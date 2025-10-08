import { useEffect, useState } from "react";

export default function ImpersonationBanner() {
  const [state, setState] = useState<{ isImpersonating?: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/session", { credentials: "include" });
        const data = await res.json();
        setState({ isImpersonating: Boolean(data?.isImpersonating) });
      } catch {
        setState({ isImpersonating: false });
      }
    })();
  }, []);

  if (!state?.isImpersonating) return null;

  async function exit() {
    await fetch("/api/admin/impersonate/stop", { method: "POST", credentials: "include" });
    location.replace("/admin/users");
  }

  return (
    <div
      style={{
        background: "#FFE8CC",
        border: "1px solid #FF6A00",
        padding: "8px 12px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 14,
      }}
    >
      <span>
        ⚠️ You are <b>impersonating</b> another user. Actions you take may affect their tenant.
      </span>
      <button
        onClick={exit}
        style={{
          border: "1px solid #FF6A00",
          padding: "6px 10px",
          borderRadius: 8,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Exit impersonation
      </button>
    </div>
  );
}
