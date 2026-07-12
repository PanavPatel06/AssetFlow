"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { departments } from "@/lib/mockData";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    departmentId: departments[0].id,
    password: "",
  });

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    // Phase 1: pretend to create an Employee account, then go to the app.
    router.push("/dashboard");
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
            {departments
              .filter((d) => d.status === "ACTIVE")
              .map((d) => (
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
          />
        </Field>

        <Button type="submit" variant="filled" size="block">
          Create account <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
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
