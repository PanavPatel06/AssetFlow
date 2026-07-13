import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, maintenanceActionSchema } from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";

const INCLUDE = {
  asset: { select: { id: true, tag: true, name: true } },
  raisedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};

export async function GET(req, { params }) {
  const { error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const request = await prisma.maintenanceRequest.findUnique({ where: { id }, include: INCLUDE });
  if (!request) {
    return NextResponse.json({ error: "Maintenance request not found." }, { status: 404 });
  }
  return NextResponse.json({ request });
}

// Strict sequential workflow: Pending → Approved/Rejected → Technician
// Assigned → In Progress → Resolved. Each action is only valid from its
// specific preceding state.
const TRANSITIONS = {
  APPROVE: { from: "PENDING", to: "APPROVED" },
  REJECT: { from: "PENDING", to: "REJECTED" },
  ASSIGN_TECHNICIAN: { from: "APPROVED", to: "TECHNICIAN_ASSIGNED" },
  START: { from: "TECHNICIAN_ASSIGNED", to: "IN_PROGRESS" },
  RESOLVE: { from: "IN_PROGRESS", to: "RESOLVED" },
};

// PATCH /api/maintenance/[id] — advance the workflow (Asset Manager / Admin).
export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("approveMaintenance");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(maintenanceActionSchema, await req.json());
  if (validationError) return validationError;

  if (data.action === "ASSIGN_TECHNICIAN" && !data.technician) {
    return NextResponse.json({ error: "Technician name is required." }, { status: 400 });
  }

  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: { asset: { select: { id: true, tag: true, name: true } } },
  });
  if (!request) {
    return NextResponse.json({ error: "Maintenance request not found." }, { status: 404 });
  }

  const transition = TRANSITIONS[data.action];
  if (request.status !== transition.from) {
    return NextResponse.json(
      { error: `This request is "${request.status}"; "${data.action}" isn't valid from that state.` },
      { status: 400 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const req_ = await tx.maintenanceRequest.update({
      where: { id },
      data: {
        status: transition.to,
        ...(data.action === "APPROVE" ? { approvedById: user.id } : {}),
        ...(data.action === "REJECT" ? { approvedById: user.id } : {}),
        ...(data.action === "ASSIGN_TECHNICIAN" ? { technician: data.technician } : {}),
      },
      include: INCLUDE,
    });

    // Asset auto-updates: Under Maintenance on approval, back to Available on
    // resolution (per the brief).
    if (data.action === "APPROVE") {
      await tx.asset.update({ where: { id: request.assetId }, data: { status: "UNDER_MAINTENANCE" } });
    }
    if (data.action === "RESOLVE") {
      // Revert to whatever the asset's actual state is: if it's still
      // actively held (maintenance can be raised on an allocated asset),
      // restore that status instead of blindly clearing it to Available.
      const activeAllocation = await tx.allocation.findFirst({
        where: { assetId: request.assetId, status: "ACTIVE" },
      });
      await tx.asset.update({
        where: { id: request.assetId },
        data: {
          status: activeAllocation
            ? activeAllocation.holderType === "EMPLOYEE"
              ? "ALLOCATED"
              : "RESERVED"
            : "AVAILABLE",
        },
      });
    }

    return req_;
  });

  const actionLabel = {
    APPROVE: "Approved",
    REJECT: "Rejected",
    ASSIGN_TECHNICIAN: "Assigned technician for",
    START: "Started",
    RESOLVE: "Resolved",
  }[data.action];

  await logActivity({
    actorId: user.id,
    action: `${actionLabel} maintenance for ${request.asset.tag} (${request.asset.name})`,
    entity: "Maintenance",
  });

  if (["APPROVE", "REJECT", "RESOLVE"].includes(data.action)) {
    await notify({
      userId: request.raisedById,
      type: "MAINTENANCE",
      message: `Maintenance ${actionLabel.toLowerCase()} for ${request.asset.name} (${request.asset.tag}).`,
    });
  }

  return NextResponse.json({ request: updated });
}
