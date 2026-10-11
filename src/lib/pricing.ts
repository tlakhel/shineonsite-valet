export type VehicleSizeId = "small" | "medium" | "large" | "van";

export interface VehicleSizeOption {
  id: VehicleSizeId;
  label: string;
  examples: string;
  surcharge: number;
}

export const vehicleSizes: VehicleSizeOption[] = [
  { id: "small", label: "Small", examples: "Fiesta, Polo, Corsa", surcharge: 0 },
  { id: "medium", label: "Medium", examples: "Golf, Focus, A3", surcharge: 5 },
  { id: "large", label: "Large / SUV", examples: "Qashqai, X5, Estate", surcharge: 10 },
  { id: "van", label: "Van / 7-seat", examples: "Transit, Zafira", surcharge: 15 },
];

export type PackageId = "express" | "full" | "deluxe";

export interface PackageOption {
  id: PackageId;
  name: string;
  price: number;
  duration: string;
  blurb: string;
  features: string[];
}

export const packages: PackageOption[] = [
  {
    id: "express",
    name: "Express",
    price: 25,
    duration: "About 45 min",
    blurb: "A quick, thorough refresh.",
    features: [
      "Snow-foam wash",
      "Wheels cleaned",
      "Windows inside and out",
      "Quick vacuum",
    ],
  },
  {
    id: "full",
    name: "Full Valet",
    price: 55,
    duration: "About 1.5 hrs",
    blurb: "Everything in Express, plus the full interior.",
    features: [
      "Everything in Express",
      "Full interior vacuum",
      "Dash and trims cleaned",
      "Door shuts cleaned",
      "Tyre shine",
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    price: 95,
    duration: "About 3 hrs",
    blurb: "Everything in Full, plus deep conditioning care.",
    features: [
      "Everything in Full",
      "Seat shampoo",
      "Clay bar treatment",
      "Hand wax",
    ],
  },
];

export type ExtraId = "pet-hair" | "engine-bay" | "headlight-restore" | "ceramic-coat";

export interface ExtraOption {
  id: ExtraId;
  label: string;
  price: number;
}

export const extras: ExtraOption[] = [
  { id: "pet-hair", label: "Pet hair removal", price: 15 },
  { id: "engine-bay", label: "Engine bay clean", price: 20 },
  { id: "headlight-restore", label: "Headlight restore", price: 30 },
  { id: "ceramic-coat", label: "Ceramic spray coat", price: 25 },
];

export type LocationType = "home" | "work";

export interface PostcodeCheck {
  covered: boolean;
  message: string;
}

const COVERED_PREFIXES = ["SS", "CM"];

export function checkPostcodeCoverage(rawPostcode: string): PostcodeCheck {
  const normalized = rawPostcode.trim().toUpperCase().replace(/\s+/g, "");
  if (normalized.length === 0) {
    return { covered: false, message: "Enter a postcode to check coverage" };
  }
  const covered = COVERED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
  return covered
    ? { covered: true, message: "Great, we cover your area" }
    : { covered: false, message: "Outside our usual area, call us" };
}

export interface TimeSlot {
  time: string;
  full: boolean;
}

export interface DaySlots {
  dateIso: string;
  weekdayLabel: string;
  dayLabel: string;
  slots: TimeSlot[];
}

export const SLOT_TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00"];

const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = { weekday: "short" };
const DAY_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

/** Deterministic pseudo-randomness so server and client agree on which slots are "full". */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getUpcomingDays(from: Date, count = 6): DaySlots[] {
  const days: DaySlots[] = [];
  for (let i = 1; i <= count; i++) {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    const dateIso = date.toISOString().slice(0, 10);

    const slots: TimeSlot[] = SLOT_TIMES.map((time, timeIndex) => {
      const seed = date.getDate() * 31 + timeIndex * 7 + date.getMonth();
      const full = pseudoRandom(seed) > 0.72;
      return { time, full };
    });

    days.push({
      dateIso,
      weekdayLabel: new Intl.DateTimeFormat("en-GB", WEEKDAY_FORMAT).format(date),
      dayLabel: new Intl.DateTimeFormat("en-GB", DAY_FORMAT).format(date),
      slots,
    });
  }
  return days;
}

export interface BookingSelection {
  vehicleSize: VehicleSizeId;
  packageId: PackageId;
  extraIds: ExtraId[];
  location: LocationType;
  postcode: string;
  dateIso: string | null;
  time: string | null;
}

export interface LineItem {
  label: string;
  amount: number;
}

export function computeLineItems(selection: BookingSelection): LineItem[] {
  const items: LineItem[] = [];

  const pkg = packages.find((p) => p.id === selection.packageId);
  if (pkg) {
    items.push({ label: `${pkg.name} valet`, amount: pkg.price });
  }

  const size = vehicleSizes.find((s) => s.id === selection.vehicleSize);
  if (size && size.surcharge > 0) {
    items.push({ label: `${size.label} vehicle`, amount: size.surcharge });
  }

  for (const extraId of selection.extraIds) {
    const extra = extras.find((e) => e.id === extraId);
    if (extra) {
      items.push({ label: extra.label, amount: extra.price });
    }
  }

  return items;
}

export function computeTotal(selection: BookingSelection): number {
  return computeLineItems(selection).reduce((sum, item) => sum + item.amount, 0);
}

export const DEFAULT_SELECTION: BookingSelection = {
  vehicleSize: "small",
  packageId: "full",
  extraIds: [],
  location: "home",
  postcode: "",
  dateIso: null,
  time: null,
};
