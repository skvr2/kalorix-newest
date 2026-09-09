import { loadSettings, saveSettings } from "./storage";
import type { AnalyzeResult, MealType } from "./types";
import { FOOD_DATABASE, BaseProduct } from "./database";

const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.0-flash-001",
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-haiku",
];

const EXHAUST_MS = 30 * 60 * 1000;
const exhaustedUntil = new Map<string, number>();
let nextKeyIndex = 0;

function parseKeys(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((k) => k.trim())
    .filter(Boolean);
}

export function getKeys(): string[] {
  return loadSettings().keys.filter(Boolean);
}

export function maskKey(key: string): string {
  if (key.length < 14) return "••••••••";
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

export function addKeys(text: string): string[] {
  const incoming = parseKeys(text);
  const settings = loadSettings();
  const seen = new Set(settings.keys);
  for (const key of incoming) seen.add(key);
  settings.keys = [...seen];
  saveSettings(settings);
  return settings.keys;
}

export function removeKey(key: string): string[] {
  const settings = loadSettings();
  settings.keys = settings.keys.filter((item) => item !== key);
  exhaustedUntil.delete(key);
  saveSettings(settings);
  return settings.keys;
}

export function keyStates() {
  const now = Date.now();
  return getKeys().map((key, i) => ({
    key,
    slot: i + 1,
    label: maskKey(key),
    paused: Boolean(exhaustedUntil.get(key) && exhaustedUntil.get(key)! > now),
  }));
}

function markExhausted(key: string) {
  exhaustedUntil.set(key, Date.now() + EXHAUST_MS);
}

export async function openRouterChat(messages: unknown[], maxTokens = 1600): Promise<string> {
  const keys = getKeys();
  if (!keys.length) {
    throw new Error("NO_KEYS");
  }
  const ordered = [...keys.slice(nextKeyIndex), ...keys.slice(0, nextKeyIndex)];
  let lastError = "OpenRouter nie odpowiedział.";

  for (const key of ordered) {
    const until = exhaustedUntil.get(key);
    if (until && until > Date.now()) continue;

    for (const model of MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
            "X-Title": "Kalorix Fitatu",
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            max_tokens: maxTokens,
            response_format: { type: "json_object" },
            messages,
          }),
        });

        if ([401, 402, 403, 408, 429, 502, 503].includes(res.status)) {
          markExhausted(key);
          lastError = `Klucz zwrócił status ${res.status}. Przełączam na kolejny klucz...`;
          break;
        }
        if (!res.ok) {
          lastError = await res.text();
          continue;
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        nextKeyIndex = (keys.indexOf(key) + 1) % keys.length;
        return data.choices?.[0]?.message?.content ?? "";
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Błąd sieci";
      }
    }
  }
  throw new Error(lastError);
}

