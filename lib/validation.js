import { NextResponse } from "next/server";
import { z } from "zod";

// Runs `schema.safeParse(data)` and returns either the parsed data or a ready
// -to-return 400 NextResponse, so route handlers can do:
//
//   const { data, error } = validate(assetCreateSchema, await req.json());
//   if (error) return error;
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      ),
    };
  }
  return { data: result.data, error: null };
}

// --- Auth --------------------------------------------------------------------
// Signup either creates a brand-new organization (the submitter becomes its
// Admin) or joins an existing one by its shareable slug (the submitter joins
// as an Employee, same as before multi-tenancy).
export const registerSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    organizationName: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
  z.object({
    mode: z.literal("join"),
    organizationSlug: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    departmentId: z.string().min(1),
  }),
]);

// --- Organization setup --------------------------------------------------
export const departmentCreateSchema = z.object({
  name: z.string().min(1),
  headId: z.string().min(1).nullable().optional(),
  parentId: z.string().min(1).nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
export const departmentUpdateSchema = departmentCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  customFields: z.array(z.string()).optional(),
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const employeeUpdateSchema = z.object({
  role: z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  departmentId: z.string().min(1).optional(),
});

// --- Assets --------------------------------------------------------------
// Status is deliberately excluded here — asset status only changes via the
// workflow action endpoints (allocate/return/maintenance/audit-close), never
// a raw PATCH, so the lifecycle rules can't be bypassed.
export const assetCreateSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  serial: z.string().optional(),
  acquisitionDate: z.coerce.date().optional(),
  acquisitionCost: z.number().int().nonnegative().optional(),
  condition: z.string().optional(),
  location: z.string().optional(),
  isBookable: z.boolean().optional(),
  photoUrl: z.string().optional(),
});
export const assetUpdateSchema = assetCreateSchema.partial();

// --- Allocation & transfer -------------------------------------------------
export const allocationCreateSchema = z.object({
  assetId: z.string().min(1),
  holderType: z.enum(["EMPLOYEE", "DEPARTMENT"]),
  holderId: z.string().min(1),
  expectedReturn: z.coerce.date().nullable().optional(),
});

export const allocationReturnSchema = z.object({
  checkInNotes: z.string().optional(),
});

export const transferCreateSchema = z.object({
  assetId: z.string().min(1),
  toUserId: z.string().min(1),
});

export const transferDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
});

// --- Bookings ------------------------------------------------------------
export const bookingCreateSchema = z
  .object({
    assetId: z.string().min(1),
    start: z.coerce.date(),
    end: z.coerce.date(),
    purpose: z.string().optional(),
  })
  .refine((v) => v.end > v.start, {
    message: "End time must be after the start time.",
    path: ["end"],
  });

// --- Maintenance -----------------------------------------------------------
export const maintenanceCreateSchema = z.object({
  assetId: z.string().min(1),
  issue: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  photoUrl: z.string().optional(),
});

export const maintenanceActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "ASSIGN_TECHNICIAN", "START", "RESOLVE"]),
  technician: z.string().optional(),
});

// --- Audits ------------------------------------------------------------
export const auditCycleCreateSchema = z.object({
  name: z.string().min(1),
  scopeType: z.enum(["DEPARTMENT", "LOCATION"]),
  scopeLabel: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  auditorIds: z.array(z.string().min(1)).min(1),
  assetIds: z.array(z.string().min(1)).min(1),
});

export const auditItemMarkSchema = z.object({
  status: z.enum(["VERIFIED", "MISSING", "DAMAGED"]),
  note: z.string().optional(),
});

// --- Notifications -----------------------------------------------------
export const notificationUpdateSchema = z.object({
  read: z.boolean(),
});
