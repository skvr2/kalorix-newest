import {
  Activity,
  DayLog,
  FoodItem,
  GoalType,
  Goals,
  MealType,
  Profile,
  Recipe,
  Settings,
} from "./types";
import { INITIAL_RECIPES } from "./recipesData";
import { FOOD_DATABASE, BaseProduct } from "./database";

const STORAGE_KEY = "kalorix_fitatu_v2_clean";

export const MEAL_LABELS: Record<MealType, { name: string; iconType: "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner"; timeHint: string }> = {
  breakfast: { name: "Śniadanie", iconType: "breakfast", timeHint: "07:00 - 09:30" },
  morning_snack: { name: "II Śniadanie", iconType: "morning_snack", timeHint: "10:30 - 12:00" },
  lunch: { name: "Obiad", iconType: "lunch", timeHint: "13:30 - 15:30" },
  afternoon_snack: { name: "Podwieczorek / Przekąski", iconType: "afternoon_snack", timeHint: "16:30 - 18:00" },
  dinner: { name: "Kolacja", iconType: "dinner", timeHint: "19:00 - 21:00" },
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  low: "Siedzący tryb życia (brak treningów)",
  light: "Lekka aktywność (1–2 treningi/tyg.)",
  mid: "Umiarkowana (3–4 treningi/tyg.)",
  high: "Duża aktywność (5–6 treningów/tyg.)",
  very: "Bardzo wysoka (sport zawodowy / praca fizyczna)",
};

export const GOAL_LABELS: Record<GoalType, string> = {
  lose: "Redukcja masy ciała (Schudnij)",
  maintain: "Utrzymanie aktualnej wagi",
  gain: "Budowanie masy mięśniowej",
};

export const DEFAULT_GOALS: Goals = {
  kcal: 2200,
  protein: 150, // Białko (g)
  fat: 70,      // Tłuszcz (g)
  carbs: 240,   // Węglowodany (g)
};

export const DEFAULT_PROFILE: Profile = {
  name: "Szymon",
  sex: "male",
  age: 24,
  heightCm: 180,
  weightKg: 78,
  activity: "mid",
  goal: "maintain",
  waterGoal: 2500,
  glassMl: 250,
};

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  keys: [],
  favoriteFoodIds: ["p-jajko", "p-piers-kurczaka", "p-platki-owsiane", "p-banan", "p-skyr-naturalny"],
};

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatPolishDate(isoDate: string): string {
  try {
    const today = todayISO();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = todayISO(yesterdayDate);

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = todayISO(tomorrowDate);

    if (isoDate === today) return "Dzisiaj";
    if (isoDate === yesterday) return "Wczoraj";
    if (isoDate === tomorrow) return "Jutro";

    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return isoDate;
  }
}

export function emptyDay(date: string): DayLog {
  return {
    date,
    meals: {
      breakfast: [],
      morning_snack: [],
      lunch: [],
      afternoon_snack: [],
      dinner: [],
    },
    waterMl: 0,
  };
}

type Store = {
  goals: Goals;
  profile: Profile;
  settings: Settings;
  days: Record<string, DayLog>;
  recipes: Recipe[];
  customProducts: BaseProduct[];
};

function defaults(): Store {
  return {
    goals: DEFAULT_GOALS,
    profile: DEFAULT_PROFILE,
    settings: DEFAULT_SETTINGS,
    days: {},
    recipes: INITIAL_RECIPES,
    customProducts: [],
  };
}

