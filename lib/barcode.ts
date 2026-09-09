import { BaseProduct } from "./database";

export interface OpenFoodFactsProduct {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    nutriments?: {
      "energy-kcal_100g"?: number;
      proteins_100g?: number;
      fat_100g?: number;
      carbohydrates_100g?: number;
      fiber_100g?: number;
    };
    serving_size?: string;
    image_front_url?: string;
  };
  status: number; // 1 = found, 0 = not found
}

/**
 * Lookup a product by barcode using the OpenFoodFacts API.
 * Returns a BaseProduct if found, or null if not found.
 */
export async function lookupBarcode(barcode: string): Promise<BaseProduct | null> {
  const cleaned = barcode.replace(/\s+/g, "").trim();
  if (!cleaned || cleaned.length < 4) return null;

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleaned)}.json`,
      {
        headers: {
          "User-Agent": "KalorixFitatu/1.0 (calorie-tracker-app)",
        },
      }
    );

    if (!res.ok) return null;

    const data = (await res.json()) as OpenFoodFactsProduct;

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments;

    if (!n) return null;

    const brandSuffix = p.brands ? ` (${p.brands})` : "";
    const name = (p.product_name || `Produkt ${cleaned}`) + brandSuffix;

    return {
      id: `barcode_${cleaned}`,
      name,
      category: "Przekąski i Słodycze",
      kcalPer100g: Math.round(n["energy-kcal_100g"] || 0),
      proteinPer100g: Math.round((n.proteins_100g || 0) * 10) / 10,
      fatPer100g: Math.round((n.fat_100g || 0) * 10) / 10,
      carbsPer100g: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      defaultGrams: 100,
    };
  } catch (err) {
    console.warn("OpenFoodFacts lookup failed:", err);
    return null;
  }
}
