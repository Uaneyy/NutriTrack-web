
import { Flame, Bell, Moon, Sun, User, BarChart2, Lightbulb, UtensilsCrossed } from "lucide-react";

export type NavTab = "Dashboard" | "Nutrition" | "Progress" | "Insights";

interface HeaderProps {
  streak: number;
  userName?: string;
  onEditProfile?: () => void;
  showDashboard?: boolean;
  darkMode?: boolean;
  onToggleDark?: () => void;
  dailyProgress?: number;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

const NAV_ITEMS: { label: NavTab; icon: typeof BarChart2 }[] = [
  { label: "Dashboard", icon: BarChart2 },
  { label: "Nutrition", icon: UtensilsCrossed },
  { label: "Progress", icon: BarChart2 },
  { label: "Insights", icon: Lightbulb },
];

export function Header({
  streak,
  userName,
  onEditProfile,
  showDashboard,
  darkMode = false,
  onToggleDark,
  dailyProgress = 76,
  activeTab = "Dashboard",
  onTabChange,
}: HeaderProps) {
  return (
    <header className="nt-header">
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
        className="nt-header-inner"
      >
        {/* ── Logo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0, minWidth: 0 }}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <circle cx="14" cy="14" r="12" stroke="#14B8A6" strokeWidth="2" />
            <circle cx="14" cy="14" r="6.5" stroke="#14B8A6" strokeWidth="2" />
          </svg>
          <span
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            NutriTrack
          </span>
        </div>

        {/* ── Nav — fungsional per tab ── */}
        {showDashboard && (
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="nt-header-nav"
            style={{ display: "flex", alignItems: "center", gap: "0.125rem" }}
          >
            {NAV_ITEMS.map(item => {
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => onTabChange?.(item.label)}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.4375rem 1rem",
                    borderRadius: "var(--r-md)",
                    border: "none",
                    background: isActive ? "var(--brand-light)" : "transparent",
                    color: isActive ? "var(--brand-dark)" : "var(--text-secondary)",
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.18s ease",
                    position: "relative",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-subtle)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  {item.label}
                  {/* Garis bawah aktif */}
                  {isActive && (
                    <span style={{
                      position: "absolute",
                      bottom: "-1px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "24px",
                      height: "2px",
                      borderRadius: "999px",
                      background: "var(--brand)",
                    }} />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* ── Kanan: dark toggle + (streak, bell, avatar hanya saat showDashboard) ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          flexShrink: 0,
          overflow: "visible",
        }}>

          {/* Streak badge — hanya setelah onboarding */}
          {showDashboard && (
            <div
              role="status"
              aria-label="Streak"
              className="streak-badge"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "var(--r-full)",
                background: "var(--brand-light)",
                border: "1px solid var(--border-soft)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--brand)",
                cursor: "default",
                transition: "all 0.15s ease",
                minHeight: "unset",
                height: "32px",
              }}
            >
              <Flame size={13} fill="var(--brand)" color="var(--brand)" />
              {streak} <span className="nt-streak-label">hari</span>
            </div>
          )}

          {/* Dark mode toggle */}
          {onToggleDark && (
            <button
              type="button"
              onClick={onToggleDark}
              className={`dark-toggle ${darkMode ? "on" : ""}`}
              aria-label="Ganti tema"
              style={{
                minHeight: "unset",
                minWidth: "unset",
                width: "48px",
                height: "26px",
                borderRadius: "9999px",
                background: darkMode ? "#1F2A3D" : "#E3E8EE",
                border: "1px solid var(--border-soft)",
                cursor: "pointer",
                position: "relative",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                transition: "background-color 150ms ease",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: darkMode ? "#111A2B" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: darkMode ? "translateX(22px)" : "translateX(0)",
                  transition: "transform 150ms ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                }}
              >
                {darkMode ? (
                  <Moon size={11} color="#14B8A6" />
                ) : (
                  <Sun size={11} color="#F59E0B" />
                )}
              </div>
            </button>
          )}

          {/* Notification bell — hanya setelah onboarding */}
          {showDashboard && (
            <button
              className="nt-btn-icon nt-bell-btn"
              aria-label="Notifikasi"
              style={{ position: "relative", minHeight: "unset", width: "32px", height: "32px" }}
            >
              <Bell size={15} color="var(--text-secondary)" />
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--brand)",
                  border: "1.5px solid var(--bg-surface)",
                }}
              />
            </button>
          )}

          {/* Avatar / Edit Profile — hanya setelah onboarding */}
          {showDashboard && onEditProfile && (
            <button
              onClick={onEditProfile}
              aria-label="Profil"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem 0.5rem 0.25rem 0.25rem",
                borderRadius: "var(--r-full)",
                border: "1px solid var(--border-soft)",
                background: "var(--bg-surface)",
                cursor: "pointer",
                transition: "border-color 0.15s ease",
                fontFamily: "inherit",
                minHeight: "unset",
                height: "34px",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-soft)";
              }}
            >
              <div style={{
                width: "24px", height: "24px",
                minWidth: "24px",
                borderRadius: "50%",
                background: "var(--brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6875rem", fontWeight: 700, color: "#fff",
                flexShrink: 0,
              }}>
                {userName ? userName.charAt(0).toUpperCase() : <User size={12} />}
              </div>
              <span className="nt-avatar-name" style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
              }}>
                {userName || "Profil"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar harian */}
      {showDashboard && (
        <div style={{ height: "2.5px", background: "var(--border-subtle)" }}>
          <div
            className="header-progress-bar"
            role="progressbar"
            aria-valuenow={dailyProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress harian: ${dailyProgress}%`}
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
      )}
    </header>
  );
}
