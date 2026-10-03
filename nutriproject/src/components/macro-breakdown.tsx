import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, Minus, X, Trash2 } from "lucide-react";

export interface LoggedFood {
  id: string;
  name: string;
  mealTime: "Sarapan" | "Makan siang" | "Makan malam" | "Camilan";
  portion: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Macro {
  current: number;
  target: number;
}

interface MacroBreakdownProps {
  protein: Macro;
  carbs: Macro;
  fat: Macro;
  loggedFoods?: LoggedFood[];
  onAddFoodItem?: (food: Omit<LoggedFood, "id">) => void;
  onDeleteFoodItem?: (id: string) => void;
  onAddFood?: () => void;
  onAddProtein?: () => void;
  onAddCarbs?: () => void;
  onAddFat?: () => void;
}

interface FoodPreset {
  name: string;
  portionName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const INDONESIAN_FOOD_PRESETS: FoodPreset[] = [
  { name: "Nasi Putih", portionName: "1 porsi (100g)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Nasi Merah", portionName: "1 porsi (100g)", calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Telur Rebus", portionName: "1 butir (55g)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { name: "Telur Dadar", portionName: "1 butir (60g)", calories: 93, protein: 6.5, carbs: 0.8, fat: 7.3 },
  { name: "Dada Ayam Panggang", portionName: "1 potong (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Ayam Goreng", portionName: "1 potong (100g)", calories: 246, protein: 25, carbs: 8, fat: 12 },
  { name: "Tempe Goreng", portionName: "2 potong (50g)", calories: 118, protein: 7, carbs: 8, fat: 6 },
  { name: "Tempe Bacem", portionName: "2 potong (50g)", calories: 130, protein: 8, carbs: 12, fat: 5 },
  { name: "Tahu Goreng", portionName: "2 potong (80g)", calories: 115, protein: 8, carbs: 3, fat: 7 },
  { name: "Sayur Bayam Bening", portionName: "1 mangkuk (100g)", calories: 36, protein: 2.2, carbs: 5.5, fat: 0.5 },
  { name: "Pisang Cavendish", portionName: "1 buah sedang", calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: "Oatmeal", portionName: "1 mangkuk (40g)", calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: "Roti Gandum", portionName: "1 lembar", calories: 80, protein: 3.5, carbs: 14, fat: 1 },
  { name: "Ikan Kembung Bakar", portionName: "1 ekor (100g)", calories: 167, protein: 21, carbs: 0, fat: 8.5 },
  { name: "Susu Rendah Lemak", portionName: "1 gelas (200ml)", calories: 102, protein: 6.8, carbs: 9.8, fat: 2 },
];

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const MACROS = [
  {
    key: "protein" as const,
    label: "Protein",
    colorLight: "#F97316",
    colorDark: "#FB923C",
    hint: "Bangun & perbaiki otot",
  },
  {
    key: "carbs" as const,
    label: "Karbohidrat",
    colorLight: "#6366F1",
    colorDark: "#818CF8",
    hint: "Sumber energi utama",
  },
  {
    key: "fat" as const,
    label: "Lemak",
    colorLight: "#D97706",
    colorDark: "#FCD34D",
    hint: "Hormon & penyerapan",
  },
];

export function MacroBreakdown({
  protein,
  carbs,
  fat,
  loggedFoods = [],
  onAddFoodItem,
  onDeleteFoodItem,
}: MacroBreakdownProps) {
  const vals = { protein, carbs, fat };
  const dark = useDarkMode();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<FoodPreset | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mealTime, setMealTime] = useState<"Sarapan" | "Makan siang" | "Makan malam" | "Camilan">("Sarapan");
  const [portion, setPortion] = useState(1);
  const [caloriesInput, setCaloriesInput] = useState("");
  const [proteinInput, setProteinInput] = useState("");
  const [carbsInput, setCarbsInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  // Handle Esc key and lock background scroll while dialog is open
  useEffect(() => {
    if (!isDialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isDialogOpen]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const hasData = protein.current > 0 || carbs.current > 0 || fat.current > 0;
  const isOnTrack =
    hasData &&
    protein.current <= protein.target * 1.15 &&
    carbs.current <= carbs.target * 1.15 &&
    fat.current <= fat.target * 1.15;

  // Filtered preset suggestions
  const filteredPresets = foodName.trim()
    ? INDONESIAN_FOOD_PRESETS.filter(p =>
      p.name.toLowerCase().includes(foodName.toLowerCase())
    )
    : [];

  const handleOpenDialog = () => {
    // Default meal time based on current hour
    const hour = new Date().getHours();
    if (hour < 11) setMealTime("Sarapan");
    else if (hour < 16) setMealTime("Makan siang");
    else if (hour < 20) setMealTime("Makan malam");
    else setMealTime("Camilan");

    setFoodName("");
    setSelectedPreset(null);
    setPortion(1);
    setCaloriesInput("");
    setProteinInput("");
    setCarbsInput("");
    setFatInput("");
    setShowSuggestions(false);
    setIsDialogOpen(true);
  };

  const handleSelectPreset = (preset: FoodPreset) => {
    setSelectedPreset(preset);
    setFoodName(preset.name);
    setCaloriesInput(String(Math.round(preset.calories * portion)));
    setProteinInput(String(Math.round(preset.protein * portion * 10) / 10));
    setCarbsInput(String(Math.round(preset.carbs * portion * 10) / 10));
    setFatInput(String(Math.round(preset.fat * portion * 10) / 10));
    setShowSuggestions(false);
  };

  const handlePortionChange = (delta: number) => {
    const nextPortion = Math.max(0.5, Math.round((portion + delta) * 10) / 10);
    setPortion(nextPortion);

    if (selectedPreset) {
      setCaloriesInput(String(Math.round(selectedPreset.calories * nextPortion)));
      setProteinInput(String(Math.round(selectedPreset.protein * nextPortion * 10) / 10));
      setCarbsInput(String(Math.round(selectedPreset.carbs * nextPortion * 10) / 10));
      setFatInput(String(Math.round(selectedPreset.fat * nextPortion * 10) / 10));
    } else {
      // Scale existing inputs proportionally if available
      const currentCal = parseFloat(caloriesInput);
      if (!isNaN(currentCal) && portion > 0) {
        const factor = nextPortion / portion;
        setCaloriesInput(String(Math.round(currentCal * factor)));
        const currentP = parseFloat(proteinInput);
        if (!isNaN(currentP)) setProteinInput(String(Math.round(currentP * factor * 10) / 10));
        const currentC = parseFloat(carbsInput);
        if (!isNaN(currentC)) setCarbsInput(String(Math.round(currentC * factor * 10) / 10));
        const currentF = parseFloat(fatInput);
        if (!isNaN(currentF)) setFatInput(String(Math.round(currentF * factor * 10) / 10));
      }
    }
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseFloat(caloriesInput);
    if (!foodName.trim() || isNaN(cal) || cal <= 0) return;

    const savedName = foodName.trim();
    onAddFoodItem?.({
      name: savedName,
      mealTime,
      portion,
      calories: Math.round(cal),
      protein: Math.round((parseFloat(proteinInput) || 0) * 10) / 10,
      carbs: Math.round((parseFloat(carbsInput) || 0) * 10) / 10,
      fat: Math.round((parseFloat(fatInput) || 0) * 10) / 10,
    });

    setIsDialogOpen(false);

    setToastMessage(`${savedName} dicatat`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const isFormValid =
    foodName.trim().length > 0 &&
    !isNaN(parseFloat(caloriesInput)) &&
    parseFloat(caloriesInput) > 0;

  // Live preview values
  const previewCal = Math.round(parseFloat(caloriesInput) || 0);
  const previewP = Math.round(parseFloat(proteinInput) || 0);
  const previewK = Math.round(parseFloat(carbsInput) || 0);
  const previewL = Math.round(parseFloat(fatInput) || 0);

  return (
    <div
      className="nt-card animate-fade-up-2"
      style={{
        borderRadius: "8px",
        border: "1px solid var(--border-soft)",
        padding: "24px",
        background: "var(--bg-surface)",
        textAlign: "left",
      }}
    >
      {/* Header bagian Makronutrien */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Makronutrien
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!hasData ? (
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Belum ada data
            </span>
          ) : isOnTrack ? (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--success, #10B981)",
                background: "var(--success-bg, rgba(16,185,129,0.1))",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              On track ✓
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleOpenDialog}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border-soft)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-surface)")}
          >
            <Plus size={14} />
            Tambah makanan
          </button>
        </div>
      </div>

      {/* 3 Kartu makro: Protein, Karbohidrat, Lemak */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}
        className="macro-3-grid"
      >
        {MACROS.map(m => {
          const macro = vals[m.key];
          const pct = macro.target > 0 ? Math.min((macro.current / macro.target) * 100, 100) : 0;
          const color = dark ? m.colorDark : m.colorLight;

          return (
            <div
              key={m.key}
              style={{
                borderRadius: "8px",
                border: "1px solid var(--border-soft)",
                background: "var(--bg-surface)",
                padding: "16px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
              role="region"
              aria-label={`${m.label}: ${macro.current}g dari ${macro.target}g`}
            >
              {/* Nama */}
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {m.label}
              </div>

              {/* 0 / 167 g */}
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                <span style={{ color }}>{macro.current}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--text-secondary)" }}>
                  {" "}
                  / {macro.target} g
                </span>
              </div>

              {/* Bar tipis */}
              <div
                style={{
                  height: "4px",
                  background: dark ? "rgba(255,255,255,0.08)" : "var(--border-subtle)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: color,
                    borderRadius: "2px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>

              {/* Satu baris keterangan kecil */}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginTop: "4px",
                }}
              >
                {m.hint}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daftar makanan yang dicatat hari ini */}
      {loggedFoods.length > 0 && (
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-soft)" }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
            Makanan tercatat hari ini ({loggedFoods.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {loggedFoods.map(food => (
              <div
                key={food.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.8125rem",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{food.name}</span>
                  <span style={{ color: "var(--text-secondary)", marginLeft: "8px" }}>
                    • {food.portion} porsi ({food.mealTime})
                  </span>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {food.calories} kcal • P {food.protein}g • K {food.carbs}g • L {food.fat}g
                  </div>
                </div>
                {onDeleteFoodItem && (
                  <button
                    type="button"
                    onClick={() => onDeleteFoodItem(food.id)}
                    aria-label={`Hapus catatan ${food.name}`}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-tertiary)",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "6px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--danger, #EF4444)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
                    title="Hapus makanan ini"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIALOG TAMBAH MAKANAN (Modal di desktop, bottom sheet di mobile via createPortal) */}
      {isDialogOpen && typeof document !== "undefined" && createPortal(
        <div
          className="add-food-dialog-overlay"
          onClick={() => setIsDialogOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-food-dialog-title"
        >
          <div
            className="add-food-dialog-content"
            onClick={e => e.stopPropagation()}
          >
            <form
              onSubmit={handleSaveFood}
              className="add-food-dialog-form"
            >
              {/* 1. Header Dialog Tetap */}
              <div className="add-food-dialog-header">
                <h3
                  id="add-food-dialog-title"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Tambah makanan
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Tutup"
                  style={{
                    minWidth: "44px",
                    minHeight: "44px",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "var(--bg-subtle)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* 2. Isi Dialog yang Bisa Di-scroll */}
              <div className="add-food-dialog-body">
                {/* Field a: Nama makanan dengan saran otomatis */}
                <div ref={searchBoxRef} style={{ position: "relative" }}>
                  <label
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Nama makanan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ketik mis. Nasi putih, Telur rebus..."
                    value={foodName}
                    onChange={e => {
                      setFoodName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-soft)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  {/* Dropdown saran lokal */}
                  {showSuggestions && filteredPresets.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "calc(100% + 4px)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "8px",
                        boxShadow: "var(--shadow-lg)",
                        maxHeight: "180px",
                        overflowY: "auto",
                        zIndex: 1100,
                        padding: "4px",
                      }}
                    >
                      <div style={{ padding: "4px 8px", fontSize: "0.6875rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
                        Pilih dari saran makanan (Perkiraan):
                      </div>
                      {filteredPresets.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "8px",
                            borderRadius: "6px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontFamily: "inherit",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div>
                            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                              {preset.name}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>
                              {preset.portionName}
                            </div>
                          </div>
                          <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                            {preset.calories} kcal
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Field b: Waktu makan */}
                <div>
                  <label
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Waktu makan
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    {(["Sarapan", "Makan siang", "Makan malam", "Camilan"] as const).map(time => {
                      const isSelected = mealTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setMealTime(time)}
                          style={{
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: isSelected ? "1px solid #14B8A6" : "1px solid var(--border-soft)",
                            background: isSelected ? "#14B8A6" : "var(--bg-surface)",
                            color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.15s ease",
                            textAlign: "center",
                          }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field c: Porsi stepper (- / + dengan langkah 0.5, default 1) */}
                <div>
                  <label
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Porsi
                  </label>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={() => handlePortionChange(-0.5)}
                      disabled={portion <= 0.5}
                      aria-label="Kurangi porsi"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-soft)",
                        background: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: portion <= 0.5 ? "not-allowed" : "pointer",
                        opacity: portion <= 0.5 ? 0.5 : 1,
                      }}
                    >
                      <Minus size={14} />
                    </button>

                    <span
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        minWidth: "70px",
                        textAlign: "center",
                      }}
                    >
                      {portion} porsi
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePortionChange(0.5)}
                      aria-label="Tambah porsi"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-soft)",
                        background: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Field d: Kalori, protein, karbo, lemak (gram) */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      Nilai gizi (bisa diedit)
                    </label>
                    {selectedPreset && (
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                        Perkiraan otomatis
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    <div>
                      <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                        Kalori (kcal)
                      </label>
                      <input
                        type="number"
                        required
                        step="1"
                        placeholder="0"
                        value={caloriesInput}
                        onChange={e => setCaloriesInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-soft)",
                          background: "var(--bg-surface)",
                          color: "var(--text-primary)",
                          fontSize: "0.8125rem",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={proteinInput}
                        onChange={e => setProteinInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-soft)",
                          background: "var(--bg-surface)",
                          color: "var(--text-primary)",
                          fontSize: "0.8125rem",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                        Karbo (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={carbsInput}
                        onChange={e => setCarbsInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-soft)",
                          background: "var(--bg-surface)",
                          color: "var(--text-primary)",
                          fontSize: "0.8125rem",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", display: "block", marginBottom: "2px" }}>
                        Lemak (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={fatInput}
                        onChange={e => setFatInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-soft)",
                          background: "var(--bg-surface)",
                          color: "var(--text-primary)",
                          fontSize: "0.8125rem",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Footer Dialog Tetap (TIDAK ikut ter-scroll) */}
              <div className="add-food-dialog-footer">
                {/* Baris pratinjau kecil: "Total: 320 kcal - P 12 g - K 45 g - L 8 g" */}
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  Total: {previewCal} kcal - P {previewP} g - K {previewK} g - L {previewL} g
                </div>

                {/* Teks bantu saat disabled */}
                {!isFormValid && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      textAlign: "right",
                      marginBottom: "8px",
                    }}
                  >
                    Isi nama dan kalori dulu
                  </div>
                )}

                {/* Dua tombol: "Batal" (outline) dan "Simpan makanan" (solid teal) */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-soft)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      minHeight: "40px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={!isFormValid}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "8px",
                      border: "none",
                      background: isFormValid ? "#14B8A6" : "var(--bg-subtle)",
                      color: isFormValid ? "#FFFFFF" : "var(--text-tertiary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: isFormValid ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                      minHeight: "40px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Simpan makanan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notifikasi setelah Simpan (4 detik via createPortal) */}
      {toastMessage && typeof document !== "undefined" && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="add-food-toast"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 11000,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-soft)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-lg)",
            borderRadius: "8px",
            padding: "10px 16px",
            fontSize: "0.875rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "calc(100vw - 32px)",
            boxSizing: "border-box",
            animation: "toastSlideUp 0.25s ease-out",
          }}
        >
          <span
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "rgba(20, 184, 166, 0.15)",
              color: "#14B8A6",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            ✓
          </span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Tutup notifikasi"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              padding: "4px",
              marginLeft: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>,
        document.body
      )}

      {/* Responsive layout styles untuk modal desktop & bottom sheet mobile */}
      <style>{`
        .add-food-dialog-overlay {
          position: fixed !important;
          inset: 0 !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          height: 100dvh !important;
          z-index: 10000 !important;
          background: rgba(15, 23, 42, 0.65) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 16px !important;
          box-sizing: border-box !important;
        }
        .add-food-dialog-content {
          background: var(--bg-surface) !important;
          border: 1px solid var(--border-soft) !important;
          border-radius: 8px !important;
          width: 100% !important;
          max-width: 480px !important;
          max-height: 90vh !important;
          max-height: 90dvh !important;
          box-shadow: var(--shadow-xl) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          position: relative !important;
          text-align: left !important;
        }
        .add-food-dialog-form {
          display: flex !important;
          flex-direction: column !important;
          max-height: 90vh !important;
          max-height: 90dvh !important;
          height: 100% !important;
          min-height: 0 !important;
          margin: 0 !important;
          overflow: hidden !important;
          width: 100% !important;
        }
        .add-food-dialog-header {
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 16px 20px !important;
          border-bottom: 1px solid var(--border-soft) !important;
          background: var(--bg-surface) !important;
        }
        .add-food-dialog-body {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          max-height: calc(90vh - 160px) !important;
          max-height: calc(90dvh - 160px) !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
          box-sizing: border-box !important;
        }
        .add-food-dialog-footer {
          flex-shrink: 0 !important;
          padding: 16px 20px !important;
          border-top: 1px solid var(--border-soft) !important;
          background: var(--bg-surface) !important;
          box-sizing: border-box !important;
        }
        @keyframes toastSlideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 12px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @media (max-width: 640px) {
          .add-food-dialog-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .add-food-dialog-content {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 16px !important;
            border-top-right-radius: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: 90vh !important;
            max-height: 90dvh !important;
            margin: 0 !important;
          }
          .add-food-dialog-form {
            max-height: 90vh !important;
            max-height: 90dvh !important;
          }
          .add-food-dialog-header {
            padding: 14px 16px !important;
          }
          .add-food-dialog-body {
            padding: 16px !important;
            gap: 14px !important;
            max-height: calc(90vh - 150px) !important;
            max-height: calc(90dvh - 150px) !important;
          }
          .add-food-dialog-footer {
            padding: 14px 16px !important;
            padding-bottom: max(16px, env(safe-area-inset-bottom, 16px)) !important;
          }
          .add-food-toast {
            bottom: 84px !important;
          }
        }
      `}</style>
    </div>
  );
}
