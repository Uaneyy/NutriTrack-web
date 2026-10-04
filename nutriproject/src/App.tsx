import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./components/header";
import type { NavTab } from "./components/header";
import { CaloriesSummary } from "./components/calories-summary";
import { MacroBreakdown } from "./components/macro-breakdown";
import type { LoggedFood } from "./components/macro-breakdown";
import { UserInputForm } from "./components/user-input-form";
import type { UserData } from "./components/user-input-form";
import { MealPlan } from "./components/meal-plan";
import { HealthInsights } from "./components/health-insights";
import { WeightChart } from "./components/weight-chart";
import { X, RotateCcw, BarChart2, UtensilsCrossed, Lightbulb, Home, MoreHorizontal } from "lucide-react";
import { NutriTrackAssistant } from "./components/nutritrack-assistant";

/* ── Sample data ──────────────────────────────────── */
const WEIGHT_DATA = [
  { date: "Day 1", weight: 75.0 },
  { date: "Day 2", weight: 74.5 },
  { date: "Day 3", weight: 74.0 },
  { date: "Day 4", weight: 73.2 },
  { date: "Day 5", weight: 72.8 },
  { date: "Day 6", weight: 72.5 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 17) return "Selamat siang";
  return "Selamat malam";
}

/* ── Mifflin-St Jeor & Macro calculations ─────────── */
function calculateCalorieGoal(userData: UserData | null): number {
  if (!userData) return 2200; // default BMR/TDEE demo
  const weight = Number(userData.weight) || 70;
  const height = Number(userData.height) || 175;
  const age = Number(userData.age) || 25;
  const isMale = userData.gender === "male";

  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (isMale) {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity Factor
  let factor = 1.2;
  if (userData.activity === "light") factor = 1.375;
  else if (userData.activity === "moderate") factor = 1.55;
  else if (userData.activity === "very") factor = 1.725;
  else if (userData.activity === "athlete") factor = 1.9;

  let target = Math.round(bmr * factor);

  // Goal adjustment
  if (userData.goal === "loss") target -= 500;
  else if (userData.goal === "gain") target += 300;

  return Math.max(target, 1200); // safety floor of 1200 kcal
}

function calculateMacroTargets(targetCalories: number) {
  const protein = Math.round((targetCalories * 0.30) / 4);
  const carbs = Math.round((targetCalories * 0.45) / 4);
  const fat = Math.round((targetCalories * 0.25) / 9);
  return { protein, carbs, fat };
}

const getDynamicMeals = (targetCalories: number, targetMacros: { protein: number, carbs: number, fat: number }, day: number = 1) => {
  const rotationIndex = ((day - 1) % 3) + 1; // 1, 2, or 3

  if (rotationIndex === 2) {
    return [
      {
        time: "7:00 – 8:00",
        name: "Breakfast",
        foods: ["Telur Orak-arik", "Roti Gandum", "Alpukat", "Tomat"],
        calories: Math.round(targetCalories * 0.27),
        protein: Math.round(targetMacros.protein * 0.27),
        carbs: Math.round(targetMacros.carbs * 0.27),
        fat: Math.round(targetMacros.fat * 0.27),
      },
      {
        time: "12:00 – 13:00",
        name: "Lunch",
        foods: ["Tumis Daging Sapi", "Nasi Merah", "Buncis", "Olive Oil"],
        calories: Math.round(targetCalories * 0.38),
        protein: Math.round(targetMacros.protein * 0.38),
        carbs: Math.round(targetMacros.carbs * 0.38),
        fat: Math.round(targetMacros.fat * 0.38),
      },
      {
        time: "19:00 – 20:00",
        name: "Dinner",
        foods: ["Tuna Panggang", "Kentang Rebus", "Salad Sayur", "Lemon Juice"],
        calories: Math.round(targetCalories * 0.35),
        protein: Math.round(targetMacros.protein * 0.35),
        carbs: Math.round(targetMacros.carbs * 0.35),
        fat: Math.round(targetMacros.fat * 0.35),
      },
    ];
  } else if (rotationIndex === 3) {
    return [
      {
        time: "7:00 – 8:00",
        name: "Breakfast",
        foods: ["Smoothie Protein", "Susu Almond", "Berries", "Chia Seeds"],
        calories: Math.round(targetCalories * 0.27),
        protein: Math.round(targetMacros.protein * 0.27),
        carbs: Math.round(targetMacros.carbs * 0.27),
        fat: Math.round(targetMacros.fat * 0.27),
      },
      {
        time: "12:00 – 13:00",
        name: "Lunch",
        foods: ["Pepes Tahu & Tempe", "Nasi Putih Porsi Kecil", "Sayur Asem"],
        calories: Math.round(targetCalories * 0.38),
        protein: Math.round(targetMacros.protein * 0.38),
        carbs: Math.round(targetMacros.carbs * 0.38),
        fat: Math.round(targetMacros.fat * 0.38),
      },
      {
        time: "19:00 – 20:00",
        name: "Dinner",
        foods: ["Sate Dada Ayam", "Lontong", "Acar Mentimun"],
        calories: Math.round(targetCalories * 0.35),
        protein: Math.round(targetMacros.protein * 0.35),
        carbs: Math.round(targetMacros.carbs * 0.35),
        fat: Math.round(targetMacros.fat * 0.35),
      },
    ];
  }

  // Default: Day 1
  return [
    {
      time: "7:00 – 8:00",
      name: "Breakfast",
      foods: ["Oatmeal", "Pisang", "Almond", "Greek Yogurt"],
      calories: Math.round(targetCalories * 0.27),
      protein: Math.round(targetMacros.protein * 0.27),
      carbs: Math.round(targetMacros.carbs * 0.27),
      fat: Math.round(targetMacros.fat * 0.27),
    },
    {
      time: "12:00 – 13:00",
      name: "Lunch",
      foods: ["Dada Ayam Panggang", "Nasi Merah", "Brokoli", "Alpukat"],
      calories: Math.round(targetCalories * 0.38),
      protein: Math.round(targetMacros.protein * 0.38),
      carbs: Math.round(targetMacros.carbs * 0.38),
      fat: Math.round(targetMacros.fat * 0.38),
    },
    {
      time: "19:00 – 20:00",
      name: "Dinner",
      foods: ["Salmon", "Ubi Jalar", "Salad Bayam", "Olive Oil"],
      calories: Math.round(targetCalories * 0.35),
      protein: Math.round(targetMacros.protein * 0.35),
      carbs: Math.round(targetMacros.carbs * 0.35),
      fat: Math.round(targetMacros.fat * 0.35),
    },
  ];
};

interface ConfettiParticle {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}

export function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  const colors = ["#14B8A6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6"];
  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: Math.random() * 6 + 4,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
    });
  }

  const startTime = Date.now();

  function draw() {
    ctx!.clearRect(0, 0, width, height);

    let active = false;
    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

      if (p.y < height) {
        active = true;
      }

      ctx!.beginPath();
      ctx!.lineWidth = p.r;
      ctx!.strokeStyle = p.color;
      ctx!.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx!.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx!.stroke();
    });

    if (active && Date.now() - startTime < 3500) {
      requestAnimationFrame(draw);
    } else {
      window.removeEventListener("resize", handleResize);
      canvas.remove();
    }
  }

  draw();
}