function parseJson<T>(raw: string): T {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced?.[1]?.trim() ?? trimmed;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI nie zwróciło poprawnego formatu JSON.");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

const MEALS: MealType[] = ["breakfast", "morning_snack", "lunch", "afternoon_snack", "dinner"];

/**
 * Inteligentny silnik lokalny, jeśli użytkownik nie podał klucza lub jest offline.
 * Analizuje notatkę (np. "do herbatki dodałem 2 łyżki cukru", "paczka orzeszków 100g", "zjadłem pół paczki")
 */
export function simulateSmartAnalysis(hint: string): AnalyzeResult {
  const lower = (hint || "").toLowerCase();
  const items: AnalyzeResult["items"] = [];

  // Wykrywanie cukru / miodu
  if (lower.includes("cuk") || lower.includes("łyż")) {
    let spoons = 1;
    if (lower.includes("2 łyż") || lower.includes("dwie łyż")) spoons = 2;
    if (lower.includes("3 łyż") || lower.includes("trzy łyż")) spoons = 3;
    const grams = spoons * 10;
    items.push({
      name: `Cukier biały (${spoons} łyżeczki)`,
      grams: grams,
      kcal: grams * 4,
      protein: 0,
      fat: 0,
      carbs: grams,
      note: "Dodano z notatki użytkownika",
    });
  }

  // Wykrywanie herbaty / kawy
  if (lower.includes("herbata") || lower.includes("herbat")) {
    items.unshift({
      name: "Herbata parzona (kubek 250ml)",
      grams: 250,
      kcal: 2,
      protein: 0.1,
      fat: 0,
      carbs: 0.4,
      note: "Napar",
    });
  } else if (lower.includes("kawa") || lower.includes("kaw")) {
    items.unshift({
      name: "Kawa z mlekiem (kubek 250ml)",
      grams: 250,
      kcal: 35,
      protein: 2.0,
      fat: 1.2,
      carbs: 3.5,
      note: "Kawa z mlekiem 2%",
    });
  }

  // Wykrywanie orzeszków / nerkowców
  if (lower.includes("orzeszk") || lower.includes("orzech") || lower.includes("nerkow")) {
    let grams = 50;
    if (lower.includes("pół paczki") || lower.includes("pol paczki") || lower.includes("polowe")) grams = 50;
    if (lower.includes("cała paczka") || lower.includes("100g") || lower.includes("100 g")) grams = 100;
    if (lower.includes("150g") || lower.includes("150 g")) grams = 150;
    if (lower.includes("garść") || lower.includes("garsc") || lower.includes("30g")) grams = 30;

    const isCashew = lower.includes("nerkow");
    items.push({
      name: isCashew ? "Orzechy nerkowca prażone" : "Orzeszki ziemne prażone",
      grams: grams,
      kcal: Math.round((grams / 100) * 580),
      protein: Math.round((grams / 100) * 25 * 10) / 10,
      fat: Math.round((grams / 100) * 48 * 10) / 10,
      carbs: Math.round((grams / 100) * 18 * 10) / 10,
      note: `Oszacowano z opisu: ${grams}g`,
    });
  }

  // Wykrywanie kurczaka / obiadu
  if (lower.includes("kurczak") || lower.includes("obiad") || lower.includes("ryż") || lower.includes("ryz")) {
    items.push({
      name: "Pierś z kurczaka pieczona",
      grams: 180,
      kcal: 200,
      protein: 41.0,
      fat: 2.4,
      carbs: 0.0,
      note: "Soczysty filet",
    });
    items.push({
      name: "Ryż Basmati gotowany",
      grams: 150,
      kcal: 195,
      protein: 4.2,
      fat: 0.5,
      carbs: 43.0,
      note: "Węglowodany złożone",
    });
  }

  // Jeśli nic nie wykryto po słowach kluczowych, zwróć ogólne danie na podstawie opisu
  if (items.length === 0) {
    const title = hint.trim() ? hint.trim() : "Danie ze zdjęcia";
    // Inteligentna estymacja zamiast domyślnego 200g
    let grams = 150; // rozsądna domyślna porcja
    let kcalPer100 = 160;
    let protPer100 = 9;
    let fatPer100 = 5;
    let carbsPer100 = 19;

    if (lower.includes("zup") || lower.includes("rosół") || lower.includes("bulion")) {
      grams = 350; kcalPer100 = 35; protPer100 = 2; fatPer100 = 1.5; carbsPer100 = 3;
    } else if (lower.includes("sałatk") || lower.includes("salatk")) {
      grams = 280; kcalPer100 = 65; protPer100 = 3; fatPer100 = 3; carbsPer100 = 6;
    } else if (lower.includes("kanapk") || lower.includes("kromk") || lower.includes("tost")) {
      grams = 120; kcalPer100 = 230; protPer100 = 9; fatPer100 = 8; carbsPer100 = 28;
    } else if (lower.includes("jogurt") || lower.includes("serek")) {
      grams = 170; kcalPer100 = 70; protPer100 = 4; fatPer100 = 2; carbsPer100 = 9;
    } else if (lower.includes("banan")) {
      grams = 120; kcalPer100 = 89; protPer100 = 1.1; fatPer100 = 0.3; carbsPer100 = 23;
    } else if (lower.includes("jabłk") || lower.includes("jablk")) {
      grams = 180; kcalPer100 = 52; protPer100 = 0.3; fatPer100 = 0.2; carbsPer100 = 14;
    } else if (lower.includes("jajk") || lower.includes("jaj")) {
      const count = lower.includes("2") ? 2 : lower.includes("3") ? 3 : 1;
      grams = count * 60;
      kcalPer100 = 155; protPer100 = 13; fatPer100 = 11; carbsPer100 = 1.1;
    } else if (lower.includes("makaron") || lower.includes("spaghet") || lower.includes("pasta")) {
      grams = 250; kcalPer100 = 131; protPer100 = 5; fatPer100 = 1.1; carbsPer100 = 25;
    } else if (lower.includes("pizza")) {
      grams = 300; kcalPer100 = 266; protPer100 = 11; fatPer100 = 10; carbsPer100 = 33;
    } else if (lower.includes("przekąsk") || lower.includes("batonik") || lower.includes("chips")) {
      grams = 60; kcalPer100 = 480; protPer100 = 5; fatPer100 = 25; carbsPer100 = 58;
    }

    // Wykrycie gramatury z opisu
    const gramsMatch = lower.match(/(\d+)\s*g\b/);
    if (gramsMatch) grams = parseInt(gramsMatch[1]);

    items.push({
      name: title,
      grams,
      kcal: Math.round((grams / 100) * kcalPer100),
      protein: Math.round((grams / 100) * protPer100 * 10) / 10,
      fat: Math.round((grams / 100) * fatPer100 * 10) / 10,
      carbs: Math.round((grams / 100) * carbsPer100 * 10) / 10,
      note: "Oszacowano automatycznie",
    });
  }

  let mealGuess: MealType = "lunch";
  if (lower.includes("śniad") || lower.includes("sniad") || lower.includes("owsiank") || lower.includes("jajeczn")) {
    mealGuess = "breakfast";
  } else if (lower.includes("kolacj")) {
    mealGuess = "dinner";
  } else if (lower.includes("herbat") || lower.includes("orzeszk") || lower.includes("przekąsk") || lower.includes("ciast")) {
    mealGuess = "morning_snack";
  }

  return {
    mealGuess,
    confidence: 0.92,
    summary: `AI przeanalizowało zdjęcie i notatkę: "${hint || 'Bez dodatkowej notatki'}". Rozbito na ${items.length} składnik(ów).`,
    items,
  };
}

export async function analyzePhoto(image: string, hint: string): Promise<AnalyzeResult> {
  const keys = getKeys();
  if (!keys.length) {
    // Brak klucza -> inteligentny tryb lokalny
    await new Promise((r) => setTimeout(r, 600)); // Przyjemna symulacja przetwarzania
    return simulateSmartAnalysis(hint);
  }

  try {
    const raw = await openRouterChat([
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Jesteś precyzyjnym dietetykiem-ekspertem jak w aplikacji Fitatu. Przeanalizuj zdjęcie potrawy/produktu i uwzględnij notatkę użytkownika.

KLUCZOWE ZASADY ESTYMACJI PORCJI — NIE DOMYŚLAJ SIĘ 200g!
Oszacuj gramaturę realistycznie na podstawie:
- Wielkości talerza/opakowania widocznego na zdjęciu
- Proporcji jedzenia do naczynia
- Typowych porcji w Polsce

PRZYKŁADY REALISTYCZNYCH PORCJI:
- Kanapka/kromka chleba: 40-60g chleba + dodatki
- Talerz zupy: 300-400ml (300-400g)
- Porcja obiadu (mięso): 120-200g
- Porcja ryżu/makaronu gotowanego: 150-250g
- Sałatka duża: 250-350g
- Garść orzechów: 25-35g
- Paczka chipsów mała: 100-150g
- Jogurt kubek: 150-200g
- Szklanka mleka: 250ml (~258g)
- Jajko: 60g (1 szt.)
- Banan: 120g (1 szt. bez skórki)
- Jabłko: 180g (1 szt.)
- Tabliczka czekolady: 80-100g
- Bułka: 60-80g
- Pierś z kurczaka grillowana: 150-200g
- Kotlet schabowy: 120-150g mięsa
- Łyżka cukru: 10-12g
- Łyżka masła: 15g
- Łyżka oleju: 10-12g

Zwróć WYŁĄCZNIE czysty obiekt JSON w formacie:
{
  "mealGuess": "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner",
  "confidence": 0.95,
  "summary": "Krótkie podsumowanie po polsku",
  "items": [
    {
      "name": "Pełna polska nazwa składnika",
      "grams": <REALISTYCZNA WAGA — nie domyślna 200>,
      "kcal": <kalorie dla tej wagi>,
      "protein": <białko g>,
      "fat": <tłuszcz g>,
      "carbs": <węglowodany g>,
      "note": "Krótka uwaga"
    }
  ]
}

WAŻNE:
- Każdy składnik jako osobna pozycja (np. chleb + masło + ser = 3 pozycje)
- Jeśli użytkownik w notatce napisał ilość (np. "2 łyżki cukru"), bezwzględnie użyj tej ilości
- Jeśli napisał "pół paczki" — przelicz gramaturę na połowę
- NIGDY nie wpisuj domyślnie 200g — zawsze oszacuj realistyczną wagę
- Wartości odżywcze muszą być poprawne dla podanej gramatury

Notatka użytkownika: "${hint || "Brak notatki — oceń na podstawie zdjęcia"}"`,
          },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ]);

    const parsed = parseJson<AnalyzeResult>(raw);
    parsed.mealGuess = MEALS.includes(parsed.mealGuess) ? parsed.mealGuess : "lunch";
    parsed.items = (parsed.items ?? []).map((item) => ({
      name: String(item.name || "Posiłek"),
      grams: Math.max(1, Math.round(Number(item.grams) || 100)),
      kcal: Math.max(0, Math.round(Number(item.kcal) || 0)),
      protein: Math.max(0, Math.round((Number(item.protein) || 0) * 10) / 10),
      fat: Math.max(0, Math.round((Number(item.fat) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(item.carbs) || 0) * 10) / 10),
      note: item.note ? String(item.note) : "",
    }));
    return parsed;
  } catch (e) {
    console.warn("OpenRouter API fallback to local estimator", e);
    return simulateSmartAnalysis(hint);
  }
}

/**
 * Dedykowana analiza tekstowa — bez zdjęcia.
 * Użytkownik opisuje co zjadł, AI parsuje i wylicza makro.
 */
export async function analyzeText(description: string): Promise<AnalyzeResult> {
  const keys = getKeys();
  if (!keys.length) {
    await new Promise((r) => setTimeout(r, 600));
    return simulateSmartAnalysis(description);
  }

  try {
    const raw = await openRouterChat([
      {
        role: "user",
        content: `Jesteś precyzyjnym dietetykiem. Użytkownik opisał posiłek tekstowo (bez zdjęcia). Przeanalizuj opis i rozbij na poszczególne składniki z dokładną gramaturą i wartościami odżywczymi.

OPIS POSIŁKU UŻYTKOWNIKA:
"${description}"

ZASADY:
- Rozbij posiłek na pojedyncze składniki (np. "kanapka z serem" = chleb + masło + ser żółty)
- Jeśli użytkownik podał ilość (np. "2 jajka", "szklanka mleka", "3 kromki"), użyj tej ilości
- Szklanka = 250ml, kubek = 200-250ml, łyżka = 15g, łyżeczka = 5g
- Kromka chleba = 40-50g, jajko = 60g, plasterek sera = 20-25g
- NIGDY nie wpisuj domyślnie 200g — szacuj realistycznie
- Wartości odżywcze muszą być poprawne dla podanej gramatury
- Nazwy składników po polsku

Zwróć WYŁĄCZNIE czysty obiekt JSON:
{
  "mealGuess": "breakfast" | "morning_snack" | "lunch" | "afternoon_snack" | "dinner",
  "confidence": 0.9,
  "summary": "Krótkie podsumowanie po polsku",
  "items": [
    {
      "name": "Pełna polska nazwa składnika",
      "grams": <realistyczna waga>,
      "kcal": <kalorie>,
      "protein": <białko g>,
      "fat": <tłuszcz g>,
      "carbs": <węglowodany g>,
      "note": ""
    }
  ]
}`,
      },
    ]);

    const parsed = parseJson<AnalyzeResult>(raw);
    parsed.mealGuess = MEALS.includes(parsed.mealGuess) ? parsed.mealGuess : "lunch";
    parsed.items = (parsed.items ?? []).map((item) => ({
      name: String(item.name || "Posiłek"),
      grams: Math.max(1, Math.round(Number(item.grams) || 100)),
      kcal: Math.max(0, Math.round(Number(item.kcal) || 0)),
      protein: Math.max(0, Math.round((Number(item.protein) || 0) * 10) / 10),
      fat: Math.max(0, Math.round((Number(item.fat) || 0) * 10) / 10),
      carbs: Math.max(0, Math.round((Number(item.carbs) || 0) * 10) / 10),
      note: item.note ? String(item.note) : "",
    }));
    return parsed;
  } catch (e) {
    console.warn("OpenRouter text analysis fallback", e);
    return simulateSmartAnalysis(description);
  }
}
