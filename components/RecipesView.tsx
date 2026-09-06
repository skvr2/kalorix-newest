"use client";

import React, { useState, useMemo } from "react";
import { Search, Clock, Plus, Check, ChevronRight, X, Sparkles, Flame, BookOpen } from "lucide-react";
import { Recipe, MealType, FoodItem } from "@/lib/types";
import { MEAL_LABELS, todayISO, addItemsToMeal } from "@/lib/storage";
import { uid } from "@/lib/image";
import { RecipeIcon } from "./RecipeIcon";

interface RecipesViewProps {
  recipes: Recipe[];
  currentDate: string;
  onAddRecipeToDay: (date: string, meal: MealType, items: FoodItem[]) => void;
  dark?: boolean;
}

export function RecipesView({
  recipes,
  currentDate,
  onAddRecipeToDay,
  dark = false,
}: RecipesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Wszystkie");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [targetMeal, setTargetMeal] = useState<MealType>("lunch");
  const [addedNotice, setAddedNotice] = useState(false);

  const categories = [
    "Wszystkie",
    "Wysokobiałkowe",
    "Szybkie (<15 min)",
    "Śniadania",
    "Obiady",
    "Desery Fit",
  ];

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(q));

      const matchCategory =
        activeCategory === "Wszystkie" ||
        r.category === activeCategory ||
        r.tags.includes(activeCategory);

      return matchQuery && matchCategory;
    });
  }, [recipes, searchQuery, activeCategory]);

  const handleAddEntireRecipe = () => {
    if (!selectedRecipe) return;

    const itemsToAdd: FoodItem[] = selectedRecipe.ingredients.map((ing) => ({
      id: uid(),
      name: `${ing.name} (${selectedRecipe.title})`,
      grams: ing.grams,
      kcal: ing.kcal,
      protein: ing.protein,
      fat: ing.fat,
      carbs: ing.carbs,
      note: `Z przepisu: ${selectedRecipe.title}`,
    }));

    onAddRecipeToDay(currentDate, targetMeal, itemsToAdd);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      setSelectedRecipe(null);
    }, 1200);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className={`text-[22px] font-black tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
            Zdrowe Przepisy Fit
          </h2>
          <p className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
            {recipes.length} zbilansowanych przepisów z policzonymi kaloriami i makro
          </p>
        </div>
      </div>

      {/* Search Input with Solid Black Font */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj przepisu (np. tortilla, burger, szakszuka, owsianka...)"
          className={`w-full rounded-2xl border pl-10 pr-10 py-3 text-[14px] font-semibold outline-none shadow-sm transition-all ${
            dark
              ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-emerald-500"
              : "bg-white border-gray-200 text-gray-950 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          }`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all ${
              activeCategory === cat
                ? "bg-emerald-500 text-white shadow-sm"
                : dark
                ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className={`group cursor-pointer overflow-hidden rounded-3xl border p-4 shadow-sm transition-all hover:shadow-md ${
              dark
                ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                : "bg-white border-gray-100 hover:border-emerald-200"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <RecipeIcon iconType={recipe.image} imageUrl={recipe.imageUrl} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {recipe.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{recipe.timeMinutes} min</span>
                  </div>
                </div>

                <h3 className={`text-[15px] font-bold tracking-tight mt-1 leading-snug ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                  {recipe.title}
                </h3>
                <p className={`text-[12px] line-clamp-1 mt-0.5 ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                  {recipe.description}
                </p>

                {/* Macro summary pills */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-extrabold text-emerald-600">{recipe.kcal} kcal</span>
                  <span className="text-gray-300 dark:text-zinc-700">•</span>
                  <span className="font-semibold text-blue-500">B: {recipe.protein}g</span>
                  <span className="font-semibold text-amber-500">T: {recipe.fat}g</span>
                  <span className="font-semibold text-purple-500">W: {recipe.carbs}g</span>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-gray-300 self-center group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div
            className={`w-full max-w-md h-[92vh] sm:h-[86vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border ${
              dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
            } overflow-hidden`}
          >
            {/* Header / Photo Banner */}
            {selectedRecipe.imageUrl ? (
              <div className="relative h-44 w-full shrink-0 overflow-hidden bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedRecipe.imageUrl}
                  alt={selectedRecipe.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {selectedRecipe.category} · {selectedRecipe.timeMinutes} min
                  </span>
                  <h3 className="text-[17px] font-black tracking-tight text-white mt-1 leading-snug drop-shadow-sm">
                    {selectedRecipe.title}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <RecipeIcon iconType={selectedRecipe.image} />
                  <div>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                      {selectedRecipe.category} · {selectedRecipe.timeMinutes} min
                    </span>
                    <h3 className={`text-[17px] font-black tracking-tight mt-1 leading-snug ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                      {selectedRecipe.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Macro Summary Dashboard */}
              <div className={`rounded-2xl p-3.5 border ${dark ? "bg-zinc-800/60 border-zinc-700" : "bg-emerald-50/70 border-emerald-100"}`}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
                    Wartości na 1 porcję:
                  </span>
                  <span className={`text-[18px] font-black ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                    {selectedRecipe.kcal} kcal
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[12px]">
                  <div className={`rounded-xl p-2 ${dark ? "bg-zinc-900" : "bg-white"}`}>
                    <span className="text-blue-500 font-bold block">Białko</span>
                    <span className="font-extrabold">{selectedRecipe.protein}g</span>
                  </div>
                  <div className={`rounded-xl p-2 ${dark ? "bg-zinc-900" : "bg-white"}`}>
                    <span className="text-amber-500 font-bold block">Tłuszcz</span>
                    <span className="font-extrabold">{selectedRecipe.fat}g</span>
                  </div>
                  <div className={`rounded-xl p-2 ${dark ? "bg-zinc-900" : "bg-white"}`}>
                    <span className="text-purple-500 font-bold block">Węglowodany</span>
                    <span className="font-extrabold">{selectedRecipe.carbs}g</span>
                  </div>
                </div>
              </div>

              {/* Składniki */}
              <div>
                <h4 className="text-[14px] font-extrabold tracking-tight mb-2">
                  Składniki:
                </h4>
                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-[13px]">
                      <span className="font-medium">{ing.name}</span>
                      <span className="font-bold text-gray-500 dark:text-zinc-400">{ing.grams}g</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sposób przygotowania */}
              <div>
                <h4 className="text-[14px] font-extrabold tracking-tight mb-2">
                  Sposób przygotowania krok po kroku:
                </h4>
                <ol className="space-y-2.5 text-[13px] text-gray-600 dark:text-zinc-300 pl-4 list-decimal">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Dodaj do posiłku footer */}
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900">
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 block mb-2">
                Wybierz posiłek, do którego chcesz dodać ten przepis:
              </span>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTargetMeal(m)}
                    className={`rounded-xl py-2 px-1 text-[11px] font-bold text-center truncate ${
                      targetMeal === m
                        ? "bg-emerald-500 text-white shadow-sm"
                        : dark
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    {MEAL_LABELS[m].name}
                  </button>
                ))}
              </div>

              {addedNotice ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[14px] font-bold text-white">
                  <Check className="h-5 w-5" />
                  <span>Dodano do posiłku {MEAL_LABELS[targetMeal].name}!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddEntireRecipe}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-98"
                >
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                  <span>Dodaj cały przepis do mojego dnia</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
