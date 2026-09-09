"use client";

import React, { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { BaseProduct } from "@/lib/database";
import { uid } from "@/lib/image";

interface CustomProductModalProps {
  onSave: (product: BaseProduct) => void;
  onClose: () => void;
  dark?: boolean;
}

export function CustomProductModal({ onSave, onClose, dark = false }: CustomProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BaseProduct["category"]>("Nabiał i Jaja");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitGrams, setUnitGrams] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    const newProd: BaseProduct = {
      id: `custom-${uid()}`,
      name: name.trim(),
      category,
      kcalPer100g: Math.max(0, Number(kcal) || 0),
      proteinPer100g: Math.max(0, Number(protein) || 0),
      fatPer100g: Math.max(0, Number(fat) || 0),
      carbsPer100g: Math.max(0, Number(carbs) || 0),
      defaultGrams: 100,
      unitName: unitName.trim() || undefined,
      unitGrams: unitGrams ? Number(unitGrams) : undefined,
    };
    onSave(newProd);
    onClose();
  };

  const inputCls = `w-full rounded-xl border px-3 py-2.5 text-[14px] font-semibold outline-none transition-all ${
    dark
      ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
      : "bg-gray-50 border-gray-200 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
  }`;

  return (
    <div className="fixed inset-0 z-55 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transition-all border ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        } max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-[18px] font-bold tracking-tight">Dodaj własny produkt</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[12px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
              Nazwa produktu:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Baton proteinowy Kizzers"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
              Kategoria:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BaseProduct["category"])}
              className={inputCls}
            >
              <option value="Nabiał i Jaja">Nabiał i Jaja</option>
              <option value="Mięso i Ryby">Mięso i Ryby</option>
              <option value="Pieczywo i Zboża">Pieczywo i Zboża</option>
              <option value="Owoce i Warzywa">Owoce i Warzywa</option>
              <option value="Orzechy i Nasiona">Orzechy i Nasiona</option>
              <option value="Napoje i Dodatki">Napoje i Dodatki</option>
              <option value="Przekąski i Słodycze">Przekąski i Słodycze</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[12px] font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Kalorie (kcal / 100g):
              </label>
              <input
                type="number"
                value={kcal}
                onChange={(e) => setKcal(e.target.value)}
                placeholder="np. 350"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-blue-500 mb-1">
                Białko (g / 100g):
              </label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="np. 20"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-amber-500 mb-1">
                Tłuszcz (g / 100g):
              </label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="np. 12"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-purple-500 mb-1">
                Węglowodany (g / 100g):
              </label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="np. 45"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Opcjonalna sztuka/opakowanie:
              </label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="np. 1 baton"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Waga sztuki (g):
              </label>
              <input
                type="number"
                value={unitGrams}
                onChange={(e) => setUnitGrams(e.target.value)}
                placeholder="np. 45"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 rounded-2xl py-3 text-[14px] font-bold ${
              dark ? "bg-zinc-800 text-zinc-300" : "bg-gray-100 text-gray-700"
            }`}
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-2 flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>Zapisz produkt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
