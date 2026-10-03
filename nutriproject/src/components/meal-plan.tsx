import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import sarapanImg from "../assets/images/meals/sarapan.jpg";
import makanSiangImg from "../assets/images/meals/makan-siang.jpg";
import makanMalamImg from "../assets/images/meals/makan-malam.jpg";

export interface Meal {
  time: string;
  name: string;
  foods: string[];
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface TargetMacros {
  protein: number;
  carbs: number;
  fat: number;
}

interface MealPlanProps {
  meals: Meal[];
  eatenMeals?: Set<number>;
  onToggleMeal?: (idx: number) => void;
  viewDay?: number;
  onViewDayChange?: (d: number) => void;
  onCompleteDay?: () => void;
  streak?: number;
  progressUpdatedToday?: boolean;
  targetMacros?: TargetMacros;
}

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

function getMealInfo(name: string): { title: string; imageSrc: string; initial: string } {
  const lower = name.toLowerCase();
  if (lower.includes("breakfast") || lower.includes("sarapan")) {
    return {
      title: "Sarapan",
      imageSrc: sarapanImg,
      initial: "S",
    };
  }
  if (lower.includes("lunch") || lower.includes("siang")) {
    return {
      title: "Makan siang",
      imageSrc: makanSiangImg,
      initial: "MS",
    };
  }
  if (lower.includes("dinner") || lower.includes("malam")) {
    return {
      title: "Makan malam",
      imageSrc: makanMalamImg,
      initial: "MM",
    };
  }
  return {
    title: name,
    imageSrc: `/images/meals/${name.toLowerCase().replace(/\s+/g, "-")}.webp`,
    initial: name.charAt(0).toUpperCase(),
  };
}

function getMealTag(meal: Meal): string {
  const proteinCal = (meal.protein || 0) * 4;
  const isHighProtein = meal.calories > 0 && (proteinCal / meal.calories) >= 0.30;
  const hasFiber = (meal as any).fiber !== undefined && (meal as any).fiber >= 5;
  if (isHighProtein) return "Tinggi protein";
  if (hasFiber) return "Tinggi serat";
  return "Seimbang";
}

function getNextMealIndex(meals: Meal[], eaten: Set<number>): number | null {
  const uneatenIndices: number[] = [];
  meals.forEach((_, idx) => {
    if (!eaten.has(idx)) uneatenIndices.push(idx);
  });

  if (uneatenIndices.length === 0) return null;

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  function parseStartHour(timeStr: string, fallbackIdx: number): number {
    const match = timeStr.match(/(\d+):(\d+)/);
    if (match) {
      return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
    }
    return fallbackIdx === 0 ? 7 : fallbackIdx === 1 ? 12 : 19;
  }

  let closestIdx: number = uneatenIndices[0];
  let minDiff = Infinity;

  for (const idx of uneatenIndices) {
    const mealHour = parseStartHour(meals[idx].time, idx);
    const diff = Math.abs(mealHour - currentHour);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  }

  return closestIdx;
}

function MealImage({
  src,
  alt,
  initial,
  isEaten,
  isLazy,
}: {
  src: string;
  alt: string;
  initial: string;
  isEaten: boolean;
  isLazy: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="meal-card-img-wrap"
      style={{
        filter: isEaten ? "grayscale(30%)" : "none",
        transition: "filter 150ms ease",
      }}
    >
      {hasError ? (
        <div className="meal-card-placeholder" aria-hidden="true">
          {initial}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={isLazy ? "lazy" : "eager"}
          onError={() => setHasError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
}

export function MealPlan({
  meals,
  eatenMeals,
  onToggleMeal,
  viewDay = 1,
  onViewDayChange,
  onCompleteDay,
  streak = 1,
  targetMacros,
}: MealPlanProps) {
  const dark = useDarkMode();
  const [localEaten, setLocalEaten] = useState<Set<number>>(new Set());

  const tabDays = streak <= 2 ? [1, 2, 3] : [streak - 1, streak, streak + 1];
  const eaten = eatenMeals ?? localEaten;
  const totalEaten = eaten.size;
  const nextMealIdx = getNextMealIndex(meals, eaten);

  const toggleEaten = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMeal) {
      onToggleMeal(idx);
    } else {
      setLocalEaten(prev => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    }
  };

  const macroColors = {
    protein: dark ? "#FB923C" : "#F97316",
    carbs: dark ? "#818CF8" : "#6366F1",
    fat: dark ? "#FCD34D" : "#D97706",
  };

  const dailyTargetMacros = {
    protein: targetMacros?.protein || 120,
    carbs: targetMacros?.carbs || 200,
    fat: targetMacros?.fat || 50,
  };

  return (
    <div className="meal-plan-section animate-fade-up-2">
      {/* 4. TAB HARI & INDIKATOR SELESAI */}
      <div className="meal-plan-header-row">
        {onViewDayChange ? (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {tabDays.map(d => {
              const isSelected = viewDay === d;
              const isToday = d === streak;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onViewDayChange(d)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: isSelected ? "1px solid #14B8A6" : "1px solid var(--border-soft)",
                    background: isSelected ? "#14B8A6" : "var(--bg-surface)",
                    color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>Hari {d}</span>
                  {isToday && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: isSelected ? "#FFFFFF" : "#14B8A6",
                        display: "inline-block",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div />
        )}

        <div
          className="meal-secondary-text"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
          }}
        >
          {totalEaten} dari {meals.length} waktu makan selesai
        </div>
      </div>

      {/* 3. DAFTAR KARTU MAKAN */}
      <div className="meal-cards-list">
        {meals.map((meal, idx) => {
          const { title: mealTitle, imageSrc, initial } = getMealInfo(meal.name);
          const isEaten = eaten.has(idx);
          const isNext = idx === nextMealIdx;
          const tagText = getMealTag(meal);

          const proteinPct = Math.min(
            100,
            Math.round(((meal.protein || 0) / dailyTargetMacros.protein) * 100)
          );
          const carbsPct = Math.min(
            100,
            Math.round(((meal.carbs || 0) / dailyTargetMacros.carbs) * 100)
          );
          const fatPct = Math.min(
            100,
            Math.round(((meal.fat || 0) / dailyTargetMacros.fat) * 100)
          );

          return (
            <div
              key={idx}
              className={`meal-card-item ${isEaten ? "is-eaten" : ""} ${isNext && !isEaten ? "is-next" : ""}`}
              style={{
                borderRadius: "8px",
                border: isEaten ? "1px solid #14B8A6" : isNext && !isEaten ? "1.5px solid #14B8A6" : "1px solid var(--border-soft)",
                background: isEaten ? "var(--brand-light)" : "var(--bg-surface)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#14B8A6";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = isEaten ? "#14B8A6" : isNext && !isEaten ? "#14B8A6" : "var(--border-soft)";
              }}
            >
              {/* Gambar / Placeholder 160x160 desktop, 140px mobile */}
              <MealImage
                src={imageSrc}
                alt={`Ilustrasi ${mealTitle.toLowerCase()}`}
                initial={initial}
                isEaten={isEaten}
                isLazy={idx > 0}
              />

              {/* Isi Kartu */}
              <div className="meal-card-content">
                {/* Baris Atas: Nama waktu makan + jam kecil abu-abu */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: 0,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.25,
                      }}
                    >
                      {mealTitle}
                    </h3>
                    <span
                      className="meal-secondary-text"
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 400,
                      }}
                    >
                      • {meal.time}
                    </span>
                  </div>

                  {/* Penanda "Berikutnya" di mobile/header row */}
                  {isNext && !isEaten && (
                    <span className="meal-badge-mobile">
                      Berikutnya
                    </span>
                  )}
                </div>

                {/* Kalori besar dan tebal + Label ringkas dengan titik teal */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {meal.calories.toLocaleString("id-ID")}{" "}
                    <span className="meal-secondary-text" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                      kcal
                    </span>
                  </div>

                  {/* Label ringkas otomatis dari data: titik teal + teks */}
                  <div
                    className="meal-secondary-text"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#14B8A6",
                        flexShrink: 0,
                      }}
                    />
                    <span>{tagText}</span>
                  </div>
                </div>

                {/* MENU SELALU TAMPIL: chip tinggi 36px, font 14px */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "2px 0" }}>
                  {meal.foods.map((food, fIdx) => (
                    <span
                      key={fIdx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: "36px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        background: isEaten ? (dark ? "rgba(17, 26, 43, 0.7)" : "#FFFFFF") : "var(--bg-subtle)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                        fontSize: "0.875rem",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        lineHeight: 1,
                      }}
                    >
                      {food}
                    </span>
                  ))}
                </div>

                {/* Tiga indikator makro sebaris dengan bar tipis 4px */}
                {(meal.protein !== undefined || meal.carbs !== undefined || meal.fat !== undefined) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "2px" }}>
                    {meal.protein !== undefined && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "68px" }}>
                        <span className="meal-secondary-text" style={{ fontSize: "0.75rem" }}>
                          Protein{" "}
                          <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {meal.protein}g
                          </strong>
                        </span>
                        <div
                          style={{
                            height: "4px",
                            width: "100%",
                            background: dark ? "rgba(255,255,255,0.08)" : "var(--border-subtle)",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${proteinPct}%`,
                              background: macroColors.protein,
                              borderRadius: "2px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {meal.carbs !== undefined && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "68px" }}>
                        <span className="meal-secondary-text" style={{ fontSize: "0.75rem" }}>
                          Karbo{" "}
                          <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {meal.carbs}g
                          </strong>
                        </span>
                        <div
                          style={{
                            height: "4px",
                            width: "100%",
                            background: dark ? "rgba(255,255,255,0.08)" : "var(--border-subtle)",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${carbsPct}%`,
                              background: macroColors.carbs,
                              borderRadius: "2px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {meal.fat !== undefined && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "68px" }}>
                        <span className="meal-secondary-text" style={{ fontSize: "0.75rem" }}>
                          Lemak{" "}
                          <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                            {meal.fat}g
                          </strong>
                        </span>
                        <div
                          style={{
                            height: "4px",
                            width: "100%",
                            background: dark ? "rgba(255,255,255,0.08)" : "var(--border-subtle)",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${fatPct}%`,
                              background: macroColors.fat,
                              borderRadius: "2px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Kolom Aksi di Kanan */}
              <div className="meal-card-action">
                {isNext && !isEaten ? (
                  <span className="meal-badge-desktop">
                    Berikutnya
                  </span>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={e => toggleEaten(idx, e)}
                  style={{
                    height: "40px",
                    padding: "0 16px",
                    borderRadius: "8px",
                    border: isEaten ? "1px solid #14B8A6" : "1px solid var(--border-soft)",
                    background: isEaten ? "#14B8A6" : "transparent",
                    color: isEaten ? "#FFFFFF" : dark ? "var(--text-secondary)" : "#475569",
                    fontSize: "0.8125rem",
                    fontWeight: isEaten ? 600 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={e => {
                    if (!isEaten) {
                      e.currentTarget.style.borderColor = "#14B8A6";
                      e.currentTarget.style.color = "#14B8A6";
                      e.currentTarget.style.background = "var(--brand-light)";
                    } else {
                      e.currentTarget.style.background = "#0F9E8E";
                      e.currentTarget.style.borderColor = "#0F9E8E";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isEaten) {
                      e.currentTarget.style.borderColor = "var(--border-soft)";
                      e.currentTarget.style.color = dark ? "var(--text-secondary)" : "#475569";
                      e.currentTarget.style.background = "transparent";
                    } else {
                      e.currentTarget.style.background = "#14B8A6";
                      e.currentTarget.style.borderColor = "#14B8A6";
                    }
                  }}
                >
                  {isEaten ? (
                    <>
                      <Check size={16} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span>Sudah dimakan</span>
                    </>
                  ) : (
                    <span>Tandai selesai</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol Selesaikan hari ini (jarak 24px) */}
      {onCompleteDay && (
        <div style={{ marginTop: "24px" }}>
          <button
            type="button"
            onClick={onCompleteDay}
            disabled={totalEaten === 0}
            style={{
              width: "100%",
              minHeight: "44px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: totalEaten === 0 ? "var(--bg-subtle)" : "#14B8A6",
              color: totalEaten === 0 ? "var(--text-tertiary)" : "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: totalEaten === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              opacity: totalEaten === 0 ? 0.7 : 1,
            }}
          >
            Selesaikan hari ini
          </button>
          {totalEaten === 0 && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                textAlign: "center",
                margin: "8px 0 0",
              }}
            >
              Centang makanan dulu untuk melanjutkan
            </p>
          )}
        </div>
      )}

      <style>{`
        .meal-plan-section {
          width: 100%;
          text-align: left;
        }
        .meal-plan-header-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }
        .meal-cards-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .meal-card-item {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          overflow: hidden;
          transition: border-color 150ms ease, background-color 150ms ease;
          position: relative;
        }
        .meal-secondary-text {
          color: #475569;
        }
        .dark .meal-secondary-text {
          color: var(--text-secondary);
        }
        .meal-card-img-wrap {
          width: 160px;
          height: 160px;
          flex-shrink: 0;
          overflow: hidden;
          background: var(--bg-subtle);
          position: relative;
        }
        .meal-card-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-subtle);
          color: var(--text-tertiary);
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 2rem;
          letter-spacing: -0.02em;
          user-select: none;
        }
        .meal-card-content {
          flex: 1;
          min-width: 0;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          gap: 10px;
        }
        .meal-card-action {
          padding: 16px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .meal-badge-desktop {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #14B8A6;
          background: var(--brand-light, rgba(20, 184, 166, 0.12));
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid rgba(20, 184, 166, 0.3);
          display: inline-block;
        }
        .meal-badge-mobile {
          display: none;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #14B8A6;
          background: var(--brand-light, rgba(20, 184, 166, 0.12));
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid rgba(20, 184, 166, 0.3);
        }
        @media (max-width: 639px) {
          .meal-card-item {
            flex-direction: column !important;
          }
          .meal-card-img-wrap {
            width: 100% !important;
            height: 140px !important;
          }
          .meal-card-action {
            padding: 0 16px 16px 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            align-items: stretch !important;
          }
          .meal-card-action button {
            min-height: 44px !important;
            width: 100% !important;
          }
          .meal-badge-desktop {
            display: none !important;
          }
          .meal-badge-mobile {
            display: inline-block !important;
          }
        }
      `}</style>
    </div>
  );
}
