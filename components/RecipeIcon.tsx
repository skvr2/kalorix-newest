"use client";

import React, { useState } from "react";
import { Wheat, Drumstick, Egg, Fish, Salad, CakeSlice, Utensils, Sandwich, Flame } from "lucide-react";

interface RecipeIconProps {
  iconType: string;
  imageUrl?: string;
  className?: string;
}

export function RecipeIcon({ iconType, imageUrl, className = "h-5 w-5" }: RecipeIconProps) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Danie"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  switch (iconType) {
    case "wrap":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Sandwich className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    case "oats":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Wheat className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    case "chicken":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <Drumstick className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    case "egg":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Egg className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    case "fish":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Fish className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    case "salad":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Salad className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    case "dessert":
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <CakeSlice className="h-6 w-6" strokeWidth={2} />
        </div>
      );
    default:
      return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Utensils className="h-6 w-6" strokeWidth={2} />
        </div>
      );
  }
}
