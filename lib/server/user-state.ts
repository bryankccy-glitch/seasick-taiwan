import "server-only";

import { z } from "zod";
import { ports } from "@/lib/ports";

const portIds = new Set(ports.map((port) => port.id));
const tripSchema = z.object({
  id: z.string().uuid(),
  portId: z.string().refine((value) => portIds.has(value)),
  date: z.string().min(1).max(40),
  score: z.number().int().min(0).max(100),
  actual: z.number().int().min(0).max(2),
  activity: z.enum(["fishing", "whale", "yacht", "ferry", "dive", "speedboat"]),
});

export const userStateSchema = z.object({
  favorites: z.array(z.string().refine((value) => portIds.has(value))).max(60),
  trips: z.array(tripSchema).max(300),
  preferences: z.object({
    language: z.enum(["zh", "en"]),
    lastPort: z.string().refine((value) => portIds.has(value)),
  }),
});

export type UserStatePayload = z.infer<typeof userStateSchema>;
export const defaultUserState: UserStatePayload = {
  favorites: ["keelung", "wushi", "donggang"],
  trips: [],
  preferences: { language: "zh", lastPort: "keelung" },
};
