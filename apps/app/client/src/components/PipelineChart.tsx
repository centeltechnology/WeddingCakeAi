import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PipelineData {
  status: string;
  count: number;
}

export function PipelineChart() {
  const { data, isLoading, error } = useQuery<PipelineData[]>({
    queryKey: ["/api/app/charts/pipeline"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Pipeline</CardTitle>
          <CardDescription>Quotes by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quote Pipeline</CardTitle>
          <CardDescription>Quotes by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-destructive">
            Error loading chart data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Pipeline</CardTitle>
        <CardDescription>Quotes by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
