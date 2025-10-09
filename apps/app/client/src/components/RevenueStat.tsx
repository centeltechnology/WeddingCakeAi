import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RevenueData {
  current: number;
  previous: number;
  deltaPct: number;
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

  const { current = 0, previous = 0, deltaPct: change = 0 } = data || {};
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const changeColor = isNeutral ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue MTD</CardTitle>
        <CardDescription>Month-to-date revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            ${current.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
            <Icon className="h-4 w-4" />
            <span>{Math.abs(change)}% vs last month</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Previous month: ${previous.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