export function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore context blocked errors
  }
}

/* ── Toast System ──────────────────────────────────── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "warning" | "error";
  exiting?: boolean;
}

const TOAST_ICONS: Record<Toast["type"], string> = {
  success: "✅",
  info: "💡",
  warning: "⚠️",
  error: "❌",
};

const TOAST_COLORS: Record<Toast["type"], string> = {
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
  error: "var(--danger)",
};

let toastIdCounter = 0;

/* ── TAB PAGES ─────────────────────────────────────── */
function TabDashboard({
  streak, hydration, onUpdateHydration,
  currentCalories, targetCalories, remainingCalories,
  meals, eatenMeals, onToggleMeal,
  viewDay, onViewDayChange, onCompleteDay,
  progressUpdatedToday,
  targetMacros,
  onOpenAssistant,
}: {
  streak: number;
  hydration: number;
  onUpdateHydration: (h: number) => void;
  currentCalories: number;
  targetCalories: number;
  remainingCalories: number;
  meals: any[];
  eatenMeals: Set<number>;
  onToggleMeal: (idx: number) => void;
  viewDay?: number;
  onViewDayChange?: (d: number) => void;
  onCompleteDay?: () => void;
  progressUpdatedToday?: boolean;
  targetMacros?: { protein: number; carbs: number; fat: number };
  onOpenAssistant?: () => void;
}) {
  const nextMealIdx = meals.findIndex((_, idx) => !eatenMeals.has(idx));
  const nextMeal = nextMealIdx >= 0 ? meals[nextMealIdx] : null;
  const getMealTitle = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes("breakfast") || l.includes("sarapan")) return "Sarapan";
    if (l.includes("lunch") || l.includes("siang")) return "Makan siang";
    if (l.includes("dinner") || l.includes("malam")) return "Makan malam";
    return name;
  };
  const nextMealTitle = nextMeal ? getMealTitle(nextMeal.name) : "";

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxSizing: "border-box",
      }}
    >
      <CaloriesSummary
        current={currentCalories}
        target={targetCalories}
        remaining={remainingCalories}
        hydration={hydration}
        streak={streak}
        onUpdateHydration={onUpdateHydration}
      />
      {/* ── Saran asisten ringkas di Dashboard (tanpa ikon dekoratif) ── */}
      <div
        className="nt-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          padding: "12px 18px",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
        }}
      >
        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          {nextMeal
            ? `Makan berikutnya: ${nextMealTitle}, ${nextMeal.calories.toLocaleString("id-ID")} kcal`
            : "Semua jadwal makan hari ini sudah selesai."}
        </span>
        <button
          type="button"
          onClick={onOpenAssistant}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--brand)",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            padding: "4px 0",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            fontFamily: "inherit",
          }}
        >
          Tanya asisten
        </button>
      </div>
      <MealPlan
        meals={meals}
        eatenMeals={eatenMeals}
        onToggleMeal={onToggleMeal}
        viewDay={viewDay}
        onViewDayChange={onViewDayChange}
        onCompleteDay={onCompleteDay}
        streak={streak}
        progressUpdatedToday={progressUpdatedToday}
        targetMacros={targetMacros}
      />
    </div>
  );
}

