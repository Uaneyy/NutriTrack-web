// ===== STATE =====
let dataBerat = JSON.parse(localStorage.getItem("dataBerat")) || [];
let chart;
let targetAirL = 0;
let currentAirML = 0;

// ===== PROFILE AUTO-SAVE =====
function saveProfile() {
  let profile = {
    b: el("berat").value,
    t: el("tinggi").value,
    u: el("umur").value,
    g: el("gender").value,
    a: el("aktivitas").value,
    tipeTubuh: el("tipe-tubuh").value,
    statusPek: el("status").value,
    target: document.querySelector('input[name="target"]:checked') ? document.querySelector('input[name="target"]:checked').value : "turun"
  };
  localStorage.setItem("userProfile", JSON.stringify(profile));
}

function loadProfile() {
  let p = JSON.parse(localStorage.getItem("userProfile"));
  if(p) {
    el("berat").value = p.b;
    el("tinggi").value = p.t;
    el("umur").value = p.u;
    el("gender").value = p.g;
    el("aktivitas").value = p.a;
    if(el("status")) el("status").value = p.statusPek || "umum";
    let targetRadio = document.querySelector(`input[name="target"][value="${p.target}"]`);
    if (targetRadio) targetRadio.checked = true;
    if(p.tipeTubuh) selectBodyType(p.tipeTubuh);
  }
}

