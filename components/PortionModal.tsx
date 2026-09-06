"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Scale, Beef, Droplet, Wheat, Flame } from "lucide-react";
import { BaseProduct, calculateMacros } from "@/lib/database";
import { FoodItem, MealType } from "@/lib/types";
import { MEAL_LABELS } from "@/lib/storage";

interface PortionModalProps {
  product: BaseProduct | null;
  initialMeal: MealType;
  editingItem?: FoodItem | null;
  onClose: () => void;
  onConfirm: (meal: MealType, item: Omit<FoodItem, "id">) => void;
  dark?: boolean;
}

export function PortionModal({
  product,
  initialMeal,
  editingItem,
  onClose,
  onConfirm,
  dark = false,
}: PortionModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const [grams, setGrams] = useState<string>(() => {
    if (editingItem) return String(editingItem.grams);
    if (product) return String(product.defaultGrams || 100);
    return "100";
  });
  const [customNote, setCustomNote] = useState<string>(editingItem?.note || "");

  useEffect(() => {
    setSelectedMeal(initialMeal);
    if (editingItem) {
      setGrams(String(editingItem.grams));
      setCustomNote(editingItem.note || "");
    } else if (product) {
      setGrams(String(product.defaultGrams || 100));
      setCustomNote("");
    }
  }, [product, initialMeal, editingItem]);

  if (!product && !editingItem) return null;

  const currentGrams = Math.max(1, Number(grams) || 0);

  // Wartości per 100g
  const per100g = editingItem
    ? {
        name: editingItem.name,
        kcalPer100g: Math.round((editingItem.kcal / (editingItem.grams || 100)) * 100),
        proteinPer100g: Math.round(((editingItem.protein / (editingItem.grams || 100)) * 100) * 10) / 10,
        fatPer100g: Math.round(((editingItem.fat / (editingItem.grams || 100)) * 100) * 10) / 10,
        carbsPer100g: Math.round(((editingItem.carbs / (editingItem.grams || 100)) * 100) * 10) / 10,
      }
    : {
        name: product!.name,
        kcalPer100g: product!.kcalPer100g,
        proteinPer100g: product!.proteinPer100g,
        fatPer100g: product!.fatPer100g,
        carbsPer100g: product!.carbsPer100g,
      };

  const factor = currentGrams / 100;
  const computedKcal = Math.round(per100g.kcalPer100g * factor);
  const computedProtein = Math.round(per100g.proteinPer100g * factor * 10) / 10;
  const computedFat = Math.round(per100g.fatPer100g * factor * 10) / 10;
  const computedCarbs = Math.round(per100g.carbsPer100g * factor * 10) / 10;

  const quickShortcuts = [
    { label: "25g", val: 25 },
    { label: "50g", val: 50 },
    { label: "100g", val: 100 },
    { label: "150g", val: 150 },
    { label: "200g", val: 200 },
    ...(product?.unitGrams && product.unitName
      ? [{ label: `${product.unitName} (${product.unitGrams}g)`, val: product.unitGrams }]
      : [{ label: "250g", val: 250 }]),
  ];

  const handleSave = () => {
    onConfirm(selectedMeal, {
      name: per100g.name,
      grams: currentGrams,
      kcal: computedKcal,
      protein: computedProtein,
      fat: computedFat,
      carbs: computedCarbs,
      note: customNote.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-all border ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        } max-h-[92vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Wybierz ilość
            </span>
            <h3 className={`text-[19px] font-bold tracking-tight mt-0.5 ${dark ? "text-zinc-100" : "text-gray-900"}`}>
              {per100g.name}
            </h3>
            <span className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
              Wartość w 100g: {per100g.kcalPer100g} kcal (B: {per100g.proteinPer100g}g · T: {per100g.fatPer100g}g · W: {per100g.carbsPer100g}g)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Macro Calculator Card */}
        <div className={`mt-5 rounded-2xl p-4 border ${dark ? "bg-zinc-800/60 border-zinc-700" : "bg-emerald-50/60 border-emerald-100"}`}>
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Flame className="h-4 w-4" />
              <span className="text-[13px] font-bold">Wartość dla wybranej porcji:</span>
            </div>
            <div className="text-right">
              <span className={`text-[22px] font-black ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                {computedKcal}
              </span>
              <span className="ml-1 text-[13px] font-semibold text-emerald-600">kcal</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className={`rounded-xl p-2.5 ${dark ? "bg-zinc-900/80" : "bg-white"}`}>
              <span className="text-[11px] font-bold text-blue-500 block">Białko</span>
              <span className={`text-[15px] font-extrabold ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                {computedProtein}g
              </span>
            </div>
            <div className={`rounded-xl p-2.5 ${dark ? "bg-zinc-900/80" : "bg-white"}`}>
              <span className="text-[11px] font-bold text-amber-500 block">Tłuszcz</span>
              <span className={`text-[15px] font-extrabold ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                {computedFat}g
              </span>
            </div>
            <div className={`rounded-xl p-2.5 ${dark ? "bg-zinc-900/80" : "bg-white"}`}>
              <span className="text-[11px] font-bold text-purple-500 block">Węglowodany</span>
              <span className={`text-[15px] font-extrabold ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                {computedCarbs}g
              </span>
            </div>
          </div>
        </div>

        {/* Input Grams with High Contrast Black Font */}
        <div className="mt-5">
          <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-zinc-200" : "text-gray-800"}`}>
            Ile zjadłeś? (w gramach):
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="2000"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="np. 150"
              className={`w-full rounded-2xl border px-4 py-3.5 text-[20px] font-extrabold outline-none shadow-sm transition-all ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  : "bg-gray-50 border-gray-200 text-gray-950 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
            <span className="absolute right-4 text-[15px] font-bold text-gray-400">gramów (g)</span>
          </div>
        </div>

        {/* Szybkie przyciski gramatur */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickShortcuts.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setGrams(String(s.val))}
              className={`rounded-xl px-3 py-1.5 text-[12px] font-bold transition-all ${
                Number(grams) === s.val
                  ? "bg-emerald-500 text-white shadow-sm"
                  : dark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Posiłek docelowy */}
        <div className="mt-5">
          <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-zinc-200" : "text-gray-800"}`}>
            Wybierz posiłek:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as MealType[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMeal(m)}
                className={`rounded-xl py-2 px-2 text-[12px] font-semibold transition-all text-center truncate ${
                  selectedMeal === m
                    ? "bg-emerald-500 text-white shadow-sm"
                    : dark
                    ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {MEAL_LABELS[m].name}
              </button>
            ))}
          </div>
        </div>

        {/* Opcjonalna notatka */}
        <div className="mt-4">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Opcjonalna notatka (np. bez sosu, pół szklanki)"
            className={`w-full rounded-xl border px-3 py-2 text-[13px] font-medium outline-none ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white"
            }`}
          />
        </div>

        {/* Przycisk Zapisz / Dodaj */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 rounded-2xl py-3.5 text-[14px] font-bold transition-colors ${
              dark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-98"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            <span>{editingItem ? "Zapisz zmiany" : "Dodaj do posiłku"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
