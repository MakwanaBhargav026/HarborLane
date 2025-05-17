"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetchCustomersData, Customers } from "../api/order"; // Adjust path to your customersApi.ts  
import React from "react";

const chartConfig = {
  actual: {
    label: "Actual",
    color: "hsl(var(--chart-2))",
  },
  predicted: {
    label: "Predicted",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function CustomersComponent() {
  const [chartData, setChartData] = React.useState<Customers[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadCustomersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCustomersData();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching customers data:", error);
        setError("Failed to load customers data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomersData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number of Customers</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!isLoading && !error && chartData.length === 0 && (
          <p className="text-center">No customers data available.</p>
        )}
        {!isLoading && !error && chartData.length > 0 && (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="actual"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="predicted"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
