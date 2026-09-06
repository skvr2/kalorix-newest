"use client";

import React from "react";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { FoodItem, MealType } from "@/lib/types";
import { MEAL_LABELS, calculateMealTotals } from "@/lib/storage";
import { MealIcon } from "./MealIcon";

interface MealCardProps {
  type: MealType;
  items: FoodItem[];
  onOpenAdd: (meal: MealType) => void;
  onDeleteItem: (meal: MealType, id: string) => void;
  onEditItem: (meal: MealType, item: FoodItem) => void;
  dark?: boolean;
}

export function MealCard({
  type,
  items,
  onOpenAdd,
  onDeleteItem,
  onEditItem,
  dark = false,
}: MealCardProps) {
  const meta = MEAL_LABELS[type];
  const mealTotals = calculateMealTotals(items);

  return (
    <div
      className={`overflow-hidden rounded-3xl border shadow-sm transition-all ${
        dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
      }`}
    >
      {/* Header posiłku z wektorową ikoną */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-b ${dark ? "border-zinc-800/80 bg-zinc-900/50" : "border-gray-50 bg-gray-50/50"}`}>
        <div className="flex items-center gap-3">
          <MealIcon type={type} />
          <div>
            <h3 className={`text-[15px] font-bold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
              {meta.name}
            </h3>
            <span className={`text-[11px] font-medium ${dark ? "text-zinc-400" : "text-gray-400"}`}>
              {meta.timeHint}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-[15px] font-extrabold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
            {mealTotals.kcal}
          </span>
          <span className={`ml-1 text-[11px] font-medium ${dark ? "text-zinc-400" : "text-gray-500"}`}>
            kcal
          </span>
          {items.length > 0 && (
            <div className="text-[10px] text-gray-400 font-medium">
              B: {mealTotals.protein}g · T: {mealTotals.fat}g · W: {mealTotals.carbs}g
            </div>
          )}
        </div>
      </div>

      {/* Lista potraw w posiłku */}
      {items.length === 0 ? (
        <div className="py-5 px-4 text-center">
          <p className={`text-[12px] ${dark ? "text-zinc-500" : "text-gray-400"}`}>
            Brak dodanych produktów
          </p>
        </div>
      ) : (
        <div className={`divide-y ${dark ? "divide-zinc-800/60" : "divide-gray-100"}`}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between px-4 py-3 transition-colors ${
                dark ? "hover:bg-zinc-800/40" : "hover:bg-gray-50/70"
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-baseline gap-2">
                  <span className={`text-[14px] font-semibold truncate ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                    {item.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {item.grams}g
                  </span>
                </div>

                {/* Pełne, czytelne makro */}
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px]">
                  <span className="text-blue-500 font-medium">Białko: {item.protein}g</span>
                  <span className="text-amber-500 font-medium">Tłuszcz: {item.fat}g</span>
                  <span className="text-purple-500 font-medium">Węglowodany: {item.carbs}g</span>
                  {item.note && (
                    <span className={`italic ${dark ? "text-zinc-400" : "text-gray-400"}`}>({item.note})</span>
                  )}
                </div>
              </div>

              {/* Kalorie i Akcje */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className={`text-[14px] font-bold ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                    {item.kcal}
                  </span>
                  <span className={`block text-[10px] ${dark ? "text-zinc-400" : "text-gray-400"}`}>
                    kcal
                  </span>
                </div>

                <div className="flex items-center gap-1 pl-1">
                  <button
                    type="button"
                    onClick={() => onEditItem(type, item)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    title="Zmień gramaturę"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(type, item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title="Usuń"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Przycisk + Dodaj do tego posiłku */}
      <div className={`p-2 border-t ${dark ? "border-zinc-800 bg-zinc-900/80" : "border-gray-50 bg-gray-50/40"}`}>
        <button
          type="button"
          onClick={() => onOpenAdd(type)}
          className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-2 text-[13px] font-semibold text-emerald-600 transition-colors ${
            dark ? "hover:bg-emerald-950/40" : "hover:bg-emerald-50"
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span>Dodaj do posiłku</span>
        </button>
      </div>
    </div>
  );
}
