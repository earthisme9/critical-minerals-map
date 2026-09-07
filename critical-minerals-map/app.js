// ============================================================
// state
// ============================================================
const state = {
  role: "all",              // "all" | "mining" | "refining"
  activeMinerals: new Set(MINERAL_ORDER),
  selectedCountry: null,    // english country name
  selectedMineral: null,    // mineral id (for the detail sub-view)
  newsFilterMineral: null,  // mineral id or null (전체)
};

// ============================================================
// helpers
// ============================================================
function krCountry(name) { return COUNTRY_KR[name] || name; }

function fmtShare(row) {
  if (row.share === null || row.share === undefined) return "비중 미상";
  return row.share + "%";
}

// build country -> [{mineralId, role, share, kt}] index
let COUNTRY_INDEX = {};
function buildCountryIndex() {
  COUNTRY_INDEX = {};
  MINERAL_ORDER.forEach(mid => {
    const m = MINERALS[mid];
    ["mining","refining"].forEach(role => {
      (m[role] || []).forEach(row => {
        if (!COUNTRY_INDEX[row.country]) COUNTRY_INDEX[row.country] = [];
        COUNTRY_INDEX[row.country].push({ mineralId: mid, role, share: row.share, kt: row.kt, source: row.source, company: row.company });
      });
    });
  });
}
buildCountryIndex();

// ============================================================
// 스프레드시트 실시간 연동 (선택사항)
// 아래 두 URL을 채우면, 페이지를 열 때마다 구글시트 최신 값을 읽어와 반영합니다.
// 비워두면 지금처럼 이 파일(data.js)에 적힌 고정값을 그대로 씁니다 — 안 채워도 사이트는 정상 작동합니다.
//
// 필요한 것: 구글시트에 아래 두 탭을 "기계가 읽기 쉬운 표" 형태로 만들고, 각 탭을
// 파일 → 공유 → 웹에 게시 → 해당 시트를 CSV로 게시 → 그 링크를 아래에 넣으세요.
//
// [탭 1: site_minerals] 헤더 행 필수. 각 광물 1행. 비워둔 칸은 기존 값 유지.
//   id, name, symbol, color, usage, company, price, demand2025, marketValue2025,
//   cagr, demand2040, marketValue2040, fulfillment2035, insight, miningNote, refiningNote
//   - id는 cu/li/ni/mn/co/graphite/ree/lree 중 하나 (기존 8개 광물과 매칭)
//   - usage는 여러 개면 파이프(|)로 구분: 전력망·전력화|이차전지·EV 배터리
//
// [탭 2: site_countries] 헤더 행 필수. 국가×광물×역할 1행씩, 여러 행.
//   mineral_id, role, country, kt, share, company, source
//   - role은 mining 또는 refining
//   - country는 영문 Natural Earth 표준명 (예: Chile, Dem. Rep. Congo,
//     United States of America, South Korea) — data.js의 COUNTRY_KR 목록 참고
//   - source에 industry라고 적으면 † 표시(IEA 표 밖 추정치), 비워두면 기본
//   - 어떤 mineral_id+role 조합이 시트에 하나도 없으면 기존 값을 그대로 유지합니다
// ============================================================
const SHEET_SYNC_CONFIG = {
  mineralsCsvUrl: "",
  countriesCsvUrl: ""
};

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n' || c === '\r') {
        if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
        if (c === '\r' && next === '\n') i++;
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ""));
}

function csvToObjects(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    header.forEach((h, i) => { obj[h] = (r[i] || "").trim(); });
    return obj;
  });
}

async function fetchCsvObjects(url) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  return csvToObjects(text);
}

function applyMineralsSheet(objs) {
  objs.forEach(row => {
    const m = MINERALS[row.id];
    if (!m) return; // 알 수 없는 id는 건너뜀
    if (row.name) m.name = row.name;
    if (row.symbol) m.symbol = row.symbol;
    if (row.color) m.color = row.color;
    if (row.usage) m.usage = row.usage.split("|").map(s => s.trim()).filter(Boolean);
    if (row.company) m.company = row.company;
    if (row.price) m.price = row.price;
    if (row.demand2025) m.demand2025 = row.demand2025;
    if (row.marketValue2025) m.marketValue2025 = row.marketValue2025;
    if (row.cagr) m.cagr = row.cagr;
    if (row.demand2040) m.demand2040 = row.demand2040;
    if (row.marketValue2040) m.marketValue2040 = row.marketValue2040;
    if (row.fulfillment2035) m.fulfillment2035 = row.fulfillment2035;
    if (row.insight) m.insight = row.insight;
    if (row.miningNote) m.miningNote = row.miningNote;
    if (row.refiningNote) m.refiningNote = row.refiningNote;
  });
}

