import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RevenueData {
  current: number;
  previous: number;
  deltaPct: number;
  currentFormatted?: string;
  previousFormatted?: string;
}

export function RevenueStat() {
  const { data, isLoading, error } = useQuery<RevenueData>({
    queryKey: ["/api/app/stats/revenue-mtd"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue MTD</CardTitle>
          <CardDescription>Month-to-date revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue MTD</CardTitle>
          <CardDescription>Month-to-date revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading revenue data</div>
        </CardContent>
      </Card>
    );
  }

  const { current = 0, previous = 0, deltaPct: change = 0, currentFormatted, previousFormatted } = data || {};
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const changeColor = isNeutral ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-600";

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue MTD</CardTitle>
        <CardDescription>Month-to-date revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {currentFormatted || formatUSD(current)}
          </div>
          <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
            <Icon className="h-4 w-4" />
            <span>{Math.abs(change).toFixed(1)}% vs last month</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Previous month: {previousFormatted || formatUSD(previous)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
