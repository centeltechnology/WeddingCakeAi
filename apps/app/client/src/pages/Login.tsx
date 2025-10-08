import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(true); // block UI until we know auth state

  // smart redirect if already logged in
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/session", { credentials: "include", cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data?.authenticated) {
          const params = new URLSearchParams(window.location.search);
          const desired = params.get("redirect");
          const target =
            desired && desired.startsWith("/") ? desired :
            "/baker/dashboard"; // legacy path; keep alias /dashboard available too
          navigate(target, { replace: true });
          return;
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

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
      navigate(data.redirect || "/baker/dashboard");
    } else {
      setErr(data?.error || "Login failed");
    }
  }

  if (checking) return <div style={{ padding: 24 }}>Checking session…</div>;

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
