"use client";

import { motion } from "motion/react";
import ParticleButton from "@/components/kokonutui/particle-button";
import { business } from "@/lib/business";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#packages", label: "Prices" },
  { href: "#areas", label: "Areas" },
];

function WaterDropLogo({ animated }: { animated: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0"
      aria-hidden="true"
      animate={animated ? { rotate: [0, 8, 0, -8, 0] } : undefined}
      transition={
        animated
          ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <path
        d="M12 2C12 2 5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-13-7-13Z"
        fill="#0B5E66"
      />
      <path
        d="M9.2 15.5a2.8 2.8 0 0 0 2.8 2.8"
        stroke="#FFFFFF"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

export default function Header() {
  const reducedMotion = useReducedMotion();

  const scrollToSection = (href: string) => {
    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-lines bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <WaterDropLogo animated={!reducedMotion} />
          <span className="text-lg font-extrabold text-ink">
            {business.name}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(link.href);
              }}
              className="text-sm font-bold text-ink-soft transition-colors hover:text-teal"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ParticleButton
          className="h-11 bg-teal px-5 text-sm font-bold text-white hover:bg-teal/90"
          onClick={() => scrollToSection("#booking")}
        >
          Book a valet
        </ParticleButton>
      </div>
    </header>
  );
}
