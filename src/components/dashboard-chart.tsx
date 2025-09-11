'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';

const data = [
  { month: 'Jan', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Feb', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Mar', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Apr', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'May', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Jun', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Jul', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Aug', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Sep', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Oct', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Nov', total: Math.floor(Math.random() * 2000) + 500 },
  { month: 'Dec', total: Math.floor(Math.random() * 2000) + 500 },
];

export function DashboardChart() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Rental Income Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
