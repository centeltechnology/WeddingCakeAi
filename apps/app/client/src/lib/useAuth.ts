import { useEffect, useState } from "react";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/session", { credentials: "include" });
        const data = await res.json();
        setAuthed(Boolean(data?.authenticated));
      } catch {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, authenticated };
}
