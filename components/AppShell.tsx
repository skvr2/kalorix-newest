"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar, NavTab } from "./Navbar";
import { CalendarHeader } from "./CalendarHeader";
import { MacroSummary } from "./MacroSummary";
import { MealCard } from "./MealCard";
import { PortionModal } from "./PortionModal";
import { SearchFoodModal } from "./SearchFoodModal";
import { AIScannerModal } from "./AIScannerModal";
import { RecipesView } from "./RecipesView";
import { WaterTracker } from "./WaterTracker";
import { ProfileSettings } from "./ProfileSettings";
import { CustomProductModal } from "./CustomProductModal";
import { AddActionModal } from "./AddActionModal";

import {
  loadDay,
  saveDay,
  loadGoals,
  saveGoals,
  loadProfile,
  saveProfile,
  loadSettings,
  saveSettings,
  loadRecipes,
  saveRecipes,
  loadCustomProducts,
  saveCustomProduct,
  todayISO,
  calculateDayTotals,
  addItemsToMeal,
  removeFoodItem,
  updateFoodItem,
  addWater,
} from "@/lib/storage";
import { BaseProduct } from "@/lib/database";
import { DayLog, FoodItem, Goals, MealType, Profile, Recipe, Settings } from "@/lib/types";
import { uid } from "@/lib/image";

const MEAL_TYPES: MealType[] = [
  "breakfast",
  "morning_snack",
  "lunch",
  "afternoon_snack",
  "dinner",
];