// ===== BODY TYPE =====
function selectBodyType(valOrEl) {
  let cards = document.querySelectorAll('.body-type-card');
  let selectedValue = "";
  
  if (typeof valOrEl === 'string') {
    selectedValue = valOrEl;
    cards.forEach(c => {
      if (c.getAttribute('data-value') === selectedValue) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  } else {
    cards.forEach(c => c.classList.remove('active'));
    valOrEl.classList.add('active');
    selectedValue = valOrEl.getAttribute('data-value');
  }
  
  let inputEl = el("tipe-tubuh");
  if(inputEl) inputEl.value = selectedValue;
}

// ===== STREAK =====
function updateStreak() {
  let today = new Date();
  let todayStr = today.getFullYear() + "-" + (today.getMonth()+1) + "-" + today.getDate();
  
  let streakData = JSON.parse(localStorage.getItem("streakData")) || { count: 0, lastDate: null };
  
  if (streakData.lastDate === todayStr) {
    // Already logged today
  } else {
    if (streakData.lastDate) {
      let yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let yesterdayStr = yesterday.getFullYear() + "-" + (yesterday.getMonth()+1) + "-" + yesterday.getDate();
      
      if (streakData.lastDate === yesterdayStr) {
        streakData.count++;
      } else {
        streakData.count = 1;
      }
    } else {
      streakData.count = 1;
    }
    streakData.lastDate = todayStr;
    localStorage.setItem("streakData", JSON.stringify(streakData));
  }
  
  let badge = document.getElementById("streakBadge");
  if (badge) {
    badge.innerHTML = `🔥 ${streakData.count} Day${streakData.count > 1 ? 's' : ''}`;
    if (streakData.count > 0) {
      badge.classList.add("active");
    }
  }
}

// ===== TOAST NOTIFICATION =====
function showToast(msg, type="error") {
  let container = el("toast-container");
  if(!container) return;
  
  let toast = document.createElement("div");
  toast.className = `toast ${type}`;
  let icon = type === "error" ? "⚠" : "✨";
  toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("closing");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
}

// ===== DYNAMIC TIPS =====
const tipsDatabase = [
  "Minum segelas air putih sebelum makan bisa membantumu merasa lebih kenyang.",
  "Tidur kurang dari 7 jam dapat mengganggu metabolisme dan membuat cepat lapar.",
  "Tubuh membutuhkan lebih banyak energi untuk mencerna protein dibanding karbohidrat.",
  "Stres kronis memicu hormon kortisol yang dapat meningkatkan penumpukan lemak.",
  "Makan perlahan memberikan waktu bagi otak untuk menerima sinyal kenyang.",
  "Jalan kaki santai 15 menit setelah makan sangat membantu menstabilkan gula darah."
];

function loadRandomTip() {
  let tipEl = el("tipsText");
  if(tipEl) {
    let randomTip = tipsDatabase[Math.floor(Math.random() * tipsDatabase.length)];
    tipEl.innerText = randomTip;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  updateStreak();
  loadRandomTip();
});

// ===== UTIL =====
function el(id){ return document.getElementById(id); }
function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// ===== HITUNG =====
function hitungKalori(b,t,u,g,a,target){
  let bmr = (g==="pria") ? 10*b+6.25*t-5*u+5 : 10*b+6.25*t-5*u-161;
  let faktor={rendah:1.2,sedang:1.55,tinggi:1.725};
  let tdee=bmr*faktor[a];
  if(target==="turun") tdee-=300;
  if(target==="naik") tdee+=300;
  return Math.round(tdee);
}

function hitungIdeal(t,g){
  let d=t-100;
  return g==="pria"?d-(0.1*d):d-(0.15*d);
}

function getOlahraga(tipe, target) {
  if (tipe === "ectomorph") {
    return target === "naik" ? "Fokus Latihan Beban (Hypertrophy), Kurangi Kardio" : "Latihan Beban Ringan & Istirahat Cukup";
  } else if (tipe === "endomorph") {
    return target === "turun" ? "Kardio, HIIT & Latihan Beban" : "Kardio Rutin & Latihan Beban Terkontrol";
  } else {
    return "Kombinasi Seimbang Beban & Kardio";
  }
}

// ===== SMART MENU DATABASE =====
const smartMenuDB = [
  // SARAPAN - TURUN
  { w: "sarapan", t: ["turun", "umum", "ectomorph", "mesomorph"], n: "Oatmeal (5 sdm) + Susu Almond (1 gelas) + Pisang (1 buah)" },
  { w: "sarapan", t: ["turun", "umum", "endomorph"], n: "Telur Rebus (2 btr) + Sayur Bayam" },
  { w: "sarapan", t: ["turun", "mahasiswa", "ectomorph", "mesomorph"], n: "Roti Gandum (2 iris) + Selai Kacang" },
  { w: "sarapan", t: ["turun", "mahasiswa", "endomorph"], n: "Omelet Putih Telur + Tomat" },
  { w: "sarapan", t: ["turun", "mahasiswa", "umum", "ectomorph", "mesomorph", "endomorph"], n: "Pisang (1-2 buah) + Teh Hijau Tawar" },

  // SARAPAN - NAIK
  { w: "sarapan", t: ["naik", "umum", "ectomorph", "mesomorph"], n: "Nasi Kuning + Ayam Suwir + Telur Bulat" },
  { w: "sarapan", t: ["naik", "umum", "endomorph"], n: "Roti Gandum + Dada Ayam + Keju" },
  { w: "sarapan", t: ["naik", "mahasiswa", "ectomorph", "mesomorph"], n: "Nasi Uduk Porsi Besar + Gorengan + Telur" },
  { w: "sarapan", t: ["naik", "mahasiswa", "endomorph"], n: "Lontong Sayur + Telur Rebus (Hindari Gorengan)" },
  
  // SIANG - TURUN
  { w: "siang", t: ["turun", "umum", "ectomorph", "mesomorph"], n: "Nasi Merah (½ porsi) + Dada Ayam Bakar + Brokoli" },
  { w: "siang", t: ["turun", "umum", "endomorph"], n: "Salad Ayam (1 mangkuk penuh) + Minyak Zaitun + Telur Rebus (1 btr)" },
  { w: "siang", t: ["turun", "mahasiswa", "ectomorph", "mesomorph"], n: "Nasi Putih (½ porsi) + Tahu Tempe Bacem + Sayur Sop" },
  { w: "siang", t: ["turun", "mahasiswa", "endomorph"], n: "Ayam Sayur (Tanpa Nasi/Nasi 2 Sendok) + Kangkung" },
  { w: "siang", t: ["turun", "mahasiswa", "umum", "ectomorph", "mesomorph", "endomorph"], n: "Gado-Gado (Bumbu Kacang Sedikit) + Telur Rebus" },

  // SIANG - NAIK
  { w: "siang", t: ["naik", "umum", "ectomorph", "mesomorph"], n: "Nasi Putih (Porsi Besar) + Ayam Penyet + Tempe Mendoan" },
  { w: "siang", t: ["naik", "umum", "endomorph"], n: "Nasi Merah (1 porsi) + Sapi Panggang/Lada Hitam + Buncis" },
  { w: "siang", t: ["naik", "mahasiswa", "ectomorph", "mesomorph"], n: "Nasi Padang (Kuah Banyak) + Ayam Rendang/Gulai" },
  { w: "siang", t: ["naik", "mahasiswa", "endomorph"], n: "Nasi Rames (1 porsi) + Telur Dadar + Sayur Nangka" },
  
  // MALAM - TURUN
  { w: "malam", t: ["turun", "umum", "ectomorph", "mesomorph"], n: "Ikan Bakar + Tumis Buncis + Nasi Merah (Sedikit)" },
  { w: "malam", t: ["turun", "umum", "endomorph"], n: "Dada Ayam Rebus/Panggang + Salad Tomat" },
  { w: "malam", t: ["turun", "mahasiswa", "ectomorph", "mesomorph"], n: "Telur Rebus (2 btr) + Sup Makaroni Sayur" },
  { w: "malam", t: ["turun", "mahasiswa", "endomorph"], n: "Tahu Tempe Bakar/Rebus + Tumis Sawi" },
  { w: "malam", t: ["turun", "mahasiswa", "umum", "ectomorph", "mesomorph", "endomorph"], n: "Buah-buahan (Apel/Pepaya) + Yoghurt Tawar" },

  // MALAM - NAIK
  { w: "malam", t: ["naik", "umum", "ectomorph", "mesomorph"], n: "Spaghetti Bolognese / Pasta + Daging Cincang" },
  { w: "malam", t: ["naik", "umum", "endomorph"], n: "Soto Ayam + Nasi Putih + Tempe Goreng" },
  { w: "malam", t: ["naik", "mahasiswa", "ectomorph", "mesomorph"], n: "Nasi Goreng Spesial + Telur Ceplok + Kerupuk" },
  { w: "malam", t: ["naik", "mahasiswa", "endomorph"], n: "Pecel Lele (Minta Jangan Terlalu Kering) + Nasi Putih" },
  { w: "malam", t: ["naik", "mahasiswa", "umum", "ectomorph", "mesomorph", "endomorph"], n: "Mie Kuah Isi Telur & Sayur (Porsi Double)" },
];

function filterMeals(waktu, target, statusPek, tipeTubuh) {
  let matches = smartMenuDB.filter(m => {
    if (m.w !== waktu) return false;
    return m.t.includes(target) && m.t.includes(statusPek) && m.t.includes(tipeTubuh);
  });
  
  if(matches.length === 0) {
    matches = smartMenuDB.filter(m => m.w === waktu && m.t.includes(target) && m.t.includes(statusPek));
  }
  if(matches.length === 0) {
    matches = smartMenuDB.filter(m => m.w === waktu && m.t.includes(target));
  }
  
  return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)].n : "Menu Sehat Kombinasi";
}

