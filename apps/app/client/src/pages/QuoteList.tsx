import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';

export default function QuoteList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const res = await fetch('/api/quotes', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/quotes/${id}/approve`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Approve failed');
      }
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: 'Quote Approved!',
        description: `Contract created successfully. ID: ${result.contractId?.slice(0, 8)}...`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading quotes...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load quotes.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PageHeader title="Quotes" subtitle="Create, review, and approve quotes" />
          <Link href="/quotes/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Quote
            </Button>
          </Link>
        </div>

        {!data || data.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No quotes yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first quote to get started</p>
          <Link href="/quotes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((quote: any) => (
            <div
              key={quote.id}
              className="border rounded-xl p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-lg">
                  {quote.title || `Quote ${quote.quoteNumber || quote.id.slice(0, 8)}`}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Status: <span className={`font-medium ${
                    quote.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                    quote.status === 'sent' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {quote.status?.charAt(0).toUpperCase() + quote.status?.slice(1) || 'Draft'}
                  </span>
                </div>
                {quote.totalAmount && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Amount: <span className="font-medium">${parseFloat(quote.totalAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Link href={`/quotes/${quote.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
                
                {quote.status !== 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(quote.id)}
                    disabled={approveMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </AppLayout>
  );
}