function TabNutrition({
  currentProtein, targetProtein, currentCarbs, targetCarbs, currentFat, targetFat,
  loggedFoods, onAddFoodItem, onDeleteFoodItem,
  meals, eatenMeals, onToggleMeal,
  viewDay, onViewDayChange, streak
}: {
  currentProtein: number;
  targetProtein: number;
  currentCarbs: number;
  targetCarbs: number;
  currentFat: number;
  targetFat: number;
  loggedFoods?: LoggedFood[];
  onAddFoodItem?: (food: Omit<LoggedFood, "id">) => void;
  onDeleteFoodItem?: (id: string) => void;
  meals: any[];
  eatenMeals: Set<number>;
  onToggleMeal: (idx: number) => void;
  viewDay?: number;
  onViewDayChange?: (d: number) => void;
  streak?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ marginBottom: "8px", textAlign: "left" }}>
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          margin: 0,
          color: "var(--text-primary)",
        }}>
          Nutrisi hari ini
        </h1>
      </div>
      <MacroBreakdown
        protein={{ current: currentProtein, target: targetProtein }}
        carbs={{ current: currentCarbs, target: targetCarbs }}
        fat={{ current: currentFat, target: targetFat }}
        loggedFoods={loggedFoods}
        onAddFoodItem={onAddFoodItem}
        onDeleteFoodItem={onDeleteFoodItem}
      />
      <MealPlan
        meals={meals}
        eatenMeals={eatenMeals}
        onToggleMeal={onToggleMeal}
        viewDay={viewDay}
        onViewDayChange={onViewDayChange}
        streak={streak}
        targetMacros={{ protein: targetProtein, carbs: targetCarbs, fat: targetFat }}
      />
    </div>
  );
}

function TabProgress({
  weightHistory,
  currentHeight,
  targetWeight,
  onUpdateProgress,
}: {
  currentCalories?: number;
  targetCalories?: number;
  remainingCalories?: number;
  hydration?: number;
  streak?: number;
  weightHistory: { date: string; weight: number }[];
  currentHeight?: number;
  targetWeight?: number;
  onUpdateProgress?: (newWeight: number, newHeight: number) => void;
  onUpdateHydration?: (newHydration: number) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "960px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Progress berat badan
        </h1>
      </div>
      <WeightChart
        data={weightHistory}
        currentHeight={currentHeight}
        targetWeight={targetWeight}
        onUpdateProgress={onUpdateProgress}
      />
    </div>
  );
}

