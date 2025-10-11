import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCw, TrendingUp, Mail, Phone, Calendar, DollarSign, Info, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

type Lead = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  budget: string | null;
  wedding_date: string | null;
  status: string;
  source: string;
  created_at: string;
  score: number | null;
  explanations: Array<{
    factor: string;
    weight: number;
    value: number;
    contribution: number;
  }> | null;
  computed_at: string | null;
};

export default function Leads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [recalculating, setRecalculating] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads/scored'],
    queryFn: async () => {
      const res = await fetch('/api/leads/scored', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
  });

  const recalcMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await fetch(`/api/leads/${leadId}/score/recalc`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to recalculate score');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads/scored'] });
      toast({
        title: 'Score Updated',
        description: 'Lead score has been recalculated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to recalculate lead score.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setRecalculating(null);
    },
  });

  const handleRecalculate = async (leadId: string) => {
    setRecalculating(leadId);
    recalcMutation.mutate(leadId);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-600';
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-purple-100 text-purple-700',
      quoted: 'bg-indigo-100 text-indigo-700',
      booked: 'bg-green-100 text-green-700',
      declined: 'bg-gray-100 text-gray-600',
    };
    
    return (
      <Badge className={variants[status] || variants.new}>
        {status}
      </Badge>
    );
  };

  const seedLeadsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/leads/sample', {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to seed sample leads');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads/scored'] });
      toast({ 
        title: 'Sample leads seeded', 
        description: data.created > 0 ? `Created ${data.created} new sample leads` : 'Sample leads already exist'
      });
    },
    onError: () => {
      toast({ title: 'Failed to seed sample leads', variant: 'destructive' });
    }
  });

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-4">
        <PageHeader
          title="Lead Scoring"
          subtitle="View and manage lead scores based on transparent criteria"
        />
        {import.meta.env.VITE_DEMO_MODE === 'true' && (
          <Button variant="outline" onClick={() => seedLeadsMutation.mutate()}>
            Seed Demo Leads
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No leads found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <div className={`px-3 py-1 rounded-full font-semibold text-sm ${getScoreColor(lead.score)}`}>
                                  {lead.score ?? '—'}
                                </div>
                                {lead.explanations && (
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </TooltipTrigger>
                            {lead.explanations && (
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold mb-2">Score Breakdown:</p>
                                  {lead.explanations.map((exp, idx) => (
                                    <div key={idx} className="text-xs flex justify-between gap-4">
                                      <span>{exp.factor}:</span>
                                      <span className="font-mono">
                                        {exp.value.toFixed(2)} × {exp.weight} = {exp.contribution.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.customer_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          {lead.customer_email && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">{lead.customer_email}</span>
                            </div>
                          )}
                          {lead.customer_phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{lead.customer_phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lead.source || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.budget ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>{lead.budget}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        {lead.wedding_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(lead.wedding_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/leads/${lead.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Open
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecalculate(lead.id)}
                            disabled={recalculating === lead.id}
                          >
                            <RefreshCw className={`h-4 w-4 ${recalculating === lead.id ? 'animate-spin' : ''}`} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {leads.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transparent Scoring Methodology</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Recency (40%)</p>
                <p className="text-muted-foreground">How recent the lead is. Newer leads score higher, decreases over 7 days.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Budget (25%)</p>
                <p className="text-muted-foreground">Lead budget value. Higher budgets increase score, normalized to $5,000 cap.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Engagement (20%)</p>
                <p className="text-muted-foreground">Response speed and interaction. Faster responses indicate higher interest.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Completeness (15%)</p>
                <p className="text-muted-foreground">Data completeness and source quality. Referrals and organic sources score higher.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
