export const business = {
  name: "ShineOnSite",
  phone: "[PHONE NUMBER]",
  email: "[EMAIL ADDRESS]",
  area: "[SERVICE AREA]",
  hours: "Mon–Sat, 8am–6pm",
  tagline: "Mobile car valeting that comes to you.",
} as const;

export type Business = typeof business;
