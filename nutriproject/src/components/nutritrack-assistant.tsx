import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";

export interface NutriTrackAssistantProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  userName?: string;
  currentCalories: number;
  targetCalories: number;
  remainingCalories: number;
  targetMacros: { protein: number; carbs: number; fat: number };
  currentProtein: number;
  currentCarbs: number;
  currentFat: number;
  meals: Array<{
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    foods: string[];
  }>;
  eatenMeals: Set<number>;
}

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  showChips?: boolean;
}

const SUGGESTION_CHIPS = [
  "Apa makan berikutnya?",
  "Sisa kalori hari ini",
  "Cek protein hari ini",
  "Ringkasan hari ini",
];

function getMealTitle(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("breakfast") || l.includes("sarapan")) return "Sarapan";
  if (l.includes("lunch") || l.includes("siang")) return "Makan siang";
  if (l.includes("dinner") || l.includes("malam")) return "Makan malam";
  return name;
}

function getAssistantResponse(
  query: string,
  data: {
    currentCalories: number;
    targetCalories: number;
    remainingCalories: number;
    targetMacros: { protein: number; carbs: number; fat: number };
    currentProtein: number;
    currentCarbs: number;
    currentFat: number;
    meals: NutriTrackAssistantProps["meals"];
    eatenMeals: Set<number>;
  }
): { text: string; showChips: boolean } {
  const q = query.trim().toLowerCase();

  // 1. Next Meal / Meal Queries
  if (
    q.includes("makan berikutnya") ||
    q.includes("berikutnya") ||
    q.includes("jadwal makan") ||
    q === "makan"
  ) {
    const nextIdx = data.meals.findIndex((_, idx) => !data.eatenMeals.has(idx));
    if (nextIdx === -1) {
      return {
        text: "Semua waktu makan hari ini sudah selesai.",
        showChips: false,
      };
    }
    const meal = data.meals[nextIdx];
    const title = getMealTitle(meal.name);
    return {
      text: `Berikutnya ${title} (${meal.time}), ${meal.calories.toLocaleString("id-ID")} kcal: ${meal.foods.join(", ")}.`,
      showChips: false,
    };
  }

  // Specific Meal Details
  if (q.includes("sarapan") || q.includes("breakfast")) {
    const idx = data.meals.findIndex(
      m => m.name.toLowerCase().includes("breakfast") || m.name.toLowerCase().includes("sarapan")
    );
    if (idx !== -1) {
      const meal = data.meals[idx];
      const isEaten = data.eatenMeals.has(idx);
      return {
        text: `Sarapan (${meal.time}) — ${meal.calories.toLocaleString("id-ID")} kcal: ${meal.foods.join(", ")}. Status: ${isEaten ? "sudah selesai dicatat" : "belum selesai"}.`,
        showChips: false,
      };
    }
  }

  if (q.includes("siang") || q.includes("lunch")) {
    const idx = data.meals.findIndex(
      m => m.name.toLowerCase().includes("lunch") || m.name.toLowerCase().includes("siang")
    );
    if (idx !== -1) {
      const meal = data.meals[idx];
      const isEaten = data.eatenMeals.has(idx);
      return {
        text: `Makan siang (${meal.time}) — ${meal.calories.toLocaleString("id-ID")} kcal: ${meal.foods.join(", ")}. Status: ${isEaten ? "sudah selesai dicatat" : "belum selesai"}.`,
        showChips: false,
      };
    }
  }

  if (q.includes("malam") || q.includes("dinner")) {
    const idx = data.meals.findIndex(
      m => m.name.toLowerCase().includes("dinner") || m.name.toLowerCase().includes("malam")
    );
    if (idx !== -1) {
      const meal = data.meals[idx];
      const isEaten = data.eatenMeals.has(idx);
      return {
        text: `Makan malam (${meal.time}) — ${meal.calories.toLocaleString("id-ID")} kcal: ${meal.foods.join(", ")}. Status: ${isEaten ? "sudah selesai dicatat" : "belum selesai"}.`,
        showChips: false,
      };
    }
  }

  // 2. Remaining Calories
  if (q.includes("kalori") || q.includes("sisa")) {
    const currentStr = data.currentCalories.toLocaleString("id-ID");
    const targetStr = data.targetCalories.toLocaleString("id-ID");
    if (data.currentCalories <= data.targetCalories) {
      const remainingStr = data.remainingCalories.toLocaleString("id-ID");
      return {
        text: `Kamu sudah makan ${currentStr} kcal dari ${targetStr} kcal. Sisa ${remainingStr} kcal.`,
        showChips: false,
      };
    } else {
      const overStr = (data.currentCalories - data.targetCalories).toLocaleString("id-ID");
      return {
        text: `Kamu sudah makan ${currentStr} kcal dari ${targetStr} kcal. Asupan kalori kamu melebihi target sebanyak ${overStr} kcal.`,
        showChips: false,
      };
    }
  }

  // 3. Protein Check
  if (q.includes("protein")) {
    const diff = data.targetMacros.protein - data.currentProtein;
    if (diff > 0) {
      return {
        text: `Protein tercatat ${data.currentProtein}g dari target ${data.targetMacros.protein}g. Sisa ${diff}g lagi untuk mencapai target harian.`,
        showChips: false,
      };
    } else if (diff === 0) {
      return {
        text: `Protein tercatat ${data.currentProtein}g dari target ${data.targetMacros.protein}g. Target protein harian kamu sudah tercapai tepat sasaran!`,
        showChips: false,
      };
    } else {
      return {
        text: `Protein tercatat ${data.currentProtein}g dari target ${data.targetMacros.protein}g. Kamu sudah melebihi target sebanyak ${Math.abs(diff)}g.`,
        showChips: false,
      };
    }
  }

  // 4. Carbs Check
  if (q.includes("karbo") || q.includes("carbs")) {
    const diff = data.targetMacros.carbs - data.currentCarbs;
    if (diff > 0) {
      return {
        text: `Karbohidrat tercatat ${data.currentCarbs}g dari target ${data.targetMacros.carbs}g. Sisa ${diff}g lagi untuk mencapai target.`,
        showChips: false,
      };
    } else if (diff === 0) {
      return {
        text: `Karbohidrat tercatat ${data.currentCarbs}g dari target ${data.targetMacros.carbs}g. Target karbohidrat harian sudah tercapai!`,
        showChips: false,
      };
    } else {
      return {
        text: `Karbohidrat tercatat ${data.currentCarbs}g dari target ${data.targetMacros.carbs}g. Melebihi target sebanyak ${Math.abs(diff)}g.`,
        showChips: false,
      };
    }
  }

  // 5. Fat Check
  if (q.includes("lemak") || q.includes("fat")) {
    const diff = data.targetMacros.fat - data.currentFat;
    if (diff > 0) {
      return {
        text: `Lemak tercatat ${data.currentFat}g dari target ${data.targetMacros.fat}g. Sisa ${diff}g lagi untuk mencapai target.`,
        showChips: false,
      };
    } else if (diff === 0) {
      return {
        text: `Lemak tercatat ${data.currentFat}g dari target ${data.targetMacros.fat}g. Target lemak harian sudah tercapai!`,
        showChips: false,
      };
    } else {
      return {
        text: `Lemak tercatat ${data.currentFat}g dari target ${data.targetMacros.fat}g. Melebihi target sebanyak ${Math.abs(diff)}g.`,
        showChips: false,
      };
    }
  }

  // 6. Summary Check
  if (q.includes("ringkasan") || q.includes("rangkuman") || q.includes("summary")) {
    const pPct = data.targetMacros.protein > 0 ? data.currentProtein / data.targetMacros.protein : 1;
    const cPct = data.targetMacros.carbs > 0 ? data.currentCarbs / data.targetMacros.carbs : 1;
    const fPct = data.targetMacros.fat > 0 ? data.currentFat / data.targetMacros.fat : 1;

    let laggingName = "protein";
    let laggingPct = Math.round(pPct * 100);

    if (cPct < pPct && cPct <= fPct) {
      laggingName = "karbohidrat";
      laggingPct = Math.round(cPct * 100);
    } else if (fPct < pPct && fPct < cPct) {
      laggingName = "lemak";
      laggingPct = Math.round(fPct * 100);
    }

    const currentCalStr = data.currentCalories.toLocaleString("id-ID");
    const targetCalStr = data.targetCalories.toLocaleString("id-ID");

    return {
      text: `Hari ini kamu sudah mengonsumsi ${currentCalStr} kcal dari target ${targetCalStr} kcal dengan ${data.eatenMeals.size} dari ${data.meals.length} waktu makan selesai, dan asupan ${laggingName} masih paling tertinggal (${laggingPct}% dari target).`,
      showChips: false,
    };
  }

  // Fallback
  return {
    text: "Aku belum paham pertanyaan itu. Coba pilih salah satu saran di bawah.",
    showChips: true,
  };
}

