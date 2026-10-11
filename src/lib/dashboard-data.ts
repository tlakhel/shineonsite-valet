export interface WeeklyRevenuePoint {
  date: Date;
  revenue: number;
}

/** Fixed anchor so the chart data stays stable at build time (demo data only). */
const EXAMPLE_DATA_ANCHOR = new Date("2026-10-11T00:00:00Z");

/** Example data — 12 weeks of revenue, most recent week last. */
export const weeklyRevenue: WeeklyRevenuePoint[] = [
  980, 1040, 890, 1120, 1260, 1180, 1340, 1290, 1410, 1380, 1520, 1610,
].map((revenue, index) => {
  const date = new Date(EXAMPLE_DATA_ANCHOR);
  date.setDate(date.getDate() - (11 - index) * 7);
  return { date, revenue };
});

export interface PackageBookings {
  name: string;
  bookings: number;
}

/** Example data — bookings by package over the last 30 days. */
export const bookingsByPackage: PackageBookings[] = [
  { name: "Express", bookings: 34 },
  { name: "Full Valet", bookings: 51 },
  { name: "Deluxe", bookings: 18 },
];

export interface DashboardStat {
  label: string;
  value: string;
}

/** Example data — headline stat tiles. */
export const dashboardStats: DashboardStat[] = [
  { label: "Bookings this week", value: "23" },
  { label: "Revenue this month", value: "£5,960" },
  { label: "Average job value", value: "£58" },
  { label: "Repeat customers", value: "61%" },
];

export interface UpcomingJob {
  time: string;
  postcode: string;
  packageName: string;
  location: "Home" | "Work";
}

/** Example data — next five scheduled jobs. */
export const upcomingJobs: UpcomingJob[] = [
  { time: "Today, 10:00", postcode: "SS2 6JA", packageName: "Full Valet", location: "Home" },
  { time: "Today, 14:00", postcode: "CM1 4GL", packageName: "Express", location: "Work" },
  { time: "Tomorrow, 08:00", postcode: "SS9 1AX", packageName: "Deluxe", location: "Home" },
  { time: "Tomorrow, 12:00", postcode: "CM2 0PQ", packageName: "Full Valet", location: "Work" },
  { time: "Thu, 16:00", postcode: "SS1 2AB", packageName: "Express", location: "Home" },
];
