"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight } from "@/components/icons";
import { Field, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight text-foreground">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-black/45">
        Sign in to your AssetFlow workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-control border border-red-600/15 bg-red-500/10 px-3.5 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-black/45 transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="filled" size="block" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}{" "}
          {!submitting && <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-black/45">
        New here?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
