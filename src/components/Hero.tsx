"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useMotionValueEvent, useScroll } from "motion/react";
import { animate as animateMotion } from "motion";
import { animate as animateAnime, stagger, svg, splitText } from "animejs";
import { CheckCircle2, Droplets, Home, ShieldCheck } from "lucide-react";
import ParticleButton from "@/components/kokonutui/particle-button";
import ShimmerText from "@/components/kokonutui/shimmer-text";
import HeroBackground from "@/components/HeroBackground";
import { carPaints } from "@/components/Car3D";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const Car3D = dynamic(() => import("@/components/Car3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-ink-soft">
      Loading 3D car…
    </div>
  ),
});

const TICKS = [
  { icon: ShieldCheck, label: "Fully insured" },
  { icon: Home, label: "Home or workplace" },
  { icon: CheckCircle2, label: "Pay after the clean" },
];

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLSpanElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  const [clean, setClean] = useState(0);
  const effectiveClean = reducedMotion ? 1 : clean;
  const [paintId, setPaintId] = useState(carPaints[0].id);
  const phaseRef = useRef<"auto" | "interactive">("auto");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reducedMotion) return;
    if (phaseRef.current === "interactive") {
      setClean(Math.min(1, Math.max(0, latest)));
    }
  });

  // One-time intro wash on load.
  useEffect(() => {
    if (reducedMotion) {
      phaseRef.current = "interactive";
      return;
    }
    const controls = animateMotion(0, 1, {
      duration: 2.4,
      ease: "easeInOut",
      onUpdate: (latest) => setClean(latest),
      onComplete: () => {
        phaseRef.current = "interactive";
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Headline word stagger + drawn underline.
  useEffect(() => {
    if (reducedMotion || !headlineRef.current) return;

    const splitter = splitText(headlineRef.current);
    animateAnime(splitter.words, {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 600,
      delay: stagger(55),
      ease: "outQuad",
    });

    if (underlinePathRef.current) {
      const [drawable] = svg.createDrawable(underlinePathRef.current);
      if (drawable) {
        animateAnime(drawable, {
          draw: ["0 0", "0 1"],
          duration: 650,
          delay: 950,
          ease: "inOutQuad",
        });
      }
    }

    return () => {
      splitter.revert();
    };
  }, [reducedMotion]);

  const triggerSplash = () => {
    if (reducedMotion) return;
    const container = splashRef.current;
    if (!container) return;
    container.innerHTML = "";

    const dropletCount = 10;
    for (let i = 0; i < dropletCount; i++) {
      const drop = document.createElement("span");
      drop.className = "absolute h-2 w-2 rounded-full bg-sun left-1/2 top-1/2";
      container.appendChild(drop);

      const angle = (i / dropletCount) * Math.PI * 2;
      const distance = 36 + Math.random() * 44;
      animateAnime(drop, {
        translateX: Math.cos(angle) * distance,
        translateY: Math.sin(angle) * distance - 18,
        opacity: [1, 0],
        scale: [1, 0.3],
        duration: 650 + Math.random() * 300,
        ease: "outCubic",
        onComplete: () => drop.remove(),
      });
    }
  };

  const handleWatchWash = () => {
    triggerSplash();
    if (reducedMotion) return;
    phaseRef.current = "auto";
    const controls = animateMotion(0, 1, {
      duration: 1.8,
      ease: "easeInOut",
      onUpdate: (latest) => setClean(latest),
      onComplete: () => {
        phaseRef.current = "interactive";
      },
    });
    return () => controls.stop();
  };

  const scrollToBooking = () => {
    document
      .getElementById("booking")
      ?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  };

  const selectedPaint =
    carPaints.find((paint) => paint.id === paintId) ?? carPaints[0];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-lines bg-background"
    >
      <HeroBackground />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-lines bg-surface px-4 py-2 text-sm font-bold text-teal">
            <Droplets className="h-4 w-4" aria-hidden="true" />
            Fully mobile · we bring water &amp; power
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
            <span ref={headlineRef}>
              A spotless car, cleaned at your{" "}
              <span className="relative inline-block">
                home or office.
                <svg
                  viewBox="0 0 240 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-2 left-0 h-4 w-full"
                >
                  <path
                    ref={underlinePathRef}
                    d="M2 12 Q 60 2, 120 12 T 238 10"
                    stroke="#F2B705"
                    strokeWidth={6}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg font-semibold text-ink-soft">
            Book a <ShimmerText text="valet" className="text-lg" /> and
            we&apos;ll come to your driveway or car park with everything we
            need — water, power, and a full kit. No trip to a car wash, ever.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ParticleButton
              size="lg"
              className="h-14 bg-teal px-8 text-base font-bold text-white hover:bg-teal/90"
              onClick={scrollToBooking}
            >
              Book a valet
            </ParticleButton>

            <div className="relative">
              <button
                type="button"
                onClick={handleWatchWash}
                className="flex h-14 items-center gap-2 rounded-full border-2 border-ink px-6 text-base font-bold text-ink transition-colors hover:bg-ink hover:text-white"
              >
                <Droplets className="h-5 w-5" aria-hidden="true" />
                Watch the wash
              </button>
              <div
                ref={splashRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              />
            </div>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {TICKS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-bold text-ink-soft"
              >
                <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right column: 3D car */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-lines bg-surface shadow-sm">
            <Car3D
              clean={effectiveClean}
              paintHex={selectedPaint.hex}
              reducedMotion={reducedMotion}
              active
            />
            <span className="absolute left-4 top-4 rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-white">
              Clean {Math.round(effectiveClean * 100)}%
            </span>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-lines bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-ink-soft">
                Dirty
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(effectiveClean * 100)}
                disabled={reducedMotion}
                onChange={(event) => {
                  phaseRef.current = "interactive";
                  setClean(Number(event.target.value) / 100);
                }}
                className="h-2 flex-1 accent-teal disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Clean percentage"
              />
              <span className="text-sm font-bold text-ink-soft">Clean</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-ink-soft">Paint:</span>
              <div className="flex gap-2">
                {carPaints.map((paint) => (
                  <button
                    key={paint.id}
                    type="button"
                    aria-label={paint.label}
                    title={paint.label}
                    onClick={() => setPaintId(paint.id)}
                    className="h-11 w-11 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: paint.hex,
                      borderColor:
                        paint.id === paintId ? "#0B1F33" : "#C3CFDA",
                      transform:
                        paint.id === paintId ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
