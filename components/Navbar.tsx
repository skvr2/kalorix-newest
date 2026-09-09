"use client";

import React from "react";
import { BookOpen, Calendar, Droplets, Plus, Settings } from "lucide-react";

export type NavTab = "diary" | "recipes" | "water" | "settings";

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  dark?: boolean;
}

export function Navbar({ currentTab, onSelectTab, onOpenAddModal, dark = false }: NavbarProps) {
  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t ${
        dark ? "border-zinc-800 bg-zinc-950/90 text-zinc-100" : "border-gray-200/80 bg-white/95 text-gray-900"
      } backdrop-blur-md px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]`}
    >
      <div className="grid grid-cols-5 items-center">
        {/* Dziennik */}
        <button
          type="button"
          onClick={() => onSelectTab("diary")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === "diary"
              ? "text-emerald-500 font-semibold"
              : dark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Calendar className="h-5 w-5" strokeWidth={currentTab === "diary" ? 2.5 : 1.8} />
          <span className="mt-1 text-[11px] tracking-tight">Dziennik</span>
        </button>

        {/* Przepisy */}
        <button
          type="button"
          onClick={() => onSelectTab("recipes")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === "recipes"
              ? "text-emerald-500 font-semibold"
              : dark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <BookOpen className="h-5 w-5" strokeWidth={currentTab === "recipes" ? 2.5 : 1.8} />
          <span className="mt-1 text-[11px] tracking-tight">Przepisy</span>
        </button>

        {/* FAB Przycisk Dodaj (Centralny Fitatu) */}
        <div className="flex justify-center -mt-5">
          <button
            type="button"
            aria-label="Dodaj posiłek lub produkt"
            onClick={onOpenAddModal}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
          >
            <Plus className="h-7 w-7" strokeWidth={2.8} />
          </button>
        </div>

        {/* Woda */}
        <button
          type="button"
          onClick={() => onSelectTab("water")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === "water"
              ? "text-emerald-500 font-semibold"
              : dark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Droplets className="h-5 w-5" strokeWidth={currentTab === "water" ? 2.5 : 1.8} />
          <span className="mt-1 text-[11px] tracking-tight">Woda</span>
        </button>

        {/* Profil i Cele */}
        <button
          type="button"
          onClick={() => onSelectTab("settings")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentTab === "settings"
              ? "text-emerald-500 font-semibold"
              : dark
              ? "text-zinc-400 hover:text-zinc-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Settings className="h-5 w-5" strokeWidth={currentTab === "settings" ? 2.5 : 1.8} />
          <span className="mt-1 text-[11px] tracking-tight">Profil</span>
        </button>
      </div>
    </nav>
  );
}
