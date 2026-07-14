"use client";

import { useEffect, useState } from "react";
import { Plus, ShieldAlert, Building2, Copy } from "@/components/icons";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Field, Input, Select } from "@/components/ui/Field";
import { useCurrentUser } from "@/lib/currentUser";
import { apiFetch } from "@/lib/apiClient";
import { ROLES, ROLE_LABELS, can } from "@/lib/roles";

const TABS = [
  { id: "departments", label: "Departments" },
  { id: "categories", label: "Asset Categories" },
  { id: "employees", label: "Employee Directory" },
];

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 rounded-control border border-red-600/15 bg-red-500/10 px-3.5 py-3 text-xs text-red-700">
      {error}
    </div>
  );
}

export default function SetupPage() {
  const { user } = useCurrentUser();
  const [tab, setTab] = useState("departments");
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [organization, setOrganization] = useState(null);

  const canSetup = user && can(user.role, "orgSetup");

  useEffect(() => {
    if (!canSetup) {
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch("/api/departments"),
      apiFetch("/api/categories"),
      apiFetch("/api/employees"),
      apiFetch("/api/organization"),
    ]).then(([d, c, e, o]) => {
      setDepartments(d.departments);
      setCategories(c.categories);
      setEmployees(e.employees);
      setOrganization(o.organization);
      setLoading(false);
    });
  }, [canSetup]);

  if (!user) return null;

  // Admin-only screen.
  if (!canSetup) {
    return (
      <div>
        <PageHeader eyebrow="Organization" title="Organization Setup" />
        <EmptyState
          icon={ShieldAlert}
          title="Admins only"
          description="Organization setup — departments, categories, and role assignment — is restricted to the Admin role."
        />
      </div>
    );
  }

  if (loading) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Organization Setup"
        description="Maintain the master data every other module depends on — departments, asset categories, and the employee directory."
      />

      {organization && <OrganizationCodeCard organization={organization} />}

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {tab === "departments" && (
        <DepartmentsTab
          departments={departments}
          setDepartments={setDepartments}
          employees={employees}
        />
      )}
      {tab === "categories" && (
        <CategoriesTab categories={categories} setCategories={setCategories} />
      )}
      {tab === "employees" && (
        <EmployeesTab
          employees={employees}
          setEmployees={setEmployees}
          departments={departments}
        />
      )}
    </div>
  );
}

/* --------------------------- Organization code ----------------------------- */
function OrganizationCodeCard({ organization }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(organization.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card hover={false} className="mb-6 flex items-center justify-between gap-3 border-black/[0.08] bg-black/[0.02] py-3">
      <div className="flex items-start gap-2.5">
        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-black/40" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-black/50">
          <span className="text-foreground">{organization.name}</span>&apos;s organization code —
          share it with new teammates so they can join at signup instead of creating a
          separate workspace.
        </p>
      </div>
      <button
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 rounded-control border border-black/[0.08] bg-card px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:bg-black/[0.03]"
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
        {copied ? "Copied!" : organization.slug}
      </button>
    </Card>
  );
}

