"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "@/components/icons";
import { Field, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true); // Phase 1: pretend an email was sent.
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-card border border-black/10 bg-white/60">
          <MailCheck className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl font-light tracking-tight text-foreground">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-black/45">
          If an account exists for <span className="text-foreground">{email}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-light tracking-tight text-foreground">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-black/45">
        Enter your email and we&apos;ll send you a reset link.
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
        <Button type="submit" variant="filled" size="block">
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-black/45 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back to sign in
      </Link>
    </div>
  );
}
