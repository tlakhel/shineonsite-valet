"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { animate as animateAnime } from "animejs";
import { PartyPopper } from "lucide-react";
import {
  type BookingSelection,
  checkPostcodeCoverage,
  computeLineItems,
  computeTotal,
} from "@/lib/pricing";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export default function Receipt({ selection }: { selection: BookingSelection }) {
  const reducedMotion = useReducedMotion();
  const lineItems = computeLineItems(selection);
  const total = computeTotal(selection);

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  const prevTotalRef = useRef(total);
  const burstRef = useRef<HTMLDivElement>(null);

  const motionTotal = useMotionValue(total);
  const springTotal = useSpring(motionTotal, { stiffness: 260, damping: 28 });
  const displayTotal = useTransform(springTotal, (value) => `£${Math.round(value)}`);

  useEffect(() => {
    if (total > prevTotalRef.current) setFlash("up");
    else if (total < prevTotalRef.current) setFlash("down");
    prevTotalRef.current = total;
    motionTotal.set(total);
  }, [total, motionTotal]);

  useEffect(() => {
    if (!flash) return;
    const timeout = setTimeout(() => setFlash(null), 650);
    return () => clearTimeout(timeout);
  }, [flash]);

  const triggerBurst = () => {
    if (reducedMotion) return;
    const container = burstRef.current;
    if (!container) return;
    container.innerHTML = "";

    const colors = ["#F2B705", "#0B5E66", "#FFFFFF"];
    for (let i = 0; i < 18; i++) {
      const particle = document.createElement("span");
      particle.className = "absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full";
      particle.style.backgroundColor = colors[i % colors.length];
      container.appendChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 90;
      animateAnime(particle, {
        translateX: Math.cos(angle) * distance,
        translateY: Math.sin(angle) * distance,
        opacity: [1, 0],
        scale: [1, 0.2],
        duration: 800 + Math.random() * 400,
        ease: "outCubic",
        onComplete: () => particle.remove(),
      });
    }
  };

  const handleSubmit = () => {
    const postcodeOk = checkPostcodeCoverage(selection.postcode).covered;
    if (!postcodeOk) {
      setError("Enter a postcode we cover (SS or CM) to continue.");
      return;
    }
    if (!selection.dateIso || !selection.time) {
      setError("Pick a day and time slot to continue.");
      return;
    }
    setError(null);
    setSubmitted(true);
    triggerBurst();
  };

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-lines bg-surface p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-ink">Your receipt</h3>
        <p className="text-xs font-bold text-ink-soft">Example prices</p>

        <ul className="mt-4 flex flex-col gap-2 border-b border-lines pb-4">
          {lineItems.length === 0 && (
            <li className="text-sm font-semibold text-ink-soft">
              Choose a package to get started.
            </li>
          )}
          {lineItems.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between text-sm font-bold text-ink"
            >
              <span>{item.label}</span>
              <span>£{item.amount}</span>
            </li>
          ))}
        </ul>

        <motion.div
          animate={{
            backgroundColor:
              flash === "up"
                ? "rgba(11,94,102,0.16)"
                : flash === "down"
                  ? "rgba(179,38,30,0.14)"
                  : "rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.4 }}
          className="mt-4 flex items-center justify-between rounded-xl px-3 py-3"
        >
          <span className="text-base font-extrabold text-ink">Total</span>
          <motion.span className="text-2xl font-extrabold text-ink">
            {displayTotal}
          </motion.span>
        </motion.div>

        <div className="relative mt-5">
          {!submitted ? (
            <>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-teal px-6 text-base font-extrabold text-white transition-colors hover:bg-teal/90"
              >
                Request this booking
              </button>
              <p className="mt-2 text-center text-xs font-bold text-ink-soft">
                Demo only — nothing is sent, no payment is taken.
              </p>
              {error && (
                <p className="mt-2 text-center text-sm font-extrabold text-signal-red">
                  {error}
                </p>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-teal bg-teal/10 px-4 py-5 text-center"
            >
              <PartyPopper className="h-6 w-6 text-teal" aria-hidden="true" />
              <p className="text-base font-extrabold text-ink">
                Booking requested (demo)
              </p>
              <p className="text-sm font-semibold text-ink-soft">
                In a real booking we&apos;d confirm your slot by text or
                email. No backend is wired up here.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-1 min-h-[44px] rounded-xl border border-lines px-4 text-sm font-extrabold text-ink"
              >
                Make another demo booking
              </button>
            </motion.div>
          )}
          <div
            ref={burstRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-visible"
          />
        </div>
      </div>
    </aside>
  );
}
