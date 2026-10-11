"use client";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { bookingsByPackage } from "@/lib/dashboard-data";

export default function PackagesChart() {
  return (
    <BarChart
      data={bookingsByPackage as unknown as Record<string, unknown>[]}
      xDataKey="name"
      aspectRatio="16 / 9"
    >
      <Grid horizontal numTicksRows={4} />
      <Bar dataKey="bookings" fill="#F2B705" />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