function generateMenu(g,target,a,statusPek,tipeTubuh){
  let sarapan = filterMeals("sarapan", target, statusPek, tipeTubuh);
  let siang   = filterMeals("siang", target, statusPek, tipeTubuh);
  let malam   = filterMeals("malam", target, statusPek, tipeTubuh);
  
  let aktivitas="Normal";
  if(a==="rendah") aktivitas="Ringan";
  if(a==="tinggi") aktivitas="Berat (tambah porsi)";
  
  let mod = "Pola Seimbang";
  if(tipeTubuh === "ectomorph") mod = "Extra Karbo & Protein Murni";
  else if(tipeTubuh === "endomorph") mod = "Rendah Karbo Jahat & Lemak";
  else mod = "Porsi Proporsional & Protein Sedang";
  
  if (statusPek === "mahasiswa") mod += " (Versi Hemat Anak Kos)";
  
  return {sarapan,siang,malam,mod,aktivitas};
}

// ===== NAVIGATION =====
function kembali() {
  el("screen-result").classList.add("hidden");
  el("screen-input").classList.remove("hidden");
}

// ===== PROSES =====
function proses(){
  let b=+el("berat").value;
  let t=+el("tinggi").value;
  let u=+el("umur").value;

  if(!b||!t||!u){
    showToast("Isi semua data dulu ya!");
    return;
  }

  saveProfile();

  // Tampilkan Loading
  let loOverlay = el("loadingOverlay");
  if(loOverlay) loOverlay.classList.remove("hidden");

  // Simulasi Cinematic Loading
  let loStep = el("loStep");
  let loCounter = el("loCounter");
  let loBar = el("loBar");
  
  if (loStep) loStep.innerText = "Menghitung BMR & TDEE...";
  if (loCounter) loCounter.innerText = "0%";
  if (loBar) loBar.style.width = "0%";

  setTimeout(() => {
    if (loStep) loStep.innerText = "Menganalisis Tipe Tubuh...";
    if (loCounter) loCounter.innerText = "45%";
    if (loBar) loBar.style.width = "45%";
  }, 500);

  setTimeout(() => {
    if (loStep) loStep.innerText = "Menyusun Menu Makanan...";
    if (loCounter) loCounter.innerText = "85%";
    if (loBar) loBar.style.width = "85%";
  }, 1000);

  setTimeout(() => {
    if (loCounter) loCounter.innerText = "100%";
    if (loBar) loBar.style.width = "100%";
    
    // Pindah Layar
    el("screen-input").classList.add("hidden");
    el("screen-result").classList.remove("hidden");

    let g=el("gender").value;
    let a=el("aktivitas").value;
    let tipeTubuh=el("tipe-tubuh").value;
    let statusPek=el("status").value;
    let target=document.querySelector('input[name="target"]:checked').value;

    let ideal=hitungIdeal(t,g);

    if(b<ideal && target==="turun"){
      tampilError("Berat kamu sudah di bawah ideal, tidak perlu turun lagi.");
      return;
    }

    if(b>ideal && target==="naik"){
      tampilError("Berat kamu sudah di atas ideal, tidak perlu naik lagi.");
      return;
    }

    let kal=hitungKalori(b,t,u,g,a,target);
    let menu=generateMenu(g,target,a,statusPek,tipeTubuh);
    
    // Perhitungan Makro
    let pro = a === "tinggi" || tipeTubuh === "ectomorph" ? b * 2 : b * 1.5;
    let lem = (kal * 0.25) / 9;
    let kar = (kal - (pro*4) - (lem*9)) / 4;
    pro = Math.round(pro);
    lem = Math.round(lem);
    kar = Math.round(kar);
    
    // Perhitungan Skor & Air
    let bmi = b / ((t/100)*(t/100));
    let skor = 100;
    let skorDesc = "Sangat Baik";
    let skorClass = "";
    if (bmi < 18.5) { skor = 75; skorDesc = "Kurang Berat"; skorClass = "warning"; }
    else if (bmi >= 25 && bmi < 29.9) { skor = 80; skorDesc = "Kelebihan Berat"; skorClass = "warning"; }
    else if (bmi >= 30) { skor = 60; skorDesc = "Obesitas"; skorClass = "warning"; }
    
    let air = (b * 35 / 1000).toFixed(1);
    targetAirL = parseFloat(air);
    currentAirML = 0;
    let targetAirML = targetAirL * 1000;
    
    let olahraga = getOlahraga(tipeTubuh, target);

    dataBerat.push(b);
    localStorage.setItem("dataBerat",JSON.stringify(dataBerat));

    updateChart();
    if(loOverlay) loOverlay.classList.add("hidden");
    el("chartEmpty").style.display = "none";

    let dashOffset = 188 - (188 * skor) / 100; // For SVG ring: 2*pi*r where r=30 is ~188

    el("hasil").innerHTML = `
      <div class="section-label" style="margin-bottom:12px; margin-left:4px;">HASIL ANALISIS</div>
      <div class="hasil-card glass-panel">
        
        <div class="score-banner">
          <div class="score-ring-wrap">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle class="score-ring-bg" cx="36" cy="36" r="30" fill="none" stroke-width="5"/>
              <circle class="score-ring-fill ${skorClass}" cx="36" cy="36" r="30" fill="none" stroke-width="5" stroke-dasharray="188" stroke-dashoffset="${dashOffset}"/>
            </svg>
            <div class="score-number ${skorClass}">${skor}</div>
          </div>
          <div class="score-text">
            <div class="score-lbl">BODY SCORE</div>
            <div class="score-desc">${skorDesc}</div>
            <div class="score-bmi">BMI: ${bmi.toFixed(1)}</div>
          </div>
          <div class="ideal-pill">
            <div class="val">${ideal.toFixed(1)}</div>
            <div class="lbl">IDEAL (KG)</div>
          </div>
        </div>

        <div class="macro-strip">
          <div class="macro-cell kal-cell">
            <div class="macro-lbl">KALORI</div>
            <div class="macro-val kal">${kal.toLocaleString('id')}</div>
          </div>
          <div class="macro-cell">
            <div class="macro-lbl">PROTEIN</div>
            <div class="macro-val pro">${pro}g</div>
          </div>
          <div class="macro-cell">
            <div class="macro-lbl">KARBO</div>
            <div class="macro-val kar">${kar}g</div>
          </div>
          <div class="macro-cell">
            <div class="macro-lbl">LEMAK</div>
            <div class="macro-val lem">${lem}g</div>
          </div>
        </div>

        <div class="hasil-body">
          <div class="olahraga-card glass-subpanel">
            <div class="olahraga-icon">🔥</div>
            <div>
              <div class="section-inner" style="margin-bottom:4px; color:var(--accent); font-size:8px;">REKOMENDASI LATIHAN</div>
              <div class="olahraga-text">${olahraga}</div>
            </div>
          </div>
          
          <div class="water-tracker glass-subpanel">
            <div class="water-header">
              <div class="water-title">💧 Target Air Harian</div>
              <div class="water-status" id="water-status-text">0ml / ${targetAirML}ml</div>
            </div>
            <div class="water-bar-wrap">
              <div class="water-fill" id="water-fill"></div>
            </div>
            <button class="btn-water" onclick="tambahAir()">+ Tambah 250ml</button>
          </div>

          <div class="section-inner" style="margin-top:20px; font-size:9px;">RENCANA MAKAN & JADWAL</div>
          <div class="meal-list">
            <div class="meal-item glass-subpanel">
              <div class="meal-time">🌅</div>
              <div class="meal-info">
                <div class="meal-when">07:00 - SARAPAN</div>
                <div class="meal-food">${menu.sarapan}</div>
                <div class="meal-portion" style="font-size:9px; color:var(--accent2); margin-top:4px; opacity: 0.9;">
                  🎯 Estimasi Takaran: ~${Math.round(kar/3)}g Karbo, ~${Math.round(pro/3)}g Protein, ~${Math.round(lem/3)}g Lemak
                </div>
              </div>
            </div>
            <div class="meal-item glass-subpanel">
              <div class="meal-time">🌞</div>
              <div class="meal-info">
                <div class="meal-when">12:30 - MAKAN SIANG</div>
                <div class="meal-food">${menu.siang}</div>
                <div class="meal-portion" style="font-size:9px; color:var(--accent2); margin-top:4px; opacity: 0.9;">
                  🎯 Estimasi Takaran: ~${Math.round(kar/3)}g Karbo, ~${Math.round(pro/3)}g Protein, ~${Math.round(lem/3)}g Lemak
                </div>
              </div>
            </div>
            <div class="meal-item glass-subpanel">
              <div class="meal-time">🌙</div>
              <div class="meal-info">
                <div class="meal-when">19:00 - MAKAN MALAM</div>
                <div class="meal-food">${menu.malam}</div>
                <div class="meal-portion" style="font-size:9px; color:var(--accent2); margin-top:4px; opacity: 0.9;">
                  🎯 Estimasi Takaran: ~${Math.round(kar/3)}g Karbo, ~${Math.round(pro/3)}g Protein, ~${Math.round(lem/3)}g Lemak
                </div>
              </div>
            </div>
          </div>
          
          <div class="tags-row" style="margin-top:16px;">
            <span class="tag green glow-tag">✦ ${menu.mod}</span>
            <span class="tag glow-tag">⚡ Aktivitas: ${menu.aktivitas}</span>
          </div>
        </div>
      </div>
    `;
  }, 1500);
}

