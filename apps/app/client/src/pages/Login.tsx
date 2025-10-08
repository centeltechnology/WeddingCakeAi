import { useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.ok) {
      const target = data.redirect || "/dashboard";
      navigate(target);
    } else {
      setErr(data?.error || "Login failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border p-3 rounded" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border p-3 rounded" />
          <button className="w-full p-3 rounded bg-black text-white">Sign in</button>
        </form>
      </div>
    </main>
  );
}
