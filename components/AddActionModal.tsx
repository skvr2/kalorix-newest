"use client";

import React from "react";
import { Search, Camera, BookOpen, Plus, X, Sparkles } from "lucide-react";
import { MealType } from "@/lib/types";
import { MEAL_LABELS } from "@/lib/storage";
import { MealIcon } from "./MealIcon";

interface AddActionModalProps {
  currentMeal: MealType;
  onSelectOption: (option: "search" | "ai" | "recipes" | "custom") => void;
  onChangeMeal: (meal: MealType) => void;
  onClose: () => void;
  dark?: boolean;
}

export function AddActionModal({
  currentMeal,
  onSelectOption,
  onChangeMeal,
  onClose,
  dark = false,
}: AddActionModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-all border ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <MealIcon type={currentMeal} />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Dodaj do posiłku
              </span>
              <h3 className={`text-[17px] font-bold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                {MEAL_LABELS[currentMeal].name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Meal Selector Tabs */}
        <div className="mt-3 flex items-center justify-between gap-1 overflow-x-auto rounded-xl bg-gray-100 dark:bg-zinc-800 p-1">
          {(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as MealType[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChangeMeal(m)}
              className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all text-center truncate ${
                currentMeal === m
                  ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900"
              }`}
            >
              {MEAL_LABELS[m].name}
            </button>
          ))}
        </div>

        {/* Options Grid */}
        <div className="mt-4 grid grid-cols-1 gap-2.5">
          {/* Szukaj w bazie */}
          <button
            type="button"
            onClick={() => onSelectOption("search")}
            className={`flex items-center gap-3.5 rounded-2xl p-4 border text-left transition-all hover:scale-101 active:scale-99 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800"
                : "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
              <Search className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold">Szukaj w bazie produktów</div>
              <div className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                Ponad 100+ produktów z gramaturą i makro
              </div>
            </div>
          </button>

          {/* Skaner AI */}
          <button
            type="button"
            onClick={() => onSelectOption("ai")}
            className={`flex items-center gap-3.5 rounded-2xl p-4 border text-left transition-all hover:scale-101 active:scale-99 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800"
                : "bg-purple-50/50 border-purple-100 hover:bg-purple-50"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-md shadow-purple-500/25">
              <Camera className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold">Skaner AI (Zdjęcie + Notatka)</span>
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <div className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                Zrób zdjęcie paczki/talerza i dopisz uwagi
              </div>
            </div>
          </button>

          {/* Przepisy */}
          <button
            type="button"
            onClick={() => onSelectOption("recipes")}
            className={`flex items-center gap-3.5 rounded-2xl p-4 border text-left transition-all hover:scale-101 active:scale-99 ${
              dark
                ? "bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800"
                : "bg-blue-50/50 border-blue-100 hover:bg-blue-50"
            }`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-md shadow-blue-500/25">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold">Wybierz z gotowych przepisów</div>
              <div className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                Wysokobiałkowe posiłki fit do dodania 1-kliknięciem
              </div>
            </div>
          </button>

          {/* Wpis ręczny / własny produkt */}
          <button
            type="button"
            onClick={() => onSelectOption("custom")}
            className={`flex items-center gap-3.5 rounded-2xl p-3.5 border text-left transition-all ${
              dark
                ? "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Plus className="h-5 w-5 text-gray-400" />
            <span className="text-[13px] font-bold">+ Dodaj własny produkt z etykiety</span>
          </button>
        </div>
      </div>
    </div>
  );
}
