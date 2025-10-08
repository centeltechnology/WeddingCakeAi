import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/useAuth";

export function AuthGuard({ children }: { children: JSX.Element }) {
  const { loading, authenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !authenticated) navigate("/login");
  }, [loading, authenticated, navigate]);

  if (loading) return <div style={{ padding: 24 }}>Checking session…</div>;
  if (!authenticated) return null;

  return children;
}
