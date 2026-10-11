"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { LiquidGlassCard } from "@/components/kokonutui/liquid-glass-card";
import Receipt from "@/components/Receipt";
import {
  type BookingSelection,
  type ExtraId,
  type LocationType,
  type VehicleSizeId,
  checkPostcodeCoverage,
  extras,
  packages,
  vehicleSizes,
} from "@/lib/pricing";
import { useUpcomingDays } from "@/hooks/use-upcoming-days";

export default function BookingBuilder() {
  const [vehicleSize, setVehicleSize] = useState<VehicleSizeId>("small");
  const [packageId, setPackageId] = useState<BookingSelection["packageId"]>(
    "full"
  );
  const [extraIds, setExtraIds] = useState<ExtraId[]>([]);
  const [location, setLocation] = useState<LocationType>("home");
  const [postcode, setPostcode] = useState("");
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const days = useUpcomingDays();

  const postcodeCheck = useMemo(
    () => checkPostcodeCoverage(postcode),
    [postcode]
  );

  const selection: BookingSelection = {
    vehicleSize,
    packageId,
    extraIds,
    location,
    postcode,
    dateIso,
    time,
  };

  const toggleExtra = (id: ExtraId) => {
    setExtraIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedDay = days.find((day) => day.dateIso === dateIso) ?? null;

  return (
    <section id="booking" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Build your booking
          </h2>
          <p className="mt-3 text-lg font-semibold text-ink-soft">
            This is a demo booking flow — nothing is submitted anywhere.
            Example prices only.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Choices */}
          <div className="flex flex-col gap-10">
            {/* Vehicle size */}
            <div>
              <h3 className="text-lg font-extrabold text-ink">Vehicle size</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {vehicleSizes.map((size) => {
                  const selected = size.id === vehicleSize;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setVehicleSize(size.id)}
                      className="relative min-h-[44px] overflow-hidden rounded-xl border border-lines px-4 py-3 text-left"
                    >
                      {selected && (
                        <motion.span
                          layoutId="vehicle-pill"
                          className="absolute inset-0 rounded-xl bg-teal"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <span
                        className={`relative z-10 block text-sm font-extrabold ${
                          selected ? "text-white" : "text-ink"
                        }`}
                      >
                        {size.label}{" "}
                        {size.surcharge > 0 && `+£${size.surcharge}`}
                      </span>
                      <span
                        className={`relative z-10 block text-xs font-bold ${
                          selected ? "text-white/85" : "text-ink-soft"
                        }`}
                      >
                        {size.examples}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Package */}
            <div id="packages">
              <h3 className="text-lg font-extrabold text-ink">Package</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {packages.map((pkg) => {
                  const selected = pkg.id === packageId;
                  return (
                    <motion.button
                      key={pkg.id}
                      type="button"
                      layout
                      onClick={() => setPackageId(pkg.id)}
                      className="text-left"
                      whileTap={{ scale: 0.98 }}
                    >
                      <LiquidGlassCard
                        className={`h-full rounded-2xl border-2 transition-colors ${
                          selected
                            ? "border-teal bg-teal/5"
                            : "border-lines bg-surface"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-lg font-extrabold text-ink">
                            {pkg.name}
                          </h4>
                          {selected && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-white"
                            >
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </motion.span>
                          )}
                        </div>
                        <p className="mt-1 text-2xl font-extrabold text-ink">
                          £{pkg.price}
                        </p>
                        <p className="text-sm font-bold text-ink-soft">
                          {pkg.duration}
                        </p>
                        <ul className="mt-3 flex flex-col gap-1.5">
                          {pkg.features.map((feature) => (
                            <li
                              key={feature}
                              className="text-sm font-semibold text-ink-soft"
                            >
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </LiquidGlassCard>
                    </motion.button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-bold text-ink-soft">
                Example prices.
              </p>
            </div>

            {/* Extras */}
            <div>
              <h3 className="text-lg font-extrabold text-ink">Extras</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {extras.map((extra) => {
                  const selected = extraIds.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      aria-pressed={selected}
                      className={`flex min-h-[44px] items-center justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                        selected
                          ? "border-teal bg-teal/10"
                          : "border-lines bg-surface"
                      }`}
                    >
                      <span className="text-sm font-extrabold text-ink">
                        {extra.label}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-extrabold text-teal">
                        +£{extra.price}
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selected
                              ? "border-teal bg-teal text-white"
                              : "border-lines text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div id="areas">
              <h3 className="text-lg font-extrabold text-ink">Location</h3>
              <div className="relative mt-4 flex max-w-xs gap-2">
                {(["home", "work"] as LocationType[]).map((option) => {
                  const selected = option === location;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLocation(option)}
                      className="relative min-h-[44px] flex-1 overflow-hidden rounded-xl border border-lines px-4 py-3"
                    >
                      {selected && (
                        <motion.span
                          layoutId="location-pill"
                          className="absolute inset-0 rounded-xl bg-teal"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                      <span
                        className={`relative z-10 text-sm font-extrabold ${
                          selected ? "text-white" : "text-ink"
                        }`}
                      >
                        At {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 max-w-xs">
                <label
                  htmlFor="postcode"
                  className="text-sm font-extrabold text-ink"
                >
                  Postcode
                </label>
                <input
                  id="postcode"
                  type="text"
                  value={postcode}
                  onChange={(event) => setPostcode(event.target.value)}
                  placeholder="e.g. SS1 2AB"
                  className="mt-2 min-h-[44px] w-full rounded-xl border border-lines bg-surface px-4 text-base font-bold text-ink outline-none focus:border-teal"
                />
                {postcode.trim().length > 0 && (
                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${
                      postcodeCheck.covered
                        ? "bg-teal/10 text-teal"
                        : "bg-signal-red/10 text-signal-red"
                    }`}
                  >
                    {postcodeCheck.message}
                  </span>
                )}
              </div>
            </div>

            {/* Day and time */}
            <div>
              <h3 className="text-lg font-extrabold text-ink">Day &amp; time</h3>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {days.map((day) => {
                  const selected = day.dateIso === dateIso;
                  return (
                    <button
                      key={day.dateIso}
                      type="button"
                      onClick={() => {
                        setDateIso(day.dateIso);
                        setTime(null);
                      }}
                      className={`min-h-[44px] shrink-0 rounded-xl border-2 px-4 py-2 text-center transition-colors ${
                        selected
                          ? "border-teal bg-teal text-white"
                          : "border-lines bg-surface text-ink"
                      }`}
                    >
                      <span className="block text-xs font-extrabold uppercase">
                        {day.weekdayLabel}
                      </span>
                      <span className="block text-sm font-extrabold">
                        {day.dayLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {selectedDay.slots.map((slot) => {
                    const selected = slot.time === time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={slot.full}
                        onClick={() => setTime(slot.time)}
                        className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-sm font-extrabold transition-colors ${
                          slot.full
                            ? "border-dashed border-lines text-ink-soft opacity-60"
                            : selected
                              ? "border-teal bg-teal text-white"
                              : "border-lines bg-surface text-ink"
                        }`}
                      >
                        {slot.time}
                        {slot.full && (
                          <span className="block text-[10px] font-bold">
                            Full
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Receipt */}
          <Receipt selection={selection} />
        </div>
      </div>
    </section>
  );
}