// ===== ERROR =====
function tampilError(msg){
  el("screen-input").classList.add("hidden");
  el("screen-result").classList.remove("hidden");
  let loOverlay = el("loadingOverlay");
  if(loOverlay) loOverlay.classList.add("hidden");
  el("hasil").innerHTML = `
    <div class="error-card">
      <span>⚠</span> ${msg}
    </div>
  `;
}

// ===== CHART =====
function updateChart(){
  let ctx = el("chart");
  if(chart) chart.destroy();

  if(dataBerat.length === 0) return;

  chart = new Chart(ctx,{
    type:"line",
    data:{
      labels: dataBerat.map((_,i)=>`Day ${i+1}`),
      datasets:[{
        label:"Berat (kg)",
        data: dataBerat,
        borderColor: "#4ade80",
        backgroundColor: "rgba(74,222,128,0.06)",
        borderWidth: 2,
        pointBackgroundColor: "#4ade80",
        pointBorderColor: "#080c10",
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.4,
        fill: true
      }]
    },
    options:{
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins:{
        legend:{ display: false },
        tooltip:{
          backgroundColor: "#131d2e",
          borderColor: "rgba(255,255,255,0.07)",
          borderWidth: 1,
          titleColor: "#5a6d85",
          bodyColor: "#e8edf5",
          padding: 10
        }
      },
      scales:{
        x:{
          grid:{ color: "rgba(255,255,255,0.04)" },
          ticks:{ color: "#5a6d85", font:{ size:11 } }
        },
        y:{
          grid:{ color: "rgba(255,255,255,0.04)" },
          ticks:{ color: "#5a6d85", font:{ size:11 } }
        }
      }
    }
  });
}

