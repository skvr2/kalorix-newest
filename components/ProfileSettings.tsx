"use client";

import React, { useState } from "react";
import { User, Key, Moon, Sun, Calculator, Check, Trash2, Plus, Sparkles } from "lucide-react";
import { Profile, Goals, Settings } from "@/lib/types";
import { ACTIVITY_LABELS, GOAL_LABELS, calculateSuggestedGoals } from "@/lib/storage";
import { addKeys, removeKey, keyStates } from "@/lib/ai";

interface ProfileSettingsProps {
  profile: Profile;
  goals: Goals;
  settings: Settings;
  onSaveProfile: (profile: Profile) => void;
  onSaveGoals: (goals: Goals) => void;
  onSaveSettings: (settings: Settings) => void;
  dark?: boolean;
}

export function ProfileSettings({
  profile,
  goals,
  settings,
  onSaveProfile,
  onSaveGoals,
  onSaveSettings,
  dark = false,
}: ProfileSettingsProps) {
  const [localProfile, setLocalProfile] = useState<Profile>(profile);
  const [localGoals, setLocalGoals] = useState<Goals>(goals);
  const [newApiKey, setNewApiKey] = useState("");
  const [keyRows, setKeyRows] = useState(() => keyStates());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleRecalculate = () => {
    const suggested = calculateSuggestedGoals(localProfile);
    setLocalGoals(suggested);
    onSaveGoals(suggested);
    onSaveProfile(localProfile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleManualSaveGoals = () => {
    onSaveGoals(localGoals);
    onSaveProfile(localProfile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleAddKey = () => {
    if (!newApiKey.trim()) return;
    addKeys(newApiKey);
    setNewApiKey("");
    setKeyRows(keyStates());
  };

  const handleRemoveKey = (k: string) => {
    removeKey(k);
    setKeyRows(keyStates());
  };

  const handleToggleTheme = (theme: "light" | "dark") => {
    const next = { ...settings, theme };
    onSaveSettings(next);
  };

  const inputCls = `w-full rounded-2xl border px-3.5 py-3 text-[14px] font-semibold outline-none transition-all ${
    dark
      ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-emerald-500"
      : "bg-gray-50 border-gray-200 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
  }`;

  return (
    <div className="space-y-5 pb-28">
      <div className="pt-1">
        <h2 className={`text-[22px] font-black tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
          Profil i Ustawienia
        </h2>
        <p className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          Dostosuj swoje zapotrzebowanie kaloryczne i klucze AI
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3.5 text-[13px] font-bold text-emerald-600 border border-emerald-500/20">
          <Check className="h-4 w-4" />
          <span>Ustawienia zostały pomyślnie zapisane!</span>
        </div>
      )}

      {/* Profil i Parametry ciała */}
      <section
        className={`rounded-3xl border p-5 shadow-sm space-y-4 ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <User className="h-4 w-4" />
          </div>
          <h3 className="text-[16px] font-bold">Twoje Dane i Cel</h3>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
            Imię:
          </label>
          <input
            type="text"
            value={localProfile.name}
            onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
              Płeć:
            </label>
            <select
              value={localProfile.sex}
              onChange={(e) => setLocalProfile({ ...localProfile, sex: e.target.value as Profile["sex"] })}
              className={inputCls}
            >
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
              <option value="other">Inna</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
              Wiek:
            </label>
            <input
              type="number"
              value={localProfile.age}
              onChange={(e) => setLocalProfile({ ...localProfile, age: Number(e.target.value) })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
              Wzrost (cm):
            </label>
            <input
              type="number"
              value={localProfile.heightCm}
              onChange={(e) => setLocalProfile({ ...localProfile, heightCm: Number(e.target.value) })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
              Waga (kg):
            </label>
            <input
              type="number"
              value={localProfile.weightKg}
              onChange={(e) => setLocalProfile({ ...localProfile, weightKg: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
            Aktywność fizyczna:
          </label>
          <select
            value={localProfile.activity}
            onChange={(e) => setLocalProfile({ ...localProfile, activity: e.target.value as Profile["activity"] })}
            className={inputCls}
          >
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
            Twój Cel Sylwetkowy:
          </label>
          <select
            value={localProfile.goal}
            onChange={(e) => setLocalProfile({ ...localProfile, goal: e.target.value as Profile["goal"] })}
            className={inputCls}
          >
            {Object.entries(GOAL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleRecalculate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-98"
        >
          <Calculator className="h-4 w-4" />
          <span>Przelicz automatycznie kalorie i makro</span>
        </button>
      </section>

      {/* Ręczne dopasowanie celów */}
      <section
        className={`rounded-3xl border p-5 shadow-sm space-y-3.5 ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <h3 className="text-[16px] font-bold">Dzienne Limity i Makroskładniki</h3>
        <p className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          Możesz precyzyjnie ustalić własne gramatury białka, tłuszczu i węglowodanów:
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-bold text-emerald-600 mb-1">
              Kalorie (kcal):
            </label>
            <input
              type="number"
              value={localGoals.kcal}
              onChange={(e) => setLocalGoals({ ...localGoals, kcal: Number(e.target.value) })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-blue-500 mb-1">
              Białko (g):
            </label>
            <input
              type="number"
              value={localGoals.protein}
              onChange={(e) => setLocalGoals({ ...localGoals, protein: Number(e.target.value) })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-amber-500 mb-1">
              Tłuszcz (g):
            </label>
            <input
              type="number"
              value={localGoals.fat}
              onChange={(e) => setLocalGoals({ ...localGoals, fat: Number(e.target.value) })}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-purple-500 mb-1">
              Węglowodany (g):
            </label>
            <input
              type="number"
              value={localGoals.carbs}
              onChange={(e) => setLocalGoals({ ...localGoals, carbs: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualSaveGoals}
          className={`w-full rounded-2xl py-3 text-[13px] font-bold transition-colors ${
            dark ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          Zapisz limity
        </button>
      </section>

      {/* Klucze OpenRouter */}
      <section
        className={`rounded-3xl border p-5 shadow-sm space-y-3.5 ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Key className="h-4 w-4" />
            </div>
            <h3 className="text-[16px] font-bold">Klucze OpenRouter AI</h3>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
            {keyRows.length} aktywnych
          </span>
        </div>

        <p className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          Klucze API zostają zapisane wyłącznie w Twojej przeglądarce. Aplikacja automatycznie rotuje klucze w razie limitów.
        </p>

        <div className="flex gap-2">
          <input
            type="password"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className={inputCls}
          />
          <button
            type="button"
            onClick={handleAddKey}
            className="flex items-center gap-1 rounded-2xl bg-emerald-500 px-4 text-[13px] font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4" />
            <span>Dodaj</span>
          </button>
        </div>

        {keyRows.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {keyRows.map((k) => (
              <div key={k.key} className="flex items-center justify-between py-2 text-[13px]">
                <div className="flex items-center gap-2 font-mono">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600">
                    {k.slot}
                  </span>
                  <span>{k.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveKey(k.key)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Wygląd motywu */}
      <section
        className={`rounded-3xl border p-5 shadow-sm space-y-3 ${
          dark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <h3 className="text-[16px] font-bold">Motyw aplikacji</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleToggleTheme("light")}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold border transition-all ${
              settings.theme === "light"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Jasny</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleTheme("dark")}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold border transition-all ${
              settings.theme === "dark"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Ciemny</span>
          </button>
        </div>
      </section>
    </div>
  );
}