/* ------------------------------- Departments ------------------------------- */
function DepartmentsTab({ departments, setDepartments, employees }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", headId: "", parentId: "", status: "ACTIVE" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const employeeName = (id) => employees.find((e) => e.id === id)?.name || "—";
  const departmentName = (id) => departments.find((d) => d.id === id)?.name || "—";

  async function toggleStatus(dept) {
    const status = dept.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const { department } = await apiFetch(`/api/departments/${dept.id}`, {
      method: "PATCH",
      body: { status },
    });
    setDepartments((list) => list.map((d) => (d.id === department.id ? { ...d, ...department } : d)));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { department } = await apiFetch("/api/departments", {
        method: "POST",
        body: {
          name: form.name,
          headId: form.headId || null,
          parentId: form.parentId || null,
          status: form.status,
        },
      });
      setDepartments((list) => [...list, department]);
      setForm({ name: "", headId: "", parentId: "", status: "ACTIVE" });
      setOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="filled" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> New Department
        </Button>
      </div>

      <Table>
        <THead>
          <Tr>
            <Th>Department</Th>
            <Th>Head</Th>
            <Th>Parent</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {departments.map((d) => (
            <Tr key={d.id} className="hover:bg-black/[0.02]">
              <Td className="text-foreground">{d.name}</Td>
              <Td className="text-black/60">{d.headId ? employeeName(d.headId) : "—"}</Td>
              <Td className="text-black/60">{d.parentId ? departmentName(d.parentId) : "—"}</Td>
              <Td>
                <StatusPill
                  label={d.status === "ACTIVE" ? "Active" : "Inactive"}
                  tone={d.status === "ACTIVE" ? "success" : "neutral"}
                />
              </Td>
              <Td className="text-right">
                <Button size="sm" onClick={() => toggleStatus(d)}>
                  {d.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </Button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Department"
        description="Add a department to the organization."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="filled" type="submit" form="dept-form">
              Create
            </Button>
          </>
        }
      >
        <form id="dept-form" onSubmit={submit} className="space-y-4">
          <ErrorBanner error={error} />
          <Field label="Name">
            <Input value={form.name} onChange={update("name")} placeholder="e.g. Marketing" required />
          </Field>
          <Field label="Department Head">
            <Select value={form.headId} onChange={update("headId")}>
              <option value="">— Unassigned —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Parent Department" hint="Optional — creates a hierarchy.">
            <Select value={form.parentId} onChange={update("parentId")}>
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={update("status")}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}

/* ------------------------------- Categories -------------------------------- */
function CategoriesTab({ categories, setCategories }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", fields: "" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    const customFields = form.fields
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const { category } = await apiFetch("/api/categories", {
        method: "POST",
        body: { name: form.name, customFields },
      });
      setCategories((list) => [...list, { ...category, count: 0 }]);
      setForm({ name: "", fields: "" });
      setOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="filled" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> New Category
        </Button>
      </div>

      <Table>
        <THead>
          <Tr>
            <Th>Category</Th>
            <Th>Custom Fields</Th>
            <Th className="text-right">Assets</Th>
          </Tr>
        </THead>
        <TBody>
          {categories.map((c) => (
            <Tr key={c.id} className="hover:bg-black/[0.02]">
              <Td className="text-foreground">{c.name}</Td>
              <Td>
                {c.customFields.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {c.customFields.map((f) => (
                      <span key={f} className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs text-black/55">
                        {f}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-black/35">—</span>
                )}
              </Td>
              <Td className="text-right font-mono text-black/60">{c.count}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Asset Category"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="filled" type="submit" form="cat-form">Create</Button>
          </>
        }
      >
        <form id="cat-form" onSubmit={submit} className="space-y-4">
          <ErrorBanner error={error} />
          <Field label="Name">
            <Input value={form.name} onChange={update("name")} placeholder="e.g. Electronics" required />
          </Field>
          <Field
            label="Custom Fields"
            hint="Comma-separated, e.g. Warranty Period, Voltage. Optional."
          >
            <Input value={form.fields} onChange={update("fields")} placeholder="Warranty Period, Voltage" />
          </Field>
        </form>
      </Modal>
    </div>
  );
}

/* ------------------------------- Employees --------------------------------- */
function EmployeesTab({ employees, setEmployees, departments }) {
  const departmentName = (id) => departments.find((d) => d.id === id)?.name || "—";

  async function changeRole(id, role) {
    const { employee } = await apiFetch(`/api/employees/${id}`, {
      method: "PATCH",
      body: { role },
    });
    setEmployees((list) => list.map((e) => (e.id === id ? { ...e, ...employee } : e)));
  }
  async function toggleStatus(emp) {
    const status = emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const { employee } = await apiFetch(`/api/employees/${emp.id}`, {
      method: "PATCH",
      body: { status },
    });
    setEmployees((list) => list.map((e) => (e.id === employee.id ? { ...e, ...employee } : e)));
  }

  return (
    <div>
      <Card hover={false} className="mb-3 flex items-start gap-2.5 border-black/[0.08] bg-black/[0.02] py-3">
        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-black/40" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-black/50">
          This is the <span className="text-foreground">only place roles are assigned</span>.
          Promote an Employee to Department Head or Asset Manager here.
        </p>
      </Card>

      <Table>
        <THead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Department</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {employees.map((e) => (
            <Tr key={e.id} className="hover:bg-black/[0.02]">
              <Td className="text-foreground">{e.name}</Td>
              <Td className="font-mono text-xs text-black/55">{e.email}</Td>
              <Td className="text-black/60">{departmentName(e.departmentId)}</Td>
              <Td>
                <Select
                  value={e.role}
                  onChange={(ev) => changeRole(e.id, ev.target.value)}
                  className="w-44 py-1.5 text-xs"
                >
                  {Object.values(ROLES).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </Select>
              </Td>
              <Td>
                <StatusPill
                  label={e.status === "ACTIVE" ? "Active" : "Inactive"}
                  tone={e.status === "ACTIVE" ? "success" : "neutral"}
                />
              </Td>
              <Td className="text-right">
                <Button size="sm" onClick={() => toggleStatus(e)}>
                  {e.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </Button>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
