import { useLocation } from "wouter";

export default function LogoutButton() {
  const [, navigate] = useLocation();
  
  async function onLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    navigate("/login");
  }
  
  return (
    <button onClick={onLogout} className="border px-3 py-2 rounded">
      Logout
    </button>
  );
}
