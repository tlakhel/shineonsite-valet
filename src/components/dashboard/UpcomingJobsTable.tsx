import { upcomingJobs } from "@/lib/dashboard-data";

export default function UpcomingJobsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-lines bg-surface shadow-sm">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-lines">
            {["Time", "Postcode", "Package", "Location"].map((heading) => (
              <th
                key={heading}
                className="px-5 py-3 font-extrabold text-ink-soft"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {upcomingJobs.map((job) => (
            <tr
              key={`${job.time}-${job.postcode}`}
              className="border-b border-lines last:border-0"
            >
              <td className="px-5 py-3 font-bold text-ink">{job.time}</td>
              <td className="px-5 py-3 font-bold text-ink">{job.postcode}</td>
              <td className="px-5 py-3 font-bold text-ink">
                {job.packageName}
              </td>
              <td className="px-5 py-3 font-bold text-ink">{job.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