function applyCountriesSheet(objs) {
  // mineral_id + role 조합별로 그룹화
  const groups = {};
  objs.forEach(row => {
    if (!row.mineral_id || !row.role || !row.country) return;
    const key = row.mineral_id + "|" + row.role;
    if (!groups[key]) groups[key] = [];
    const entry = { country: row.country };
    if (row.kt) entry.kt = parseFloat(row.kt);
    entry.share = row.share ? parseFloat(row.share) : null;
    if (row.company) entry.company = row.company;
    if (row.source) entry.source = row.source;
    groups[key].push(entry);
  });
  Object.keys(groups).forEach(key => {
    const [mid, role] = key.split("|");
    const m = MINERALS[mid];
    if (!m) return;
    const rows = groups[key].sort((a, b) => (b.share || 0) - (a.share || 0));
    m[role] = rows;
  });
}

async function syncFromSheets() {
  const tasks = [];
  if (SHEET_SYNC_CONFIG.mineralsCsvUrl) {
    tasks.push(fetchCsvObjects(SHEET_SYNC_CONFIG.mineralsCsvUrl).then(applyMineralsSheet));
  }
  if (SHEET_SYNC_CONFIG.countriesCsvUrl) {
    tasks.push(fetchCsvObjects(SHEET_SYNC_CONFIG.countriesCsvUrl).then(applyCountriesSheet));
  }
  if (tasks.length === 0) return;
  const statusEl = document.getElementById("sync-status");
  if (statusEl) statusEl.textContent = " · 시트 동기화 중...";
  try {
    await Promise.all(tasks);
    buildCountryIndex();
    if (statusEl) statusEl.textContent = " · 시트와 동기화됨 (" + new Date().toLocaleTimeString("ko-KR") + ")";
  } catch (e) {
    console.warn("시트 동기화 실패 — data.js의 고정값으로 표시합니다.", e);
    if (statusEl) statusEl.textContent = " · 시트 동기화 실패, 고정값 표시 중";
  }
}

// ============================================================
// svg / projection setup
// ============================================================
const svg = d3.select("#map");
const gLand = svg.append("g").attr("class", "land-layer");
const gMarkers = svg.append("g").attr("class", "marker-layer");

let width = 0, height = 0, projection, path;

function computeSize() {
  const box = document.getElementById("map-wrap").getBoundingClientRect();
  width = box.width;
  height = box.height;
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  projection = d3.geoNaturalEarth1().fitSize([width - 16, height - 16], WORLD_GEO);
  path = d3.geoPath(projection);
}

function drawLand() {
  const sel = gLand.selectAll("path.country")
    .data(WORLD_GEO.features, d => d.properties.name);

  sel.join(
    enter => enter.append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("data-name", d => d.properties.name),
    update => update.attr("d", path),
    exit => exit.remove()
  );
}

// ============================================================
// marker rendering
// ============================================================
const shareRadius = d3.scaleSqrt().domain([0, 100]).range([3.2, 15]);

function visibleEntries() {
  // returns list of {country, mineralId, role, share, kt}
  const out = [];
  MINERAL_ORDER.forEach(mid => {
    if (!state.activeMinerals.has(mid)) return;
    const m = MINERALS[mid];
    ["mining", "refining"].forEach(role => {
      if (state.role !== "all" && state.role !== role) return;
      (m[role] || []).forEach(row => {
        out.push({ country: row.country, mineralId: mid, role, share: row.share, kt: row.kt });
      });
    });
  });
  return out;
}

