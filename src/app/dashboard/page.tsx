import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StatTile from "@/components/dashboard/StatTile";
import RevenueChart from "@/components/dashboard/RevenueChart";
import PackagesChart from "@/components/dashboard/PackagesChart";
import UpcomingJobsTable from "@/components/dashboard/UpcomingJobsTable";
import { business } from "@/lib/business";
import { dashboardStats } from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-lines bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-extrabold text-teal"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to {business.name}
          </Link>
          <h1 className="text-3xl font-extrabold text-ink">Your bookings</h1>
          <p className="text-sm font-bold text-ink-soft">
            Example data — this dashboard is a demo of the valeter&apos;s view.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <StatTile key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-lines bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-ink">
              Revenue — last 12 weeks
            </h2>
            <p className="text-xs font-bold text-ink-soft">Example data</p>
            <div className="mt-4">
              <RevenueChart />
            </div>
          </div>

          <div className="rounded-2xl border border-lines bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-ink">
              Bookings by package
            </h2>
            <p className="text-xs font-bold text-ink-soft">Example data</p>
            <div className="mt-4">
              <PackagesChart />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-extrabold text-ink">
            Next 5 upcoming jobs
          </h2>
          <p className="text-xs font-bold text-ink-soft">Example data</p>
          <div className="mt-4">
            <UpcomingJobsTable />
          </div>
        </div>
      </main>
    </div>
  );
}
