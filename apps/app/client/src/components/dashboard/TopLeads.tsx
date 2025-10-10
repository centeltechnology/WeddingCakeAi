import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/Button';

type Lead = {
  id: string;
  customer_name: string;
  customer_email: string;
  budget: string | null;
  status: string;
  score: number | null;
};

export function TopLeads() {
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads/scored'],
    queryFn: async () => {
      const res = await fetch('/api/leads/scored', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    enabled: import.meta.env.VITE_LEAD_SCORING_ENABLED === 'true',
  });

  const topLeads = leads.slice(0, 5);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (import.meta.env.VITE_LEAD_SCORING_ENABLED !== 'true') {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          Top Leads
        </CardTitle>
        <Link href="/leads">
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : topLeads.length === 0 ? (
          <div className="text-sm text-muted-foreground">No leads yet</div>
        ) : (
          <div className="space-y-3">
            {topLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lead.customer_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{lead.customer_email}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {lead.budget && (
                    <Badge variant="outline" className="text-xs">
                      {lead.budget}
                    </Badge>
                  )}
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(lead.score)}`}>
                    {lead.score ?? '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
