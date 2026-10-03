import { useState } from "react";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import ectomorphImg from "../assets/images/body-types/ektomorf.png";
import mesomorphImg from "../assets/images/body-types/mesomorf.png";
import endomorphImg from "../assets/images/body-types/endomorf.png";

export interface UserData {
  name: string;
  weight: string;
  height: string;
  age: string;
  gender: string;
  activity: string;
  goal: string;
  bodyType: string;
}

interface UserInputFormProps {
  onGenerate: (data: UserData) => void;
}

/* ── Validasi real-time ── */
function validate(field: keyof UserData, val: string): string {
  if (!val.trim()) return "Wajib diisi";
  if (field === "age") {
    const n = Number(val);
    if (isNaN(n) || n < 5 || n > 120) return "Usia harus 5–120 tahun";
  }
  if (field === "weight") {
    const n = Number(val);
    if (isNaN(n) || n < 20 || n > 500) return "Berat harus 20–500 kg";
  }
  if (field === "height") {
    const n = Number(val);
    if (isNaN(n) || n < 50 || n > 280) return "Tinggi harus 50–280 cm";
  }
  return "";
}

/* ── Input field: label di atas input, tinggi 44px, border 1px, focus teal ring, tanpa ikon di dalam ── */
interface FieldProps {
  fieldKey: string;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (val: string) => void;
  onBlur: () => void;
}

