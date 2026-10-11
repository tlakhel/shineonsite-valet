"use client";

import { useEffect, useRef, useState } from "react";
import { Water } from "@paper-design/shaders-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const BASE_SPEED = 0.35;

export default function HeroBackground() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const speed = reducedMotion || !inView ? 0 : BASE_SPEED;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "#EEF3F6" }}
    >
      <Water
        className="absolute inset-0 h-full w-full"
        style={{ pointerEvents: "none" }}
        fit="cover"
        scale={1.1}
        size={1.2}
        colorBack="#EEF3F6"
        colorHighlight="#FFFFFF"
        highlights={0.5}
        layering={0.4}
        waves={0.5}
        caustic={0}
        edges={0}
        speed={speed}
      />
      {/* Subtle teal brand tint, layered on top of the white caustic highlights. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 72%, rgba(11,94,102,0.14), transparent 58%), radial-gradient(circle at 78% 22%, rgba(11,94,102,0.10), transparent 55%)",
        }}
      />
    </div>
  );
}
