"use client";

import React from "react";
import { Sunrise, Apple, UtensilsCrossed, Cookie, Moon, Coffee, Sparkles } from "lucide-react";
import { MealType } from "@/lib/types";

interface MealIconProps {
  type: MealType;
  className?: string;
  size?: number;
}

export function MealIcon({ type, className = "h-5 w-5", size }: MealIconProps) {
  switch (type) {
    case "breakfast":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Sunrise className={className} strokeWidth={2.2} />
        </div>
      );
    case "morning_snack":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Apple className={className} strokeWidth={2.2} />
        </div>
      );
    case "lunch":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <UtensilsCrossed className={className} strokeWidth={2.2} />
        </div>
      );
    case "afternoon_snack":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Cookie className={className} strokeWidth={2.2} />
        </div>
      );
    case "dinner":
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Moon className={className} strokeWidth={2.2} />
        </div>
      );
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-500/10 text-gray-600">
          <UtensilsCrossed className={className} strokeWidth={2.2} />
        </div>
      );
  }
}
