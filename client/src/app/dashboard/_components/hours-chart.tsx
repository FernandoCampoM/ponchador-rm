"use client"

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { TimeEntry } from "@/lib/types"
import { Value } from "@radix-ui/react-select";

interface HoursChartProps {
  timeEntries: TimeEntry[];
}

export function HoursChart({ timeEntries }: HoursChartProps) {
  const data = timeEntries.reduce((acc, entry) => {
    if (!entry.clockOut) return acc;
    console.log("Entry:", entry);
    console.log("Type of clockIn:", typeof entry.clockIn, entry.clockIn);
    console.log("Type of clockOut:", typeof entry.clockOut, entry.clockOut);
    const hours = (entry.clockOut.getTime() - entry.clockIn.getTime()) / (1000 * 60 * 60);
    
    const existingUser = acc.find(item => item.userId === entry.userId);
    if (existingUser) {
      existingUser.totalHours += hours;
    } else {
      acc.push({ userId: entry.userId, name: entry.userName, totalHours: hours });
    }
    
    return acc;
  }, [] as {userId: string; name: string; totalHours: number }[]).map(d => ({ ...d, totalHours: parseFloat(d.totalHours.toFixed(2)) }));


  const chartConfig = {
    totalHours: {
      label: "Total Hours",
      color: "hsl(var(--primary))",
    },
  };
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <RechartsBarChart accessibilityLayer data={data}>
        <XAxis
        dataKey="name"
         tickFormatter={(value) =>
    value.split(" ")[0]+" "+String(value.split(" ")[1]?value.split(" ")[1]:"").slice(0,1).toUpperCase()
  }
         interval={0}
        stroke="#888888"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        angle={-90}
        textAnchor="end"
        height={80}
      />

        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip
        cursor={false}
        content={({ payload }) => {
          if (!payload || !payload.length) return null;

          const { name, userId, totalHours } = payload[0].payload;
          const color = payload[0].color || payload[0].fill;

          return (
            <div className="rounded-lg border bg-white px-3 py-2 shadow">
              <p className="text-xs text-muted-foreground">ID: {userId}</p>
              <p className="text-sm font-semibold">{name}</p>

              <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{totalHours} h</span>
              </div>
            </div>
          );
        }}
      />

        <Bar dataKey="totalHours" fill="var(--color-totalHours)" radius={4} />
      </RechartsBarChart>
    </ChartContainer>
  )
}
/* 
 */