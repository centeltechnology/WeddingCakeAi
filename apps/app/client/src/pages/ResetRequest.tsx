import { useState } from "react";

export default function ResetRequest() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  
  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setErr("");
    const res = await fetch("/api/password/forgot", {
      method:"POST", 
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setSent(true); 
    else setErr("Request failed");
  }
  
  if (sent) {
    return (
      <div style={{padding:24}}>
        If that email exists, we sent a reset link.
      </div>
    );
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold text-center">Reset password</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input 
          type="email" 
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          placeholder="Email" 
          className="w-full border p-3 rounded"
        />
        <button className="w-full p-3 rounded bg-black text-white">
          Send reset link
        </button>
      </form>
    </main>
  );
}
