import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Plus } from "lucide-react";

interface WeightChartProps {
  data: { date: string; weight: number }[];
  currentHeight?: number;
  targetWeight?: number;
  onUpdateProgress?: (newWeight: number, newHeight: number) => void;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-soft)",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "var(--shadow-md)",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#14B8A6" }}>
        {payload[0].value}{" "}
        <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-secondary)" }}>kg</span>
      </div>
    </div>
  );
};

export function WeightChart({
  data,
  currentHeight,
  targetWeight = 70,
  onUpdateProgress,
}: WeightChartProps) {
  const start = data[0]?.weight ?? 0;
  const end = data[data.length - 1]?.weight ?? 0;
  const diffNum = Number((end - start).toFixed(1));

  let diffText = "Stabil";
  if (diffNum < 0) {
    diffText = `Turun ${Math.abs(diffNum)} kg`;
  } else if (diffNum > 0) {
    diffText = `Naik ${diffNum} kg`;
  }

  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState(currentHeight ? String(currentHeight) : "");
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    const h = parseFloat(newHeight);
    if (!isNaN(w) && !isNaN(h) && onUpdateProgress) {
      onUpdateProgress(w, h);
      setNewWeight("");
      setShowUpdateForm(false);
    }
  };

  const chartData = data.map(item => {
    let displayDate = item.date;
    if (item.date.toLowerCase().startsWith("day ")) {
      displayDate = item.date.replace(/day /i, "Hari ");
    } else {
      const parsed = Date.parse(item.date);
      if (!isNaN(parsed)) {
        displayDate = new Date(parsed).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
      }
    }
    return {
      ...item,
      displayDate,
    };
  });

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
      {/* Keterangan perubahan & periode */}
      <div
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          marginBottom: "16px",
        }}
      >
        {diffText} • 6 minggu terakhir
      </div>

      {/* Ringkasan angka: Awal / Sekarang / Target (satu baris, tanpa kotak abu-abu) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Awal
          </div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {start}{" "}
            <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "var(--text-secondary)" }}>
              kg
            </span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Sekarang
          </div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#14B8A6",
              lineHeight: 1.2,
            }}
          >
            {end}{" "}
            <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "#14B8A6" }}>
              kg
            </span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Target
          </div>
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {targetWeight}{" "}
            <span style={{ fontSize: "0.8125rem", fontWeight: 400, color: "var(--text-secondary)" }}>
              kg
            </span>
          </div>
        </div>
      </div>

      {/* Tombol utama solid teal di bawah ringkasan angka & di atas grafik */}
      {onUpdateProgress && (
        <div style={{ marginBottom: "24px" }}>
          {!showUpdateForm ? (
            <button
              type="button"
              onClick={() => setShowUpdateForm(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#14B8A6",
                color: "#FFFFFF",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0F9E8E")}
              onMouseLeave={e => (e.currentTarget.style.background = "#14B8A6")}
            >
              <Plus size={16} />
              Catat berat hari ini
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border-soft)",
                background: "var(--bg-subtle)",
                maxWidth: "480px",
              }}
            >
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Catat berat badan baru
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Contoh: 72.5"
                    value={newWeight}
                    onChange={e => setNewWeight(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "6px",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Contoh: 175"
                    value={newHeight}
                    onChange={e => setNewHeight(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid var(--border-soft)",
                      borderRadius: "6px",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#14B8A6",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-surface)",
                    color: "var(--text-secondary)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Grafik atau pesan jika data < 2 titik */}
      {data.length < 2 ? (
        <div
          style={{
            padding: "48px 16px",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "0.875rem",
            background: "var(--bg-subtle)",
            borderRadius: "8px",
            border: "1px dashed var(--border-soft)",
          }}
        >
          Grafik muncul setelah kamu mencatat berat badan minimal 2 kali.
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -10, right: 16, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="0"
                stroke="var(--border-subtle)"
                strokeWidth={1}
              />

              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={{ stroke: "var(--border-subtle)" }}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 400,
                }}
                tickMargin={10}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 1.5", "dataMax + 1.5"]}
                tick={{
                  fill: "var(--text-secondary)",
                  fontSize: 12,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 400,
                }}
                tickFormatter={val => `${val} kg`}
                width={55}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Garis target putus-putus */}
              <ReferenceLine
                y={targetWeight}
                stroke="var(--text-tertiary)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Target: ${targetWeight} kg`,
                  position: "insideTopRight",
                  fill: "var(--text-secondary)",
                  fontSize: 11,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              />

              <Area
                type="monotone"
                dataKey="weight"
                stroke="#14B8A6"
                strokeWidth={2}
                fill="url(#wGrad)"
                dot={{ fill: "#14B8A6", r: 4, strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 6, fill: "#14B8A6", stroke: "#FFFFFF", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