function read(): Store {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = defaults();
      write(init);
      return init;
    }
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      goals: parsed.goals ?? DEFAULT_GOALS,
      profile: parsed.profile ?? DEFAULT_PROFILE,
      settings: parsed.settings ?? DEFAULT_SETTINGS,
      days: parsed.days ?? {},
      recipes: parsed.recipes && parsed.recipes.length ? parsed.recipes : INITIAL_RECIPES,
      customProducts: parsed.customProducts ?? [],
    };
  } catch {
    return defaults();
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

export function loadGoals(): Goals {
  return read().goals;
}
export function saveGoals(goals: Goals) {
  write({ ...read(), goals });
}
export function loadProfile(): Profile {
  return read().profile;
}
export function saveProfile(profile: Profile) {
  write({ ...read(), profile });
}
export function loadSettings(): Settings {
  return read().settings;
}
export function saveSettings(settings: Settings) {
  write({ ...read(), settings });
}
export function loadRecipes(): Recipe[] {
  return read().recipes;
}
export function saveRecipes(recipes: Recipe[]) {
  write({ ...read(), recipes });
}
export function loadCustomProducts(): BaseProduct[] {
  return read().customProducts;
}
export function saveCustomProduct(product: BaseProduct) {
  const store = read();
  store.customProducts = [product, ...store.customProducts.filter((p) => p.id !== product.id)];
  write(store);
}

export function loadDay(date: string): DayLog {
  const day = read().days[date];
  if (!day) return emptyDay(date);
  return {
    ...emptyDay(date),
    ...day,
    meals: {
      breakfast: day.meals?.breakfast ?? [],
      morning_snack: day.meals?.morning_snack ?? [],
      lunch: day.meals?.lunch ?? [],
      afternoon_snack: day.meals?.afternoon_snack ?? [],
      dinner: day.meals?.dinner ?? [],
    },
    waterMl: day.waterMl ?? 0,
  };
}

export function saveDay(day: DayLog) {
  const store = read();
  store.days[day.date] = day;
  write(store);
}

export function addItemsToMeal(date: string, meal: MealType, items: FoodItem[]): DayLog {
  const day = loadDay(date);
  day.meals[meal] = [...day.meals[meal], ...items];
  saveDay(day);
  return day;
}

export function removeFoodItem(date: string, meal: MealType, itemId: string): DayLog {
  const day = loadDay(date);
  day.meals[meal] = day.meals[meal].filter((item) => item.id !== itemId);
  saveDay(day);
  return day;
}

export function updateFoodItem(date: string, meal: MealType, updatedItem: FoodItem): DayLog {
  const day = loadDay(date);
  day.meals[meal] = day.meals[meal].map((item) => (item.id === updatedItem.id ? updatedItem : item));
  saveDay(day);
  return day;
}

export function addWater(date: string, ml: number): DayLog {
  const day = loadDay(date);
  day.waterMl = Math.max(0, day.waterMl + ml);
  saveDay(day);
  return day;
}

export function calculateDayTotals(day: DayLog): {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
} {
  const allItems = Object.values(day.meals).flat();
  return allItems.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: Math.round((acc.protein + item.protein) * 10) / 10,
      fat: Math.round((acc.fat + item.fat) * 10) / 10,
      carbs: Math.round((acc.carbs + item.carbs) * 10) / 10,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export function calculateMealTotals(items: FoodItem[]): {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
} {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: Math.round((acc.protein + item.protein) * 10) / 10,
      fat: Math.round((acc.fat + item.fat) * 10) / 10,
      carbs: Math.round((acc.carbs + item.carbs) * 10) / 10,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export function getWeekDays(centerDateStr = todayISO()): { date: string; label: string; dayNum: number }[] {
  const parts = centerDateStr.split("-");
  const center = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const currentDayOfWeek = center.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(center);
  monday.setDate(center.getDate() + distanceToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = todayISO(d);
    return {
      date: iso,
      label: d.toLocaleDateString("pl-PL", { weekday: "narrow" }).toUpperCase(),
      dayNum: d.getDate(),
    };
  });
}

export function calculateSuggestedGoals(profile: Profile): Goals {
  const { weightKg: w, heightCm: h, age, sex, activity, goal } = profile;
  // Wzór Mifflina-St Jeora
  const bmr = sex === "male" ? 10 * w + 6.25 * h - 5 * age + 5 : 10 * w + 6.25 * h - 5 * age - 161;
  const multiplier = { low: 1.2, light: 1.375, mid: 1.55, high: 1.725, very: 1.9 }[activity];
  let kcal = bmr * multiplier;
  if (goal === "lose") kcal -= 400;
  if (goal === "gain") kcal += 350;
  kcal = Math.max(1200, Math.round(kcal / 10) * 10);

  // Makroskładniki
  const protein = Math.round(w * (goal === "lose" ? 2.0 : goal === "gain" ? 2.1 : 1.8));
  const fat = Math.round(w * 0.9);
  const remainingKcal = Math.max(200, kcal - protein * 4 - fat * 9);
  const carbs = Math.round(remainingKcal / 4);

  return { kcal, protein, fat, carbs };
}