function drawMarkers() {
  const entries = visibleEntries();

  // group by country
  const byCountry = d3.group(entries, d => d.country);
  const markerData = [];

  byCountry.forEach((rows, country) => {
    const feature = WORLD_GEO.features.find(f => f.properties.name === country);
    if (!feature) return;
    const centroid = projection(d3.geoCentroid(feature));
    if (!centroid || isNaN(centroid[0])) return;

    const n = rows.length;
    rows.forEach((r, i) => {
      // arrange in small ring cluster around centroid
      let dx = 0, dy = 0;
      if (n > 1) {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ringR = 9 + Math.min(n, 8) * 1.1;
        dx = Math.cos(angle) * ringR;
        dy = Math.sin(angle) * ringR;
      }
      markerData.push({
        ...r,
        x: centroid[0] + dx,
        y: centroid[1] + dy
      });
    });
  });

  const sel = gMarkers.selectAll("g.marker")
    .data(markerData, d => d.country + "|" + d.mineralId + "|" + d.role);

  sel.exit().remove();

  const enter = sel.enter().append("g")
    .attr("class", "marker")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  enter.append("circle").attr("class", "ping");
  enter.append("circle");
  enter.append("title");

  const merged = enter.merge(sel);

  merged
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .classed("is-refining", d => d.role === "refining")
    .classed("is-selected-mineral", d => state.selectedMineral === d.mineralId)
    .classed("is-selected-country", d => state.selectedCountry === d.country);

  merged.select("circle:not(.ping)")
    .attr("r", d => shareRadius(d.share || 6))
    .attr("fill", d => MINERALS[d.mineralId].color)
    .attr("fill-opacity", d => d.role === "refining" ? 0.28 : 0.92)
    .attr("stroke", d => MINERALS[d.mineralId].color)
    .attr("stroke-width", d => d.role === "refining" ? 2 : 0.75);

  merged.select("circle.ping")
    .attr("r", d => shareRadius(d.share || 6))
    .attr("stroke", d => MINERALS[d.mineralId].color);

  merged.on("click", (event, d) => {
    event.stopPropagation();
    selectCountry(d.country);
    selectMineral(d.mineralId, false);
  });

  merged.select("title").text(d =>
    `${krCountry(d.country)} · ${MINERALS[d.mineralId].name} ${d.role === "mining" ? "채굴" : "정련"} ${fmtShare(d)}`
  );

  // land highlight
  gLand.selectAll("path.country")
    .classed("is-selected", d => d.properties.name === state.selectedCountry)
    .classed("has-data", d => !!COUNTRY_INDEX[d.properties.name]);
}

// ============================================================
// motion helper — retrigger a fade/slide-in on content update
// ============================================================
function revealEl(el) {
  el.classList.remove("fade-in");
  void el.offsetWidth; // reflow to restart animation
  el.classList.add("fade-in");
}

// ============================================================
// panel rendering
// ============================================================
const panel = document.getElementById("panel");

function renderDefaultPanel() {
  const rows = MINERAL_ORDER.map(mid => {
    const m = MINERALS[mid];
    return `
      <button class="mineral-row" data-mineral="${mid}">
        <span class="dot" style="background:${m.color}"></span>
        <span class="mineral-row-main">
          <span class="mineral-row-name">${m.name} <em>${m.symbol}</em></span>
          <span class="mineral-row-insight">${m.insight}</span>
        </span>
        <span class="chev">›</span>
      </button>`;
  }).join("");

  panel.innerHTML = `
    <div class="panel-intro">
      <p>지도의 마커를 클릭하면 해당 국가가 어떤 광물을 채굴·정련하는지 보여줍니다. 아래 목록에서 광물을 눌러도 같은 정보를 볼 수 있습니다.</p>
    </div>
    <div class="mineral-list">${rows}</div>
  `;

  panel.querySelectorAll(".mineral-row").forEach(btn => {
    btn.addEventListener("click", () => selectMineral(btn.dataset.mineral, true));
  });
  revealEl(panel);
}

