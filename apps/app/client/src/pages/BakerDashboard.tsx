import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PipelineChart } from "../components/PipelineChart";
import { RevenueStat } from "../components/RevenueStat";
import { TaskList } from "../components/TaskList";
import AiToolsCard from "@/components/ai/AiToolsCard";
import AppLayout from "@/components/AppLayout";
import { TopLeads } from "@/components/dashboard/TopLeads";
import QuickActions from "@/components/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  leadsToday: number;
  quotesPending: number;
  invoicesDue: number;
  contractsAwaitingSignature: number;
}

interface Message {
  id: string;
  name: string;
  snippet: string;
  time: Date;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  amount: string;
  customer: string;
  status: string;
}

export default function BakerDashboard() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        const [statsRes, messagesRes, invoicesRes] = await Promise.all([
          fetch("/api/app/stats", { credentials: "include" }),
          fetch("/api/app/recent/messages?limit=5", { credentials: "include" }),
          fetch("/api/app/invoices/due?limit=5", { credentials: "include" })
        ]);

        if (!statsRes.ok || !messagesRes.ok || !invoicesRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [statsData, messagesData, invoicesData] = await Promise.all([
          statsRes.json(),
          messagesRes.json(),
          invoicesRes.json()
        ]);

        setStats(statsData);
        setMessages(messagesData);
        setInvoices(invoicesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Baker Dashboard 🧁</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Baker Dashboard 🧁</h1>
          <div className="text-destructive">{error}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Baker Dashboard 🧁</h1>
        </div>

        {/* Quick Actions Card */}
        <Card className="rounded-2xl bg-[var(--accent)] border-[var(--accent-2)]">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActions variant="full" />
          </CardContent>
        </Card>

        {/* AI Tools */}
        <AiToolsCard />

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Leads Today" value={stats?.leadsToday || 0} />
          <StatCard 
            title="Quotes Pending" 
            value={stats?.quotesPending || 0} 
            onClick={() => navigate('/quotes')} 
          />
          <StatCard 
            title="Invoices Due" 
            value={stats?.invoicesDue || 0} 
            onClick={() => navigate('/invoices')} 
          />
          <StatCard 
            title="Awaiting Signature" 
            value={stats?.contractsAwaitingSignature || 0} 
            onClick={() => navigate('/contracts')} 
          />
        </div>

        {/* Revenue and Tasks Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueStat />
          <TaskList />
        </div>

        {/* Pipeline Chart - Hide on mobile, show compact stats instead */}
        <div className="hidden md:block">
          <PipelineChart />
        </div>

        {/* Top Leads Widget */}
        {import.meta.env.VITE_LEAD_SCORING_ENABLED === 'true' && (
          <TopLeads />
        )}

        {/* Recent Activity - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Messages */}
          <Card className="rounded-2xl border-[var(--accent-2)]">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-muted-foreground">No recent messages</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="font-semibold">{msg.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{msg.snippet}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(msg.time).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices Coming Due */}
          <Card className="rounded-2xl border-[var(--accent-2)]">
            <CardHeader>
              <CardTitle>Invoices Coming Due</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground">No upcoming invoices</p>
              ) : (
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{inv.customer}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Due: {new Date(inv.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold">${inv.amount}</div>
                          <div className="text-xs text-muted-foreground mt-1">{inv.invoiceNumber}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, onClick }: { title: string; value: number; onClick?: () => void }) {
  return (
    <Card 
      className={`rounded-2xl bg-[var(--accent)] border-[var(--accent-2)] transition-all ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground mb-2">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
