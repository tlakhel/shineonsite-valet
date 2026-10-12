"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { animate as animateMotion } from "motion";
import { ChevronsLeftRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const REVEAL_START = 4;
const REVEAL_SETTLE = 50;
const STEP = 4;

export interface BeforeAfterHandle {
  /** Replays the left-to-right reveal animation, settling back at 50%. */
  replay: () => void;
}

const BeforeAfter = forwardRef<BeforeAfterHandle>(function BeforeAfter(
  _props,
  ref
) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(REVEAL_SETTLE);

  const playReveal = useCallback(() => {
    if (reducedMotion) {
      setPosition(REVEAL_SETTLE);
      return undefined;
    }
    setPosition(REVEAL_START);
    const controls = animateMotion(REVEAL_START, REVEAL_SETTLE, {
      duration: 1.6,
      ease: "easeInOut",
      onUpdate: (latest) => setPosition(latest),
    });
    return controls;
  }, [reducedMotion]);

  useEffect(() => {
    const controls = playReveal();
    return () => controls?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useImperativeHandle(ref, () => ({ replay: () => playReveal() }), [
    playReveal,
  ]);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(event.clientX);
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((prev) => Math.max(0, prev - STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((prev) => Math.min(100, prev + STEP));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-3xl border-2 border-lines bg-surface shadow-lg"
    >
      <Image
        src="/images/after.jpg"
        alt="The same car, freshly valeted and shining clean"
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src="/images/before.jpg"
          alt="The same car, muddy and dirty before a valet"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-sm">
        Before
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-sm">
        After
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.35)]"
        style={{ left: `${position}%` }}
      />

      <div
        role="slider"
        tabIndex={0}
        aria-label="Before and after comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation="horizontal"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={handleKeyDown}
        style={{ left: `${position}%`, touchAction: "none" }}
        className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-md outline-none focus-visible:ring-4 focus-visible:ring-teal/40"
      >
        <ChevronsLeftRight className="h-5 w-5 text-navy" aria-hidden="true" />
      </div>
    </div>
  );
});

export default BeforeAfter;
