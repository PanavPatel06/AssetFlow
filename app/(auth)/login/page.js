"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@/components/icons";
import { Field, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("priya@acme.com");
  const [password, setPassword] = useState("password");

  // Phase 1: no real auth yet — just navigate into the app. Auth.js wires in
  // during Phase 3.
  function handleSubmit(e) {
    e.preventDefault();
    router.push("/dashboard");
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

        <Button type="submit" variant="filled" size="block">
          Sign in <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
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
