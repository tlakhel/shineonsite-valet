"use client";

import { useSyncExternalStore } from "react";
import { type DaySlots, getUpcomingDays } from "@/lib/pricing";

function subscribe(): () => void {
  return () => {};
}

let cachedDayKey: string | null = null;
let cachedSnapshot: DaySlots[] = [];

function getSnapshot(): DaySlots[] {
  const todayKey = new Date().toDateString();
  if (cachedDayKey !== todayKey) {
    cachedDayKey = todayKey;
    cachedSnapshot = getUpcomingDays(new Date());
  }
  return cachedSnapshot;
}

function getServerSnapshot(): DaySlots[] {
  return [];
}

/** Upcoming booking days, computed client-side only (depends on "now"). */
export function useUpcomingDays(): DaySlots[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