// ===== WATER TRACKER =====
function updateWaterUI() {
  let targetML = targetAirL * 1000;
  let pct = Math.min(100, (currentAirML / targetML) * 100);
  let fillEl = document.getElementById("water-fill");
  let textEl = document.getElementById("water-status-text");
  if(fillEl) fillEl.style.width = pct + "%";
  if(textEl) textEl.innerText = `${currentAirML}ml / ${targetML}ml`;
}

function tambahAir() {
  let targetML = targetAirL * 1000;
  if(currentAirML >= targetML) return;
  currentAirML += 250;
  if(currentAirML > targetML) currentAirML = targetML;
  updateWaterUI();
  
  let fillEl = document.getElementById("water-fill");
  if(fillEl) {
    fillEl.classList.remove("pulse");
    void fillEl.offsetWidth; // trigger reflow
    fillEl.classList.add("pulse");
  }
}

// ===== RESET CHART =====
function resetChart() {
  if(confirm("Apakah kamu yakin ingin menghapus semua data riwayat berat badan?")) {
    dataBerat = [];
    localStorage.removeItem("dataBerat");
    if(chart) chart.destroy();
    let emptyEl = el("chartEmpty");
    if(emptyEl) emptyEl.style.display = "block";
  }
}

// ===== DOWNLOAD PLAN =====
function downloadPlan() {
  let node = el("screen-result");
  let actions = document.querySelector(".top-actions");
  if(actions) actions.style.display = "none"; // Hide buttons before capture
  
  // Add a tiny delay to ensure display:none is applied
  setTimeout(() => {
    html2canvas(node, {
      backgroundColor: "#080c10",
      scale: 2
    }).then(canvas => {
      let link = document.createElement("a");
      link.download = "NutriTrack_Plan.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      if(actions) actions.style.display = "flex"; // Show buttons again
    }).catch(err => {
      console.error(err);
      if(actions) actions.style.display = "flex";
      showToast("Gagal mengunduh gambar.");
    });
  }, 100);
}

updateChart();
if(dataBerat.length > 0) {
  let emptyEl = el("chartEmpty");
  if(emptyEl) emptyEl.style.display = "none";
}

// ===== PWA SERVICE WORKER & INSTALL =====
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  let installBtn = document.getElementById('btnInstallPwa');
  if(installBtn) {
    installBtn.style.display = 'block';
    installBtn.addEventListener('click', async () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  let installBtn = document.getElementById('btnInstallPwa');
  if(installBtn) installBtn.style.display = 'none';
  console.log('PWA was installed');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA tersambung (Scope: ' + reg.scope + ')'))
      .catch(err => console.error('PWA gagal: ', err));
  });
}