"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setError(result.message ?? "Unable to sign in."); setLoading(false); return; }
    router.push("/admin"); router.refresh();
  }

  return <div className="login-card">
    <div className="login-icon"><LockKeyhole /></div><p className="eyebrow">Private area</p><h1>Portfolio admin</h1><p>Sign in with your existing administrator account.</p>
    <form onSubmit={submit}><label>Username<input name="username" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={5} required /></label><button className="button" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>{error && <p className="form-status error">{error}</p>}</form>
    <Link href="/"><ArrowLeft size={16} /> Back to portfolio</Link>
  </div>;
}
