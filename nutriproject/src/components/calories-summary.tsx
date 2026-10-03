import { useEffect, useState } from "react";

interface CaloriesSummaryProps {
  current: number;
  target: number;
  remaining: number;
  hydration?: number;
  streak?: number;
  onUpdateHydration?: (newHydration: number) => void;
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

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function CaloriesSummary({ current, target, remaining }: CaloriesSummaryProps) {
  const dark = useDarkMode();
  const animCurrent = useCountUp(current);
  const animRemaining = useCountUp(remaining);

  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  let statusMessage = "Belum ada yang dicatat. Mulai dari sarapan ya.";
  if (current >= target) {
    statusMessage = "Target hari ini tercapai.";
  } else if (current > 0) {
    statusMessage = "Sudah berjalan, lanjutkan.";
  }

  /* SVG Ring calculation (diameter 88px, radius 37px, strokeWidth 7px) */
  const R = 37;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;

  return (
    <div className="nt-card compact-summary-strip animate-fade-up-1">
      <div className="summary-left-group">
        {/* Ring progress kecil diameter 88px */}
        <div
          style={{
            position: "relative",
            width: "88px",
            height: "88px",
            flexShrink: 0,
          }}
        >
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ display: "block" }}>
            <circle
              cx="44"
              cy="44"
              r={R}
              fill="none"
              stroke={dark ? "rgba(255,255,255,0.08)" : "var(--border-subtle)"}
              strokeWidth="7"
            />
            <circle
              cx="44"
              cy="44"
              r={R}
              fill="none"
              stroke="#14B8A6"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>

          {/* Angka kalori dimakan di tengah */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "2px",
            }}
          >
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {animCurrent.toLocaleString("id-ID")}
            </span>
            <span
              style={{
                fontSize: "0.625rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
                marginTop: "2px",
                lineHeight: 1,
              }}
            >
              kcal
            </span>
          </div>
        </div>

        {/* Tiga statistik sebaris di kanannya: Dimakan | Sisa | Target */}
        <div className="summary-stats-col">
          <div className="summary-stats-row">
            <div className="stat-item">
              <div className="stat-label">Dimakan</div>
              <div className="stat-val">
                {animCurrent.toLocaleString("id-ID")}{" "}
                <span className="stat-unit">kcal</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <div className="stat-label">Sisa</div>
              <div className="stat-val">
                {animRemaining.toLocaleString("id-ID")}{" "}
                <span className="stat-unit">kcal</span>
              </div>
            </div>

            <div className="stat-divider" />

            <div className="stat-item">
              <div className="stat-label">Target</div>
              <div className="stat-val">
                {target.toLocaleString("id-ID")}{" "}
                <span className="stat-unit">kcal</span>
              </div>
            </div>
          </div>

          {/* Pesan status satu kalimat (desktop) */}
          <p className="summary-status-desktop">
            {statusMessage}
          </p>
        </div>
      </div>

      {/* Pesan status satu kalimat di bawah (mobile <640px) */}
      <p className="summary-status-mobile">
        {statusMessage}
      </p>

      <style>{`
        .compact-summary-strip {
          border-radius: 8px;
          border: 1px solid var(--border-soft);
          background: var(--bg-surface);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .summary-left-group {
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
        }
        .summary-stats-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }
        .summary-stats-row {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 2px;
          font-weight: 500;
        }
        .stat-val {
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .stat-unit {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-secondary);
        }
        .stat-divider {
          width: 1px;
          height: 24px;
          background: var(--border-soft);
        }
        .summary-status-desktop {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        .summary-status-mobile {
          display: none;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        @media (max-width: 639px) {
          .compact-summary-strip {
            padding: 14px 16px;
          }
          .summary-left-group {
            gap: 16px;
          }
          .summary-stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            width: 100%;
          }
          .stat-divider {
            display: none;
          }
          .stat-val {
            font-size: 0.875rem;
          }
          .summary-status-desktop {
            display: none;
          }
          .summary-status-mobile {
            display: block;
            padding-top: 8px;
            border-top: 1px solid var(--border-subtle);
          }
        }
      `}</style>
    </div>
  );
}
