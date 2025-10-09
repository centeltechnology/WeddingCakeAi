import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminNetworkReports() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['admin-network-report'],
    queryFn: async () => {
      const response = await fetch('/api/admin/reports/network');
      if (!response.ok) throw new Error('Failed to fetch network report');
      return response.json();
    }
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">No data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network Reports</h1>
        <p className="text-muted-foreground">Overview of advertiser network performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sends</CardTitle>
            <CardDescription>Network-wide deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.networkStats.totalSends.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Rate</CardTitle>
            <CardDescription>Average open percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.networkStats.openRate}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {report.networkStats.totalOpens.toLocaleString()} opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Click Rate</CardTitle>
            <CardDescription>Average click-through</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.networkStats.clickRate}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {report.networkStats.totalClicks.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unsubscribe Rate</CardTitle>
          <CardDescription>Network opt-out metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{report.networkStats.unsubRate}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            {report.networkStats.totalUnsubs.toLocaleString()} unsubscribes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Advertisers</CardTitle>
          <CardDescription>By total spend</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
                <TableHead className="text-right">Sends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.topAdvertisers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No advertisers yet
                  </TableCell>
                </TableRow>
              ) : (
                report.topAdvertisers.map((advertiser: any) => (
                  <TableRow key={advertiser.advertiserId}>
                    <TableCell className="font-medium">{advertiser.companyName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(advertiser.totalSpendCents)}</TableCell>
                    <TableCell className="text-right">{advertiser.totalSends.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Geos</CardTitle>
          <CardDescription>By email deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Sends</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.topGeos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No data yet
                  </TableCell>
                </TableRow>
              ) : (
                report.topGeos.map((geo: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {geo.city}, {geo.state}
                    </TableCell>
                    <TableCell className="text-right">{geo.sends.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
