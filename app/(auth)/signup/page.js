"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Info } from "@/components/icons";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", departmentId: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch("/api/departments").then(({ departments }) => {
      const active = departments.filter((d) => d.status === "ACTIVE");
      setDepartments(active);
      setForm((f) => ({ ...f, departmentId: active[0]?.id || "" }));
    });
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await apiFetch("/api/auth/register", { method: "POST", body: form });
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
        Join your organization&apos;s AssetFlow workspace.
      </p>

      {/* The key rule from the brief: signup only creates an Employee. */}
      <div className="mt-6 flex items-start gap-2.5 rounded-control border border-black/[0.08] bg-black/[0.02] px-3.5 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-black/40" strokeWidth={1.5} />
        <p className="text-xs leading-relaxed text-black/50">
          New accounts join as an <span className="text-foreground">Employee</span>.
          Higher roles (Department Head, Asset Manager) are granted by an Admin in
          the Employee Directory — never chosen at signup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-control border border-red-600/15 bg-red-500/10 px-3.5 py-3 text-xs text-red-700">
            {error}
          </div>
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

        <Field label="Department">
          <Select value={form.departmentId} onChange={update("departmentId")}>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>

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

        <Button type="submit" variant="filled" size="block" disabled={submitting}>
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
