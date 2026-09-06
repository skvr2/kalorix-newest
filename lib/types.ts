export type MealType = "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner";

export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  grams: number;
  kcal: number;
  protein: number; // Białko w gramach
  fat: number;     // Tłuszcz w gramach
  carbs: number;   // Węglowodany w gramach
  fiber?: number;  // Błonnik w gramach
  photo?: string;
  note?: string;
  category?: string;
};

export type DayLog = {
  date: string; // YYYY-MM-DD
  meals: Record<MealType, FoodItem[]>;
  waterMl: number;
  notes?: string;
};

export type Goals = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type Activity = "low" | "light" | "mid" | "high" | "very";
export type GoalType = "lose" | "maintain" | "gain";

export type Profile = {
  name: string;
  sex: "female" | "male" | "other";
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: GoalType;
  waterGoal: number;
  glassMl: number;
};

export type RecipeIngredient = {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type Recipe = {
  id: string;
  title: string;
  category: "Śniadania" | "Obiady" | "Kolacje" | "Wysokobiałkowe" | "Desery Fit" | "Szybkie (<15 min)";
  timeMinutes: number;
  servings: number;
  image: string;
  imageUrl?: string;
  description: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
};

export type AnalyzeResult = {
  mealGuess: MealType;
  items: Omit<FoodItem, "id" | "photo">[];
  summary: string;
  confidence: number;
};

export type Settings = {
  theme: "light" | "dark";
  keys: string[];
  favoriteFoodIds: string[];
};
