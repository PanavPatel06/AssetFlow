"use client";

import { useState } from "react";
import {
  Plus,
  ClipboardCheck,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Field, Input, Select } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/currentUser";
import {
  assets,
  employees,
  departments,
  auditCycles as seedCycles,
  auditItems as seedItems,
  getAsset,
  employeeName,
} from "@/lib/mockData";
import { AUDIT_ITEM_STATUS, AUDIT_CYCLE_STATUS } from "@/lib/statuses";
import { formatDate, NOW } from "@/lib/format";
import { can } from "@/lib/roles";

const today = NOW.toISOString().slice(0, 10);

export default function AuditsPage() {
  const { user } = useCurrentUser();
  const [cycles, setCycles] = useState(seedCycles);
  const [items, setItems] = useState(seedItems);
  const [selectedId, setSelectedId] = useState(seedCycles[0]?.id || null);
  const [open, setOpen] = useState(false);

  const canRun = can(user.role, "runAudit");
  const selected = cycles.find((c) => c.id === selectedId);
  const selectedItems = items.filter((i) => i.cycleId === selectedId);

  if (!canRun) {
    return (
      <div>
        <PageHeader eyebrow="Audit" title="Asset Audit" />
        <EmptyState
          icon={ShieldAlert}
          title="Managers only"
          description="Audit cycles are run by Asset Managers and Admins. Switch role (top-right) to manage them."
        />
      </div>
    );
  }

  function markItem(itemId, status) {
    setItems((list) => list.map((i) => (i.id === itemId ? { ...i, status } : i)));
  }

  function closeCycle(cycleId) {
    setCycles((list) =>
      list.map((c) => (c.id === cycleId ? { ...c, status: "CLOSED" } : c))
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Audit"
        title="Asset Audit"
        description="Run structured verification cycles. Auditors mark each asset; discrepancies are flagged automatically; closing a cycle locks it."
        actions={
          <Button variant="filled" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> New Cycle
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {/* Cycle list */}
        <div className="space-y-2">
          {cycles.map((c) => {
            const ci = items.filter((i) => i.cycleId === c.id);
            const verified = ci.filter((i) => i.status !== "PENDING").length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full rounded-card border p-4 text-left transition-all duration-200",
                  c.id === selectedId
                    ? "border-black/20 bg-card"
                    : "border-black/[0.07] bg-card/60 hover:border-black/15"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">{c.name}</span>
                  <StatusPill map={AUDIT_CYCLE_STATUS} value={c.status} />
                </div>
                <div className="mt-1 text-xs text-black/45">{c.scopeLabel}</div>
                <div className="mt-2 text-xs text-black/40">
                  {verified}/{ci.length} checked · {formatDate(c.startDate)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cycle detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <CycleDetail
              cycle={selected}
              items={selectedItems}
              onMark={markItem}
              onClose={() => closeCycle(selected.id)}
            />
          ) : (
            <EmptyState icon={ClipboardCheck} title="Select a cycle" />
          )}
        </div>
      </div>

      <NewCycleModal
        open={open}
        onClose={() => setOpen(false)}
        setCycles={setCycles}
        setItems={setItems}
        onCreated={setSelectedId}
      />
    </div>
  );
}

function CycleDetail({ cycle, items, onMark, onClose }) {
  const isOpen = cycle.status === "OPEN";
  const discrepancies = items.filter((i) => ["MISSING", "DAMAGED"].includes(i.status));

  return (
    <div className="space-y-3">
      <Card hover={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-light text-foreground">{cycle.name}</h3>
            <div className="mt-1 text-sm text-black/45">
              {cycle.scopeType === "DEPARTMENT" ? "Department" : "Location"}: {cycle.scopeLabel}
            </div>
            <div className="mt-1 text-xs text-black/40">
              {formatDate(cycle.startDate)} – {formatDate(cycle.endDate)}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cycle.auditorIds.map((id) => (
                <span key={id} className="rounded-full bg-black/[0.04] px-2.5 py-0.5 text-xs text-black/55">
                  {employeeName(id)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusPill map={AUDIT_CYCLE_STATUS} value={cycle.status} />
            {isOpen && (
              <Button size="sm" variant="filled" onClick={onClose}>
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> Close Cycle
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Discrepancy report */}
      {discrepancies.length > 0 && (
        <Card hover={false} className="border-amber-600/20 bg-amber-500/[0.04]">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            <h4 className="text-sm font-light text-foreground">Discrepancy Report</h4>
            <span className="text-xs text-black/45">({discrepancies.length} flagged)</span>
          </div>
          <ul className="space-y-1.5 text-sm">
            {discrepancies.map((i) => {
              const asset = getAsset(i.assetId);
              return (
                <li key={i.id} className="flex items-center justify-between gap-3">
                  <span className="text-foreground">
                    {asset.name} <span className="font-mono text-xs text-black/45">{asset.tag}</span>
                  </span>
                  <StatusPill map={AUDIT_ITEM_STATUS} value={i.status} />
                </li>
              );
            })}
          </ul>
          {!isOpen && (
            <p className="mt-3 text-xs text-black/50">
              Cycle closed — confirmed-missing assets have been set to <span className="text-foreground">Lost</span>.
            </p>
          )}
        </Card>
      )}

      {/* Items */}
      <Table>
        <THead>
          <Tr>
            <Th>Asset</Th>
            <Th>Result</Th>
            <Th className="text-right">Mark</Th>
          </Tr>
        </THead>
        <TBody>
          {items.map((i) => {
            const asset = getAsset(i.assetId);
            return (
              <Tr key={i.id}>
                <Td>
                  <span className="text-foreground">{asset.name}</span>
                  <div className="font-mono text-xs text-black/45">{asset.tag}</div>
                </Td>
                <Td><StatusPill map={AUDIT_ITEM_STATUS} value={i.status} /></Td>
                <Td className="text-right">
                  {isOpen ? (
                    <span className="inline-flex gap-1">
                      <IconMark title="Verified" active={i.status === "VERIFIED"} tone="text-emerald-600" onClick={() => onMark(i.id, "VERIFIED")}>
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                      </IconMark>
                      <IconMark title="Damaged" active={i.status === "DAMAGED"} tone="text-amber-600" onClick={() => onMark(i.id, "DAMAGED")}>
                        <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                      </IconMark>
                      <IconMark title="Missing" active={i.status === "MISSING"} tone="text-red-600" onClick={() => onMark(i.id, "MISSING")}>
                        <XCircle className="h-4 w-4" strokeWidth={1.5} />
                      </IconMark>
                    </span>
                  ) : (
                    <span className="text-xs text-black/35">Locked</span>
                  )}
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}

function IconMark({ children, title, active, tone, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "rounded-md border p-1.5 transition-colors",
        active ? cn("border-black/15 bg-black/[0.04]", tone) : "border-transparent text-black/35 hover:bg-black/[0.04]"
      )}
    >
      {children}
    </button>
  );
}

function NewCycleModal({ open, onClose, setCycles, setItems, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    scopeType: "DEPARTMENT",
    scopeLabel: departments[0].name,
    startDate: today,
    endDate: today,
    auditorId: employees.find((e) => e.role === "ASSET_MANAGER")?.id || employees[0].id,
  });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const id = `au-${Date.now()}`;
    setCycles((list) => [
      { id, name: form.name, scopeType: form.scopeType, scopeLabel: form.scopeLabel, startDate: form.startDate, endDate: form.endDate, status: "OPEN", auditorIds: [form.auditorId] },
      ...list,
    ]);
    // Seed a handful of assets as pending items for the new cycle.
    setItems((list) => [
      ...list,
      ...assets.slice(0, 6).map((a, idx) => ({
        id: `${id}-i${idx}`,
        cycleId: id,
        assetId: a.id,
        status: "PENDING",
        note: null,
      })),
    ]);
    onCreated(id);
    setForm({ ...form, name: "" });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Audit Cycle"
      description="Define scope, dates, and assign an auditor."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="filled" type="submit" form="cycle-form">Create Cycle</Button>
        </>
      }
    >
      <form id="cycle-form" onSubmit={submit} className="space-y-4">
        <Field label="Cycle Name">
          <Input value={form.name} onChange={update("name")} placeholder="e.g. Q4 HQ Audit" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Scope">
            <Select value={form.scopeType} onChange={update("scopeType")}>
              <option value="DEPARTMENT">Department</option>
              <option value="LOCATION">Location</option>
            </Select>
          </Field>
          <Field label={form.scopeType === "DEPARTMENT" ? "Department" : "Location"}>
            <Input value={form.scopeLabel} onChange={update("scopeLabel")} required />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date">
            <Input type="date" value={form.startDate} onChange={update("startDate")} />
          </Field>
          <Field label="End Date">
            <Input type="date" value={form.endDate} onChange={update("endDate")} />
          </Field>
        </div>
        <Field label="Assign Auditor">
          <Select value={form.auditorId} onChange={update("auditorId")}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