export function NutriTrackAssistant({
  isOpen,
  onOpen,
  onClose,
  userName,
  currentCalories,
  targetCalories,
  remainingCalories,
  targetMacros,
  currentProtein,
  currentCarbs,
  currentFat,
  meals,
  eatenMeals,
}: NutriTrackAssistantProps) {
  const cleanName = userName?.trim() || "";
  const initialGreeting = cleanName
    ? `Hai ${cleanName}, aku bisa bantu cek sisa kalori, makronutrien, dan makanan berikutnya.`
    : "Hai! Aku bisa bantu cek sisa kalori, makronutrien, dan makanan berikutnya.";

  // Chat history stored in session state (lost on refresh)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      sender: "assistant",
      text: initialGreeting,
      showChips: true,
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTyping, setActiveTyping] = useState<{
    id: string;
    fullText: string;
    words: string[];
    currentWordIndex: number;
  } | null>(null);

  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const wordIntervalRef = useRef<number | null>(null);

  // Auto-scroll when messages, typing, or words change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeTyping]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle ESC key to close and return focus to trigger button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
        triggerButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (wordIntervalRef.current) clearInterval(wordIntervalRef.current);
    };
  }, []);

  const handleClose = () => {
    onClose();
    triggerButtonRef.current?.focus();
  };

  const handleSkipTyping = () => {
    if (wordIntervalRef.current) {
      clearInterval(wordIntervalRef.current);
      wordIntervalRef.current = null;
    }
    if (activeTyping) {
      setLiveAnnouncement(activeTyping.fullText);
      setActiveTyping(null);
    }
  };

  const processQuery = (queryText: string) => {
    if (!queryText.trim() || isTyping || activeTyping !== null) return;

    const trimmed = queryText.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: trimmed,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    const answer = getAssistantResponse(trimmed, {
      currentCalories,
      targetCalories,
      remainingCalories,
      targetMacros,
      currentProtein,
      currentCarbs,
      currentFat,
      meals,
      eatenMeals,
    });

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Immediate display without typing animations
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}-${Math.random()}`,
        sender: "assistant",
        text: answer.text,
        showChips: answer.showChips,
      };
      setMessages(prev => [...prev, botMsg]);
      setLiveAnnouncement(answer.text);
      return;
    }

    // Step 1: Pulsing typing indicator (700ms)
    setIsTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);

      const botMsgId = `bot-${Date.now()}-${Math.random()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: "assistant",
        text: answer.text,
        showChips: answer.showChips,
      };

      setMessages(prev => [...prev, botMsg]);

      // Step 2: Word-by-word typing effect (~25ms per word)
      const words = answer.text.split(" ");
      setActiveTyping({
        id: botMsgId,
        fullText: answer.text,
        words,
        currentWordIndex: 1,
      });

      if (wordIntervalRef.current) clearInterval(wordIntervalRef.current);
      wordIntervalRef.current = window.setInterval(() => {
        setActiveTyping(prev => {
          if (!prev) return null;
          if (prev.currentWordIndex >= prev.words.length) {
            if (wordIntervalRef.current) clearInterval(wordIntervalRef.current);
            setLiveAnnouncement(prev.fullText);
            return null;
          }
          return {
            ...prev,
            currentWordIndex: prev.currentWordIndex + 1,
          };
        });
      }, 25);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(inputValue);
  };

  return (
    <>
      {/* ── Screen Reader Announcement ── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {liveAnnouncement}
      </div>

      {/* ── Floating Action Trigger Button (56px) ── */}
      <button
        ref={triggerButtonRef}
        type="button"
        className="assistant-trigger-btn"
        onClick={onOpen}
        aria-label="Buka asisten"
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#14B8A6" strokeWidth="2.2" />
            <circle cx="14" cy="14" r="6.5" stroke="#14B8A6" strokeWidth="2.2" />
          </svg>
        </div>
      </button>

      {/* ── Drawer & Overlay ── */}
      {isOpen && (
        <>
          {/* Thin overlay (no glassmorphism / no blur) */}
          <div
            className="assistant-overlay"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Panel Drawer (Desktop 400px, Mobile 80vh bottom sheet) */}
          <div
            className="assistant-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Asisten NutriTrack"
          >
            {/* ── Header ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="12" stroke="#14B8A6" strokeWidth="2.2" />
                    <circle cx="14" cy="14" r="6.5" stroke="#14B8A6" strokeWidth="2.2" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      lineHeight: 1.2,
                    }}
                  >
                    Asisten NutriTrack
                  </h2>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.2,
                    }}
                  >
                    Saran otomatis dari data harianmu
                  </p>
                </div>
              </div>

              {/* Close Button (min 44px tap target) */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup asisten"
                style={{
                  width: "44px",
                  height: "44px",
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 150ms ease, color 150ms ease",
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

            {/* ── Scrollable Messages Area ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "var(--bg-base)",
              }}
            >
              {messages.map(msg => {
                const isAssistant = msg.sender === "assistant";
                const isCurrentlyTyping = activeTyping !== null && activeTyping.id === msg.id;

                const displayText = isCurrentlyTyping
                  ? activeTyping.words.slice(0, activeTyping.currentWordIndex).join(" ")
                  : msg.text;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isAssistant ? "flex-start" : "flex-end",
                      gap: "4px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        wordBreak: "break-word",
                        background: isAssistant ? "var(--bg-surface)" : "var(--brand)",
                        color: isAssistant ? "var(--text-primary)" : "#FFFFFF",
                        border: isAssistant ? "1px solid var(--border-subtle)" : "none",
                        boxShadow: isAssistant ? "var(--shadow-sm)" : "none",
                      }}
                    >
                      {displayText}
                    </div>

                    {/* Small Skip (Lewati) button while typing word-by-word */}
                    {isCurrentlyTyping && (
                      <button
                        type="button"
                        onClick={handleSkipTyping}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--brand)",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "2px 4px",
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                          fontFamily: "inherit",
                        }}
                      >
                        Lewati
                      </button>
                    )}

                    {/* Suggestion Chips */}
                    {isAssistant && msg.showChips && !isCurrentlyTyping && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "8px",
                          width: "100%",
                        }}
                      >
                        {SUGGESTION_CHIPS.map(chip => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => processQuery(chip)}
                            disabled={isTyping || activeTyping !== null}
                            style={{
                              background: "var(--bg-surface)",
                              border: "1px solid var(--border-soft)",
                              borderRadius: "9999px",
                              padding: "8px 14px",
                              fontSize: "0.8125rem",
                              color: "var(--text-primary)",
                              cursor:
                                isTyping || activeTyping !== null ? "not-allowed" : "pointer",
                              transition: "all 150ms ease",
                              textAlign: "left",
                              lineHeight: 1.3,
                              minHeight: "40px",
                              display: "inline-flex",
                              alignItems: "center",
                              fontFamily: "inherit",
                              boxShadow: "var(--shadow-xs)",
                            }}
                            onMouseEnter={e => {
                              if (!isTyping && activeTyping === null) {
                                e.currentTarget.style.borderColor = "var(--brand)";
                                e.currentTarget.style.background = "var(--bg-subtle)";
                              }
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = "var(--border-soft)";
                              e.currentTarget.style.background = "var(--bg-surface)";
                            }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator (3 pulsing dots for 600-900ms) */}
              {isTyping && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  aria-label="Asisten sedang mengetik"
                >
                  <span className="assistant-typing-dot" style={{ animationDelay: "0ms" }} />
                  <span className="assistant-typing-dot" style={{ animationDelay: "200ms" }} />
                  <span className="assistant-typing-dot" style={{ animationDelay: "400ms" }} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input & Footer Area ── */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                flexShrink: 0,
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Tanya soal makanan hari ini..."
                  disabled={isTyping || activeTyping !== null}
                  style={{
                    flex: 1,
                    height: "44px",
                    minHeight: "44px",
                    padding: "0 14px",
                    fontSize: "0.875rem",
                    borderRadius: "6px",
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "var(--brand)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "var(--border-soft)";
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping || activeTyping !== null}
                  aria-label="Kirim pesan"
                  style={{
                    height: "44px",
                    minHeight: "44px",
                    width: "44px",
                    minWidth: "44px",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--brand)",
                    color: "#FFFFFF",
                    cursor:
                      !inputValue.trim() || isTyping || activeTyping !== null
                        ? "not-allowed"
                        : "pointer",
                    opacity: !inputValue.trim() || isTyping || activeTyping !== null ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "opacity 150ms ease, background 150ms ease",
                  }}
                >
                  <Send size={18} />
                </button>
              </form>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                Saran umum, bukan pengganti saran dokter atau ahli gizi.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
