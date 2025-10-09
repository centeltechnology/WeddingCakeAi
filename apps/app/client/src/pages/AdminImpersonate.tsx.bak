import { useState } from "react";

export default function AdminImpersonate() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetEmail: email }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.ok) {
      setMsg("Impersonation started.");
      location.replace("/baker/dashboard");
    } else {
      setMsg(data?.error || "Failed");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin: Impersonate by Email</h2>
      <form onSubmit={start} style={{ display: "flex", gap: 8 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="target@example.com"
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button style={{ padding: "8px 12px" }}>Impersonate</button>
      </form>
      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
    </div>
  );
}
