import { useState } from "react";
import { X } from "lucide-react";

interface HealthInsightsProps {
  bmi?: number;
  hydration?: number;
  workout?: string;
  onToast?: (msg: string, type?: string) => void;
}

interface InsightItem {
  id: string;
  tag: string;
  title: string;
  body: string;
  action: string;
  href?: string;
}

const AI_INSIGHTS: InsightItem[] = [
  {
    id: "protein",
    tag: "Nutrisi",
    title: "Tingkatkan protein",
    body: "Kamu masih di bawah target protein harian. Coba tambahkan telur rebus, dada ayam, tempe, atau tahu pada menu makanmu.",
    action: "Lihat resep tinggi protein →",
    href: "https://cookpad.com/id/cari/masakan%20tinggi%20protein",
  },
  {
    id: "hydration",
    tag: "Hidrasi",
    title: "Minum lebih banyak air",
    body: "Minum air secara berkala sepanjang hari membantu menjaga metabolisme dan tingkat fokus kamu.",
    action: "Atur pengingat minum →",
  },
  {
    id: "consistency",
    tag: "Progress",
    title: "Konsistensi terjaga",
    body: "Kamu konsisten mencatat pola makan akhir-akhir ini. Lanjutkan kebiasaan baik ini untuk mencapai targetmu.",
    action: "Lihat statistik mingguan →",
  },
  {
    id: "recovery",
    tag: "Pemulihan",
    title: "Tips pemulihan",
    body: "Makan dalam 30 menit setelah aktivitas fisik membantu pemulihan otot. Utamakan asupan kombinasi protein dan karbohidrat.",
    action: "Lihat rekomendasi camilan →",
  },
];

export function HealthInsights({ onToast }: HealthInsightsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const visibleInsights = AI_INSIGHTS.filter(i => !dismissed.has(i.id));
  const displayedInsights = showAll ? visibleInsights : visibleInsights.slice(0, 3);
  const hasMore = visibleInsights.length > 3;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => new Set([...prev, id]));
  };

  const handleAction = (actionText: string) => {
    onToast?.(actionText.replace(" →", ""), "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      {visibleInsights.length === 0 ? (
        <div
          style={{
            padding: "40px 16px",
            textAlign: "center",
            borderRadius: "8px",
            border: "1px dashed var(--border-soft)",
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
          }}
        >
          <p style={{ margin: "0 0 12px" }}>Semua insight sudah kamu baca.</p>
          <button
            type="button"
            onClick={() => setDismissed(new Set())}
            style={{
              background: "transparent",
              border: "none",
              color: "#14B8A6",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
            }}
          >
            Tampilkan kembali insight
          </button>
        </div>
      ) : (
        displayedInsights.map(ins => (
          <div
            key={ins.id}
            className="nt-card animate-fade-up"
            style={{
              borderRadius: "8px",
              border: "1px solid var(--border-soft)",
              background: "var(--bg-surface)",
              padding: "20px",
              textAlign: "left",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Tombol tutup */}
            <button
              type="button"
              onClick={e => handleDismiss(ins.id, e)}
              aria-label="Tutup insight"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                padding: 0,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              <X size={16} />
            </button>

            {/* Kategori */}
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
                display: "block",
              }}
            >
              {ins.tag}
            </span>

            {/* Judul */}
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
                paddingRight: "28px",
                lineHeight: 1.3,
              }}
            >
              {ins.title}
            </h2>

            {/* Penjelasan */}
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {ins.body}
            </p>

            {/* Link aksi teal */}
            <div>
              {ins.href ? (
                <a
                  href={ins.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#14B8A6",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginTop: "4px",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0F9E8E")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#14B8A6")}
                >
                  {ins.action}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction(ins.action)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    color: "#14B8A6",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginTop: "4px",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0F9E8E")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#14B8A6")}
                >
                  {ins.action}
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Tombol teks "Lihat semua" jika ada lebih dari 3 */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <button
            type="button"
            onClick={() => setShowAll(prev => !prev)}
            style={{
              background: "transparent",
              border: "none",
              color: "#14B8A6",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              padding: "8px 16px",
              fontFamily: "inherit",
            }}
          >
            {showAll ? "Tampilkan lebih sedikit" : "Lihat semua"}
          </button>
        </div>
      )}
    </div>
  );
}
