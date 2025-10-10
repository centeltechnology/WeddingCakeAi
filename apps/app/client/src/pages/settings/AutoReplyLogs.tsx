import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, History } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { format } from 'date-fns';

type AutoReplyLog = {
  id: string;
  tenantId: string;
  leadId: string | null;
  channel: string;
  templateId: string | null;
  ruleId: string | null;
  toAddress: string;
  status: 'sent' | 'skipped' | 'failed';
  meta: {
    reason?: string;
    error?: string;
    [key: string]: any;
  } | null;
  createdAt: string;
};

type AutoReplyLogsProps = {
  embedded?: boolean;
};

export default function AutoReplyLogs({ embedded = false }: AutoReplyLogsProps) {
  const { data: logs = [], isLoading } = useQuery<AutoReplyLog[]>({
    queryKey: ['/api/auto-reply/logs'],
    queryFn: async () => {
      const res = await fetch('/api/auto-reply/logs', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-600">Sent</Badge>;
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Auto-Reply Activity Log
          </CardTitle>
          <CardDescription>
            Last 50 auto-reply attempts (sent, skipped, or failed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No auto-reply activity yet
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.toAddress || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.channel}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.status === 'skipped' && log.meta?.reason && (
                          <span>
                            {log.meta.reason === 'quiet_hours' && 'During quiet hours'}
                            {log.meta.reason === 'tenant_daily_limit_exceeded' && 'Daily limit reached'}
                            {log.meta.reason === 'lead_cooldown_active' && 'Cooldown period'}
                            {log.meta.reason === 'no_recipient_address' && 'No recipient address'}
                            {!['quiet_hours', 'tenant_daily_limit_exceeded', 'lead_cooldown_active', 'no_recipient_address'].includes(log.meta.reason) && log.meta.reason}
                          </span>
                        )}
                        {log.status === 'failed' && log.meta?.error && (
                          <span className="text-red-600">
                            Error: {log.meta.error}
                          </span>
                        )}
                        {log.status === 'sent' && '✓ Successfully delivered'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AppLayout>
      <PageHeader
        title="Auto-Reply Logs"
        subtitle="View recent auto-reply activity and status"
      />
      {content}
    </AppLayout>
  );
}
