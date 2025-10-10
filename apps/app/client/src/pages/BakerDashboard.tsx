import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PipelineChart } from "../components/PipelineChart";
import { RevenueStat } from "../components/RevenueStat";
import { TaskList } from "../components/TaskList";
import AiToolsCard from "@/components/ai/AiToolsCard";
import AppLayout from "@/components/AppLayout";

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
        
        // Fetch all data in parallel
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
        <div style={{ padding: 24 }}>
          <h1>Baker Dashboard 🧁</h1>
          <p>Loading dashboard data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div style={{ padding: 24 }}>
          <h1>Baker Dashboard 🧁</h1>
          <div style={{ color: 'red' }}>{error}</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 32 }}>Baker Dashboard 🧁</h1>

            {/* AI Tools quick actions */}
            <section className="mb-4">
              <AiToolsCard />
            </section>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard title="Leads Today" value={stats?.leadsToday || 0} />
              <StatCard title="Quotes Pending" value={stats?.quotesPending || 0} onClick={() => navigate('/quotes')} />
              <StatCard title="Invoices Due" value={stats?.invoicesDue || 0} onClick={() => navigate('/invoices')} />
              <StatCard title="Awaiting Signature" value={stats?.contractsAwaitingSignature || 0} onClick={() => navigate('/contracts')} />
            </div>

            {/* Revenue and Tasks Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
              <RevenueStat />
              <TaskList />
            </div>

            {/* Pipeline Chart */}
            <div style={{ marginBottom: 24 }}>
              <PipelineChart />
            </div>

            {/* Data Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
              {/* Recent Messages */}
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20 }}>
                <h2 style={{ marginTop: 0, marginBottom: 16 }}>Recent Messages</h2>
                {messages.length === 0 ? (
                  <p style={{ color: '#666' }}>No recent messages</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.map((msg) => (
                      <div key={msg.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        <div style={{ fontWeight: 600 }}>{msg.name}</div>
                        <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{msg.snippet}</div>
                        <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                          {new Date(msg.time).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices Coming Due */}
              <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20 }}>
                <h2 style={{ marginTop: 0, marginBottom: 16 }}>Invoices Coming Due</h2>
                {invoices.length === 0 ? (
                  <p style={{ color: '#666' }}>No upcoming invoices</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {invoices.map((inv) => (
                      <div key={inv.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{inv.customer}</div>
                            <div style={{ color: '#666', fontSize: 14 }}>
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>${inv.amount}</div>
                            <div style={{ color: '#999', fontSize: 12 }}>{inv.invoiceNumber}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div></AppLayout>
  );
}

function StatCard({ title, value, onClick }: { title: string; value: number; onClick?: () => void }) {
  return (
    <div 
      style={{ 
        border: '1px solid #ddd', 
        borderRadius: 8, 
        padding: 20,
        backgroundColor: '#f9f9f9',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#f9f9f9';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}
