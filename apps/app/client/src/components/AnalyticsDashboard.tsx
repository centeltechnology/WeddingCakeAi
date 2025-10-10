import { useState } from "react";
import { TrendingUp, Eye, MessageCircle, DollarSign, Calendar, Users, Download, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

interface AnalyticsDashboardProps {
  bakerId: string;
}

interface AnalyticsSummary {
  profileViews: number;
  inquiries: number;
  bookings: number;
  revenue: number;
  averageRating: number;
  completedProjects: number;
  repeatCustomers: number;
  conversionRate: number;
}

interface AnalyticsData {
  date: string;
  metric: string;
  value: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export function AnalyticsDashboard({ bakerId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('profile_view');

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/bakers', bakerId, 'analytics', 'summary', startDate, endDate],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bakers/${bakerId}/analytics?startDate=${startDate}&endDate=${endDate}`);
      return response.json() as Promise<AnalyticsSummary>;
    },
  });

  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ['/api/bakers', bakerId, 'analytics', selectedMetric],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bakers/${bakerId}/analytics?metric=${selectedMetric}`);
      return response.json() as Promise<AnalyticsData[]>;
    },
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/bakers', bakerId, 'transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bakers/${bakerId}/transactions`);
      return response.json() as Promise<any[]>;
    },
  });

  const metricOptions = [
    { value: 'profile_view', label: 'Profile Views', icon: Eye },
    { value: 'inquiry_received', label: 'Inquiries Received', icon: MessageCircle },
    { value: 'quote_sent', label: 'Quotes Sent', icon: Calendar },
    { value: 'booking_confirmed', label: 'Bookings Confirmed', icon: Users },
  ];

  const formatChartData = (data: AnalyticsData[]) => {
    const grouped = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = { date, value: 0 };
      }
      acc[date].value += item.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const getRevenueByType = () => {
    const revenueByType = transactions.reduce((acc, transaction) => {
      if (transaction.status === 'completed') {
        acc[transaction.type] = (acc[transaction.type] || 0) + parseFloat(transaction.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByType).map(([type, amount]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: amount
    }));
  };

  const exportData = () => {
    const dataToExport = {
      summary,
      chartData,
      transactions: transactions.filter(t => t.status === 'completed'),
      exportDate: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${bakerId}-${startDate}-to-${endDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i} data-testid={`metric-card-loading-${i}`}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartDataFormatted = formatChartData(chartData);
  const revenueData = getRevenueByType();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card data-testid="analytics-header">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Dashboard
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32" data-testid="select-time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={exportData}
                variant="outline" 
                size="sm"
                data-testid="button-export-data"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid="metric-profile-views">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.profileViews?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-inquiries">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.inquiries?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-bookings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.bookings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-rating">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.averageRating?.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground">All time average</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-completed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completedProjects?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Projects completed</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-repeat">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.repeatCustomers?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Return clients</p>
          </CardContent>
        </Card>

        <Card data-testid="metric-conversion">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.conversionRate?.toFixed(1) || '0.0'}%</div>
            <p className="text-xs text-muted-foreground">Inquiry to booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card data-testid="trend-chart">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Trend Analysis</span>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48" data-testid="select-metric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [value, metricOptions.find(m => m.value === selectedMetric)?.label || selectedMetric]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card data-testid="revenue-chart">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No revenue data yet</p>
                  <p className="text-sm">Complete your first transaction to see revenue analytics</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card data-testid="recent-transactions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map(transaction => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center p-3 border rounded dark:border-gray-700"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div>
                    <div className="font-medium capitalize">
                      {transaction.type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${parseFloat(transaction.amount).toFixed(2)}</div>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm" data-testid="button-view-all-transactions">
                    View All Transactions ({transactions.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your payment history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}