"use client";

import { useState } from "react";
import { Plus, ShieldAlert, Building2 } from "lucide-react";
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
import {
  departments as seedDepartments,
  categories as seedCategories,
  employees as seedEmployees,
  departmentName,
  employeeName,
} from "@/lib/mockData";
import { ROLES, ROLE_LABELS, can } from "@/lib/roles";

const TABS = [
  { id: "departments", label: "Departments" },
  { id: "categories", label: "Asset Categories" },
  { id: "employees", label: "Employee Directory" },
];

export default function SetupPage() {
  const { user } = useCurrentUser();
  const [tab, setTab] = useState("departments");

  // Local working copies so the demo feels live.
  const [departments, setDepartments] = useState(seedDepartments);
  const [categories, setCategories] = useState(seedCategories);
  const [employees, setEmployees] = useState(seedEmployees);

  // Admin-only screen.
  if (!can(user.role, "orgSetup")) {
    return (
      <div>
        <PageHeader eyebrow="Organization" title="Organization Setup" />
        <EmptyState
          icon={ShieldAlert}
          title="Admins only"
          description="Organization setup — departments, categories, and role assignment — is restricted to the Admin role. Switch to an Admin (demo switcher, top-right) to manage it."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Organization Setup"
        description="Maintain the master data every other module depends on — departments, asset categories, and the employee directory."
      />

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

/* ------------------------------- Departments ------------------------------- */
function DepartmentsTab({ departments, setDepartments, employees }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", headId: "", parentId: "", status: "ACTIVE" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function toggleStatus(id) {
    setDepartments((list) =>
      list.map((d) =>
        d.id === id ? { ...d, status: d.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : d
      )
    );
  }

  function submit(e) {
    e.preventDefault();
    setDepartments((list) => [
      ...list,
      {
        id: `d${list.length + 1}-${Date.now()}`,
        name: form.name,
        headId: form.headId || null,
        parentId: form.parentId || null,
        status: form.status,
      },
    ]);
    setForm({ name: "", headId: "", parentId: "", status: "ACTIVE" });
    setOpen(false);
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
                <Button size="sm" onClick={() => toggleStatus(d.id)}>
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
  const [form, setForm] = useState({ name: "", fields: "" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const customFields = form.fields
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setCategories((list) => [
      ...list,
      { id: `c${list.length + 1}-${Date.now()}`, name: form.name, customFields, count: 0 },
    ]);
    setForm({ name: "", fields: "" });
    setOpen(false);
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
  function changeRole(id, role) {
    setEmployees((list) => list.map((e) => (e.id === id ? { ...e, role } : e)));
  }
  function toggleStatus(id) {
    setEmployees((list) =>
      list.map((e) =>
        e.id === id ? { ...e, status: e.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : e
      )
    );
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
                <Button size="sm" onClick={() => toggleStatus(e.id)}>
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
