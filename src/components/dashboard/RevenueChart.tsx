"use client";

import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { weeklyRevenue } from "@/lib/dashboard-data";

export default function RevenueChart() {
  return (
    <AreaChart
      data={weeklyRevenue as unknown as Record<string, unknown>[]}
      xDataKey="date"
      aspectRatio="16 / 8"
    >
      <Grid horizontal numTicksRows={4} />
      <Area
        dataKey="revenue"
        stroke="#0B5E66"
        fill="#0B5E66"
        fillOpacity={0.18}
        showMarkers
      />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