function FormField({
  fieldKey,
  label,
  placeholder,
  type = "text",
  value,
  error,
  touched,
  onChange,
  onBlur,
}: FieldProps) {
  const hasError = touched && !!error;
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={`field-${fieldKey}`}
        style={{
          display: "block",
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: "var(--text-secondary)",
          marginBottom: "6px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </label>
      <input
        id={`field-${fieldKey}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => {
          onBlur();
          setFocused(false);
        }}
        onFocus={() => setFocused(true)}
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? `err-${fieldKey}` : undefined}
        style={{
          width: "100%",
          height: "44px",
          padding: "0 12px",
          border: `1px solid ${
            hasError
              ? "var(--danger)"
              : focused
              ? "#14B8A6"
              : "var(--border-soft)"
          }`,
          borderRadius: "6px",
          fontSize: "0.9375rem",
          fontWeight: 400,
          color: "var(--text-primary)",
          background: "var(--bg-surface)",
          fontFamily: "'Inter', sans-serif",
          outline: "none",
          boxShadow: focused
            ? "0 0 0 2px rgba(20, 184, 166, 0.25)"
            : "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          boxSizing: "border-box",
        }}
      />
      {hasError && (
        <p
          id={`err-${fieldKey}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.75rem",
            color: "var(--danger)",
            margin: "4px 0 0",
            fontWeight: 500,
          }}
          role="alert"
        >
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Static options data ── */
const GOALS = [
  {
    id: "loss",
    label: "Turunkan berat badan",
    desc: "Defisit kalori bertahap untuk kurangi lemak",
  },
  {
    id: "maintenance",
    label: "Jaga berat badan",
    desc: "Pertahankan massa dan komposisi tubuh saat ini",
  },
  {
    id: "gain",
    label: "Tambah massa otot",
    desc: "Surplus kalori terukur untuk pertumbuhan otot",
  },
];

const ACTIVITY_LEVELS = [
  {
    id: "sedentary",
    label: "Sangat jarang",
    desc: "Kerja santai, hampir tidak pernah olahraga",
  },
  {
    id: "light",
    label: "Ringan",
    desc: "Olahraga ringan 1–3 hari per minggu",
  },
  {
    id: "moderate",
    label: "Sedang",
    desc: "Olahraga teratur 3–5 hari per minggu",
  },
  {
    id: "very",
    label: "Aktif",
    desc: "Olahraga intensif 6–7 hari per minggu",
  },
  {
    id: "athlete",
    label: "Sangat aktif",
    desc: "Latihan berat 2× sehari atau kerja fisik berat",
  },
];

const BODY_TYPES = [
  {
    id: "ectomorph",
    label: "Ektomorf",
    desc: "Metabolisme cepat, cenderung ramping",
    image: ectomorphImg,
    fallbackImage: "/images/body-types/ektomorf.png",
    alt: "Ilustrasi tubuh ektomorf",
  },
  {
    id: "mesomorph",
    label: "Mesomorf",
    desc: "Atletis, mudah membangun massa otot",
    image: mesomorphImg,
    fallbackImage: "/images/body-types/mesomorf.png",
    alt: "Ilustrasi tubuh mesomorf",
  },
  {
    id: "endomorph",
    label: "Endomorf",
    desc: "Metabolisme efisien, mudah menyimpan energi",
    image: endomorphImg,
    fallbackImage: "/images/body-types/endomorf.png",
    alt: "Ilustrasi tubuh endomorf",
  },
];

const INITIAL_DATA: UserData = {
  name: "",
  weight: "",
  height: "",
  age: "",
  gender: "male",
  activity: "moderate",
  goal: "maintenance",
  bodyType: "mesomorph",
};

/* ── Select style ── */
const getSelectStyle = (focused: boolean): React.CSSProperties => ({
  width: "100%",
  height: "44px",
  padding: "0 32px 0 12px",
  border: `1px solid ${focused ? "#14B8A6" : "var(--border-soft)"}`,
  borderRadius: "6px",
  fontSize: "0.9375rem",
  fontWeight: 400,
  color: "var(--text-primary)",
  background: "var(--bg-surface)",
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'%3E%3Cpath d='M3 5L7 9L11 5' stroke='%238A97AB' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  cursor: "pointer",
  boxShadow: focused ? "0 0 0 2px rgba(20, 184, 166, 0.25)" : "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
  boxSizing: "border-box",
});

/* ── Nutrition Facts Card (Label Nilai Gizi) ── */
interface NutritionFactsProps {
  data: UserData;
}

function NutritionFactsCard({ data }: NutritionFactsProps) {
  const w = parseFloat(data.weight);
  const h = parseFloat(data.height);
  const a = parseFloat(data.age);
  const isComplete =
    !isNaN(w) &&
    w >= 20 &&
    w <= 500 &&
    !isNaN(h) &&
    h >= 50 &&
    h <= 280 &&
    !isNaN(a) &&
    a >= 5 &&
    a <= 120 &&
    !!data.gender;

  let bmr: number | null = null;
  let calories: number | null = null;
  let protein: number | null = null;
  let carbs: number | null = null;
  let fat: number | null = null;

  if (isComplete) {
    const isMale = data.gender === "male";
    // Mifflin-St Jeor: 10 * w + 6.25 * h - 5 * a + (isMale ? 5 : -161)
    const bmrRaw = 10 * w + 6.25 * h - 5 * a + (isMale ? 5 : -161);
    bmr = Math.round(bmrRaw);

    let factor = 1.55; // moderate default
    if (data.activity === "sedentary") factor = 1.2;
    else if (data.activity === "light") factor = 1.375;
    else if (data.activity === "moderate") factor = 1.55;
    else if (data.activity === "very") factor = 1.725;
    else if (data.activity === "athlete") factor = 1.9;

    let target = Math.round(bmrRaw * factor);
    if (data.goal === "loss") target -= 500;
    else if (data.goal === "gain") target += 300;
    target = Math.max(target, 1200);

    calories = target;
    protein = Math.round((target * 0.30) / 4);
    carbs = Math.round((target * 0.45) / 4);
    fat = Math.round((target * 0.25) / 9);
  }

  return (
    <div
      className="nutrition-facts-card"
      style={{
        border: "2px solid var(--border-medium)",
        borderRadius: "6px",
        background: "var(--bg-surface)",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      {/* Title */}
      <div>
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1.375rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Estimasi harian
        </h2>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            margin: "4px 0 0",
            lineHeight: 1.4,
          }}
        >
          Kebutuhan energi & makronutrisi harian
        </p>
      </div>

      {/* Garis pemisah tebal 7px */}
      <div
        style={{
          height: "7px",
          background: "var(--text-primary)",
          margin: "12px 0 6px",
        }}
      />

      {/* BMR Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "6px 0",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          BMR (Metabolisme Dasar)
        </span>
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Inter', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {bmr !== null ? `${bmr.toLocaleString("id-ID")} kkal` : "—"}
        </span>
      </div>

      {/* Calories Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "8px 0",
        }}
      >
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Kebutuhan Kalori
        </span>
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "'Inter', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {calories !== null ? `${calories.toLocaleString("id-ID")} kkal` : "—"}
        </span>
      </div>

      {/* Garis pemisah tebal 5px */}
      <div
        style={{
          height: "5px",
          background: "var(--text-primary)",
          margin: "6px 0 8px",
        }}
      />

      {/* Makro Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "4px 0",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Target Makronutrisi
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          Target Harian
        </span>
      </div>

      {/* Protein Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "6px 0",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--text-primary)",
            fontWeight: 500,
          }}
        >
          Protein (30%)
        </span>
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Inter', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {protein !== null ? `${protein} g` : "—"}
        </span>
      </div>

      {/* Carbs Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "6px 0",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--text-primary)",
            fontWeight: 500,
          }}
        >
          Karbohidrat (45%)
        </span>
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Inter', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {carbs !== null ? `${carbs} g` : "—"}
        </span>
      </div>

      {/* Fat Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "6px 0",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            color: "var(--text-primary)",
            fontWeight: 500,
          }}
        >
          Lemak (25%)
        </span>
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontFamily: "'Inter', sans-serif",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fat !== null ? `${fat} g` : "—"}
        </span>
      </div>

      {/* 3-segment flat macro bar: 8px height, 0 radius, teal first, two blue-gray derived */}
      <div
        style={{
          height: "8px",
          width: "100%",
          display: "flex",
          marginTop: "12px",
          marginBottom: "8px",
          background: "var(--border-soft)",
          borderRadius: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            width: "30%",
            height: "100%",
            background: isComplete ? "#14B8A6" : "var(--border-medium)",
            transition: "background-color 150ms ease",
          }}
          title="Protein: 30%"
        />
        <div
          style={{
            width: "45%",
            height: "100%",
            background: isComplete ? "var(--carbs)" : "var(--border-soft)",
            transition: "background-color 150ms ease",
          }}
          title="Karbohidrat: 45%"
        />
        <div
          style={{
            width: "25%",
            height: "100%",
            background: isComplete ? "var(--fat)" : "var(--border-subtle)",
            transition: "background-color 150ms ease",
          }}
          title="Lemak: 25%"
        />
      </div>

      {/* Legend under macro bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.6875rem",
          color: "var(--text-secondary)",
          marginBottom: "12px",
          fontFamily: "'Inter', sans-serif",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              background: isComplete ? "#14B8A6" : "var(--border-medium)",
              display: "inline-block",
            }}
          />
          Protein 30%
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              background: isComplete ? "var(--carbs)" : "var(--border-soft)",
              display: "inline-block",
            }}
          />
          Karbo 45%
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              background: isComplete ? "var(--fat)" : "var(--border-subtle)",
              display: "inline-block",
            }}
          />
          Lemak 25%
        </span>
      </div>

      {/* Footnote divider */}
      <div
        style={{
          height: "2px",
          background: "var(--border-soft)",
          marginBottom: "8px",
        }}
      />

      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-tertiary)",
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {isComplete
          ? "Dihitung otomatis dengan formula Mifflin-St Jeor berdasarkan data kamu."
          : "Isi data fisik di samping untuk melihat estimasi kebutuhan kamu."}
      </p>
    </div>
  );
}

export function UserInputForm({ onGenerate }: UserInputFormProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<UserData>(INITIAL_DATA);
  const [touched, setTouched] = useState<Partial<Record<keyof UserData, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [genderFocused, setGenderFocused] = useState(false);
  const [activityFocused, setActivityFocused] = useState(false);

  const set = (field: keyof UserData, val: string) => {
    setData(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validate(field, val) }));
    }
  };

  const touch = (field: keyof UserData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, data[field] as string) }));
  };

  const goTo = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isStep1Valid = !!(
    data.name &&
    data.weight &&
    data.height &&
    data.age &&
    !validate("name", data.name) &&
    !validate("weight", data.weight) &&
    !validate("height", data.height) &&
    !validate("age", data.age)
  );

  const handleStep1Continue = () => {
    const fields: (keyof UserData)[] = ["name", "weight", "height", "age"];
    const newTouched: Partial<Record<keyof UserData, boolean>> = {};
    const newErrors: Partial<Record<keyof UserData, string>> = {};
    fields.forEach(f => {
      newTouched[f] = true;
      newErrors[f] = validate(f, data[f] as string);
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    if (isStep1Valid) goTo(2);
  };

  return (
    <div
      className="nt-dot-grid"
      style={{
        minHeight: "calc(100vh - 68px)",
        width: "100%",
        boxSizing: "border-box",
        padding: "40px 16px 64px",
      }}
    >
      <div
        className="onboarding-layout"
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* ── Left Column: Form (max-width 440px) ── */}
        <div
          className="onboarding-form-col"
          style={{
            flex: 1,
            maxWidth: "440px",
            width: "100%",
          }}
        >
          {/* Progress langkah: 3 segmen tipis seperti bar makro */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Langkah {step} dari 3
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text-tertiary)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {step === 1
                  ? "Data fisik"
                  : step === 2
                  ? "Tujuan & aktivitas"
                  : "Tipe tubuh"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "6px", width: "100%" }}>
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: "#14B8A6",
                  borderRadius: 0,
                  transition: "background-color 150ms ease",
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: step >= 2 ? "#14B8A6" : "var(--border-soft)",
                  borderRadius: 0,
                  transition: "background-color 150ms ease",
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: step >= 3 ? "#14B8A6" : "var(--border-soft)",
                  borderRadius: 0,
                  transition: "background-color 150ms ease",
                }}
              />
            </div>
          </div>

          {/* ══ STEP 1: Info Pribadi ══ */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.25,
                    margin: "0 0 8px",
                  }}
                >
                  Ceritain dulu tentang kamu
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    margin: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Data ini dibutuhkan untuk menghitung kebutuhan kalori harian kamu
                  secara akurat.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <FormField
                  fieldKey="name"
                  label="Nama kamu"
                  placeholder="mis. Budi Santoso"
                  value={data.name}
                  error={errors.name}
                  touched={touched.name}
                  onChange={v => set("name", v)}
                  onBlur={() => touch("name")}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                  className="step-form-grid"
                >
                  <FormField
                    fieldKey="weight"
                    label="Berat badan (kg)"
                    placeholder="70"
                    type="number"
                    value={data.weight}
                    error={errors.weight}
                    touched={touched.weight}
                    onChange={v => set("weight", v)}
                    onBlur={() => touch("weight")}
                  />
                  <FormField
                    fieldKey="height"
                    label="Tinggi badan (cm)"
                    placeholder="175"
                    type="number"
                    value={data.height}
                    error={errors.height}
                    touched={touched.height}
                    onChange={v => set("height", v)}
                    onBlur={() => touch("height")}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                  className="step-form-grid"
                >
                  <FormField
                    fieldKey="age"
                    label="Usia"
                    placeholder="25"
                    type="number"
                    value={data.age}
                    error={errors.age}
                    touched={touched.age}
                    onChange={v => set("age", v)}
                    onBlur={() => touch("age")}
                  />
                  <div>
                    <label
                      htmlFor="field-gender"
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                        marginBottom: "6px",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Jenis kelamin
                    </label>
                    <select
                      id="field-gender"
                      value={data.gender}
                      onChange={e => set("gender", e.target.value)}
                      onFocus={() => setGenderFocused(true)}
                      onBlur={() => setGenderFocused(false)}
                      style={getSelectStyle(genderFocused)}
                    >
                      <option value="male">Laki-laki</option>
                      <option value="female">Perempuan</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  id="btn-step1-lanjut"
                  onClick={handleStep1Continue}
                  style={{
                    width: "100%",
                    height: "44px",
                    background: "#14B8A6",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background-color 150ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#0F9E8E";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#14B8A6";
                  }}
                >
                  Lanjut <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Tujuan & Aktivitas ══ */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.25,
                    margin: "0 0 8px",
                  }}
                >
                  Tujuan & aktivitas kamu
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    margin: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Membantu kami menentukan target kalori dan laju perubahan berat
                  badan kamu.
                </p>
              </div>

              {/* Goal cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {GOALS.map(g => {
                  const selected = data.goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      id={`goal-${g.id}`}
                      onClick={() => set("goal", g.id)}
                      aria-pressed={selected}
                      style={{
                        border: `1px solid ${
                          selected ? "#14B8A6" : "var(--border-soft)"
                        }`,
                        borderRadius: "6px",
                        background: selected
                          ? "var(--brand-light)"
                          : "var(--bg-surface)",
                        padding: "12px 14px",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition:
                          "border-color 150ms ease, background-color 150ms ease",
                        boxSizing: "border-box",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginBottom: "2px",
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {g.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            fontWeight: 400,
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          {g.desc}
                        </div>
                      </div>
                      {selected && (
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "#14B8A6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Check size={11} color="#FFFFFF" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Activity level */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="field-activity"
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Tingkat aktivitas fisik
                </label>
                <select
                  id="field-activity"
                  value={data.activity}
                  onChange={e => set("activity", e.target.value)}
                  onFocus={() => setActivityFocused(true)}
                  onBlur={() => setActivityFocused(false)}
                  style={getSelectStyle(activityFocused)}
                >
                  {ACTIVITY_LEVELS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {a.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  id="btn-step2-kembali"
                  onClick={() => goTo(1)}
                  style={{
                    flex: 1,
                    height: "44px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition:
                      "background-color 150ms ease, color 150ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--bg-subtle)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  id="btn-step2-lanjut"
                  onClick={() => goTo(3)}
                  style={{
                    flex: 2,
                    height: "44px",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    background: "#14B8A6",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background-color 150ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#0F9E8E";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#14B8A6";
                  }}
                >
                  Lanjut <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Tipe Tubuh ══ */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.75rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.25,
                    margin: "0 0 8px",
                  }}
                >
                  Tipe tubuh kamu
                </h1>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    margin: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Membantu kalibrasi target nutrisi yang lebih pas buat
                  metabolisme kamu.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  marginBottom: "20px",
                }}
                className="body-3-grid"
                role="radiogroup"
                aria-label="Tipe tubuh"
              >
                {BODY_TYPES.map(bt => {
                  const selected = data.bodyType === bt.id;
                  return (
                    <button
                      key={bt.id}
                      type="button"
                      id={`body-${bt.id}`}
                      onClick={() => set("bodyType", bt.id)}
                      role="radio"
                      aria-checked={selected}
                      style={{
                        position: "relative",
                        border: `1px solid ${
                          selected ? "#14B8A6" : "var(--border-soft)"
                        }`,
                        borderRadius: "6px",
                        background: selected
                          ? "var(--brand-light)"
                          : "var(--bg-surface)",
                        padding: "14px 8px",
                        textAlign: "center",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        transition:
                          "border-color 150ms ease, background-color 150ms ease",
                        boxSizing: "border-box",
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: "#14B8A6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={10} color="#FFFFFF" strokeWidth={3} />
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                          width: "100%",
                          height: "160px",
                        }}
                      >
                        <img
                          src={bt.image}
                          alt={bt.alt}
                          className="body-type-img"
                          loading="eager"
                          draggable={false}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== window.location.origin + bt.fallbackImage) {
                              target.src = bt.fallbackImage;
                            }
                          }}
                          style={{
                            height: "100%",
                            maxHeight: "160px",
                            maxWidth: "100%",
                            objectFit: "contain",
                            display: "block",
                            margin: "0 auto",
                            transition: "transform 200ms ease, filter 200ms ease",
                            filter: selected
                              ? "drop-shadow(0 4px 10px rgba(20, 184, 166, 0.4))"
                              : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))",
                            transform: selected ? "scale(1.04)" : "scale(1)",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: selected ? "#14B8A6" : "var(--text-primary)",
                          marginBottom: "3px",
                        }}
                      >
                        {bt.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-secondary)",
                          fontWeight: 400,
                          lineHeight: 1.35,
                        }}
                      >
                        {bt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Privacy note */}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  marginBottom: "20px",
                  lineHeight: 1.45,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                🔒 Semua data tersimpan di perangkat kamu dan tidak dikirim ke server mana pun.
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  id="btn-step3-kembali"
                  onClick={() => goTo(2)}
                  style={{
                    flex: 1,
                    height: "44px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition:
                      "background-color 150ms ease, color 150ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--bg-subtle)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  id="btn-buat-rencana"
                  onClick={() => onGenerate(data)}
                  style={{
                    flex: 2,
                    height: "44px",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    background: "#14B8A6",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background-color 150ms ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#0F9E8E";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#14B8A6";
                  }}
                >
                  Buat rencana makan <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Nutrition Facts Card (max-width 360px, sticky) ── */}
        <div
          className="onboarding-facts-col"
          style={{
            width: "360px",
            flexShrink: 0,
            position: "sticky",
            top: "88px",
          }}
        >
          <NutritionFactsCard data={data} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .onboarding-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 24px !important;
          }
          .onboarding-form-col {
            max-width: 100% !important;
          }
          .onboarding-facts-col {
            width: 100% !important;
            max-width: 440px !important;
            position: static !important;
            margin-top: 8px;
          }
        }
        .body-type-img {
          height: 160px;
          object-fit: contain;
        }
        @media (max-width: 640px) {
          .body-type-img {
            height: 128px !important;
          }
        }
        @media (max-width: 480px) {
          .step-form-grid {
            grid-template-columns: 1fr !important;
          }
          .body-3-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