function rankTable(rows, role) {
  if (!rows || rows.length === 0) return `<p class="muted">데이터 없음</p>`;
  const max = Math.max(...rows.map(r => r.share || 0), 1);
  return `
    <table class="rank-table">
      ${rows.map((r, i) => `
        <tr class="${r.source === "industry" ? "is-industry-row" : ""}">
          <td class="rank-num">${String(i + 1).padStart(2, "0")}</td>
          <td class="rank-country">
            <span class="rank-country-name">${krCountry(r.country)}${r.source === "industry" ? '<sup class="industry-mark">†</sup>' : ""}</span>
            ${r.company ? `<span class="rank-company">${r.company}</span>` : ""}
          </td>
          <td class="rank-bar-cell">
            <div class="rank-bar-track">
              <div class="rank-bar-fill" style="width:${((r.share||0)/max*100)}%"></div>
            </div>
          </td>
          <td class="rank-share">${fmtShare(r)}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

function mineralDetailHTML(m) {
  return `
    <div class="detail-head" style="border-color:${m.color}">
      <span class="dot lg" style="background:${m.color}"></span>
      <div>
        <div class="detail-title">${m.name} <em>${m.symbol}</em></div>
        <div class="detail-usage">${m.usage.join(" · ")}</div>
      </div>
    </div>

    <p class="detail-insight">${m.insight}</p>

    <div class="stat-grid">
      <div class="stat"><span class="stat-label">대표 기업</span><span class="stat-value">${m.company}</span></div>
      <div class="stat"><span class="stat-label">가격</span><span class="stat-value">${m.price}</span></div>
      <div class="stat"><span class="stat-label">2025 수요</span><span class="stat-value">${m.demand2025}</span></div>
      <div class="stat"><span class="stat-label">2025 시장가치</span><span class="stat-value">${m.marketValue2025}</span></div>
      <div class="stat"><span class="stat-label">수요 CAGR('25→'40)</span><span class="stat-value">${m.cagr}</span></div>
      <div class="stat"><span class="stat-label">2040 수요(e)</span><span class="stat-value">${m.demand2040}</span></div>
      <div class="stat"><span class="stat-label">2040 시장가치(proxy)</span><span class="stat-value">${m.marketValue2040}</span></div>
      <div class="stat"><span class="stat-label">2035 공급충족률</span><span class="stat-value">${m.fulfillment2035}</span></div>
    </div>

    ${m.miningNote ? `<p class="muted small">${m.miningNote}</p>` : ""}

    <div class="rank-block">
      <h4><span class="rank-swatch mining"></span>채굴 상위국 (2025)</h4>
      ${rankTable(m.mining, "mining")}
    </div>
    <div class="rank-block">
      <h4><span class="rank-swatch refining"></span>정련 상위국 (2025)</h4>
      ${rankTable(m.refining, "refining")}
      ${m.refiningNote ? `<p class="muted small industry-footnote">${m.refiningNote}</p>` : ""}
    </div>
  `;
}

function renderMineralDetail(mid) {
  const m = MINERALS[mid];
  panel.innerHTML = `
    <button class="back-btn" id="back-to-list">‹ 전체 목록</button>
    ${mineralDetailHTML(m)}
  `;

  document.getElementById("back-to-list").addEventListener("click", () => {
    selectCountry(null);
  });
  revealEl(panel);
}

function renderCountryDetail(country) {
  const entries = (COUNTRY_INDEX[country] || []).filter(e => state.activeMinerals.has(e.mineralId));
  const mining = entries.filter(e => e.role === "mining");
  const refining = entries.filter(e => e.role === "refining");

  function entryRow(e) {
    const m = MINERALS[e.mineralId];
    return `
      <button class="entry-row" data-mineral="${e.mineralId}">
        <span class="dot" style="background:${m.color}"></span>
        <span class="entry-row-main">
          <span class="entry-row-name">${m.name} <em>${m.symbol}</em>${e.source === "industry" ? '<sup class="industry-mark">†</sup>' : ""}</span>
          ${e.company ? `<span class="entry-row-company">${e.company}</span>` : ""}
        </span>
        <span class="entry-row-share">${fmtShare(e)}</span>
      </button>`;
  }

  panel.innerHTML = `
    <button class="back-btn" id="back-to-list">‹ 전체 목록</button>
    <div class="detail-title lg">${krCountry(country)}</div>

    ${mining.length ? `
      <div class="rank-block">
        <h4><span class="rank-swatch mining"></span>채굴하는 광물</h4>
        <div class="entry-list">${mining.map(entryRow).join("")}</div>
      </div>` : ""}

    ${refining.length ? `
      <div class="rank-block">
        <h4><span class="rank-swatch refining"></span>정련하는 광물</h4>
        <div class="entry-list">${refining.map(entryRow).join("")}</div>
      </div>` : ""}

    ${entries.length === 0 ? `<p class="muted">현재 필터에서 이 국가에 해당하는 데이터가 없습니다.</p>` : ""}
    ${entries.some(e => e.source === "industry") ? `<p class="muted small industry-footnote">† IEA 상위 6개국 표에는 없지만, 업계 자료(설비 능력 등)로 추정해 별도 표시한 항목입니다.</p>` : ""}
  `;

  panel.querySelectorAll(".entry-row").forEach(btn => {
    btn.addEventListener("click", () => selectMineral(btn.dataset.mineral, true));
  });
  document.getElementById("back-to-list").addEventListener("click", () => {
    selectCountry(null);
  });
  revealEl(panel);
}

// ============================================================
// selection actions
// ============================================================
function updateSelectionClass() {
  const has = !!(state.selectedMineral || state.selectedCountry);
  document.getElementById("app").classList.toggle("has-selection", has);
}

function selectMineral(mid, clearCountry) {
  state.selectedMineral = mid;
  if (clearCountry) state.selectedCountry = null;
  if (mid) {
    renderMineralDetail(mid);
  } else {
    renderDefaultPanel();
  }
  updateSelectionClass();
  drawMarkers();
}

function selectCountry(country) {
  state.selectedCountry = country;
  state.selectedMineral = null;
  if (country) {
    renderCountryDetail(country);
  } else {
    renderDefaultPanel();
  }
  updateSelectionClass();
  drawMarkers();
}

// ============================================================
// controls: role toggle + mineral chips
// ============================================================
function buildControls() {
  const roleWrap = document.getElementById("role-toggle");
  roleWrap.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      state.role = btn.dataset.role;
      roleWrap.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === btn));
      drawMarkers();
    });
  });

  const chipWrap = document.getElementById("mineral-chips");
  chipWrap.innerHTML = MINERAL_ORDER.map(mid => {
    const m = MINERALS[mid];
    return `<button class="chip active" data-mineral="${mid}" style="--chip-color:${m.color}">
      <span class="dot"></span>${m.name}
    </button>`;
  }).join("");

  chipWrap.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const mid = chip.dataset.mineral;
      if (state.activeMinerals.has(mid)) {
        state.activeMinerals.delete(mid);
        chip.classList.remove("active");
      } else {
        state.activeMinerals.add(mid);
        chip.classList.add("active");
      }
      drawMarkers();
      if (state.selectedCountry) renderCountryDetail(state.selectedCountry);
    });
  });

  document.getElementById("reset-filters").addEventListener("click", () => {
    state.role = "all";
    state.activeMinerals = new Set(MINERAL_ORDER);
    state.selectedCountry = null;
    state.selectedMineral = null;
    roleWrap.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.role === "all"));
    chipWrap.querySelectorAll(".chip").forEach(c => c.classList.add("active"));
    renderDefaultPanel();
    updateSelectionClass();
    drawMarkers();
  });
}

