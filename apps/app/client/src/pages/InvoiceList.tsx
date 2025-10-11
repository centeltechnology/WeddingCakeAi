import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  customerName?: string;
  customerEmail?: string;
  total: string;
  paidAmount?: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export default function InvoiceList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading: loading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Demo Invoice',
          total: 500
        })
      });
      if (!response.ok) throw new Error('Failed to create invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Success',
        description: 'Invoice created successfully'
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create invoice'
      });
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch(`/api/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark invoice as paid');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Success',
        description: 'Invoice marked as paid'
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark invoice as paid'
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      sent: { variant: 'secondary', icon: Clock },
      paid: { variant: 'default', icon: CheckCircle },
      partial: { variant: 'secondary', icon: AlertCircle },
      overdue: { variant: 'destructive', icon: AlertCircle },
      cancelled: { variant: 'outline', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading invoices...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader title="Invoices" subtitle="Manage customer invoices and payments" />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
          {invoices.map((invoice: Invoice) => {
            const isPaid = invoice.status === 'paid';

            return (
              <Card key={invoice.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.title}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-lg font-semibold">${parseFloat(invoice.total).toFixed(2)}</div>
                      {!isPaid && (
                        <Button 
                          size="sm" 
                          onClick={() => markPaidMutation.mutate(invoice.id)}
                          disabled={markPaidMutation.isPending}
                          className="h-7 text-xs"
                        >
                          {markPaidMutation.isPending ? 'Marking...' : 'Mark Paid'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-6 text-muted-foreground">
                    {invoice.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {invoice.paidAmount && parseFloat(invoice.paidAmount) > 0 && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4" />
                        ${parseFloat(invoice.paidAmount).toFixed(2)} paid
                      </div>
                    )}
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
