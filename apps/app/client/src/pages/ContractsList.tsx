import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Calendar, DollarSign, User, CheckCircle, Clock, XCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  customerName?: string;
  status: string;
  totalAmount: string;
  signedAt?: string;
  eventDate?: string;
  createdAt: string;
}

export default function ContractsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contracts, isLoading: loading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const res = await fetch('/api/contracts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch contracts');
      return res.json() as Promise<Contract[]>;
    }
  });

  const signMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contracts/${id}/sign`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Sign failed');
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({
        title: 'Contract Signed!',
        description: result.invoiceId ? `Deposit invoice created. ID: ${result.invoiceId.slice(0, 8)}...` : 'Contract signed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Sign Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive', icon: any }> = {
      draft: { variant: 'outline', icon: Clock },
      sent: { variant: 'secondary', icon: Clock },
      signed: { variant: 'default', icon: CheckCircle },
      completed: { variant: 'default', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
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
          <div className="text-muted-foreground">Loading contracts...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader title="Contracts" subtitle="Manage your customer contracts" />
          <div className="flex gap-2">
            {import.meta.env.VITE_DEMO_MODE === 'true' && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/contracts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        title: 'Demo Contract',
                        status: 'draft',
                        totalAmount: '750',
                      })
                    });
                    if (!res.ok) {
                      const error = await res.json();
                      throw new Error(error.error || 'Failed to create contract');
                    }
                    queryClient.invalidateQueries({ queryKey: ['contracts'] });
                    toast({ title: 'Demo contract created' });
                  } catch (e: any) {
                    toast({ title: 'Failed to create demo contract', description: e.message, variant: 'destructive' });
                  }
                }}
              >
                Seed Draft Contract
              </Button>
            )}
            <Link href="/contracts/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
            </Link>
          </div>
        </div>

        {!contracts || contracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contracts yet</h3>
            <p className="text-muted-foreground mb-4">Create your first contract to get started</p>
            <Link href="/contracts/new">
              <Button>Create Contract</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => {
            const isSigned = contract.status === 'signed' || contract.status === 'completed';

            return (
              <Card key={contract.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{contract.contractNumber}</CardTitle>
                        {getStatusBadge(contract.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{contract.title}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-lg font-semibold">${parseFloat(contract.totalAmount).toFixed(2)}</div>
                      <div className="flex gap-2">
                        <Link href={`/contracts/${contract.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            <Edit className="h-3 w-3" />
                            Open
                          </Button>
                        </Link>
                        {!isSigned && (
                          <Button
                            size="sm"
                            onClick={() => signMutation.mutate(contract.id)}
                            disabled={signMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            {signMutation.isPending ? 'Signing...' : 'Sign'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    {contract.customerName && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {contract.customerName}
                      </div>
                    )}
                    {contract.eventDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(contract.eventDate).toLocaleDateString()}
                      </div>
                    )}
                    {contract.signedAt && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Signed {new Date(contract.signedAt).toLocaleDateString()}
                      </div>
                    )}
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