// background click clears selection
svg.on("click", () => {
  selectCountry(null);
});

// ============================================================
// industry view
// ============================================================
const industryState = {
  selectedIndustry: null,
  selectedMineral: null,
};

const ICONS = {
  battery: `<rect x="2.5" y="7.5" width="16" height="9" rx="1.2"/><rect x="19" y="10.3" width="2.3" height="3.4" rx="0.6"/><rect x="5.3" y="10" width="2.6" height="4" fill="currentColor" stroke="none"/><rect x="9.2" y="10" width="2.6" height="4" fill="currentColor" stroke="none" opacity="0.6"/><rect x="13.1" y="10" width="2.6" height="4" fill="none" opacity="0.35"/>`,
  pylon: `<path d="M12 2 6 21M12 2l6 19M9 8h6M7.5 13h9M6.3 18h11.4M4 21h16"/><path d="M9.5 5h5"/>`,
  magnet: `<path d="M6 4h4v9a2 2 0 1 0 4 0V4h4v9a6 6 0 1 1-12 0V4z"/><path d="M6 4v3.2M10 4v3.2M14 4v3.2M18 4v3.2"/>`,
  solar: `<rect x="3" y="10" width="12" height="9"/><path d="M3 13.3h12M3 16.6h12M7 10v9M11 10v9"/><circle cx="18.5" cy="5.5" r="1.8"/><path d="M18.5 1.7v1.3M18.5 8v1.3M22.3 5.5H21M16 5.5h-1.3M21 2.5l-1 1M16.9 8.1l-1 1M21 8.5l-1-1M16.9 2.9l-1 1"/>`,
  chip: `<rect x="7" y="7" width="10" height="10"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3"/>`,
  server: `<rect x="4" y="3.5" width="16" height="5" rx="1"/><rect x="4" y="9.5" width="16" height="5" rx="1"/><rect x="4" y="15.5" width="16" height="5" rx="1"/><circle cx="7.3" cy="6" r="0.7" fill="currentColor" stroke="none"/><circle cx="7.3" cy="12" r="0.7" fill="currentColor" stroke="none"/><circle cx="7.3" cy="18" r="0.7" fill="currentColor" stroke="none"/><path d="M14 6h3M14 12h3M14 18h3"/>`,
  robot: `<circle cx="12" cy="3.6" r="1.3"/><path d="M12 4.9v2.6"/><rect x="6" y="7.5" width="12" height="9.5" rx="1.6"/><circle cx="9.6" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.4" cy="12" r="1.1" fill="currentColor" stroke="none"/><path d="M9 15.6h6M3.5 10.5v4M20.5 10.5v4"/>`,
  signal: `<path d="M12 21v-9"/><path d="M7 12a5 5 0 0 1 10 0"/><path d="M4 9a8 8 0 0 1 16 0"/><circle cx="12" cy="21" r="1.1"/>`,
  rocket: `<path d="M12 2c3 2 4.5 6.2 4.5 10 0 2.1-.7 4-1.5 5.2L12 22l-3-4.8C8.2 16 7.5 14.1 7.5 12c0-3.8 1.5-8 4.5-10z"/><circle cx="12" cy="10.2" r="1.6"/><path d="M8.2 15.3l-3.2 2.6M15.8 15.3l3.2 2.6"/>`,
  hydrogen: `<circle cx="7" cy="12" r="3.4"/><circle cx="17" cy="12" r="3.4"/><path d="M10.4 12h3.2"/>`,
};

