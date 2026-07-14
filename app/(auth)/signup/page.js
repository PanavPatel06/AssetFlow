"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Info } from "@/components/icons";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { apiFetch } from "@/lib/apiClient";

const MODES = [
  { id: "join", label: "Join a workspace" },
  { id: "create", label: "Create a workspace" },
];

export default function SignupPage() {
  const router = useRouter();
  const [mode, setMode] = useState("join");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    organizationSlug: "",
    departmentId: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Once the visitor has typed an organization code, look up its departments
  // so they can be picked at signup (this call is unauthenticated — public
  // by slug only, no other org data is exposed).
  useEffect(() => {
    if (mode !== "join" || !form.organizationSlug) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    const timeout = setTimeout(() => {
      apiFetch(`/api/departments?organizationSlug=${encodeURIComponent(form.organizationSlug)}`)
        .then(({ departments }) => {
          const active = departments.filter((d) => d.status === "ACTIVE");
          setDepartments(active);
          setForm((f) => ({ ...f, departmentId: active[0]?.id || "" }));
        })
        .catch(() => setDepartments([]))
        .finally(() => setLoadingDepartments(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [mode, form.organizationSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body =
      mode === "create"
        ? { mode, organizationName: form.organizationName, name: form.name, email: form.email, password: form.password }
        : { mode, organizationSlug: form.organizationSlug, name: form.name, email: form.email, password: form.password, departmentId: form.departmentId };

    try {
      await apiFetch("/api/auth/register", { method: "POST", body });
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created — sign in from the login page.");
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight text-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-black/45">
        Join your organization&apos;s AssetFlow workspace, or set up a new one.
      </p>

      <Tabs tabs={MODES} active={mode} onChange={setMode} className="mt-6" />

      {mode === "join" ? (
        <div className="mt-6 flex items-start gap-2.5 rounded-control border border-black/[0.08] bg-black/[0.02] px-3.5 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-black/40" strokeWidth={1.5} />
          <p className="text-xs leading-relaxed text-black/50">
            New accounts join as an <span className="text-foreground">Employee</span>.
            Higher roles (Department Head, Asset Manager) are granted by an Admin in
            the Employee Directory — never chosen at signup. Ask your Admin for your
            organization&apos;s code.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex items-start gap-2.5 rounded-control border border-black/[0.08] bg-black/[0.02] px-3.5 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-black/40" strokeWidth={1.5} />
          <p className="text-xs leading-relaxed text-black/50">
            You&apos;ll become the <span className="text-foreground">Admin</span> of a
            brand-new, isolated workspace. Invite teammates afterwards by sharing your
            organization&apos;s code from Organization Setup.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-control border border-red-600/15 bg-red-500/10 px-3.5 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {mode === "create" && (
          <Field label="Organization name">
            <Input
              value={form.organizationName}
              onChange={update("organizationName")}
              placeholder="Acme Corp"
              required
            />
          </Field>
        )}

        {mode === "join" && (
          <Field label="Organization code" hint="Given to you by your organization's Admin.">
            <Input
              value={form.organizationSlug}
              onChange={update("organizationSlug")}
              placeholder="acme-corp"
              required
            />
          </Field>
        )}

        <Field label="Full name">
          <Input
            value={form.name}
            onChange={update("name")}
            placeholder="Jordan Lee"
            required
          />
        </Field>

        <Field label="Work email">
          <Input
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@company.com"
            required
          />
        </Field>

        {mode === "join" && (
          <Field label="Department">
            <Select value={form.departmentId} onChange={update("departmentId")} disabled={!departments.length}>
              {departments.length === 0 ? (
                <option value="">
                  {loadingDepartments ? "Looking up organization…" : "Enter a valid organization code above"}
                </option>
              ) : (
                departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))
              )}
            </Select>
          </Field>
        )}

        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Choose a strong password"
            required
            minLength={8}
          />
        </Field>

        <Button
          type="submit"
          variant="filled"
          size="block"
          disabled={submitting || (mode === "join" && !form.departmentId)}
        >
          {submitting ? "Creating account…" : "Create account"}{" "}
          {!submitting && <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-black/45">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