export default function AppShell() {
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>("diary");
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  // State
  const [dayLog, setDayLog] = useState<DayLog>(() => loadDay(todayISO()));
  const [goals, setGoals] = useState<Goals>(loadGoals);
  const [profile, setProfile] = useState<Profile>(loadProfile);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);
  const [customProducts, setCustomProducts] = useState<BaseProduct[]>(loadCustomProducts);

  // Modals state
  const [activeMealForAdd, setActiveMealForAdd] = useState<MealType>("lunch");
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAIScannerModal, setShowAIScannerModal] = useState(false);
  const [showCustomProductModal, setShowCustomProductModal] = useState(false);

  // Portion Modal state
  const [selectedProductForPortion, setSelectedProductForPortion] = useState<BaseProduct | null>(null);
  const [editingFoodItem, setEditingFoodItem] = useState<{ meal: MealType; item: FoodItem } | null>(null);

  const dark = settings.theme === "dark";

  useEffect(() => {
    setMounted(true);
    setDayLog(loadDay(selectedDate));
    setRecipes(loadRecipes());

    // Dynamic Theme synchronizer for iOS status bar & safe areas
    const isDark = settings.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.backgroundColor = isDark ? "#09090b" : "#f8fafc";
    document.body.style.backgroundColor = isDark ? "#09090b" : "#f8fafc";

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute("content", isDark ? "#09090b" : "#f8fafc");

    let metaStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaStatus) {
      metaStatus = document.createElement("meta");
      metaStatus.setAttribute("name", "apple-mobile-web-app-status-bar-style");
      document.head.appendChild(metaStatus);
    }
    metaStatus.setAttribute("content", "black-translucent");
  }, [selectedDate, settings.theme]);

  // Recalculate daily totals
  const dayTotals = useMemo(() => calculateDayTotals(dayLog), [dayLog]);

  // Handlers
  const handleOpenAddForMeal = (meal: MealType) => {
    setActiveMealForAdd(meal);
    setShowAddActionModal(true);
  };

  const handleSelectAddOption = (option: "search" | "ai" | "recipes" | "custom") => {
    setShowAddActionModal(false);
    if (option === "search") {
      setShowSearchModal(true);
    } else if (option === "ai") {
      setShowAIScannerModal(true);
    } else if (option === "recipes") {
      setCurrentTab("recipes");
    } else if (option === "custom") {
      setShowCustomProductModal(true);
    }
  };

  const handleProductSelectedFromSearch = (product: BaseProduct, meal: MealType) => {
    setShowSearchModal(false);
    setActiveMealForAdd(meal);
    setSelectedProductForPortion(product);
  };

  const handleConfirmPortion = (meal: MealType, itemData: Omit<FoodItem, "id">) => {
    if (editingFoodItem) {
      // Editing existing item
      const updated: FoodItem = {
        ...itemData,
        id: editingFoodItem.item.id,
      };
      const newDay = updateFoodItem(selectedDate, meal, updated);
      setDayLog(newDay);
      setEditingFoodItem(null);
    } else {
      // Adding new item
      const newItem: FoodItem = {
        ...itemData,
        id: uid(),
      };
      const newDay = addItemsToMeal(selectedDate, meal, [newItem]);
      setDayLog(newDay);
      setSelectedProductForPortion(null);
    }
  };

  const handleDeleteItem = (meal: MealType, id: string) => {
    const newDay = removeFoodItem(selectedDate, meal, id);
    setDayLog(newDay);
  };

  const handleEditItem = (meal: MealType, item: FoodItem) => {
    setEditingFoodItem({ meal, item });
  };

  const handleCommitAIItems = (meal: MealType, items: FoodItem[]) => {
    const newDay = addItemsToMeal(selectedDate, meal, items);
    setDayLog(newDay);
    setShowAIScannerModal(false);
  };

  const handleAddRecipeToDay = (date: string, meal: MealType, items: FoodItem[]) => {
    const newDay = addItemsToMeal(date, meal, items);
    if (date === selectedDate) {
      setDayLog(newDay);
    }
  };

  const handleAddWater = (ml: number) => {
    const newDay = addWater(selectedDate, ml);
    setDayLog(newDay);
  };

  const handleSaveCustomProduct = (prod: BaseProduct) => {
    saveCustomProduct(prod);
    setCustomProducts(loadCustomProducts());
    // Directly open portion modal for this newly created product
    setSelectedProductForPortion(prod);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  return (
    <div className={`min-h-[100dvh] w-full transition-colors ${dark ? "bg-zinc-950 text-zinc-100" : "bg-slate-50 text-gray-900"}`}>
      <div className={`mx-auto flex min-h-[100dvh] max-w-md flex-col ${dark ? "bg-zinc-950" : "bg-slate-50"} shadow-2xl`}>
        {/* Sticky Calendar Header in Diary Tab */}
        {currentTab === "diary" ? (
          <CalendarHeader
            selectedDate={selectedDate}
            onDateChange={(d) => setSelectedDate(d)}
            dark={dark}
          />
        ) : (
          /* Top Safe Area Bar for non-diary tabs to prevent white notch gap */
          <div className={`pt-[max(14px,env(safe-area-inset-top))] px-4 transition-colors ${dark ? "bg-zinc-950" : "bg-slate-50"}`} />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 pt-2 pb-24 space-y-4">
          {/* TAB 1: DZIENNIK (Fitatu Style) */}
          {currentTab === "diary" && (
            <>
              {/* Macro Summary Dashboard */}
              <MacroSummary totals={dayTotals} goals={goals} dark={dark} />

              {/* Meal Cards */}
              <div className="space-y-3.5 mt-2">
                {MEAL_TYPES.map((type) => (
                  <MealCard
                    key={type}
                    type={type}
                    items={dayLog.meals[type] || []}
                    onOpenAdd={handleOpenAddForMeal}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={handleEditItem}
                    dark={dark}
                  />
                ))}
              </div>
            </>
          )}

          {/* TAB 2: PRZEPISY FIT */}
          {currentTab === "recipes" && (
            <RecipesView
              recipes={recipes}
              currentDate={selectedDate}
              onAddRecipeToDay={handleAddRecipeToDay}
              dark={dark}
            />
          )}

          {/* TAB 3: WODA */}
          {currentTab === "water" && (
            <WaterTracker
              waterMl={dayLog.waterMl}
              profile={profile}
              onAddWater={handleAddWater}
              onUpdateWaterGoal={(goal) => {
                const next = { ...profile, waterGoal: goal };
                setProfile(next);
                saveProfile(next);
              }}
              dark={dark}
            />
          )}

          {/* TAB 4: PROFIL I USTAWIENIA */}
          {currentTab === "settings" && (
            <ProfileSettings
              profile={profile}
              goals={goals}
              settings={settings}
              onSaveProfile={(p) => {
                setProfile(p);
                saveProfile(p);
              }}
              onSaveGoals={(g) => {
                setGoals(g);
                saveGoals(g);
              }}
              onSaveSettings={(s) => {
                setSettings(s);
                saveSettings(s);
              }}
              dark={dark}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={(t) => setCurrentTab(t)}
          onOpenAddModal={() => handleOpenAddForMeal(activeMealForAdd)}
          dark={dark}
        />

        {/* MODALS */}
        {showAddActionModal && (
          <AddActionModal
            currentMeal={activeMealForAdd}
            onSelectOption={handleSelectAddOption}
            onChangeMeal={(m) => setActiveMealForAdd(m)}
            onClose={() => setShowAddActionModal(false)}
            dark={dark}
          />
        )}

        {showSearchModal && (
          <SearchFoodModal
            initialMeal={activeMealForAdd}
            customProducts={customProducts}
            onSelectProduct={handleProductSelectedFromSearch}
            onOpenCustomProduct={() => {
              setShowSearchModal(false);
              setShowCustomProductModal(true);
            }}
            onClose={() => setShowSearchModal(false)}
            dark={dark}
          />
        )}

        {/* Portion Modal (Wpisywanie ilości PRZED dodaniem lub edycja) */}
        {(selectedProductForPortion || editingFoodItem) && (
          <PortionModal
            product={selectedProductForPortion}
            initialMeal={editingFoodItem ? editingFoodItem.meal : activeMealForAdd}
            editingItem={editingFoodItem ? editingFoodItem.item : null}
            onClose={() => {
              setSelectedProductForPortion(null);
              setEditingFoodItem(null);
            }}
            onConfirm={handleConfirmPortion}
            dark={dark}
          />
        )}

        {showAIScannerModal && (
          <AIScannerModal
            initialMeal={activeMealForAdd}
            onCommitItems={handleCommitAIItems}
            onClose={() => setShowAIScannerModal(false)}
            dark={dark}
          />
        )}

        {showCustomProductModal && (
          <CustomProductModal
            onSave={handleSaveCustomProduct}
            onClose={() => setShowCustomProductModal(false)}
            dark={dark}
          />
        )}
      </div>
    </div>
  );
}
