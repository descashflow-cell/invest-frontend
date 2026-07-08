import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const INV_COLORS = [
  "#38BDF8",
  "#A78BFA",
  "#F472B6",
  "#FBBF24",
  "#34D399",
  "#F87171",
  "#94A3B8",
  "#FB923C",
];