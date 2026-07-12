"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Wrench, Paperclip, ArrowRight } from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useCurrentUser } from "@/lib/currentUser";
import {
  assets,
  maintenance as seedMaintenance,
  getAsset,
  employeeName,
} from "@/lib/mockData";
import { MAINTENANCE_STATUS, PRIORITY } from "@/lib/statuses";
import { formatDate, NOW } from "@/lib/format";
import { can } from "@/lib/roles";

const today = NOW.toISOString().slice(0, 10);

// Which action moves the request to which next state.
function nextActions(status) {
  switch (status) {
    case "PENDING":
      return [
        { label: "Approve", to: "APPROVED", variant: "filled" },
        { label: "Reject", to: "REJECTED", variant: "danger" },
      ];
    case "APPROVED":
      return [{ label: "Assign Technician", to: "TECHNICIAN_ASSIGNED", variant: "filled" }];
    case "TECHNICIAN_ASSIGNED":
      return [{ label: "Start Work", to: "IN_PROGRESS", variant: "filled" }];
    case "IN_PROGRESS":
      return [{ label: "Mark Resolved", to: "RESOLVED", variant: "filled" }];
    default:
      return [];
  }
}

export default function MaintenancePage() {
  const { user } = useCurrentUser();
  const [requests, setRequests] = useState(seedMaintenance);
  const [open, setOpen] = useState(false);

  const canManage = can(user.role, "approveMaintenance");

  const sorted = [...requests].sort(
    (a, b) => new Date(b.raisedOn) - new Date(a.raisedOn)
  );

  function advance(id, to) {
    setRequests((list) =>
      list.map((m) =>
        m.id === id
          ? { ...m, status: to, approvedById: m.approvedById || user.id }
          : m
      )
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Maintenance"
        title="Maintenance Management"
        description="Route repairs through approval before work starts. Assets flip to Under Maintenance on approval, and back to Available when resolved."
        actions={
          <Button variant="filled" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Raise Request
          </Button>
        }
      />

      {/* Workflow legend */}
      <Card hover={false} className="mb-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-black/45">
          {["Pending", "Approved", "Technician Assigned", "In Progress", "Resolved"].map(
            (step, i, arr) => (
              <span key={step} className="flex items-center gap-1.5">
                <span className="text-foreground">{step}</span>
                {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-black/25" strokeWidth={1.5} />}
              </span>
            )
          )}
        </div>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState icon={Wrench} title="No maintenance requests" />
      ) : (
        <div className="space-y-3">
          {sorted.map((m) => {
            const asset = getAsset(m.assetId);
            const actions = canManage ? nextActions(m.status) : [];
            return (
              <Card key={m.id} hover={false}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/assets/${asset.id}`} className="text-foreground hover:underline">
                        {asset.name}
                      </Link>
                      <span className="font-mono text-xs text-black/45">{asset.tag}</span>
                    </div>
                    <p className="mt-1 text-sm text-black/55">{m.issue}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-black/45">
                      <span>Raised by {employeeName(m.raisedById)}</span>
                      <span>·</span>
                      <span>{formatDate(m.raisedOn)}</span>
                      {m.technician && (
                        <>
                          <span>·</span>
                          <span>Technician: {m.technician}</span>
                        </>
                      )}
                      {m.photo && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" strokeWidth={1.5} /> Photo attached
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <div className="flex items-center gap-2">
                      <StatusPill map={PRIORITY} value={m.priority} />
                      <StatusPill map={MAINTENANCE_STATUS} value={m.status} />
                    </div>
                    {actions.length > 0 && (
                      <div className="flex gap-2">
                        {actions.map((a) => (
                          <Button key={a.to} size="sm" variant={a.variant} onClick={() => advance(m.id, a.to)}>
                            {a.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <RaiseRequestModal
        open={open}
        onClose={() => setOpen(false)}
        setRequests={setRequests}
        currentUserId={user.id}
      />
    </div>
  );
}

function RaiseRequestModal({ open, onClose, setRequests, currentUserId }) {
  const [form, setForm] = useState({ assetId: "", issue: "", priority: "MEDIUM" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    setRequests((list) => [
      {
        id: `m-${Date.now()}`,
        assetId: form.assetId,
        raisedById: currentUserId,
        issue: form.issue,
        priority: form.priority,
        status: "PENDING",
        technician: null,
        approvedById: null,
        raisedOn: today,
        photo: false,
      },
      ...list,
    ]);
    setForm({ assetId: "", issue: "", priority: "MEDIUM" });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Raise Maintenance Request"
      description="Requests must be approved before any repair work begins."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="filled" type="submit" form="maint-form">Submit Request</Button>
        </>
      }
    >
      <form id="maint-form" onSubmit={submit} className="space-y-4">
        <Field label="Asset">
          <Select value={form.assetId} onChange={update("assetId")} required>
            <option value="">— Select an asset —</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.tag} · {a.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Describe the Issue">
          <Textarea value={form.issue} onChange={update("issue")} placeholder="What's wrong with the asset?" required />
        </Field>
        <Field label="Priority">
          <Select value={form.priority} onChange={update("priority")}>
            {Object.keys(PRIORITY).map((p) => (
              <option key={p} value={p}>{PRIORITY[p].label}</option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center gap-2.5 rounded-control border border-dashed border-black/15 bg-black/[0.02] px-3.5 py-3 text-xs text-black/45">
          <Paperclip className="h-4 w-4 text-black/35" strokeWidth={1.5} />
          Attach a photo (optional)
        </div>
      </form>
    </Modal>
  );
}
