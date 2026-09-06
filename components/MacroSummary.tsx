"use client";

import React from "react";
import { Flame, Beef, Droplet, Wheat } from "lucide-react";
import { Goals } from "@/lib/types";

interface MacroSummaryProps {
  totals: {
    kcal: number;
    protein: number; // Białko
    fat: number;     // Tłuszcz
    carbs: number;   // Węglowodany
  };
  goals: Goals;
  dark?: boolean;
}

export function MacroSummary({ totals, goals, dark = false }: MacroSummaryProps) {
  const leftKcal = goals.kcal - totals.kcal;
  const pctKcal = Math.min(100, Math.round((totals.kcal / (goals.kcal || 1)) * 100));

  // Wymiary okręgu
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pctKcal / 100) * circumference;

  const macroStats = [
    {
      id: "protein",
      name: "Białko",
      icon: Beef,
      current: totals.protein,
      target: goals.protein,
      unit: "g",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: dark ? "bg-blue-950/40" : "bg-blue-50",
      borderColor: dark ? "border-blue-900/50" : "border-blue-100",
    },
    {
      id: "fat",
      name: "Tłuszcz",
      icon: Droplet,
      current: totals.fat,
      target: goals.fat,
      unit: "g",
      color: "bg-amber-500",
      textColor: "text-amber-500",
      bgColor: dark ? "bg-amber-950/40" : "bg-amber-50",
      borderColor: dark ? "border-amber-900/50" : "border-amber-100",
    },
    {
      id: "carbs",
      name: "Węglowodany",
      icon: Wheat,
      current: totals.carbs,
      target: goals.carbs,
      unit: "g",
      color: "bg-purple-500",
      textColor: "text-purple-500",
      bgColor: dark ? "bg-purple-950/40" : "bg-purple-50",
      borderColor: dark ? "border-purple-900/50" : "border-purple-100",
    },
  ];

  return (
    <section
      className={`rounded-3xl p-5 shadow-sm transition-all border ${
        dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
      }`}
    >
      {/* Kcal Main Header */}
      <div className="flex items-center justify-between gap-5">
        {/* Ring Chart */}
        <div className="relative flex h-[116px] w-[116px] shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={`${dark ? "stroke-zinc-800" : "stroke-gray-100"}`}
              strokeWidth="9"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-emerald-500 transition-all duration-500 ease-out"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <Flame className="h-4 w-4 text-emerald-500 mb-0.5" />
            <span className={`text-[20px] font-extrabold leading-none tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
              {totals.kcal}
            </span>
            <span className={`text-[10px] font-medium mt-0.5 ${dark ? "text-zinc-400" : "text-gray-400"}`}>
              z {goals.kcal} kcal
            </span>
          </div>
        </div>

        {/* Calories info */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex items-baseline justify-between">
            <span className={`text-[12px] font-semibold uppercase tracking-wider ${dark ? "text-zinc-400" : "text-gray-500"}`}>
              Pozostało na dziś
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-[32px] font-black tracking-tight leading-none ${
                leftKcal < 0
                  ? "text-rose-500"
                  : dark
                  ? "text-zinc-100"
                  : "text-gray-900"
              }`}
            >
              {leftKcal}
            </span>
            <span className={`text-[15px] font-medium ${dark ? "text-zinc-400" : "text-gray-500"}`}>
              kcal
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <div className={`h-2 flex-1 overflow-hidden rounded-full ${dark ? "bg-zinc-800" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  leftKcal < 0 ? "bg-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, pctKcal)}%` }}
              />
            </div>
            <span className={`text-[11px] font-semibold ${dark ? "text-zinc-400" : "text-gray-500"}`}>
              {pctKcal}%
            </span>
          </div>
        </div>
      </div>

      {/* Makroskładniki - ZAWSZE PEŁNE CZYTELNE NAZWY (Białko, Tłuszcz, Węglowodany) */}
      <div className="mt-5 grid grid-cols-3 gap-2.5">
        {macroStats.map((m) => {
          const pct = Math.min(100, Math.round((m.current / (m.target || 1)) * 100));
          const left = Math.round(m.target - m.current);
          const Icon = m.icon;

          return (
            <div
              key={m.id}
              className={`flex flex-col rounded-2xl p-3 border transition-colors ${m.bgColor} ${m.borderColor}`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`h-3.5 w-3.5 ${m.textColor}`} />
                <span className={`text-[12px] font-bold ${dark ? "text-zinc-200" : "text-gray-800"}`}>
                  {m.name}
                </span>
              </div>

              {/* Spożyte / Cel */}
              <div className="flex items-baseline gap-1">
                <span className={`text-[16px] font-extrabold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                  {Math.round(m.current)}
                </span>
                <span className={`text-[11px] font-normal ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                  / {m.target} {m.unit}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${dark ? "bg-zinc-800" : "bg-white/80"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Pozostało */}
              <div className="mt-1.5 flex justify-between text-[10px]">
                <span className={dark ? "text-zinc-400" : "text-gray-500"}>
                  {left >= 0 ? `zostało ${left}g` : `+${Math.abs(left)}g`}
                </span>
                <span className={`font-semibold ${m.textColor}`}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
