"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, AlertTriangle, ArrowLeftRight } from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useCurrentUser } from "@/lib/currentUser";
import { apiFetch } from "@/lib/apiClient";
import { TRANSFER_STATUS } from "@/lib/statuses";
import { isOverdue, formatDate, relativeDays } from "@/lib/format";
import { can } from "@/lib/roles";

const TABS = [
  { id: "active", label: "Active Allocations" },
  { id: "transfers", label: "Transfer Requests" },
];

function holderName(holderUser, holderDepartment) {
  return holderUser?.name || holderDepartment?.name || "—";
}

export default function AllocationsPage() {
  const { user } = useCurrentUser();
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assets, setAssets] = useState([]);

  const [allocateOpen, setAllocateOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnNotes, setReturnNotes] = useState("");

  const canAllocate = user && can(user.role, "allocateAsset");
  const canApprove = user && can(user.role, "approveTransfer");

  async function loadAll() {
    const [a, t, e, d, as] = await Promise.all([
      apiFetch("/api/allocations"),
      apiFetch("/api/transfers"),
      apiFetch("/api/employees"),
      apiFetch("/api/departments"),
      apiFetch("/api/assets"),
    ]);
    setAllocations(a.allocations);
    setTransfers(t.transfers);
    setEmployees(e.employees);
    setDepartments(d.departments);
    setAssets(as.assets);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const active = allocations.filter((a) => a.status === "ACTIVE");

  async function confirmReturn() {
    await apiFetch(`/api/allocations/${returnTarget.id}/return`, {
      method: "POST",
      body: { checkInNotes: returnNotes || undefined },
    });
    setReturnTarget(null);
    setReturnNotes("");
    loadAll();
  }

  async function decideTransfer(id, decision) {
    await apiFetch(`/api/transfers/${id}`, { method: "PATCH", body: { decision } });
    loadAll();
  }

  if (!user || loading) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Allocation"
        title="Allocation & Transfer"
        description="Manage who holds what. Assets can't be double-allocated — a transfer request is required instead."
        actions={
          canAllocate && (
            <Button variant="filled" onClick={() => setAllocateOpen(true)}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Allocate Asset
            </Button>
          )
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === "active" &&
        (active.length === 0 ? (
          <EmptyState title="No active allocations" />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Asset</Th>
                <Th>Holder</Th>
                <Th>Allocated</Th>
                <Th>Expected Return</Th>
                <Th className="text-right">Action</Th>
              </Tr>
            </THead>
            <TBody>
              {active.map((al) => {
                const overdue = isOverdue(al.expectedReturn);
                return (
                  <Tr key={al.id} className="hover:bg-black/[0.02]">
                    <Td>
                      <Link href={`/assets/${al.asset.id}`} className="text-foreground hover:underline">
                        {al.asset.name}
                      </Link>
                      <div className="font-mono text-xs text-black/45">{al.asset.tag}</div>
                    </Td>
                    <Td className="text-black/60">{holderName(al.holderUser, al.holderDepartment)}</Td>
                    <Td className="text-black/55">{formatDate(al.allocatedOn)}</Td>
                    <Td>
                      {al.expectedReturn ? (
                        <span className="flex items-center gap-2">
                          <span className="text-black/55">{formatDate(al.expectedReturn)}</span>
                          {overdue && (
                            <StatusPill label={`Overdue · ${relativeDays(al.expectedReturn)}`} tone="danger" />
                          )}
                        </span>
                      ) : (
                        <span className="text-black/35">No date</span>
                      )}
                    </Td>
                    <Td className="text-right">
                      <Button size="sm" onClick={() => setReturnTarget(al)}>
                        Mark Returned
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        ))}

      {tab === "transfers" &&
        (transfers.length === 0 ? (
          <EmptyState title="No transfer requests" />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Asset</Th>
                <Th>From → To</Th>
                <Th>Requested</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </Tr>
            </THead>
            <TBody>
              {transfers.map((t) => (
                <Tr key={t.id} className="hover:bg-black/[0.02]">
                  <Td>
                    <Link href={`/assets/${t.asset.id}`} className="text-foreground hover:underline">
                      {t.asset.name}
                    </Link>
                    <div className="font-mono text-xs text-black/45">{t.asset.tag}</div>
                  </Td>
                  <Td className="text-black/60">
                    {t.fromUser?.name} <span className="text-black/30">→</span> {t.toUser?.name}
                  </Td>
                  <Td className="text-black/55">{formatDate(t.requestedOn)}</Td>
                  <Td><StatusPill map={TRANSFER_STATUS} value={t.status} /></Td>
                  <Td className="text-right">
                    {t.status === "REQUESTED" && canApprove ? (
                      <span className="flex justify-end gap-2">
                        <Button size="sm" variant="danger" onClick={() => decideTransfer(t.id, "REJECTED")}>
                          Reject
                        </Button>
                        <Button size="sm" variant="filled" onClick={() => decideTransfer(t.id, "APPROVED")}>
                          Approve
                        </Button>
                      </span>
                    ) : (
                      <span className="text-xs text-black/35">
                        {t.approvedBy ? `by ${t.approvedBy.name}` : "—"}
                      </span>
                    )}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ))}

      <AllocateModal
        open={allocateOpen}
        onClose={() => setAllocateOpen(false)}
        assets={assets}
        employees={employees}
        departments={departments}
        onDone={loadAll}
      />

      {/* Return modal */}
      <Modal
        open={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title="Return Asset"
        description={returnTarget?.asset?.name}
        footer={
          <>
            <Button onClick={() => setReturnTarget(null)}>Cancel</Button>
            <Button variant="filled" onClick={confirmReturn}>Confirm Return</Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-black/50">
          The asset status will revert to <span className="text-foreground">Available</span> once returned.
        </p>
        <Field label="Condition / Check-in Notes">
          <Textarea
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="e.g. Returned in good condition, minor scratches on lid."
          />
        </Field>
      </Modal>
    </div>
  );
}

/* --------- Allocate modal: demonstrates the double-allocation conflict --------- */
function AllocateModal({ open, onClose, assets, employees, departments, onDone }) {
  const [assetId, setAssetId] = useState("");
  const [holderType, setHolderType] = useState("EMPLOYEE");
  const [holderId, setHolderId] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [conflict, setConflict] = useState(null);
  const [error, setError] = useState("");

  function reset() {
    setAssetId("");
    setHolderType("EMPLOYEE");
    setHolderId("");
    setExpectedReturn("");
    setConflict(null);
    setError("");
  }

  function close() {
    reset();
    onClose();
  }

  async function allocate(e) {
    e.preventDefault();
    setError("");
    setConflict(null);
    try {
      await apiFetch("/api/allocations", {
        method: "POST",
        body: {
          assetId,
          holderType,
          holderId,
          expectedReturn: expectedReturn || undefined,
        },
      });
      close();
      onDone();
    } catch (err) {
      if (err.status === 409) {
        setConflict(err.data.currentHolder);
      } else {
        setError(err.message);
      }
    }
  }

  async function requestTransfer() {
    setError("");
    try {
      await apiFetch("/api/transfers", {
        method: "POST",
        body: { assetId, toUserId: holderId },
      });
      close();
      onDone();
    } catch (err) {
      setError(err.message);
    }
  }

  const holderOptions = holderType === "EMPLOYEE" ? employees : departments;
  // The backend only supports employee-to-employee transfer requests.
  const transferSupported = conflict?.holderType === "EMPLOYEE" && holderType === "EMPLOYEE";

  return (
    <Modal
      open={open}
      onClose={close}
      title="Allocate Asset"
      description="Assign an asset to an employee or department."
      footer={
        conflict ? (
          <>
            <Button onClick={close}>Cancel</Button>
            {transferSupported && (
              <Button variant="filled" onClick={requestTransfer} disabled={!holderId}>
                <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.5} /> Request Transfer
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="filled" type="submit" form="allocate-form" disabled={!assetId || !holderId}>
              Allocate
            </Button>
          </>
        )
      }
    >
      <form id="allocate-form" onSubmit={allocate} className="space-y-4">
        {error && (
          <div className="rounded-control border border-red-600/15 bg-red-500/10 px-3.5 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <Field label="Asset">
          <Select
            value={assetId}
            onChange={(e) => {
              setAssetId(e.target.value);
              setConflict(null);
            }}
            required
          >
            <option value="">— Select an asset —</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>{a.tag} · {a.name}</option>
            ))}
          </Select>
        </Field>

        {/* Conflict rule from the brief */}
        {conflict && (
          <div className="flex items-start gap-2.5 rounded-control border border-amber-600/20 bg-amber-500/[0.07] px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.5} />
            <p className="text-xs leading-relaxed text-amber-800">
              This asset is currently held by{" "}
              <span className="font-medium">{holderName(conflict.holderUser, conflict.holderDepartment)}</span>.
              {transferSupported
                ? " You can't allocate it directly — request a transfer instead."
                : " Transfers can only be requested between employees — ask the current holder's department (or an Asset Manager) to return it first."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Assign to">
            <Select
              value={holderType}
              onChange={(e) => {
                setHolderType(e.target.value);
                setHolderId("");
              }}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="DEPARTMENT">Department</option>
            </Select>
          </Field>
          <Field label={holderType === "EMPLOYEE" ? "Employee" : "Department"}>
            <Select value={holderId} onChange={(e) => setHolderId(e.target.value)} required>
              <option value="">— Select —</option>
              {holderOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </Field>
        </div>

        {!conflict && (
          <Field label="Expected Return Date" hint="Optional. Overdue returns are flagged automatically.">
            <Input type="date" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
          </Field>
        )}
      </form>
    </Modal>
  );
}
