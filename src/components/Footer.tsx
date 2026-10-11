import Link from "next/link";
import { business } from "@/lib/business";

export default function Footer() {
  return (
    <footer className="bg-navy py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xl font-extrabold text-white">{business.name}</p>
          <p className="mt-1 font-semibold text-white/90">{business.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm font-bold sm:flex sm:gap-10">
          <div>
            <p className="text-white/70">Phone</p>
            <p className="mt-1 text-white">{business.phone}</p>
          </div>
          <div>
            <p className="text-white/70">Email</p>
            <p className="mt-1 text-white">{business.email}</p>
          </div>
          <div>
            <p className="text-white/70">Service area</p>
            <p className="mt-1 text-white">{business.area}</p>
          </div>
          <div>
            <p className="text-white/70">Hours</p>
            <p className="mt-1 text-white">{business.hours}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/15 px-4 pt-6 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center text-sm font-extrabold text-white underline underline-offset-4 hover:text-sun"
        >
          Owner dashboard (demo)
        </Link>
      </div>
    </footer>
  );
}
