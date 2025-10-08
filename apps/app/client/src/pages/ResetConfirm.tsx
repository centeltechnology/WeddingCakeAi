import { useState } from "react";
import { useRoute, useLocation } from "wouter";

export default function ResetConfirm() {
  const [, params] = useRoute("/reset/:token");
  const token = params?.token || "";
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  
  async function submit(e: React.FormEvent) {
    e.preventDefault(); 
    setErr("");
    const res = await fetch("/api/password/reset", {
      method:"POST", 
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) navigate("/login"); 
    else setErr("Reset failed. Link may be expired.");
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold text-center">Set a new password</h1>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input 
          type="password" 
          value={password} 
          onChange={e=>setPassword(e.target.value)}
          placeholder="New password" 
          className="w-full border p-3 rounded"
        />
        <button className="w-full p-3 rounded bg-black text-white">
          Update password
        </button>
      </form>
    </main>
  );
}
