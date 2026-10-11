"use client";

import { motion, type Variants } from "motion/react";
import { Car, MapPin, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Build your clean",
    body: "Pick your vehicle size, package, and any extras. See the price update instantly.",
  },
  {
    icon: MapPin,
    title: "Tell us where",
    body: "Home or work — just drop in your postcode and your preferred day and time.",
  },
  {
    icon: Car,
    title: "We arrive & clean",
    body: "We bring the water, the power, and the kit. You get a spotless car, wherever you are.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0.6 },
  show: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export default function Steps() {
  return (
    <section id="how-it-works" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-lg font-semibold text-ink-soft">
            Three steps, no driving to a car wash.
          </p>
        </div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="mt-12 grid gap-6 sm:grid-cols-3"
        >
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <motion.li
              key={title}
              variants={cardVariants}
              className="relative flex flex-col gap-4 rounded-2xl border border-lines bg-surface p-6 shadow-sm"
            >
              <motion.span
                variants={badgeVariants}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-lg font-extrabold text-white"
              >
                {index + 1}
              </motion.span>
              <Icon className="h-6 w-6 text-teal" aria-hidden="true" />
              <h3 className="text-xl font-extrabold text-ink">{title}</h3>
              <p className="text-base font-semibold text-ink-soft">{body}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
