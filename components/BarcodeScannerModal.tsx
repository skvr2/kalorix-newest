"use client";

import React, { useState, useRef, useEffect } from "react";
import { ScanBarcode, X, Search, Check, AlertCircle, Loader2 } from "lucide-react";
import { lookupBarcode } from "@/lib/barcode";
import { BaseProduct } from "@/lib/database";
import { MealType } from "@/lib/types";
import { MEAL_LABELS } from "@/lib/storage";

interface BarcodeScannerModalProps {
  initialMeal: MealType;
  onProductFound: (product: BaseProduct, meal: MealType) => void;
  onClose: () => void;
  dark?: boolean;
}

export function BarcodeScannerModal({
  initialMeal,
  onProductFound,
  onClose,
  dark = false,
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [foundProduct, setFoundProduct] = useState<BaseProduct | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMeal);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Start camera scanner
  const startScanner = async () => {
    setError("");
    setScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scannerId = "barcode-reader";

      // Wait for DOM element to be available
      await new Promise((r) => setTimeout(r, 100));

      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.5,
        },
        async (decodedText: string) => {
          // Barcode found
          try {
            await html5QrCode.stop();
          } catch {
            // ignore stop errors
          }
          html5QrCodeRef.current = null;
          setScanning(false);
          await handleLookup(decodedText);
        },
        () => {
          // Scan frame - no match yet, ignore
        }
      );
    } catch (err) {
      setScanning(false);
      setError(
        err instanceof Error
          ? err.message.includes("Permission")
            ? "Brak dostępu do kamery. Sprawdź uprawnienia."
            : err.message
          : "Nie udało się uruchomić skanera"
      );
    }
  };

  // Stop scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleLookup = async (code: string) => {
    const cleaned = code.trim();
    if (!cleaned) {
      setError("Wpisz kod kreskowy");
      return;
    }
    setError("");
    setBusy(true);
    setFoundProduct(null);

    try {
      const product = await lookupBarcode(cleaned);
      if (product) {
        setFoundProduct(product);
      } else {
        setError(`Nie znaleziono produktu o kodzie: ${cleaned}. Sprawdź kod lub dodaj produkt ręcznie.`);
      }
    } catch (err) {
      setError("Błąd podczas wyszukiwania produktu");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = () => {
    if (!foundProduct) return;
    onProductFound(foundProduct, selectedMeal);
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <ScanBarcode className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-[17px] font-bold tracking-tight ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                Skaner kodów kreskowych
              </h3>
              <p className={`text-[11px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                Zeskanuj kod z opakowania lub wpisz ręcznie
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

        <div className="flex-1 py-4 space-y-4">
          {/* Camera Scanner Area */}
          {!foundProduct && (
            <>
              {scanning ? (
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700">
                  <div id="barcode-reader" ref={scannerRef} className="w-full" />
                  <button
                    type="button"
                    onClick={async () => {
                      if (html5QrCodeRef.current) {
                        try { await html5QrCodeRef.current.stop(); } catch {}
                        html5QrCodeRef.current = null;
                      }
                      setScanning(false);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startScanner}
                  className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all ${
                    dark
                      ? "border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 hover:border-orange-500"
                      : "border-gray-200 bg-gray-50 hover:bg-orange-50/40 hover:border-orange-500"
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-500/25">
                    <ScanBarcode className="h-7 w-7" />
                  </div>
                  <span className="text-[14px] font-bold">Uruchom kamerę i zeskanuj</span>
                  <span className={`text-[12px] ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                    Skieruj kamerę na kod kreskowy produktu
                  </span>
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${dark ? "bg-zinc-800" : "bg-gray-200"}`} />
                <span className={`text-[12px] font-bold ${dark ? "text-zinc-500" : "text-gray-400"}`}>lub wpisz ręcznie</span>
                <div className={`flex-1 h-px ${dark ? "bg-zinc-800" : "bg-gray-200"}`} />
              </div>

              {/* Manual Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Wpisz kod kreskowy (EAN)..."
                  className={`flex-1 rounded-2xl border p-3.5 text-[14px] font-semibold outline-none shadow-sm transition-all ${
                    dark
                      ? "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      : "bg-gray-50 border-gray-200 text-gray-950 placeholder:text-gray-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLookup(manualCode);
                  }}
                />
                <button
                  type="button"
                  disabled={busy || !manualCode.trim()}
                  onClick={() => handleLookup(manualCode)}
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className={`flex items-center gap-2 rounded-xl p-3 text-[13px] border ${
              dark ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-rose-50 text-rose-600 border-rose-200"
            }`}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Found Product */}
          {foundProduct && (
            <div className={`rounded-2xl border p-4 ${dark ? "bg-zinc-800/80 border-zinc-700" : "bg-orange-50/50 border-orange-100"}`}>
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-[13px] font-bold text-orange-600">Znaleziony produkt:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFoundProduct(null);
                    setManualCode("");
                    setError("");
                  }}
                  className={`text-[12px] font-bold ${dark ? "text-zinc-400" : "text-gray-500"} hover:text-orange-500`}
                >
                  Skanuj inny
                </button>
              </div>

              <div className="mt-3">
                <h4 className={`text-[16px] font-bold ${dark ? "text-zinc-100" : "text-gray-900"}`}>
                  {foundProduct.name}
                </h4>

                {/* Macro per 100g */}
                <div className={`mt-3 rounded-xl p-3 ${dark ? "bg-zinc-900" : "bg-white"} border ${dark ? "border-zinc-800" : "border-gray-100"}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                    Wartości na 100g:
                  </span>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-[16px] font-extrabold text-emerald-600">{foundProduct.kcalPer100g}</div>
                      <div className={`text-[10px] font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>kcal</div>
                    </div>
                    <div>
                      <div className="text-[16px] font-extrabold text-blue-500">{foundProduct.proteinPer100g}g</div>
                      <div className={`text-[10px] font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>Białko</div>
                    </div>
                    <div>
                      <div className="text-[16px] font-extrabold text-amber-500">{foundProduct.fatPer100g}g</div>
                      <div className={`text-[10px] font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>Tłuszcz</div>
                    </div>
                    <div>
                      <div className="text-[16px] font-extrabold text-purple-500">{foundProduct.carbsPer100g}g</div>
                      <div className={`text-[10px] font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>Węgl.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal Selector */}
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
                          ? "bg-orange-500 text-white"
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

              {/* Confirm */}
              <button
                type="button"
                onClick={handleConfirm}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-98"
              >
                <Check className="h-5 w-5" />
                <span>Dodaj i wpisz gramaturę</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
