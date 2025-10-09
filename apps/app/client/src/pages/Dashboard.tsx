import LogoutButton from "../components/LogoutButton";
import AppLayout from "@/components/AppLayout";

export default function Dashboard() {
  return (
    <AppLayout><div style={{ padding: 24 }}>
            <LogoutButton />
            <h1>Dashboard (alias) 🎂</h1>
            <p>Welcome to your dashboard!</p>
          </div></AppLayout>
  );
}