function TabInsights({ onToast, hydration }: { onToast: (msg: string, type?: Toast["type"]) => void; hydration: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "720px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Insights
        </h1>
      </div>
      <HealthInsights bmi={22.3} hydration={hydration} workout="30 Menit Kardio + Core" onToast={onToast} />
    </div>
  );
}

/* ── App ───────────────────────────────────────────── */
export default function App() {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem("nutritrack_user_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [showPlan, setShowPlan] = useState<boolean>(() => {
    const saved = localStorage.getItem("nutritrack_user_data");
    return !!saved;
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("nutritrack_dark_mode");
    const isDark = saved ? JSON.parse(saved) : true; // default: dark mode aktif
    document.documentElement.classList.toggle("dark", isDark);
    return isDark;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>("Dashboard");

  // Program tracking state (initialized from localStorage or demo data)
  const [streak, setStreak] = useState<number>(() => {
    // Jika belum ada profil user (pengguna baru), streak selalu 0
    const hasUser = !!localStorage.getItem("nutritrack_user_data");
    if (!hasUser) return 0;
    const saved = localStorage.getItem("nutritrack_streak");
    return saved ? Number(saved) : 0;
  });
  const [hydration, setHydration] = useState<number>(() => {
    const saved = localStorage.getItem("nutritrack_hydration");
    return saved ? Number(saved) : 75;
  });
  const [eatenMeals, setEatenMeals] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("nutritrack_eaten_meals");
    return saved ? new Set(JSON.parse(saved)) : new Set([0]);
  });
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>(() => {
    const saved = localStorage.getItem("nutritrack_logged_foods");
    return saved ? JSON.parse(saved) : [];
  });

  const [progressUpdatedToday, setProgressUpdatedToday] = useState<boolean>(() => {
    const saved = localStorage.getItem("nutritrack_progress_updated_today");
    return saved ? JSON.parse(saved) : false;
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const optionsMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    }
    if (showOptionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptionsMenu]);

  /* Edit profile states */
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("male");
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editActivity, setEditActivity] = useState("moderate");
  const [editGoal, setEditGoal] = useState("loss");

  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>(() => {
    const saved = localStorage.getItem("nutritrack_weight_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item, index) => {
            if (typeof item === "object" && item !== null && item.date && !String(item.date).startsWith("Day")) {
              return { ...item, date: `Day ${index + 1}` };
            }
            return item;
          });
        }
      } catch (e) {
        // Fallback below
      }
    }
    return WEIGHT_DATA;
  });

  const [viewDay, setViewDay] = useState<number>(() => {
    const savedStreak = localStorage.getItem("nutritrack_streak");
    const initStreak = savedStreak ? Number(savedStreak) : 1;
    return initStreak === 0 ? 1 : initStreak;
  });

  useEffect(() => {
    if (streak > 0) {
      setViewDay(streak);
    } else {
      setViewDay(1);
    }
  }, [streak]);

  // Sync state to localStorage
  useEffect(() => {
    if (userData) {
      localStorage.setItem("nutritrack_user_data", JSON.stringify(userData));
    } else {
      localStorage.removeItem("nutritrack_user_data");
    }
  }, [userData]);

  useEffect(() => {
    localStorage.setItem("nutritrack_dark_mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("nutritrack_streak", String(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("nutritrack_hydration", String(hydration));
  }, [hydration]);

  useEffect(() => {
    localStorage.setItem("nutritrack_eaten_meals", JSON.stringify(Array.from(eatenMeals)));
  }, [eatenMeals]);

  useEffect(() => {
    localStorage.setItem("nutritrack_logged_foods", JSON.stringify(loggedFoods));
  }, [loggedFoods]);

  useEffect(() => {
    localStorage.setItem("nutritrack_weight_history", JSON.stringify(weightHistory));
  }, [weightHistory]);

  useEffect(() => {
    localStorage.setItem("nutritrack_progress_updated_today", String(progressUpdatedToday));
  }, [progressUpdatedToday]);

  /* Dynamic targets based on userData */
  const targetCalories = calculateCalorieGoal(userData);
  const targetMacros = calculateMacroTargets(targetCalories);
  const meals = getDynamicMeals(targetCalories, targetMacros, viewDay);

  // Compute eaten meals totals
  let mealsCalories = 0;
  let mealsProtein = 0;
  let mealsCarbs = 0;
  let mealsFat = 0;

  eatenMeals.forEach(idx => {
    const meal = meals[idx];
    if (meal) {
      mealsCalories += meal.calories;
      mealsProtein += meal.protein;
      mealsCarbs += meal.carbs;
      mealsFat += meal.fat;
    }
  });

  // Compute logged food totals
  let loggedCalories = 0;
  let loggedProtein = 0;
  let loggedCarbs = 0;
  let loggedFat = 0;

  loggedFoods.forEach(food => {
    loggedCalories += food.calories;
    loggedProtein += food.protein;
    loggedCarbs += food.carbs;
    loggedFat += food.fat;
  });

  // Current values: computed dynamically from eaten meals and logged food items
  const currentProtein = Math.round(mealsProtein + loggedProtein);
  const currentCarbs = Math.round(mealsCarbs + loggedCarbs);
  const currentFat = Math.round(mealsFat + loggedFat);
  const currentCalories = Math.round(mealsCalories + loggedCalories);
  const remainingCalories = Math.max(targetCalories - currentCalories, 0);
  const dailyProgress = targetCalories > 0 ? Math.min(Math.round((currentCalories / targetCalories) * 100), 100) : 0;

  /* Toast API */
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastIdCounter;
    setToasts(prev => {
      // Filter out duplicate messages and transition other active toasts to exit
      const filtered = prev.filter(t => t.message !== message && !t.exiting).map(t => ({ ...t, exiting: true }));
      return [...filtered, { id, message, type }];
    });
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, 2500);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
  };

  /* Toggle dark mode */
  const toggleDark = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const handleGenerate = (d: UserData) => {
    setUserData(d);
    setShowPlan(true);
    setActiveTab("Dashboard");

    // Set initial weight history based on user's weight input
    const initialWeight = Number(d.weight) || 70;
    setWeightHistory([{ date: "Day 1", weight: initialWeight }]);
    setProgressUpdatedToday(true); // Initial profile setup has weight/height, so count as updated

    // If they filled the form after a reset (streak was 0), start fresh on Day 1
    if (streak === 0) {
      setStreak(1);
      setHydration(0);
      setEatenMeals(new Set());
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast(`Rencana untuk ${d.name.split(" ")[0]} berhasil dibuat! 🎉`, "success");
  };

  /* Reset seluruh program ke awal */
  const handleResetProgram = () => {
    setUserData(null);
    setShowPlan(false);
    setActiveTab("Dashboard");
    setStreak(0);
    setHydration(0);
    setEatenMeals(new Set());
    setLoggedFoods([]);
    setWeightHistory(WEIGHT_DATA);
    setProgressUpdatedToday(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast("Program direset. Silakan isi ulang dari awal.", "info");
  };

  const handleOpenEditProfile = () => {
    if (userData) {
      setEditName(userData.name);
      setEditAge(userData.age);
      setEditGender(userData.gender);
      setEditWeight(userData.weight);
      setEditHeight(userData.height);
      setEditActivity(userData.activity);
      setEditGoal(userData.goal);
      setShowEditProfileModal(true);
    }
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    const updated: UserData = {
      ...userData,
      name: editName,
      age: editAge,
      gender: editGender,
      weight: editWeight,
      height: editHeight,
      activity: editActivity,
      goal: editGoal,
      bodyType: userData.bodyType
    };
    setUserData(updated);

    // Update weight history for the current day as well if weight is updated
    const newW = parseFloat(editWeight);
    const newH = parseFloat(editHeight);
    if (!isNaN(newW) && !isNaN(newH)) {
      const dayStr = `Day ${streak === 0 ? 1 : streak}`;
      setWeightHistory(prev => {
        const existsIdx = prev.findIndex(item => item.date === dayStr);
        if (existsIdx !== -1) {
          const next = [...prev];
          next[existsIdx] = { ...next[existsIdx], weight: newW };
          return next;
        }
        return [...prev, { date: dayStr, weight: newW }];
      });
      setProgressUpdatedToday(true);
    }

    setShowEditProfileModal(false);
    addToast("Profil & Target Anda berhasil diperbarui! 🎯", "success");
  };

  /* Update progres berat badan dan tinggi badan harian */
  const handleUpdateProgress = (newWeight: number, newHeight: number) => {
    if (!userData) return;

    const updatedUserData = {
      ...userData,
      weight: String(newWeight),
      height: String(newHeight),
    };
    setUserData(updatedUserData);

    const dayStr = `Day ${streak === 0 ? 1 : streak}`;
    setWeightHistory(prev => {
      const existsIdx = prev.findIndex(item => item.date === dayStr);
      if (existsIdx !== -1) {
        const next = [...prev];
        next[existsIdx] = { ...next[existsIdx], weight: newWeight };
        return next;
      }
      return [...prev, { date: dayStr, weight: newWeight }];
    });

    setProgressUpdatedToday(true);
    addToast("Progres berat badan & tinggi badan berhasil diperbarui! 🎯", "success");
  };

  const handleCompleteDay = () => {
    if (!progressUpdatedToday) {
      addToast("⚠️ Silakan perbarui progres berat badan & tinggi badan hari ini terlebih dahulu di bagian Grafik & Progress!", "warning");
      return;
    }
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setHydration(0);
    setEatenMeals(new Set());
    setLoggedFoods([]);
    setProgressUpdatedToday(false);

    // Auto-update weight chart with a new Day X point carrying over the last recorded weight
    setWeightHistory(prev => {
      const lastWeight = prev.length > 0 ? prev[prev.length - 1].weight : (Number(userData?.weight) || 70);
      const nextDayStr = `Day ${nextStreak}`;
      const existsIdx = prev.findIndex(item => item.date === nextDayStr);
      if (existsIdx !== -1) {
        return prev;
      }
      return [...prev, { date: nextDayStr, weight: lastWeight }];
    });

    triggerConfetti();
    playSuccessSound();

    window.scrollTo({ top: 0, behavior: "smooth" });
    addToast(`Selamat! Hari ke-${streak} selesai. Memulai Hari ke-${nextStreak}! 🚀`, "success");
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleMeal = (idx: number) => {
    setEatenMeals(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
        addToast("Makanan ditandai belum dimakan.", "info");
      } else {
        next.add(idx);
        addToast("Makanan ditandai sudah dimakan! ✓", "success");
      }
      return next;
    });
  };

  const handleAddFoodItem = (food: Omit<LoggedFood, "id">) => {
    const newItem: LoggedFood = {
      ...food,
      id: String(Date.now() + Math.random()),
    };
    setLoggedFoods(prev => [newItem, ...prev]);
  };

  const handleDeleteFoodItem = (id: string) => {
    setLoggedFoods(prev => prev.filter(f => f.id !== id));
    addToast("Catatan makanan dihapus.", "info");
  };

  const rawFirstName = userData?.name?.split(" ")[0] || "kamu";
  const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", transition: "background 0.35s ease, color 0.35s ease" }}>
      <Header
        streak={streak}
        userName={userData?.name ? firstName : undefined}
        showDashboard={showPlan}
        darkMode={darkMode}
        onToggleDark={toggleDark}
        onEditProfile={showPlan ? handleOpenEditProfile : undefined}
        dailyProgress={dailyProgress}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {!showPlan ? (
        <UserInputForm onGenerate={handleGenerate} />
      ) : (
        <main className="main-pad" style={{ maxWidth: activeTab === "Dashboard" ? "960px" : "1320px", margin: "0 auto", padding: "2.5rem 2rem 4rem", boxSizing: "border-box", width: "100%" }}>

          {/* ── Greeting bar — hanya di Dashboard ── */}
          {activeTab === "Dashboard" && (
            <div
              className="animate-fade-up greeting-bar"
              style={{
                marginBottom: "2rem",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                <h1 style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  margin: 0,
                  color: "var(--text-primary)",
                  wordBreak: "break-word",
                }}>
                  {getGreeting()}, {firstName}
                </h1>
                <p style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  margin: "0.375rem 0 0",
                  fontWeight: 400,
                }}>
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Menu titik tiga (⋯) untuk opsi */}
              <div style={{ position: "relative" }} ref={optionsMenuRef}>
                <button
                  onClick={() => setShowOptionsMenu(prev => !prev)}
                  aria-label="Menu opsi"
                  aria-haspopup="true"
                  aria-expanded={showOptionsMenu}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "38px",
                    height: "38px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-surface)",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontSize: "1.25rem",
                    lineHeight: 1,
                  }}
                  title="Opsi"
                >
                  <MoreHorizontal size={18} />
                </button>
                {showOptionsMenu && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      minWidth: "160px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow-lg)",
                      zIndex: 50,
                      padding: "4px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowResetConfirm(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: "transparent",
                        color: "var(--danger, #EF4444)",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <RotateCcw size={14} />
                      Reset Program
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab content ── */}
          <div key={activeTab} className="animate-fade-up">
            {activeTab === "Dashboard" && (
              <TabDashboard
                streak={streak}
                hydration={hydration}
                onUpdateHydration={setHydration}
                currentCalories={currentCalories}
                targetCalories={targetCalories}
                remainingCalories={remainingCalories}
                meals={meals}
                eatenMeals={eatenMeals}
                onToggleMeal={handleToggleMeal}
                viewDay={viewDay}
                onViewDayChange={setViewDay}
                onCompleteDay={handleCompleteDay}
                progressUpdatedToday={progressUpdatedToday}
                targetMacros={targetMacros}
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />
            )}
            {activeTab === "Nutrition" && (
              <TabNutrition
                currentProtein={currentProtein}
                targetProtein={targetMacros.protein}
                currentCarbs={currentCarbs}
                targetCarbs={targetMacros.carbs}
                currentFat={currentFat}
                targetFat={targetMacros.fat}
                loggedFoods={loggedFoods}
                onAddFoodItem={handleAddFoodItem}
                onDeleteFoodItem={handleDeleteFoodItem}
                meals={meals}
                eatenMeals={eatenMeals}
                onToggleMeal={handleToggleMeal}
                viewDay={viewDay}
                onViewDayChange={setViewDay}
                streak={streak}
              />
            )}
            {activeTab === "Progress" && (
              <TabProgress
                currentCalories={currentCalories}
                targetCalories={targetCalories}
                remainingCalories={remainingCalories}
                hydration={hydration}
                streak={streak}
                weightHistory={weightHistory}
                currentHeight={userData ? Number(userData.height) : undefined}
                targetWeight={userData?.weight ? (userData.goal === "loss" ? Math.max(Number(userData.weight) - 5, 45) : userData.goal === "gain" ? Number(userData.weight) + 5 : Number(userData.weight)) : 70}
                onUpdateProgress={handleUpdateProgress}
                onUpdateHydration={setHydration}
              />
            )}
            {activeTab === "Insights" && <TabInsights onToast={addToast} hydration={hydration} />}
          </div>
        </main>
      )}

      {/* Mobile Bottom Navigation */}
      {showPlan && (
        <nav className="nt-mobile-nav" role="navigation" aria-label="Mobile navigation">
          {([
            { label: "Dashboard" as NavTab, icon: <Home size={18} />, shortLabel: "Home" },
            { label: "Nutrition" as NavTab, icon: <UtensilsCrossed size={18} />, shortLabel: "Nutrisi" },
            { label: "Progress" as NavTab, icon: <BarChart2 size={18} />, shortLabel: "Progress" },
            { label: "Insights" as NavTab, icon: <Lightbulb size={18} />, shortLabel: "Insights" },
          ] as { label: NavTab; icon: React.ReactElement; shortLabel: string }[]).map(item => {
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                className={`nt-mobile-nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleTabChange(item.label)}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="nav-icon-wrap">
                  {item.icon}
                </div>
                {item.shortLabel}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── Toast Notification Container ── */}
      <div className="nt-toast-container" role="region" aria-live="polite" aria-label="Notifikasi">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`nt-toast ${toast.type} ${toast.exiting ? "exiting" : ""}`}
            role="alert"
            style={{ position: "relative" }}
          >
            <div className="nt-toast-icon">{TOAST_ICONS[toast.type]}</div>
            <span style={{ flex: 1, fontWeight: 500, color: "var(--text-primary)" }}>{toast.message}</span>
            <button
              className="nt-toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
            <div
              className="nt-toast-progress"
              style={{ background: TOAST_COLORS[toast.type], width: "100%" }}
            />
          </div>
        ))}
      </div>

      {/* Edit Profil Modal */}
      {showEditProfileModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem"
        }}
          onClick={() => setShowEditProfileModal(false)}
        >
          <div style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--r-xl)",
            border: "1px solid var(--border-soft)",
            width: "100%", maxWidth: "500px",
            padding: "2rem",
            boxShadow: "var(--shadow-xl)",
            position: "relative",
            animation: "scaleIn var(--dur-base) var(--ease-spring) both"
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>
                Edit Profil & Target 🎯
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{
                  border: "none", background: "transparent",
                  color: "var(--text-tertiary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1.5px solid var(--border-soft)",
                    borderRadius: "var(--r-md)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Usia
                  </label>
                  <input
                    type="number"
                    required
                    value={editAge}
                    onChange={e => setEditAge(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1.5px solid var(--border-soft)",
                      borderRadius: "var(--r-md)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Jenis Kelamin
                  </label>
                  <select
                    value={editGender}
                    onChange={e => setEditGender(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1.5px solid var(--border-soft)",
                      borderRadius: "var(--r-md)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editWeight}
                    onChange={e => setEditWeight(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1.5px solid var(--border-soft)",
                      borderRadius: "var(--r-md)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editHeight}
                    onChange={e => setEditHeight(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1.5px solid var(--border-soft)",
                      borderRadius: "var(--r-md)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Tingkat Aktivitas
                </label>
                <select
                  value={editActivity}
                  onChange={e => setEditActivity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1.5px solid var(--border-soft)",
                    borderRadius: "var(--r-md)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                >
                  <option value="sedentary">Sangat Jarang Olahraga (Sedentary)</option>
                  <option value="light">Ringan (Olahraga 1-3x/minggu)</option>
                  <option value="moderate">Sedang (Olahraga 3-5x/minggu)</option>
                  <option value="very">Berat (Olahraga 6-7x/minggu)</option>
                  <option value="athlete">Sangat Berat (Atlet/Pekerja Fisik)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Tujuan Diet
                </label>
                <select
                  value={editGoal}
                  onChange={e => setEditGoal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1.5px solid var(--border-soft)",
                    borderRadius: "var(--r-md)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                >
                  <option value="loss">Menurunkan Berat Badan (Defisit)</option>
                  <option value="maintain">Mempertahankan Berat Badan</option>
                  <option value="gain">Meningkatkan Massa Otot (Surplus)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  className="nt-btn-primary"
                  style={{ flex: 2, padding: "0.75rem", minHeight: "48px" }}
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="nt-btn-ghost"
                  style={{ flex: 1, padding: "0.75rem", minHeight: "48px" }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Reset Program */}
      {showResetConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "8px",
              border: "1px solid var(--border-soft)",
              width: "100%",
              maxWidth: "400px",
              padding: "24px",
              boxShadow: "var(--shadow-xl)",
              textAlign: "left",
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: "0 0 8px",
              }}
            >
              Reset Program?
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                margin: "0 0 24px",
              }}
            >
              Semua data dan progres harian kamu akan direset ke awal. Kamu yakin ingin melanjutkan?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
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
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  handleResetProgram();
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--danger, #EF4444)",
                  color: "#FFFFFF",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Asisten NutriTrack (Hanya setelah onboarding / showPlan) ── */}
      {showPlan && (
        <NutriTrackAssistant
          isOpen={isAssistantOpen}
          onOpen={() => setIsAssistantOpen(true)}
          onClose={() => setIsAssistantOpen(false)}
          userName={userData?.name}
          currentCalories={currentCalories}
          targetCalories={targetCalories}
          remainingCalories={remainingCalories}
          targetMacros={targetMacros}
          currentProtein={currentProtein}
          currentCarbs={currentCarbs}
          currentFat={currentFat}
          meals={meals}
          eatenMeals={eatenMeals}
        />
      )}

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .macro-3-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .macro-3-grid  { grid-template-columns: 1fr !important; }
          .goal-3-grid   { grid-template-columns: 1fr !important; }
          .body-3-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
