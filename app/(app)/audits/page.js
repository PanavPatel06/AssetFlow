"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  ClipboardCheck,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
} from "@/components/icons";
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
import { apiFetch } from "@/lib/apiClient";
import { AUDIT_ITEM_STATUS, AUDIT_CYCLE_STATUS } from "@/lib/statuses";
import { formatDate } from "@/lib/format";
import { can } from "@/lib/roles";

export default function AuditsPage() {
  const { user } = useCurrentUser();
  const [cycles, setCycles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null); // full cycle detail incl. items
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const canRun = user && can(user.role, "runAudit");

  async function loadCycles() {
    const { cycles } = await apiFetch("/api/audits");
    setCycles(cycles);
    return cycles;
  }

  async function loadSelected(id) {
    if (!id) {
      setSelected(null);
      return;
    }
    const { cycle } = await apiFetch(`/api/audits/${id}`);
    setSelected(cycle);
  }

  useEffect(() => {
    if (!canRun) {
      setLoading(false);
      return;
    }
    Promise.all([loadCycles(), apiFetch("/api/assets"), apiFetch("/api/employees")]).then(
      ([cycles, a, e]) => {
        setAssets(a.assets);
        setEmployees(e.employees);
        if (cycles[0]) setSelectedId(cycles[0].id);
        setLoading(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRun]);

  useEffect(() => {
    loadSelected(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!user) return null;

  if (!canRun) {
    return (
      <div>
        <PageHeader eyebrow="Audit" title="Asset Audit" />
        <EmptyState
          icon={ShieldAlert}
          title="Managers only"
          description="Audit cycles are run by Asset Managers and Admins."
        />
      </div>
    );
  }

  if (loading) return null;

  async function markItem(itemId, status) {
    await apiFetch(`/api/audits/${selectedId}/items/${itemId}`, {
      method: "PATCH",
      body: { status },
    });
    loadSelected(selectedId);
  }

  async function closeCycle(cycleId) {
    await apiFetch(`/api/audits/${cycleId}/close`, { method: "POST" });
    loadCycles();
    loadSelected(cycleId);
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
          {cycles.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="No audit cycles yet" />
          ) : (
            cycles.map((c) => {
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
                    {c.itemCount} asset{c.itemCount === 1 ? "" : "s"} in scope · {formatDate(c.startDate)}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Cycle detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <CycleDetail
              cycle={selected}
              items={selected.items}
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
        assets={assets}
        employees={employees}
        onCreated={async (id) => {
          await loadCycles();
          setSelectedId(id);
        }}
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
              {cycle.auditors.map((a) => (
                <span key={a.id} className="rounded-full bg-black/[0.04] px-2.5 py-0.5 text-xs text-black/55">
                  {a.name}
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
            {discrepancies.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3">
                <span className="text-foreground">
                  {i.asset.name} <span className="font-mono text-xs text-black/45">{i.asset.tag}</span>
                </span>
                <StatusPill map={AUDIT_ITEM_STATUS} value={i.status} />
              </li>
            ))}
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
          {items.map((i) => (
            <Tr key={i.id}>
              <Td>
                <span className="text-foreground">{i.asset.name}</span>
                <div className="font-mono text-xs text-black/45">{i.asset.tag}</div>
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
          ))}
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

function NewCycleModal({ open, onClose, assets, employees, onCreated }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    name: "",
    scopeType: "DEPARTMENT",
    scopeLabel: "",
    startDate: today,
    endDate: today,
    auditorId: "",
    assetIds: [],
  });
  const [error, setError] = useState("");
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!form.auditorId && employees.length) {
      setForm((f) => ({
        ...f,
        auditorId: employees.find((e) => e.role === "ASSET_MANAGER")?.id || employees[0].id,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  function toggleAsset(id) {
    setForm((f) => ({
      ...f,
      assetIds: f.assetIds.includes(id) ? f.assetIds.filter((x) => x !== id) : [...f.assetIds, id],
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { cycle } = await apiFetch("/api/audits", {
        method: "POST",
        body: {
          name: form.name,
          scopeType: form.scopeType,
          scopeLabel: form.scopeLabel,
          startDate: form.startDate,
          endDate: form.endDate,
          auditorIds: [form.auditorId],
          assetIds: form.assetIds,
        },
      });
      onCreated(cycle.id);
      setForm((f) => ({ ...f, name: "", scopeLabel: "", assetIds: [] }));
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Audit Cycle"
      description="Define scope, dates, assets in scope, and assign an auditor."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="filled" type="submit" form="cycle-form" disabled={!form.assetIds.length}>
            Create Cycle
          </Button>
        </>
      }
    >
      <form id="cycle-form" onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-control border border-red-600/15 bg-red-500/10 px-3.5 py-3 text-xs text-red-700">
            {error}
          </div>
        )}
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
        <Field label="Assets in Scope" hint="Select every asset this cycle should verify.">
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-control border border-black/10 p-2">
            {assets.map((a) => (
              <label key={a.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-black/[0.03]">
                <input
                  type="checkbox"
                  checked={form.assetIds.includes(a.id)}
                  onChange={() => toggleAsset(a.id)}
                  className="h-4 w-4"
                />
                <span className="font-mono text-xs text-black/45">{a.tag}</span>
                <span className="text-foreground">{a.name}</span>
              </label>
            ))}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
