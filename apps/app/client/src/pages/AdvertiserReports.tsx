import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdvertiserReports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['advertiser-summary', appliedFrom, appliedTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (appliedFrom) params.append('from', appliedFrom);
      if (appliedTo) params.append('to', appliedTo);
      
      const response = await fetch(`/api/advertisers/reports/summary?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    }
  });

  const handleApplyFilter = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const calculateRate = (numerator: number, denominator: number) => {
    if (denominator === 0) return '0.00';
    return ((numerator / denominator) * 100).toFixed(2);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Reports</h1>
        <p className="text-muted-foreground">View your campaign performance metrics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Filter reports by date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleApplyFilter} className="w-full">
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Emails Sent</CardTitle>
              <CardDescription>Total deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.sends.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opens</CardTitle>
              <CardDescription>Email open rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.opens.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {calculateRate(summary.opens, summary.sends)}% open rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clicks</CardTitle>
              <CardDescription>Click-through rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.clicks.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {calculateRate(summary.clicks, summary.sends)}% CTR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unsubscribes</CardTitle>
              <CardDescription>Opt-out rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.unsubscribes.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {calculateRate(summary.unsubscribes, summary.sends)}% unsub rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Spend</CardTitle>
              <CardDescription>Campaign costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(summary.spendCents)}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
