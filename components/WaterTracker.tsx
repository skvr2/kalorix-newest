"use client";

import React, { useState } from "react";
import { Droplets, Droplet, Coffee, Plus, Minus, Check, GlassWater } from "lucide-react";
import { Profile } from "@/lib/types";

interface WaterTrackerProps {
  waterMl: number;
  profile: Profile;
  onAddWater: (ml: number) => void;
  onUpdateWaterGoal: (newGoal: number) => void;
  dark?: boolean;
}

export function WaterTracker({
  waterMl,
  profile,
  onAddWater,
  onUpdateWaterGoal,
  dark = false,
}: WaterTrackerProps) {
  const [customAmount, setCustomAmount] = useState("");
  const goal = profile.waterGoal || 2500;
  const pct = Math.min(100, Math.round((waterMl / goal) * 100));

  return (
    <div className="space-y-4 pb-24">
      <div className="pt-1">
        <h2 className={`text-[22px] font-black tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
          Nawodnienie
        </h2>
        <p className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          Kontroluj codzienne spożycie płynów
        </p>
      </div>

      <div
        className={`rounded-3xl border p-6 shadow-sm text-center ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <div className="flex justify-center mb-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500 shadow-inner">
            <Droplets className="h-8 w-8" />
          </div>
        </div>

        <span className="text-[12px] font-bold uppercase tracking-wider text-blue-500">
          Wypite dzisiaj
        </span>

        <div className="mt-1 flex items-baseline justify-center gap-1.5">
          <span className={`text-[44px] font-black tracking-tight leading-none ${dark ? "text-zinc-100" : "text-gray-900"}`}>
            {waterMl}
          </span>
          <span className="text-[18px] font-bold text-gray-400">/ {goal} ml</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 h-3.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800 p-0.5 border border-gray-200 dark:border-zinc-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] font-semibold text-gray-400">
          <span>0 ml</span>
          <span className="text-blue-500">{pct}% celu</span>
          <span>{goal} ml</span>
        </div>

        {/* Quick Add Buttons with Lucide Icons */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {[
            { label: "Szklanka", ml: 250, icon: GlassWater },
            { label: "Kubek", ml: 330, icon: Coffee },
            { label: "Butelka", ml: 500, icon: Droplet },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.ml}
                type="button"
                onClick={() => onAddWater(item.ml)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3.5 border transition-all hover:scale-102 active:scale-98 ${
                  dark
                    ? "bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800 text-zinc-100"
                    : "bg-blue-50/50 border-blue-100 hover:bg-blue-50 text-gray-900"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[14px] font-bold">+{item.ml} ml</span>
                <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Wpisz własną ilość (ml)..."
            className={`flex-1 rounded-2xl border px-4 py-3 text-[14px] font-semibold outline-none shadow-sm ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500"
                : "bg-gray-50 border-gray-200 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => {
              const ml = Number(customAmount);
              if (ml) {
                onAddWater(ml);
                setCustomAmount("");
              }
            }}
            className="flex items-center gap-1 rounded-2xl bg-blue-500 px-5 text-[14px] font-bold text-white shadow-md shadow-blue-500/25 hover:bg-blue-600 active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Dodaj</span>
          </button>
        </div>

        {/* Undo button */}
        {waterMl > 0 && (
          <button
            type="button"
            onClick={() => onAddWater(-250)}
            className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-rose-500 transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
            <span>Cofnij ostatnie 250 ml</span>
          </button>
        )}
      </div>
    </div>
  );
}