function industryIconSvg(iconKey) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[iconKey] || ""}</svg>`;
}

const SOURCE_LABEL = {
  quant: "IEA 정량 데이터",
  qual: "IEA 언급(정성)",
  general: "일반 소재 지식"
};

function renderIndustryCards() {
  const wrap = document.getElementById("industry-cards");
  wrap.innerHTML = INDUSTRY_ORDER.map((iid, i) => {
    const ind = INDUSTRIES[iid];
    return `
      <button class="industry-card" data-industry="${iid}">
        <span class="industry-index">${String(i + 1).padStart(2, "0")}</span>
        <span class="industry-icon">${industryIconSvg(ind.icon)}</span>
        <span class="industry-name">${ind.name}</span>
      </button>`;
  }).join("");

  wrap.querySelectorAll(".industry-card").forEach(btn => {
    btn.addEventListener("click", () => selectIndustry(btn.dataset.industry));
  });
}

function renderIndustryDefaultBody() {
  const body = document.getElementById("industry-body");
  body.innerHTML = `<p class="muted industry-placeholder">위에서 산업을 선택하면 그 산업에 들어가는 핵심광물이 여기 표시됩니다.</p>`;
}

function renderIndustryMineralList(iid) {
  const ind = INDUSTRIES[iid];
  const body = document.getElementById("industry-body");
  const chips = ind.minerals.map(mid => {
    const m = MINERALS[mid];
    return `
      <button class="entry-row industry-mineral-row" data-mineral="${mid}">
        <span class="dot" style="background:${m.color}"></span>
        <span class="entry-row-name">${m.name} <em>${m.symbol}</em></span>
        <span class="chev">›</span>
      </button>`;
  }).join("");

  body.innerHTML = `
    <div class="industry-note-block">
      <div class="industry-note-title-row">
        <div class="industry-note-title">${ind.name}에 쓰이는 핵심광물</div>
        <span class="source-badge source-${ind.sourceTag}">${SOURCE_LABEL[ind.sourceTag]}</span>
      </div>
      <p class="industry-note">${ind.note}</p>
    </div>
    <div class="entry-list">${chips}</div>
  `;

  body.querySelectorAll(".industry-mineral-row").forEach(btn => {
    btn.addEventListener("click", () => selectIndustryMineral(btn.dataset.mineral));
  });
  revealEl(body);
}

function selectIndustry(iid) {
  industryState.selectedIndustry = iid;
  industryState.selectedMineral = null;
  document.querySelectorAll(".industry-card").forEach(c => c.classList.toggle("active", c.dataset.industry === iid));
  renderIndustryMineralList(iid);
  renderIndustryPanelEmpty();
}

function renderIndustryPanelEmpty() {
  const p = document.getElementById("industry-panel");
  p.innerHTML = `<p class="muted">광물을 클릭하면 어디서 채굴·정련되고 어떤 특징이 있는지 여기 표시됩니다.</p>`;
}

function selectIndustryMineral(mid) {
  industryState.selectedMineral = mid;
  document.querySelectorAll(".industry-mineral-row").forEach(r => r.classList.toggle("active", r.dataset.mineral === mid));
  const m = MINERALS[mid];
  const p = document.getElementById("industry-panel");
  p.innerHTML = mineralDetailHTML(m);
  revealEl(p);
}

function initIndustryView() {
  renderIndustryCards();
  renderIndustryDefaultBody();
  renderIndustryPanelEmpty();
}

// ============================================================
// news (뉴스) — Google News RSS를 광물별로 검색해 최신 뉴스를 가져온다.
// rss2json.com이 서버에서 RSS를 대신 읽어와 JSON으로 돌려주는 방식이라
// 브라우저 CORS 문제 없이 바로 fetch할 수 있습니다 (API 키 불필요, 무료 한도 내).
// 이 서비스가 막히거나 한도를 넘으면 NEWS_CONFIG.rss2jsonEndpoint를
// 다른 프록시로 바꿔주면 됩니다 (예: https://api.allorigins.win/raw?url= + 직접 XML 파싱).
// ============================================================
let newsLoaded = false;
let newsCache = [];
let newsBusy = false;
let newsPoll = null;
let visitCutoff = '';
try { visitCutoff = localStorage.getItem('mineralsNewsSeen') || ''; } catch (_) {}
function newsEscape(value) { return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderNewsList() {
  const filtered = newsCache.filter(n => !state.newsFilterMineral || n.mineralIds.includes(state.newsFilterMineral));
  document.getElementById('news-list').innerHTML = filtered.length ? filtered.map(n => {
    const tags = n.mineralIds.filter(mid => MINERALS[mid]).map(mid => `<span class="news-tag" style="--tag-color:${MINERALS[mid].color}">${newsEscape(MINERALS[mid].name)}</span>`).join('');
    const connections = [...(n.markets || []), ...(n.stages || [])].map(t => `<span class="news-tag industry" title="제목 근거: ${newsEscape(t.evidence)}">${newsEscape(t.label)}</span>`).join('');
    const fresh = visitCutoff && n.firstSeenAt > visitCutoff;
    return `<a class="news-item" href="${newsEscape(n.link)}" target="_blank" rel="noopener noreferrer"><div class="news-item-tags">${fresh ? '<span class="news-tag">NEW</span>' : ''}${tags}${connections}</div><div class="news-item-title">${newsEscape(n.title)}</div><div class="news-item-meta">${newsEscape(n.source)} · ${newsEscape(new Date(n.pubDate).toLocaleString('ko-KR'))}</div><div class="news-item-meta">${newsEscape(n.classificationBasis)}${connections ? '' : ' · 시장·밸류체인 미분류'}</div></a>`;
  }).join('') : '<p class="muted">이 광물의 저장된 뉴스가 없습니다. 위의 수집 상태를 확인하세요.</p>';
}
function renderNewsFilters() {
  const wrap = document.getElementById('news-filters');
  wrap.innerHTML = '<button class="news-filter-chip active" data-mineral="">전체</button>' + MINERAL_ORDER.map(mid => `<button class="news-filter-chip" data-mineral="${mid}" style="--chip-color:${MINERALS[mid].color}">${newsEscape(MINERALS[mid].name)}</button>`).join('');
  wrap.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    state.newsFilterMineral = btn.dataset.mineral || null;
    wrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn)); renderNewsList();
  }));
}
async function loadNews(force) {
  if (newsBusy || (newsLoaded && !force)) return;
  newsBusy = true;
  const status = document.getElementById('news-status');
  status.textContent = '최신 뉴스 확인 중…';
  try {
    let data;
    try {
      const response = await fetch('/api/news', {cache:'no-store', signal:AbortSignal.timeout(10000)});
      if (!response.ok) throw new Error('static');
      data = await response.json();
      if (!Array.isArray(data.articles)) throw new Error('invalid');
    } catch (_) {
      const response = await fetch('./news.json?t=' + Date.now(), {cache:'no-store', signal:AbortSignal.timeout(10000)});
      if (!response.ok) throw new Error('뉴스 저장 파일을 찾지 못했습니다. README의 수집 실행 방법을 확인하세요.');
      data = await response.json();
    }
    newsCache = (data.articles || []).filter(n => /^https?:\/\//i.test(n.link) && Array.isArray(n.mineralIds));
    newsLoaded = true; renderNewsList();
    const labels = {ok:'정상',empty:'새 기사 없음',partial:'일부 실패',failed:'수집 실패'};
    status.textContent = `${newsCache.length}건 · 마지막 시도: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString('ko-KR') : '아직 없음'}${data.collecting ? ' · 추가 수집 중…' : ''} · ` + MINERAL_ORDER.map(mid => `${MINERALS[mid].name}: ${labels[data.status?.[mid]?.state] || '미수집'} (${data.status?.[mid]?.count || 0})`).join(' / ');
    if (data.collecting) { clearTimeout(newsPoll); newsPoll = setTimeout(() => loadNews(true), 5000); }
    try { localStorage.setItem('mineralsNewsSeen', new Date().toISOString()); } catch (_) {}
  } catch (error) {
    status.textContent = '갱신 실패 · ' + error.message;
    if (newsCache.length) renderNewsList();
    else document.getElementById('news-list').textContent = '뉴스 수집기를 먼저 실행해 주세요. HTML 파일을 더블클릭하는 대신 http://localhost:8080 에 접속하세요.';
  } finally { newsBusy = false; }
}

function initNewsOnce() {
  if (document.getElementById("news-filters").dataset.inited) return;
  document.getElementById("news-filters").dataset.inited = "1";
  renderNewsFilters();
  document.getElementById("news-refresh").addEventListener("click", () => loadNews(true));
  loadNews(false);
}

// ============================================================
// tab switching
// ============================================================
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  const viewIds = ["map", "industry", "news"];
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view;
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      viewIds.forEach(v => {
        const el = document.getElementById("view-" + v);
        if (el) el.classList.toggle("is-active", view === v);
      });
      document.getElementById("map-only-controls").style.display = view === "map" ? "flex" : "none";
      if (view === "map") {
        // svg may have been laid out while hidden; recompute
        computeSize();
        drawLand();
        drawMarkers();
      }
      if (view === "news") {
        initNewsOnce();
      }
    });
  });
}

// ============================================================
// init
// ============================================================
async function init() {
  // 시트 연동이 켜져 있으면 최신 데이터를 먼저 받아온다 (최대 4초, 실패해도 고정값으로 계속 진행)
  await Promise.race([
    syncFromSheets(),
    new Promise(resolve => setTimeout(resolve, 4000))
  ]);

  computeSize();
  drawLand();
  buildControls();
  renderDefaultPanel();
  drawMarkers();
  initIndustryView();
  initTabs();

  gLand.selectAll("path.country").on("click", (event, d) => {
    event.stopPropagation();
    const name = d.properties.name;
    if (COUNTRY_INDEX[name]) selectCountry(name);
  });

  window.addEventListener("resize", () => {
    if (!document.getElementById("view-map").classList.contains("is-active")) return;
    computeSize();
    drawLand();
    drawMarkers();
    gLand.selectAll("path.country").on("click", (event, d) => {
      event.stopPropagation();
      const name = d.properties.name;
      if (COUNTRY_INDEX[name]) selectCountry(name);
    });
  });
}

init();
