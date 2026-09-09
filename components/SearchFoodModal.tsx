"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Plus, ChevronRight, Apple } from "lucide-react";
import { BaseProduct, FOOD_DATABASE } from "@/lib/database";
import { MealType } from "@/lib/types";
import { MEAL_LABELS } from "@/lib/storage";
import { MealIcon } from "./MealIcon";

interface SearchFoodModalProps {
  initialMeal: MealType;
  customProducts: BaseProduct[];
  onSelectProduct: (product: BaseProduct, meal: MealType) => void;
  onOpenCustomProduct: () => void;
  onClose: () => void;
  dark?: boolean;
}

export function SearchFoodModal({
  initialMeal,
  customProducts,
  onSelectProduct,
  onOpenCustomProduct,
  onClose,
  dark = false,
}: SearchFoodModalProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Wszystkie");
  const [currentMeal, setCurrentMeal] = useState<MealType>(initialMeal);

  const categories = [
    "Wszystkie",
    "Nabiał i Jaja",
    "Mięso i Ryby",
    "Pieczywo i Zboża",
    "Owoce i Warzywa",
    "Orzechy i Nasiona",
    "Napoje i Dodatki",
    "Przekąski i Słodycze",
    "Własne produkty",
  ];

  const allProducts = useMemo(() => {
    return [...customProducts, ...FOOD_DATABASE];
  }, [customProducts]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((product) => {
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "Wszystkie" ||
        (selectedCategory === "Własne produkty"
          ? customProducts.some((p) => p.id === product.id)
          : product.category === selectedCategory);

      return matchesQuery && matchesCat;
    });
  }, [allProducts, customProducts, query, selectedCategory]);

  return (
    <div className="fixed inset-0 z-45 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full max-w-md h-[92vh] sm:h-[85vh] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col border ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <MealIcon type={currentMeal} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {MEAL_LABELS[currentMeal].name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  200+
                </span>
              </div>
              <h3 className={`text-[17px] font-bold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                Szukaj produktu
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

        {/* Search Input with Solid Black/Crisp Dark Font */}
        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj produktu (np. twaróg, banan, pierś...)"
            autoFocus
            className={`w-full rounded-2xl border pl-10 pr-10 py-3 text-[15px] font-semibold outline-none shadow-sm transition-all ${
              dark
                ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                : "bg-gray-50 border-gray-200 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-bold transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-white shadow-sm"
                  : dark
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meal Selector Tabs */}
        <div className="mt-2.5 flex items-center justify-between gap-1 overflow-x-auto rounded-xl bg-gray-100 dark:bg-zinc-800 p-1">
          {(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as MealType[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCurrentMeal(m)}
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

        {/* Products List */}
        <div className="mt-3 flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <Apple className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-600 mb-2" />
              <p className={`text-[14px] font-medium ${dark ? "text-zinc-300" : "text-gray-600"}`}>
                Nie znaleziono produktu "{query}"
              </p>
              <p className={`text-[12px] mt-1 ${dark ? "text-zinc-500" : "text-gray-400"}`}>
                Możesz go dodać jako swój własny produkt poniżej!
              </p>
              <button
                type="button"
                onClick={onOpenCustomProduct}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj własny produkt</span>
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product, currentMeal)}
                className={`w-full flex items-center justify-between py-3 px-2 text-left transition-colors rounded-xl ${
                  dark ? "hover:bg-zinc-800/60" : "hover:bg-emerald-50/50"
                }`}
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[14px] font-bold truncate ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                      {product.name}
                    </span>
                    {product.unitName && (
                      <span className={`text-[11px] ${dark ? "text-zinc-400" : "text-gray-400"}`}>
                        ({product.unitName})
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
                    <span>100g: <strong className="text-gray-700 dark:text-zinc-300">{product.kcalPer100g} kcal</strong></span>
                    <span>•</span>
                    <span className="text-blue-500 font-medium">Białko: {product.proteinPer100g}g</span>
                    <span className="text-amber-500 font-medium">Tłuszcz: {product.fatPer100g}g</span>
                    <span className="text-purple-500 font-medium">Węgle: {product.carbsPer100g}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                    Wybierz ilość
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Custom Product Button */}
        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <button
            type="button"
            onClick={onOpenCustomProduct}
            className={`flex items-center gap-1.5 text-[13px] font-bold text-emerald-600 hover:text-emerald-700`}
          >
            <Plus className="h-4 w-4" />
            <span>+ Dodaj własny produkt</span>
          </button>
          <span className={`text-[11px] ${dark ? "text-zinc-500" : "text-gray-400"}`}>
            Baza: {allProducts.length} produktów
          </span>
        </div>
      </div>
    </div>
  );
}
