"use client";

import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Sparkles, X, Check, Coffee, Utensils, Wheat, Salad, AlertCircle } from "lucide-react";
import { compressImage, uid } from "@/lib/image";
import { analyzePhoto } from "@/lib/ai";
import { AnalyzeResult, FoodItem, MealType } from "@/lib/types";
import { MEAL_LABELS } from "@/lib/storage";
import { MealIcon } from "./MealIcon";

interface AIScannerModalProps {
  initialMeal: MealType;
  onCommitItems: (meal: MealType, items: FoodItem[]) => void;
  onClose: () => void;
  dark?: boolean;
}

export function AIScannerModal({
  initialMeal,
  onCommitItems,
  onClose,
  dark = false,
}: AIScannerModalProps) {
  const [photo, setPhoto] = useState<string>("");
  const [userNote, setUserNote] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);

  const camInputRef = useRef<HTMLInputElement>(null);
  const galInputRef = useRef<HTMLInputElement>(null);

  // Przykładowe presety z czystymi wektorowymi ikonami
  const samplePresets = [
    {
      title: "Paczka orzeszków",
      note: "Zjadłem pół paczki orzeszków nerkowca (ok. 50g)",
      icon: Salad,
    },
    {
      title: "Herbata z cukrem",
      note: "Do herbatki dodałem 2 łyżki cukru",
      icon: Coffee,
    },
    {
      title: "Obiad domowy",
      note: "Pieczona pierś z kurczaka z ryżem i brokułem",
      icon: Utensils,
    },
    {
      title: "Owsianka fit",
      note: "Owsianka na mleku z bananem i 1 łyżką masła orzechowego",
      icon: Wheat,
    },
  ];

  const handleProcessImage = async (file: File) => {
    try {
      setError("");
      setBusy(true);
      const compressed = await compressImage(file);
      setPhoto(compressed);
      const res = await analyzePhoto(compressed, userNote);
      setResult(res);
      setSelectedMeal(res.mealGuess || initialMeal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas analizy zdjęcia");
    } finally {
      setBusy(false);
    }
  };

  const handleAnalyzeWithTextOnly = async () => {
    if (!userNote.trim() && !photo) {
      setError("Wpisz notatkę lub wybierz zdjęcie potrawy.");
      return;
    }
    try {
      setError("");
      setBusy(true);
      const res = await analyzePhoto(photo || "data:image/svg+xml;utf8,<svg></svg>", userNote);
      setResult(res);
      setSelectedMeal(res.mealGuess || initialMeal);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd analizy");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateItemGrams = (index: number, newGrams: number) => {
    if (!result) return;
    const oldItem = result.items[index];
    const factor = newGrams / (oldItem.grams || 100);
    const updated = [...result.items];
    updated[index] = {
      ...oldItem,
      grams: newGrams,
      kcal: Math.round(oldItem.kcal * factor),
      protein: Math.round(oldItem.protein * factor * 10) / 10,
      fat: Math.round(oldItem.fat * factor * 10) / 10,
      carbs: Math.round(oldItem.carbs * factor * 10) / 10,
    };
    setResult({ ...result, items: updated });
  };

  const handleConfirm = () => {
    if (!result || result.items.length === 0) return;
    const itemsToAdd: FoodItem[] = result.items.map((it) => ({
      ...it,
      id: uid(),
      photo: photo || undefined,
    }));
    onCommitItems(selectedMeal, itemsToAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full max-w-md h-[94vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col border ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        } overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-[17px] font-bold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                Skaner AI ze zdjęciem
              </h3>
              <p className={`text-[11px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                Zrób zdjęcie i dopisz szczegóły dla maksymalnej dokładności
              </p>
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

        {/* Ukryte inputy pliku */}
        <input
          ref={camInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleProcessImage(e.target.files[0]);
          }}
        />
        <input
          ref={galInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleProcessImage(e.target.files[0]);
          }}
        />

        {/* Główna treść */}
        <div className="flex-1 py-4 space-y-4">
          {/* Photo Section */}
          {photo ? (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="Zdjęcie potrawy" className="h-44 w-full object-cover" />
              <button
                type="button"
                onClick={() => setPhoto("")}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                title="Usuń zdjęcie"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => camInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all ${
                  dark
                    ? "border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 hover:border-emerald-500"
                    : "border-gray-200 bg-gray-50 hover:bg-emerald-50/40 hover:border-emerald-500"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="text-[13px] font-bold">Zrób zdjęcie</span>
              </button>

              <button
                type="button"
                onClick={() => galInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all ${
                  dark
                    ? "border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 hover:border-emerald-500"
                    : "border-gray-200 bg-gray-50 hover:bg-emerald-50/40 hover:border-emerald-500"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white shadow-md shadow-blue-500/25">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="text-[13px] font-bold">Wybierz z galerii</span>
              </button>
            </div>
          )}

          {/* Notatka dla AI z czarną czcionką */}
          <div>
            <label className={`block text-[13px] font-bold mb-1.5 ${dark ? "text-zinc-200" : "text-gray-800"}`}>
              Notatka dla AI (szczegóły / dodatki / ilość):
            </label>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="np. Do herbatki dodałem 2 łyżki cukru, zjadłem pół paczki orzeszków..."
              rows={3}
              className={`w-full rounded-2xl border p-3.5 text-[14px] font-semibold outline-none shadow-sm transition-all ${
                dark
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  : "bg-gray-50 border-gray-200 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
          </div>

          {/* Szybkie presety testowe */}
          <div>
            <span className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${dark ? "text-zinc-400" : "text-gray-500"}`}>
              Szybkie przykłady:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {samplePresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => setUserNote(preset.note)}
                    className={`flex items-center gap-2.5 rounded-xl p-2.5 text-left border transition-all ${
                      userNote === preset.note
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : dark
                        ? "border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800"
                        : "border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-bold truncate">{preset.title}</div>
                      <div className="text-[10px] text-gray-400 truncate">{preset.note}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Przycisk Analizuj */}
          {!result && (
            <button
              type="button"
              disabled={busy}
              onClick={handleAnalyzeWithTextOnly}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />
              <span>{busy ? "AI analizuje zdjęcie i notatkę…" : "Przelicz z AI"}</span>
            </button>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-[13px] text-rose-600 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Wynik Analizy AI */}
          {result && (
            <div className={`rounded-2xl border p-4 ${dark ? "bg-zinc-800/80 border-zinc-700" : "bg-emerald-50/50 border-emerald-100"}`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-[13px] font-bold text-emerald-600">Rozpoznane składniki:</span>
                <span className={`text-[12px] font-bold ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                  Suma: {result.items.reduce((a, b) => a + b.kcal, 0)} kcal
                </span>
              </div>
              <p className={`mt-1.5 text-[12px] italic ${dark ? "text-zinc-400" : "text-gray-600"}`}>
                {result.summary}
              </p>

              {/* Lista składników z możliwością poprawy gramatury */}
              <div className="mt-3 space-y-2">
                {result.items.map((it, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-xl p-2.5 border ${
                      dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-[13px] font-bold truncate">{it.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                        <span className="text-blue-500 font-medium">Białko: {it.protein}g</span>
                        <span className="text-amber-500 font-medium">Tłuszcz: {it.fat}g</span>
                        <span className="text-purple-500 font-medium">Węgl.: {it.carbs}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        value={it.grams}
                        onChange={(e) => handleUpdateItemGrams(idx, Number(e.target.value) || 1)}
                        className="w-16 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-2 py-1 text-center text-[12px] font-bold text-gray-900 dark:text-zinc-100"
                      />
                      <span className="text-[11px] text-gray-400 font-medium">g</span>
                      <span className="text-[13px] font-extrabold text-emerald-600 ml-1">{it.kcal} kcal</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Wybór docelowego posiłku */}
              <div className="mt-3">
                <span className="text-[11px] font-bold text-gray-500 block mb-1">Dodaj do posiłku:</span>
                <div className="grid grid-cols-3 gap-1">
                  {(["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"] as MealType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMeal(m)}
                      className={`rounded-lg py-1.5 px-1 text-[11px] font-bold transition-all text-center truncate ${
                        selectedMeal === m
                          ? "bg-emerald-500 text-white"
                          : dark
                          ? "bg-zinc-900 text-zinc-300"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {MEAL_LABELS[m].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zapisz w dzienniku */}
              <button
                type="button"
                onClick={handleConfirm}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-98"
              >
                <Check className="h-5 w-5" />
                <span>Zapisz w dzienniku</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
