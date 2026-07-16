/**
 * MDPI Author Services — Quote calculator prototype
 * Language editing prices from official word-count bands (CHF).
 * Standard, Rapid, and Academic tiers
 */

/** Word-count bands: minWords is the lower edge of each band. */
const LANGUAGE_PRICE_TABLE = [
  {
    minWords: 0,
    label: "Word count: 1000 - 2000",
    standard: 77.48,
    rapid: 112.04,
    academic: 194.56,
  },
  {
    minWords: 2001,
    label: "Word count: 2001 - 4000",
    standard: 129.68,
    rapid: 187.5,
    academic: 321.58,
  },
  {
    minWords: 4001,
    label: "Word count: 4001 - 6000",
    standard: 219.1,
    rapid: 308.74,
    academic: 520.12,
  },
  {
    minWords: 6001,
    label: "Word count: 6001 - 8000",
    standard: 292.77,
    rapid: 399.79,
    academic: 661.47,
  },
  {
    minWords: 8001,
    label: "Word count: 8001 - 10000",
    standard: 357.05,
    rapid: 471.85,
    academic: 764.83,
  },
  {
    minWords: 10001,
    label: "Word count: 10001 - 12000",
    standard: 416.98,
    rapid: 533.24,
    academic: 844.57,
  },
  {
    minWords: 12001,
    label: "Word count: 12001 - 15000",
    standard: 472.66,
    rapid: 586.19,
    academic: 906.84,
  },
  {
    minWords: 15001,
    label: "Word count: 15001+",
    standard: 551.25,
    rapid: 655.65,
    academic: 979.82,
  },
];

const RATES = {
  figures: { perUnit: 50, unitLabel: "per figure" },
  layout: { flat: 85, unitLabel: "per submission" },
  graphical: { flat: 200, unitLabel: "per submission" },
  video: {
    abstract: 600,
    short: 500,
    profile: 500,
    interview: 400,
    unitLabel: "per submission",
  },
};

function getLanguagePrice(words, tier) {
  if (!words || words < 1) return 0;
  let band = LANGUAGE_PRICE_TABLE[0];
  for (const row of LANGUAGE_PRICE_TABLE) {
    if (words >= row.minWords) band = row;
    else break;
  }
  return band[tier] ?? 0;
}

const FX = {
  CHF: 1,
  EUR: 0.95,
  USD: 1.12,
  GBP: 0.88,
};

const FIGURE_DISCOUNT = {
  standard: 0.1, // 10% with Standard language editing
  rapid: 0.1, // 10% with Rapid language editing
  academic: 1, // Included with Academic
};

const LAYOUT_DISCOUNT = {
  academic: 1, // Included with Academic for MDPI journals
};

const VIDEO_CAMPAIGN = {
  code: "VIDEO10",
  discount: 0.1,
  start: new Date("2026-07-01T00:00:00"),
  end: new Date("2026-12-30T23:59:59"),
};

const VIDEO_TYPE_LABELS = {
  abstract: "Video Abstract",
  short: "Short Take",
  profile: "Scholar Profile",
  interview: "Scholar Interview",
};

function getVideoTypeValue() {
  return document.getElementById("video-type")?.value || "abstract";
}

function isVideoCampaignActive(date = new Date()) {
  return date >= VIDEO_CAMPAIGN.start && date <= VIDEO_CAMPAIGN.end;
}

function getVideoBasePrice(videoType) {
  return videoType ? (RATES.video[videoType] ?? 0) : 0;
}

function getVideoPrice(videoType) {
  const base = getVideoBasePrice(videoType);
  if (!base || !isVideoCampaignActive()) return base;
  return base * (1 - VIDEO_CAMPAIGN.discount);
}

function formatVideoListPrice(amount) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

const SERVICE_PANELS = {
  language: "panel-language",
  figures: "panel-figures",
  layout: "panel-layout",
  graphical: "panel-graphical",
  video: "panel-video",
};

const IOAP_DOMAINS = [
  "mdpi.com",
  "ethz.ch",
  "unibe.ch",
  "cam.ac.uk",
  "mit.edu",
  "stanford.edu",
  "ox.ac.uk",
  "tu-dresden.de",
  "unige.ch",
];

const form = document.getElementById("quote-form");
const totalEl = document.getElementById("total-price");
const ioapBanner = document.getElementById("ioap-banner");
const discountLine = document.getElementById("line-discount");
const noServiceHint = document.getElementById("no-service-hint");
const figuresDiscountHint = document.getElementById("figures-discount-hint");
const layoutFreeHint = document.getElementById("layout-free-hint");
const toast = document.getElementById("toast");

function getServiceInputs() {
  return [...document.querySelectorAll('input[name="service"]')];
}

function getSelectedServices() {
  return getServiceInputs()
    .filter((el) => el.checked)
    .map((el) => el.value);
}

function setServiceChecked(value, checked = true) {
  const input = document.querySelector(`input[name="service"][value="${value}"]`);
  if (input) input.checked = checked;
}

function isIoapEligible(email) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return IOAP_DOMAINS.some((d) => domain === d || domain.endsWith("." + d));
}

function formatChf(amount) {
  if (amount < 1) {
    const s = amount.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    return `CHF ${s}`;
  }
  if (Number.isInteger(amount)) {
    return `CHF ${amount}`;
  }
  return `CHF ${amount.toFixed(2)}`;
}

function formatDisplayPrice(amount) {
  return `CHF ${Math.floor(amount).toFixed(2)}`;
}

function formatWordRange(index) {
  const ranges = [
    "1,000 – 2,000 words",
    "2,001 – 4,000 words",
    "4,001 – 6,000 words",
    "6,001 – 8,000 words",
    "8,001 – 10,000 words",
    "10,001 – 12,000 words",
    "12,001 – 15,000 words",
    "15,001+ words",
  ];
  return ranges[index] ?? ranges[0];
}

function shortBandLabel(index) {
  const labels = [
    "1k–2k",
    "2k–4k",
    "4k–6k",
    "6k–8k",
    "8k–10k",
    "10k–12k",
    "12k–15k",
    "15k+",
  ];
  return labels[index] ?? labels[0];
}

function sampleWordsForBand(index) {
  const samples = [1000, 2001, 4001, 6001, 8001, 10001, 12001, 15001];
  return samples[index] ?? 1000;
}

function updateTierCardPrices(bandIndex) {
  const band = LANGUAGE_PRICE_TABLE[bandIndex] || LANGUAGE_PRICE_TABLE[0];
  const isStarting = bandIndex === 0;

  ["standard", "rapid", "academic"].forEach((tier) => {
    const amountEl = document.querySelector(
      `[data-price-tier="${tier}"] .card-price-amount`
    );
    const captionEl = document.querySelector(
      `[data-price-tier="${tier}"] .card-price-caption`
    );
    if (!amountEl || band[tier] == null) return;

    amountEl.classList.remove("is-updating");
    // Force reflow so the animation can replay
    void amountEl.offsetWidth;
    amountEl.textContent = formatDisplayPrice(band[tier]);
    amountEl.classList.add("is-updating");
    window.setTimeout(() => amountEl.classList.remove("is-updating"), 220);

    if (captionEl) {
      captionEl.textContent = isStarting ? "Starting from" : "For this word count";
    }
  });
}

function setWordCountBand(index, { syncForm = true } = {}) {
  const bandIndex = Math.max(0, Math.min(LANGUAGE_PRICE_TABLE.length - 1, Number(index)));
  const slider = document.getElementById("word-count-slider");
  const rangeEl = document.getElementById("word-count-range");
  const hintEl = document.getElementById("word-count-hint");
  const bands = document.getElementById("word-count-bands");

  if (slider) {
    slider.value = String(bandIndex);
    slider.setAttribute("aria-valuetext", formatWordRange(bandIndex));
  }
  if (rangeEl) rangeEl.textContent = formatWordRange(bandIndex);
  if (hintEl) {
    hintEl.textContent =
      bandIndex === 0
        ? "Starting prices shown"
        : "Prices update for all tiers below";
  }

  if (bands) {
    bands.querySelectorAll(".word-count-band").forEach((btn) => {
      const active = Number(btn.dataset.index) === bandIndex;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  updateTierCardPrices(bandIndex);

  if (syncForm && form?.words) {
    form.words.value = String(sampleWordsForBand(bandIndex));
    syncFormState();
  }
}

function initPriceGuides() {
  const slider = document.getElementById("word-count-slider");
  const bands = document.getElementById("word-count-bands");
  if (!slider || !bands) return;

  bands.innerHTML = LANGUAGE_PRICE_TABLE.map((_, index) => {
    return `
      <button
        type="button"
        class="word-count-band${index === 0 ? " is-active" : ""}"
        data-index="${index}"
        aria-pressed="${index === 0 ? "true" : "false"}"
      >
        ${shortBandLabel(index)}
      </button>
    `;
  }).join("");

  bands.addEventListener("click", (event) => {
    const btn = event.target.closest(".word-count-band");
    if (!btn) return;
    setWordCountBand(btn.dataset.index);
  });

  slider.addEventListener("input", () => {
    setWordCountBand(slider.value, { syncForm: false });
  });
  slider.addEventListener("change", () => {
    setWordCountBand(slider.value);
  });

  setWordCountBand(0, { syncForm: false });
}

function bandIndexForWords(words) {
  let index = 0;
  for (let i = 0; i < LANGUAGE_PRICE_TABLE.length; i += 1) {
    if (words >= LANGUAGE_PRICE_TABLE[i].minWords) index = i;
  }
  return index;
}

function countWordsInText(text) {
  let cleaned = String(text || "")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ");

  // Drop reference / bibliography blocks when clearly marked (approximate).
  const refMatch = cleaned.search(
    /\n\s*(references|bibliography|works cited|literature cited)\s*\n/i
  );
  if (refMatch > 120) {
    cleaned = cleaned.slice(0, refMatch);
  }

  const words = cleaned
    .trim()
    .split(/\s+/)
    .filter((token) => /[A-Za-z0-9\u00C0-\u024F]/.test(token));
  return words.length;
}

function looksLikeDocx(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 4));
  // ZIP signature "PK"
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function looksLikeLegacyDoc(buffer) {
  const bytes = new Uint8Array(buffer.slice(0, 8));
  // OLE Compound File magic
  return (
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  );
}

/** @type {{ words: number, figures: number, tables: number, items: number, fileName: string } | null} */
let lastManuscriptDetection = null;
let previousEditingTier = null;
/** Explicit Standard/Rapid opt-in for Figure & Table Editing (independent of form reset races). */
let figuresSelectiveOptIn = false;
/** Track Layout auto-included by Academic so we can clear it when leaving Academic. */
let layoutAutoIncludedByAcademic = false;
/** Explicit Standard/Rapid opt-in for Layout Editing. */
let layoutSelectiveOptIn = false;

function countUniqueCaptionIds(text, pattern) {
  const ids = new Set();
  const source = String(text || "");
  for (const match of source.matchAll(pattern)) {
    const digits = String(match[0]).replace(/\D/g, "");
    const n = Number(digits);
    if (n > 0) ids.add(n);
  }
  return ids.size;
}

/**
 * Count figures/tables from the same Word document.xml (+ relationships).
 * Uses structural markup first, then caption labels as a fallback.
 */
async function countFiguresAndTablesFromDocx(zip, docXml) {
  const tablesInXml = (docXml.match(/<w:tbl[\s>/]/g) || []).length;
  const drawings = (docXml.match(/<w:drawing[\s>/]/g) || []).length;
  const picts = (docXml.match(/<w:pict[\s>/]/g) || []).length;
  const objects = (docXml.match(/<w:object[\s>/]/g) || []).length;
  const blips = (docXml.match(/<a:blip\b/g) || []).length;

  let mediaImages = 0;
  const relsFile = zip.file("word/_rels/document.xml.rels");
  if (relsFile) {
    const relsXml = await relsFile.async("string");
    const targets = [...relsXml.matchAll(/\bTarget="([^"]+)"/g)].map((m) => m[1]);
    mediaImages = targets.filter((target) =>
      /(?:^|\/)media\//i.test(target) &&
      /\.(png|jpe?g|gif|emf|wmf|tiff?|bmp|svg|eps)$/i.test(target)
    ).length;
  }

  // Structural figure estimate from the same document part.
  let figures = Math.max(mediaImages, blips, drawings + picts + objects);

  // Plain text from the same document.xml for caption cues (Figure 1, Table 2…).
  const plainFromXml = docXml
    .replace(/<w:tab\b[^>]*\/>/g, " ")
    .replace(/<w:br\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");

  const captionFigures = countUniqueCaptionIds(
    plainFromXml,
    /\b(?:figure|fig\.?)\s*\d+/gi
  );
  const captionTables = countUniqueCaptionIds(
    plainFromXml,
    /\b(?:table|tbl\.?)\s*\d+/gi
  );

  if (captionFigures > figures) figures = captionFigures;

  let tables = tablesInXml;
  if (tables === 0 && captionTables > 0) tables = captionTables;
  // If caption max is higher than XML tables (e.g. some tables are images), prefer captions.
  if (captionTables > tables) tables = captionTables;

  return {
    figures,
    tables,
    items: figures + tables,
    methods: {
      mediaImages,
      blips,
      drawings,
      picts,
      tablesInXml,
      captionFigures,
      captionTables,
    },
  };
}

async function analyzeManuscript(file) {
  const name = (file.name || "").toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith(".txt")) {
    const text = new TextDecoder("utf-8").decode(buffer);
    return {
      words: countWordsInText(text),
      figures: 0,
      tables: 0,
      items: 0,
      fileName: file.name,
      note: "Plain text has no figures/tables to detect.",
    };
  }

  const isDocExt = name.endsWith(".doc");

  if (isDocExt && looksLikeLegacyDoc(buffer)) {
    throw new Error(
      "Legacy .doc (Word 97–2003) can’t be read in the browser. Please save as .docx and upload again."
    );
  }

  if (!looksLikeDocx(buffer)) {
    throw new Error(
      "Please upload a Word manuscript (.docx preferred; .doc if saved in modern format)."
    );
  }

  if (typeof mammoth === "undefined" || !mammoth.extractRawText) {
    throw new Error("Word reader failed to load. Please refresh the page and try again.");
  }
  if (typeof JSZip === "undefined") {
    throw new Error("Document parser failed to load. Please refresh the page and try again.");
  }

  // One file buffer → one ZIP + one text extract (same manuscript).
  const zip = await JSZip.loadAsync(buffer);
  const docEntry = zip.file("word/document.xml");
  if (!docEntry) {
    throw new Error("This Word file has no readable document body.");
  }

  const [docXml, textResult] = await Promise.all([
    docEntry.async("string"),
    mammoth.extractRawText({ arrayBuffer: buffer }),
  ]);

  const words = countWordsInText(textResult.value || "");
  const visuals = await countFiguresAndTablesFromDocx(zip, docXml);

  return {
    words,
    figures: visuals.figures,
    tables: visuals.tables,
    items: visuals.items,
    fileName: file.name,
    source: "same-docx",
  };
}

function currentEditingTier() {
  return form?.tier?.value || "rapid";
}

function isAcademicTier(tier = currentEditingTier()) {
  return tier === "academic";
}

function figureEditingEstimate(items, tier = currentEditingTier()) {
  const count = Math.max(0, Number(items) || 0);
  const hasLanguage =
    !!form &&
    Array.from(form.querySelectorAll('input[name="service"]:checked')).some(
      (input) => input.value === "language"
    );
  const included = hasLanguage && isAcademicTier(tier);
  const discount = hasLanguage ? FIGURE_DISCOUNT[tier] ?? 0 : 0;
  const base = count * RATES.figures.perUnit;
  const total = included ? 0 : base * (1 - discount);
  return { count, base, total, discount, tier, included };
}

function syncFiguresForTierAndDetection() {
  if (!lastManuscriptDetection || !form) return;

  const items = lastManuscriptDetection.items;
  const tier = currentEditingTier();
  const academic = isAcademicTier(tier);

  if (academic && items > 0) {
    setServiceChecked("figures", true);
    form.figures.value = String(items);
    return;
  }

  // Standard / Rapid: only keep figures if the user opted in via the detection checkbox
  // or already had the service selected with a count.
  const includeEl = document.getElementById("include-detected-figures");
  if (includeEl?.checked && items > 0) {
    setServiceChecked("figures", true);
    form.figures.value = String(items);
  }
}

function renderManuscriptDetection(detection) {
  const panel = document.getElementById("manuscript-detection");
  const wordsEl = document.getElementById("detect-words");
  const figuresEl = document.getElementById("detect-figures");
  const tablesEl = document.getElementById("detect-tables");
  const priceEl = document.getElementById("detection-figure-price");
  const includeEl = document.getElementById("include-detected-figures");
  const includeLabel = document.getElementById("detection-include-label");
  const includeText = document.getElementById("detection-include-text");
  const includedNote = document.getElementById("detection-included-note");
  const badgeEl = document.getElementById("detection-figure-badge");
  const offerEl = document.getElementById("detection-figure-offer");

  if (!panel || !detection) return;

  panel.classList.remove("hidden");
  if (wordsEl) wordsEl.textContent = detection.words.toLocaleString("en-US");
  if (figuresEl) figuresEl.textContent = String(detection.figures);
  if (tablesEl) tablesEl.textContent = String(detection.tables);

  const tier = currentEditingTier();
  const academic = isAcademicTier(tier);
  const estimate = figureEditingEstimate(detection.items, tier);
  const currency = form?.currency?.value || "CHF";
  const tierLabel =
    tier === "standard" ? "Standard" : tier === "academic" ? "Academic" : "Rapid";

  if (priceEl) {
    if (estimate.count < 1) {
      priceEl.innerHTML = "No figures or tables detected in the manuscript body.";
    } else if (estimate.included) {
      priceEl.innerHTML = `${estimate.count} item${estimate.count === 1 ? "" : "s"} · <strong>Included with ${tierLabel}</strong>`;
    } else if (estimate.discount > 0) {
      priceEl.innerHTML = `${estimate.count} item${estimate.count === 1 ? "" : "s"} · <strong>${formatMoney(
        estimate.total,
        currency
      )}</strong> <span>if added with ${tierLabel} (${Math.round(estimate.discount * 100)}% off)</span>`;
    } else {
      priceEl.innerHTML = `${estimate.count} item${estimate.count === 1 ? "" : "s"} · <strong>${formatMoney(
        estimate.total,
        currency
      )}</strong> <span>if added with ${tierLabel} (CHF ${RATES.figures.perUnit.toFixed(0)} each)</span>`;
    }
  }

  if (badgeEl) {
    badgeEl.textContent = academic ? "Included with Academic" : "Optional with Standard / Rapid";
    badgeEl.classList.toggle("is-included", academic && estimate.count > 0);
  }

  const showOptionalToggle = !academic && estimate.count > 0;
  includeLabel?.classList.toggle("hidden", !showOptionalToggle);
  includedNote?.classList.toggle("hidden", !(academic && estimate.count > 0));

  if (includeEl) {
    includeEl.disabled = estimate.count < 1 || academic;
    if (academic && estimate.count > 0) {
      includeEl.checked = true;
    } else if (estimate.count < 1) {
      includeEl.checked = false;
    } else {
      includeEl.checked = figuresSelectiveOptIn;
    }
  }
  if (includeText) {
    includeText.textContent =
      tier === "standard"
        ? "Add with Standard"
        : "Add with Rapid";
  }

  offerEl?.classList.toggle("is-disabled", estimate.count < 1);
  offerEl?.classList.toggle("is-included", academic && estimate.count > 0);
}

function applyManuscriptDetection(detection) {
  lastManuscriptDetection = detection;
  const count = Math.max(0, Math.round(Number(detection.words) || 0));
  const bandIndex = bandIndexForWords(count);

  // Apply words from this file. Figure count is stored in detection and applied
  // only when the figure service is selected (Standard/Rapid) or included (Academic).
  if (form?.words) {
    form.words.value = String(count || "");
  }

  setWordCountBand(bandIndex, { syncForm: false });

  const rangeEl = document.getElementById("word-count-range");
  const hintEl = document.getElementById("word-count-hint");
  if (rangeEl) {
    rangeEl.textContent =
      count > 0
        ? `${count.toLocaleString("en-US")} words detected`
        : formatWordRange(bandIndex);
  }
  if (hintEl) {
    const extras = [];
    if (detection.figures) extras.push(`${detection.figures} figures`);
    if (detection.tables) extras.push(`${detection.tables} tables`);
    hintEl.textContent = extras.length
      ? `From “${detection.fileName}” · ${extras.join(" · ")} (same file)`
      : `From “${detection.fileName}” · prices updated for this length`;
  }

  const wordsHint = document.getElementById("words-upload-hint");
  if (wordsHint && count > 0) {
    const figurePart =
      detection.items > 0
        ? ` Also detected ${detection.figures} figure${detection.figures === 1 ? "" : "s"} and ${detection.tables} table${detection.tables === 1 ? "" : "s"} in the same file.`
        : " No figures/tables detected in this file.";
    wordsHint.textContent = `Detected ${count.toLocaleString("en-US")} words from “${detection.fileName}”.${figurePart} Adjust manually if needed.`;
  }

  setServiceChecked("language", true);

  // New upload: Standard/Rapid start unselected; Academic includes automatically.
  if (isAcademicTier() && detection.items > 0) {
    figuresSelectiveOptIn = true;
  } else {
    figuresSelectiveOptIn = false;
    setServiceChecked("figures", false);
    if (form?.figures) form.figures.value = "";
  }

  syncFiguresForTierAndDetection();
  renderManuscriptDetection(detection);

  if (typeof syncFormState === "function" && form) {
    syncFormState();
  } else {
    updateTierCardPrices(bandIndex);
  }
}

function applyDetectedFiguresToQuote(include, { silent = false } = {}) {
  if (isAcademicTier()) {
    figuresSelectiveOptIn = true;
    syncFiguresForTierAndDetection();
    if (typeof syncFormState === "function" && form) syncFormState();
    return;
  }

  const items = lastManuscriptDetection?.items || 0;
  if (include && items < 1 && !lastManuscriptDetection) {
    // Allow manual selective add later only when detection exists.
    figuresSelectiveOptIn = false;
  }

  figuresSelectiveOptIn = !!include && items > 0;

  if (include && items < 1) {
    figuresSelectiveOptIn = false;
    const includeEl = document.getElementById("include-detected-figures");
    if (includeEl) includeEl.checked = false;
    const quoteInclude = document.getElementById("quote-include-figures");
    if (quoteInclude) quoteInclude.checked = false;
    if (!silent) showToast("No figures or tables were detected to add.");
    if (typeof syncFormState === "function" && form) syncFormState();
    return;
  }

  setServiceChecked("figures", figuresSelectiveOptIn);
  if (figuresSelectiveOptIn) {
    if (form?.figures) form.figures.value = String(items);
    if (!silent) {
      showToast(
        `Figure & Table Editing added for ${items} item${items === 1 ? "" : "s"} (10% off with language editing).`
      );
    }
  } else {
    if (form?.figures) form.figures.value = "";
  }

  const uploadInclude = document.getElementById("include-detected-figures");
  if (uploadInclude) uploadInclude.checked = figuresSelectiveOptIn;
  const quoteInclude = document.getElementById("quote-include-figures");
  if (quoteInclude) quoteInclude.checked = figuresSelectiveOptIn;

  if (typeof syncFormState === "function" && form) {
    syncFormState();
  }
  if (lastManuscriptDetection) {
    renderManuscriptDetection(lastManuscriptDetection);
  }
}

function applyLayoutToQuote(include) {
  if (isAcademicTier()) {
    layoutSelectiveOptIn = true;
    setServiceChecked("layout", true);
  } else {
    layoutSelectiveOptIn = !!include;
    setServiceChecked("layout", layoutSelectiveOptIn);
  }

  const checkbox = document.getElementById("quote-include-layout");
  if (checkbox) {
    checkbox.checked = isAcademicTier() || layoutSelectiveOptIn;
  }

  syncFormState();

  if (!isAcademicTier()) {
    showToast(
      layoutSelectiveOptIn
        ? "Layout Editing added to the quote."
        : "Layout Editing removed from the quote."
    );
  }
}

async function handleManuscriptFile(file, statusEl) {
  if (!file) return;

  const setStatus = (message, type) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("is-success", type === "success");
    statusEl.classList.toggle("is-error", type === "error");
  };

  const dropzone = document.getElementById("manuscript-upload");
  dropzone?.classList.add("is-loading");
  setStatus(`Reading “${file.name}”…`, null);

  try {
    const detection = await analyzeManuscript(file);
    if (detection.words < 1) {
      throw new Error("No readable words were found in that file.");
    }
    applyManuscriptDetection(detection);

    const parts = [
      `${detection.words.toLocaleString("en-US")} words`,
      `${detection.figures} figure${detection.figures === 1 ? "" : "s"}`,
      `${detection.tables} table${detection.tables === 1 ? "" : "s"}`,
    ];
    setStatus(`Detected ${parts.join(" · ")} from “${file.name}”.`, "success");
    const tier = currentEditingTier();
    let figureMsg = "";
    if (detection.items > 0) {
      figureMsg = isAcademicTier(tier)
        ? ` Figure & Table Editing included with Academic for ${detection.items} item${detection.items === 1 ? "" : "s"}.`
        : ` ${detection.items} figure/table item${detection.items === 1 ? "" : "s"} detected — optionally add Figure & Table Editing with ${tier === "standard" ? "Standard" : "Rapid"}.`;
    }
    showToast(
      `Detected ${detection.words.toLocaleString("en-US")} words.${figureMsg || " Language editing prices updated."}`
    );
  } catch (error) {
    const message = error?.message || "Could not read that manuscript.";
    setStatus(message, "error");
    showToast(message);
  } finally {
    dropzone?.classList.remove("is-loading");
  }
}

function initManuscriptUpload() {
  const dropzone = document.getElementById("manuscript-upload");
  const mainInput = document.getElementById("manuscript-file-input");
  const quoteInput = document.getElementById("quote-manuscript-input");
  const statusEl = document.getElementById("manuscript-upload-status");
  const includeEl = document.getElementById("include-detected-figures");

  const onFile = (file) => handleManuscriptFile(file, statusEl);

  includeEl?.addEventListener("change", (event) => {
    event.stopPropagation();
    applyDetectedFiguresToQuote(includeEl.checked);
  });

  const quoteIncludeFigures = document.getElementById("quote-include-figures");
  quoteIncludeFigures?.addEventListener("click", (event) => {
    // Ensure the control is interactive even if a parent handler interferes.
    event.stopPropagation();
  });
  quoteIncludeFigures?.addEventListener("change", (event) => {
    event.stopPropagation();
    if (isAcademicTier()) {
      quoteIncludeFigures.checked = true;
      applyDetectedFiguresToQuote(true);
      return;
    }
    applyDetectedFiguresToQuote(quoteIncludeFigures.checked);
  });

  document.getElementById("figure-opt-in-row")?.addEventListener("click", (event) => {
    // Clicking the label text should toggle the checkbox reliably.
    if (event.target === quoteIncludeFigures) return;
    if (quoteIncludeFigures?.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    if (isAcademicTier()) return;
    quoteIncludeFigures.checked = !quoteIncludeFigures.checked;
    applyDetectedFiguresToQuote(quoteIncludeFigures.checked);
  });

  const quoteIncludeLayout = document.getElementById("quote-include-layout");
  quoteIncludeLayout?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  quoteIncludeLayout?.addEventListener("change", (event) => {
    event.stopPropagation();
    applyLayoutToQuote(quoteIncludeLayout.checked);
  });

  document.getElementById("layout-opt-in-row")?.addEventListener("click", (event) => {
    if (event.target === quoteIncludeLayout) return;
    if (quoteIncludeLayout?.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    quoteIncludeLayout.checked = !quoteIncludeLayout.checked;
    applyLayoutToQuote(quoteIncludeLayout.checked);
  });

  if (mainInput) {
    mainInput.addEventListener("change", () => {
      const file = mainInput.files?.[0];
      if (file) onFile(file);
      mainInput.value = "";
    });
  }

  if (quoteInput) {
    quoteInput.addEventListener("change", () => {
      const file = quoteInput.files?.[0];
      if (file) onFile(file);
      quoteInput.value = "";
    });
  }

  if (!dropzone || !mainInput) return;

  const openPicker = () => mainInput.click();

  dropzone.addEventListener("click", (event) => {
    if (event.target === mainInput) return;
    // Keep figure opt-in controls from opening the file picker.
    if (event.target.closest("#manuscript-detection")) return;
    openPicker();
  });

  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  });

  ["dragenter", "dragover"].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragover");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) onFile(file);
  });
}

function renderAddonPrices() {
  const servicePrices = {
    figures: `CHF ${RATES.figures.perUnit.toFixed(2)}`,
    layout: `CHF ${RATES.layout.flat.toFixed(2)}`,
    graphical: `CHF ${RATES.graphical.flat.toFixed(2)}`,
  };

  document.querySelectorAll("[data-price-service]").forEach((el) => {
    const key = el.dataset.priceService;
    if (key === "video") {
      // Homepage card keeps published list prices; VIDEO10 promo lives in the quote estimate.
      return;
    }
    const text = servicePrices[key];
    if (text) el.textContent = text;
  });
}

function updateVideoTypeOptions() {
  const select = document.getElementById("video-type");
  if (!select) return;
  const current = select.value || "abstract";

  [...select.options].forEach((option) => {
    if (!option.value) return;
    const label = VIDEO_TYPE_LABELS[option.value] || option.value;
    const base = RATES.video[option.value];
    option.textContent = `${label} — CHF ${base}`;
  });

  if (current) select.value = current;
}

function renderVideoCampaignPrices() {
  const campaignActive = isVideoCampaignActive();
  document.querySelectorAll("[data-video-type-price]").forEach((el) => {
    const type = el.dataset.videoTypePrice;
    const base = RATES.video[type];
    if (!base) return;
    if (!campaignActive) {
      el.textContent = `CHF ${base}`;
      return;
    }
    const discounted = getVideoPrice(type);
    el.innerHTML = `CHF ${formatVideoListPrice(discounted)} <small>10% off</small>`;
  });

  const note = document.getElementById("video-campaign-note");
  if (note) {
    const showInEstimate =
      campaignActive && !!document.querySelector('input[name="service"][value="video"]:checked');
    note.classList.toggle("hidden", !showInEstimate);
  }
}

const EXAMPLE_GALLERY = {
  figures: {
    title: "Figure & Table Editing examples",
    images: [
      {
        src: "assets/figures-example-1.png",
        alt: "Before and after: scientific illustration and stacked bar chart editing",
      },
      {
        src: "assets/figures-example-2.png",
        alt: "Before and after: flowchart, line graph, bar chart, and pie chart editing",
      },
    ],
  },
  layout: {
    title: "Layout Editing examples",
    images: [
      {
        src: "assets/layout-example-1.png",
        alt: "Before and after: manuscript formatted for MDPI Antibiotics with editorial comments",
      },
      {
        src: "assets/layout-example-2.png",
        alt: "Before and after: references section formatted for MDPI Heritage with tracked changes",
      },
    ],
  },
  graphical: {
    title: "Graphical Abstract examples",
    images: [
      {
        src: "assets/graphical-example-1.png",
        alt: "Cite Lens graphical abstract with NLP embeddings and ROC analysis",
      },
      {
        src: "assets/graphical-example-2.png",
        alt: "SMEDDS pharmaceutical graphical abstract with formulation and stability study",
      },
      {
        src: "assets/graphical-example-3.png",
        alt: "Chromite processing graphical abstract comparing conventional and comprehensive methods",
      },
    ],
  },
};

/** Official sample videos from https://www.mdpi.com/authors/services */
const VIDEO_EXAMPLES = [
  {
    id: "abstract",
    name: "Video Abstract",
    price: 600,
    description:
      "A video abstract is an animated or filmed summary of your article that helps readers quickly understand your research and increases its visibility online.",
    src: "https://res.mdpi.com/data/video-abstract-vegan-and-vegetarian-diets-for-dogs-and-cats.mp4",
  },
  {
    id: "short",
    name: "Short Take",
    price: 500,
    description:
      "A short take is a concise presentation of research highlights, typically in a 2-3 minute format, designed to capture the essence of your study for a broader audience.",
    src: "https://res.mdpi.com/data/short-take-carbapenemases-and-in-vitro-tests-prior-to-treatment.mp4",
  },
  {
    id: "profile",
    name: "Scholar Profile",
    price: 500,
    description:
      "A scholar profile video introduces you and your research expertise, helping you build an academic presence and connect with collaborators worldwide.",
    src: "https://res.mdpi.com/data/scholar-profile-martin-a.-masuelli.mp4",
  },
  {
    id: "interview",
    name: "Scholar Interview",
    price: 400,
    description:
      "A scholar interview features a conversation about your work, methods, and findings, making your research more accessible to a wider audience.",
    src: "https://res.mdpi.com/data/scholar-interview.mp4",
  },
];

function initExampleModal() {
  const modal = document.getElementById("example-modal");
  const titleEl = document.getElementById("example-modal-title");
  const imageEl = document.getElementById("example-modal-image");
  const canvas = document.getElementById("example-modal-canvas");
  const stage = modal?.querySelector(".example-modal-stage");
  const zoomLabel = document.getElementById("example-zoom-label");
  const prevBtn = document.getElementById("example-prev");
  const nextBtn = document.getElementById("example-next");
  const countEl = document.getElementById("example-count");
  if (!modal || !titleEl || !imageEl || !canvas || !stage || !zoomLabel) return;

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let images = [];
  let imageIndex = 0;

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.25;

  function applyTransform() {
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  }

  function setZoom(next) {
    scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (scale === 1) {
      offsetX = 0;
      offsetY = 0;
    }
    applyTransform();
  }

  function showImage(index) {
    if (!images.length) return;
    imageIndex = (index + images.length) % images.length;
    const item = images[imageIndex];
    imageEl.src = item.src;
    imageEl.alt = item.alt;
    setZoom(1);

    const multi = images.length > 1;
    prevBtn?.classList.toggle("hidden", !multi);
    nextBtn?.classList.toggle("hidden", !multi);
    if (countEl) {
      countEl.classList.toggle("hidden", !multi);
      countEl.textContent = `Example ${imageIndex + 1} of ${images.length}`;
    }
  }

  function openModal(service) {
    const item = EXAMPLE_GALLERY[service];
    if (!item) return;
    images = item.images || [];
    titleEl.textContent = item.title;
    showImage(0);
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
    dragging = false;
    stage.classList.remove("is-dragging");
  }

  document.querySelectorAll(".link-examples").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const service = btn.dataset.example;
      if (service === "video") return; // handled by initVideoExampleModal
      event.preventDefault();
      event.stopPropagation();
      openModal(service);
    });
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  prevBtn?.addEventListener("click", () => showImage(imageIndex - 1));
  nextBtn?.addEventListener("click", () => showImage(imageIndex + 1));

  document.getElementById("example-zoom-in")?.addEventListener("click", () => {
    setZoom(scale + ZOOM_STEP);
  });
  document.getElementById("example-zoom-out")?.addEventListener("click", () => {
    setZoom(scale - ZOOM_STEP);
  });
  document.getElementById("example-zoom-reset")?.addEventListener("click", () => {
    setZoom(1);
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (modal.classList.contains("hidden")) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(scale + delta);
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".example-nav")) return;
    if (scale <= 1) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    originX = offsetX;
    originY = offsetY;
    stage.classList.add("is-dragging");
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    offsetX = originX + (event.clientX - startX);
    offsetY = originY + (event.clientY - startY);
    applyTransform();
  });

  const endDrag = () => {
    dragging = false;
    stage.classList.remove("is-dragging");
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") showImage(imageIndex - 1);
    if (event.key === "ArrowRight") showImage(imageIndex + 1);
    if (event.key === "+" || event.key === "=") setZoom(scale + ZOOM_STEP);
    if (event.key === "-" || event.key === "_") setZoom(scale - ZOOM_STEP);
    if (event.key === "0") setZoom(1);
  });
}

function initVideoExampleModal() {
  const modal = document.getElementById("video-example-modal");
  const sidebar = document.getElementById("video-example-sidebar");
  const descriptionEl = document.getElementById("video-example-description");
  const videoEl = document.getElementById("video-example-video");
  if (!modal || !sidebar || !descriptionEl || !videoEl) return;

  let activeId = "abstract";

  function renderSidebar() {
    sidebar.innerHTML = VIDEO_EXAMPLES.map((item) => {
      const active = item.id === activeId ? " is-active" : "";
      return `
        <button
          type="button"
          class="video-type-card${active}"
          data-video-type="${item.id}"
          role="tab"
          aria-selected="${item.id === activeId}"
        >
          <span class="video-type-name">${item.name}</span>
          <span class="video-type-price">${item.price} CHF</span>
        </button>
      `;
    }).join("");
  }

  function showType(id, { autoplay = false } = {}) {
    const item = VIDEO_EXAMPLES.find((entry) => entry.id === id) || VIDEO_EXAMPLES[0];
    activeId = item.id;
    descriptionEl.textContent = item.description;
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.src = item.src;
    videoEl.load();
    if (autoplay) {
      videoEl.play().catch(() => {});
    }
    renderSidebar();
  }

  function openModal() {
    showType(activeId);
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    videoEl.pause();
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  sidebar.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-video-type]");
    if (!btn) return;
    showType(btn.dataset.videoType);
  });

  modal.querySelectorAll("[data-close-video-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("open-video-examples", openModal);

  document.querySelectorAll('.link-examples[data-example="video"]').forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden")) return;
    if (event.key === "Escape") closeModal();
  });

  showType("abstract");
}

function formatMoney(amount, currency) {
  const converted = amount * (FX[currency] ?? 1);
  return `${currency} ${converted.toFixed(2)}`;
}

function setLine(id, value, currency, active, freeLabel) {
  const line = document.getElementById(id);
  if (!line) return;
  const dd = line.querySelector("dd");
  line.classList.toggle("is-active", !!active);
  if (!active) {
    dd.textContent = "—";
    return;
  }
  if (freeLabel) {
    dd.textContent = freeLabel;
    return;
  }
  dd.textContent = formatMoney(value, currency);
}

function updateQuoteUx(services, total, currency) {
  const steps = document.querySelectorAll(".quote-steps li");
  const hasServices = services.length > 0;
  const hasConfig =
    (services.includes("language") && Number(form.words?.value) > 0) ||
    (services.includes("figures") && Number(form.figures?.value) > 0) ||
    (services.includes("layout")) ||
    services.includes("graphical") ||
    services.includes("video");
  const hasEstimate = total > 0;

  steps.forEach((step) => {
    const n = step.getAttribute("data-quote-step");
    step.classList.remove("is-active", "is-done");
    if (n === "1") {
      step.classList.toggle("is-active", !hasServices || (!hasConfig && !hasEstimate));
      step.classList.toggle("is-done", hasServices);
    } else if (n === "2") {
      step.classList.toggle("is-active", hasServices && !hasEstimate);
      step.classList.toggle("is-done", hasConfig && hasEstimate);
    } else if (n === "3") {
      step.classList.toggle("is-active", hasEstimate);
      step.classList.toggle("is-done", hasEstimate);
    }
  });

  const sub = document.getElementById("price-panel-sub");
  if (!sub) return;
  if (!hasServices) {
    sub.textContent = "Select a service to begin";
  } else if (!hasEstimate) {
    sub.textContent = "Add details below to calculate price";
  } else {
    const labels = {
      language: "Language",
      figures: "Figures",
      layout: "Layout",
      graphical: "Graphical",
      video: "Video",
    };
    const names = services.map((s) => labels[s] || s).join(" · ");
    sub.textContent = `${names} · ${formatMoney(total, currency)}`;
  }
}

function updatePricePanelVideoCampaign(services) {
  const note = document.getElementById("video-campaign-note");
  if (!note) return;
  const show = isVideoCampaignActive() && services.includes("video");
  note.classList.toggle("hidden", !show);
}

function togglePanel(service, visible) {
  const panel = document.getElementById(SERVICE_PANELS[service]);
  panel.classList.toggle("hidden", !visible);
}

function calculateQuote() {
  const services = getSelectedServices();
  const tier = form.tier.value;
  const words = Math.max(0, Number(form.words.value) || 0);
  const figures = Math.max(0, Number(form.figures.value) || 0);
  const currency = form.currency.value;
  const email = form.email.value.trim();
  const videoType = getVideoTypeValue();

  let language = 0;
  let figureCost = 0;
  let layout = 0;
  let graphical = 0;
  let video = 0;

  if (services.includes("language") && words > 0) {
    language = getLanguagePrice(words, tier);
  }

  const figuresIncluded =
    services.includes("figures") &&
    services.includes("language") &&
    isAcademicTier(tier) &&
    figures > 0;

  if (services.includes("figures") && figures > 0) {
    const base = figures * RATES.figures.perUnit;
    const discount = services.includes("language") ? (FIGURE_DISCOUNT[tier] ?? 0) : 0;
    figureCost = figuresIncluded ? 0 : base * (1 - discount);
  }

  const layoutFree =
    services.includes("layout") &&
    services.includes("language") &&
    tier === "academic";

  if (services.includes("layout")) {
    const layoutDiscount = services.includes("language")
      ? LAYOUT_DISCOUNT[tier] ?? 0
      : 0;
    layout = layoutFree
      ? 0
      : RATES.layout.flat * (1 - layoutDiscount);
  }

  if (services.includes("graphical")) {
    graphical = RATES.graphical.flat;
  }

  if (services.includes("video")) {
    video = getVideoPrice(videoType);
  }

  const subtotal = language + figureCost + layout + graphical + video;
  const ioap = isIoapEligible(email) && services.length > 0 && subtotal > 0;
  const discount = ioap ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  setLine("line-language", language, currency, language > 0);
  setLine(
    "line-figures",
    figureCost,
    currency,
    services.includes("figures") && figures > 0,
    figuresIncluded ? "Included (Academic)" : null
  );
  setLine(
    "line-layout",
    layout,
    currency,
    services.includes("layout"),
    layoutFree ? "Included (Academic)" : null
  );
  setLine("line-graphical", graphical, currency, services.includes("graphical"));
  const videoActive = services.includes("video") && video > 0;
  const videoCampaignActive = videoActive && isVideoCampaignActive();
  const videoBase = getVideoBasePrice(videoType);
  setLine("line-video", video, currency, videoActive);
  const videoLine = document.getElementById("line-video");
  const videoDt = videoLine?.querySelector("dt");
  const videoDd = videoLine?.querySelector("dd");
  if (videoDt) {
    videoDt.textContent = videoCampaignActive
      ? "Video Production (VIDEO10 · 10% off)"
      : "Video Production";
  }
  if (videoDd && videoActive && videoCampaignActive && videoBase > video) {
    videoDd.innerHTML = `<span class="price-was">${formatMoney(videoBase, currency)}</span> ${formatMoney(video, currency)}`;
  }

  if (discount > 0) {
    discountLine.classList.remove("hidden");
    discountLine.querySelector("dd").textContent = `−${formatMoney(discount, currency)}`;
  } else {
    discountLine.classList.add("hidden");
  }

  totalEl.textContent = formatMoney(total, currency);
  updateQuoteUx(services, total, currency);
  updatePricePanelVideoCampaign(services);

  if (ioap) {
    ioapBanner.classList.remove("hidden");
  } else {
    ioapBanner.classList.add("hidden");
  }

  return {
    total,
    currency,
    services,
    tier,
    words,
    figures,
    videoType,
    pricing: {
      language,
      figures: figureCost,
      figuresIncluded,
      layout,
      layoutIncluded: layoutFree,
      graphical,
      video,
      videoCampaign: videoActive && isVideoCampaignActive(),
      subtotal,
      ioapDiscount: discount,
      total,
    },
  };
}

function buildOrderPayload() {
  const quote = calculateQuote();
  if (!quote.total || quote.total <= 0) return null;

  return {
    services: quote.services,
    tier: quote.tier,
    words: quote.words,
    figures: quote.figures,
    videoType: quote.videoType,
    currency: quote.currency,
    email: form.email?.value.trim() || "",
    manuscriptFileName: lastManuscriptDetection?.fileName || null,
    detectedFigures: lastManuscriptDetection?.figures || 0,
    detectedTables: lastManuscriptDetection?.tables || 0,
    pricing: quote.pricing,
    createdAt: new Date().toISOString(),
    details: {},
    invoice: {},
    review: {},
  };
}

function saveOrderAndGoToCheckout() {
  const payload = buildOrderPayload();
  if (!payload) return false;
  sessionStorage.setItem("mdpi-as-order-v1", JSON.stringify(payload));
  window.location.href = "checkout.html";
  return true;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.add("hidden"), 4000);
}

function syncFormState() {
  const services = getSelectedServices();
  const hasLanguage = services.includes("language");
  const hasFigures = services.includes("figures");
  const hasLayout = services.includes("layout");
  const tier = form.tier.value;
  const isAcademic = tier === "academic";
  const detectedItems = lastManuscriptDetection?.items || 0;
  const hasDetectedFigures = detectedItems > 0;
  const figureItemCount = Math.max(0, Number(form?.figures?.value) || 0);
  const hasFigureItems = hasDetectedFigures || figureItemCount > 0;

  noServiceHint.classList.toggle("hidden", services.length > 0);

  // Academic includes Layout Editing for MDPI journals.
  const leavingAcademic =
    previousEditingTier === "academic" && !isAcademic;
  const layoutIncludedByE3 = !!(hasLanguage && isAcademic);

  const layoutServiceInput = document.querySelector(
    'input[name="service"][value="layout"]'
  );
  // Keep enabled while we set checked, so the selection always sticks.
  if (layoutServiceInput) layoutServiceInput.disabled = false;

  if (layoutIncludedByE3) {
    setServiceChecked("layout", true);
    layoutAutoIncludedByAcademic = true;
    layoutSelectiveOptIn = true;
  } else if (leavingAcademic && layoutAutoIncludedByAcademic) {
    setServiceChecked("layout", false);
    layoutAutoIncludedByAcademic = false;
    layoutSelectiveOptIn = false;
  } else if (hasLanguage && !isAcademic) {
    setServiceChecked("layout", layoutSelectiveOptIn);
  }

  const layoutNowSelected =
    layoutIncludedByE3 || getSelectedServices().includes("layout");

  Object.keys(SERVICE_PANELS).forEach((service) => {
    if (service === "figures") {
      // Show for selected figures, or as selective offer after manuscript detection with language.
      const showFiguresPanel =
        hasFigures || (hasLanguage && hasDetectedFigures);
      togglePanel(service, showFiguresPanel);
      return;
    }
    if (service === "layout") {
      // Show beside Figure Editing after upload; Standard/Rapid can then opt in.
      togglePanel(
        service,
        layoutNowSelected ||
          layoutIncludedByE3 ||
          (hasLanguage && !!lastManuscriptDetection)
      );
      return;
    }
    togglePanel(service, services.includes(service));
  });

  document.getElementById("panel-ioap")?.classList.toggle(
    "hidden",
    services.length === 0
  );

  updateLanguagePerkMessage(hasLanguage, tier, isAcademic);

  const layoutSelectedRow = document.getElementById("layout-selected-row");
  const layoutOptInRow = document.getElementById("layout-opt-in-row");
  const quoteIncludeLayout = document.getElementById("quote-include-layout");
  const layoutOptInText = document.getElementById("layout-opt-in-text");
  const layoutOptFields = document.getElementById("layout-opt-fields");
  document.getElementById("layout-included-banner")?.classList.add("hidden");
  if (layoutSelectedRow) {
    layoutSelectedRow.classList.toggle("hidden", !layoutIncludedByE3);
  }
  layoutOptInRow?.classList.toggle("hidden", isAcademic || !hasLanguage);
  const layoutIncludedCheck = document.getElementById("layout-included-check");
  if (layoutIncludedCheck) layoutIncludedCheck.checked = layoutIncludedByE3;
  if (quoteIncludeLayout) {
    quoteIncludeLayout.disabled = isAcademic;
    quoteIncludeLayout.checked = isAcademic
      ? layoutIncludedByE3
      : layoutSelectiveOptIn;
  }
  if (layoutOptInText && !isAcademic) {
    layoutOptInText.innerHTML =
      `Add Layout Editing<small>Optional with ${tier === "standard" ? "Standard" : "Rapid"} · CHF ${RATES.layout.flat.toFixed(2)} per submission</small>`;
  }
  layoutOptFields?.classList.toggle(
    "hidden",
    !(
      layoutIncludedByE3 ||
      (!hasLanguage && layoutNowSelected) ||
      (hasLanguage && !isAcademic && layoutSelectiveOptIn)
    )
  );

  // Keep Layout listed/selected directly under Figure & Table Editing for Academic.
  const layoutCheckboxCard = document
    .querySelector('input[name="service"][value="layout"]')
    ?.closest(".checkbox-card");
  layoutCheckboxCard?.classList.toggle("is-included-selected", layoutIncludedByE3);
  const figuresCheckboxCard = document
    .querySelector('input[name="service"][value="figures"]')
    ?.closest(".checkbox-card");
  figuresCheckboxCard?.classList.toggle(
    "is-included-selected",
    !!(hasLanguage && isAcademic && hasFigureItems)
  );

  const figureOptInRow = document.getElementById("figure-opt-in-row");
  const figureOptFields = document.getElementById("figure-opt-fields");
  const quoteIncludeFigures = document.getElementById("quote-include-figures");
  const figureOptInText = document.getElementById("figure-opt-in-text");
  const figuresDetectionHint = document.getElementById("figures-detection-hint");

  // Academic includes detected figures/tables; Standard/Rapid remain selective.
  if (lastManuscriptDetection) {
    const items = lastManuscriptDetection.items;

    if (isAcademic && hasLanguage && items > 0) {
      setServiceChecked("figures", true);
      if (form.figures) form.figures.value = String(items);
    } else if (leavingAcademic) {
      figuresSelectiveOptIn = false;
      setServiceChecked("figures", false);
      if (form.figures) form.figures.value = "";
      const includeDetected = document.getElementById("include-detected-figures");
      if (includeDetected) includeDetected.checked = false;
      if (quoteIncludeFigures) quoteIncludeFigures.checked = false;
    } else if (!isAcademic && hasLanguage && hasDetectedFigures) {
      // Honor explicit selective opt-in for Standard/Rapid.
      setServiceChecked("figures", figuresSelectiveOptIn);
      if (figuresSelectiveOptIn) {
        form.figures.value = String(items);
      } else if (!hasFigures) {
        form.figures.value = "";
      }
    }

    renderManuscriptDetection(lastManuscriptDetection);
  }

  previousEditingTier = tier;

  if (isAcademic && hasLanguage && hasFigureItems) {
    setServiceChecked("figures", true);
  }

  const figuresNowSelected =
    getSelectedServices().includes("figures") ||
    (isAcademic && hasFigureItems) ||
    (!isAcademic && figuresSelectiveOptIn && hasDetectedFigures);

  // Keep the service checkbox and selective control aligned with opt-in state.
  if (!isAcademic && hasDetectedFigures) {
    setServiceChecked("figures", figuresSelectiveOptIn);
  }

  if (figureOptInRow && quoteIncludeFigures) {
    const showOptIn = hasLanguage && (hasFigureItems || figuresNowSelected);
    figureOptInRow.classList.toggle("hidden", !showOptIn);
    figureOptInRow.classList.toggle("is-locked", isAcademic && hasFigureItems);
    figureOptInRow.classList.toggle("is-selective", !isAcademic);

    quoteIncludeFigures.disabled = !!(isAcademic && hasFigureItems);
    // Never overwrite a user's click with a stale service flag.
    quoteIncludeFigures.checked = isAcademic
      ? hasFigureItems
      : figuresSelectiveOptIn;

    const tierShort = tier === "standard" ? "Standard" : "Rapid";
    const detectedSummary = hasDetectedFigures
      ? `Detected ${lastManuscriptDetection.figures} figure${lastManuscriptDetection.figures === 1 ? "" : "s"} and ${lastManuscriptDetection.tables} table${lastManuscriptDetection.tables === 1 ? "" : "s"} · optional · 10% off with ${tierShort}`
      : `Optional with ${tierShort} · 10% off with language editing`;

    if (figureOptInText) {
      if (isAcademic && hasFigureItems) {
        const includedSummary = hasDetectedFigures
          ? `Detected ${lastManuscriptDetection.figures} figure${lastManuscriptDetection.figures === 1 ? "" : "s"} and ${lastManuscriptDetection.tables} table${lastManuscriptDetection.tables === 1 ? "" : "s"} from your manuscript`
          : `${figureItemCount} figure/table item${figureItemCount === 1 ? "" : "s"} included`;
        figureOptInText.innerHTML =
          `Figure &amp; Table Editing included with Academic<small>${includedSummary}</small>`;
      } else {
        figureOptInText.innerHTML =
          `Add Figure &amp; Table Editing<small id="figure-opt-summary">${detectedSummary}</small>`;
      }
    }
  }

  // Selective: hide count/price fields until the user opts in (Standard/Rapid).
  // Academic (included) shows fields immediately.
  const showFigureFields =
    figuresNowSelected || (isAcademic && hasFigureItems);
  figureOptFields?.classList.toggle("hidden", !showFigureFields);

  if (showFigureFields && hasDetectedFigures && form.figures) {
    form.figures.value = String(detectedItems);
  }

  if (figuresDetectionHint) {
    if (showFigureFields && lastManuscriptDetection && hasDetectedFigures) {
      figuresDetectionHint.classList.remove("hidden");
      figuresDetectionHint.textContent = `Detected ${lastManuscriptDetection.figures} figure${lastManuscriptDetection.figures === 1 ? "" : "s"} and ${lastManuscriptDetection.tables} table${lastManuscriptDetection.tables === 1 ? "" : "s"} from “${lastManuscriptDetection.fileName}”.`;
    } else {
      figuresDetectionHint.classList.add("hidden");
    }
  }

  const figureDiscount =
    hasLanguage && figuresNowSelected ? FIGURE_DISCOUNT[tier] ?? 0 : 0;
  figuresDiscountHint.classList.toggle(
    "hidden",
    !(figuresNowSelected && (figureDiscount > 0 || (isAcademic && hasLanguage)))
  );
  if (figuresDiscountHint && figuresNowSelected) {
    if (isAcademic && hasLanguage) {
      figuresDiscountHint.textContent =
        "Included with your Academic Language Editing service.";
    } else if (figureDiscount > 0) {
      figuresDiscountHint.textContent = `${Math.round(
        figureDiscount * 100
      )}% discount applied from your Language Editing service (${tier === "standard" ? "Standard" : "Rapid"}).`;
    }
  }

  layoutFreeHint?.classList.toggle(
    "hidden",
    !(layoutNowSelected && hasLanguage && isAcademic)
  );
  if (layoutFreeHint && layoutNowSelected && hasLanguage && isAcademic) {
    layoutFreeHint.textContent =
      "Included with your Academic Language Editing service for MDPI journals.";
  }

  // Prevent unchecking Layout while Academic includes it (without disabling the input).
  if (layoutServiceInput) {
    layoutServiceInput.dataset.lockedByAcademic = layoutIncludedByE3 ? "1" : "";
  }

  updateAcademicRecommendation(hasLanguage, tier);
  updateVideoTypeOptions();
  renderVideoCampaignPrices();
  calculateQuote();
}

function updateLanguagePerkMessage(hasLanguage, tier, isAcademic) {
  const languagePerk = document.getElementById("language-figure-perk");
  if (!languagePerk) return;
  languagePerk.classList.toggle("hidden", !hasLanguage);
  if (!hasLanguage) return;

  if (isAcademic) {
    languagePerk.innerHTML =
      "With Academic: <strong>Figure &amp; Table Editing</strong> is included when figures/tables are detected in your manuscript, and <strong>Layout Editing for MDPI journals</strong> is included.";
  } else {
    languagePerk.innerHTML =
      `With ${tier === "standard" ? "Standard" : "Rapid"}: <strong>10% off</strong> Figure &amp; Table Editing when added to language editing.`;
  }
}

function updateAcademicRecommendation(hasLanguage, tier) {
  const recommendation = document.getElementById("academic-recommendation");
  const recommendationText = document.getElementById(
    "academic-recommendation-text"
  );
  if (!recommendation || !recommendationText) return;

  const words = Math.max(0, Number(form?.words?.value) || 0);
  const selectedServices = getSelectedServices();
  const figureCount = Math.max(0, Number(form?.figures?.value) || 0);
  const hasSelectedFigures =
    selectedServices.includes("figures") && figureCount > 0;
  const hasSelectedLayout = selectedServices.includes("layout");
  const canCompare =
    hasLanguage &&
    tier !== "academic" &&
    words > 0 &&
    (hasSelectedFigures || hasSelectedLayout);

  if (!canCompare) {
    recommendation.classList.add("hidden");
    return;
  }

  const languagePrice = getLanguagePrice(words, tier);
  const figurePrice = hasSelectedFigures
    ? figureCount *
      RATES.figures.perUnit *
      (1 - (FIGURE_DISCOUNT[tier] ?? 0))
    : 0;
  const layoutPrice = hasSelectedLayout ? RATES.layout.flat : 0;
  const currentBundlePrice = languagePrice + figurePrice + layoutPrice;
  const academicPrice = getLanguagePrice(words, "academic");
  const savings = currentBundlePrice - academicPrice;

  if (savings <= 0) {
    recommendation.classList.add("hidden");
    return;
  }

  const currency = form?.currency?.value || "CHF";
  const tierLabel = tier === "standard" ? "Standard" : "Rapid";
  const bundleParts = [`${tierLabel} language editing`];
  if (hasSelectedFigures) {
    bundleParts.push(
      `Figure &amp; Table Editing for ${figureCount} item${figureCount === 1 ? "" : "s"} (10% off)`
    );
  }
  if (hasSelectedLayout) {
    bundleParts.push("Layout Editing (full price)");
  }

  const academicIncludes = [];
  if (hasSelectedFigures) {
    academicIncludes.push("Figure &amp; Table Editing");
  }
  if (hasSelectedLayout) {
    academicIncludes.push("Layout Editing for MDPI journals");
  }
  const academicIncludeLabel =
    academicIncludes.length > 0
      ? academicIncludes.join(" and ")
      : "these add-ons";

  recommendationText.innerHTML =
    `Your bundle (${bundleParts.join(" + ")}) is estimated at ` +
    `<strong>${formatMoney(currentBundlePrice, currency)}</strong>. ` +
    `<strong>Academic</strong> is <strong>${formatMoney(academicPrice, currency)}</strong> ` +
    `and includes ${academicIncludeLabel}. ` +
    `Estimated saving: <strong>${formatMoney(savings, currency)}</strong>.`;
  recommendation.classList.remove("hidden");
}

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

function initVideoTypeOrdering() {
  const cards = Array.from(document.querySelectorAll("[data-order-video-type]"));
  const orderLink = document.getElementById("order-selected-video");
  const selectedLabel = document.getElementById("selected-video-label");
  if (!cards.length || !orderLink) return;

  const selectCard = (card) => {
    const input = card.querySelector(".video-price-selector");
    if (!input) return;
    input.checked = true;

    const type = card.dataset.orderVideoType;
    const label = card.dataset.orderVideoLabel;
    cards.forEach((item) => {
      item.classList.toggle("is-selected", item === card);
    });

    orderLink.href = `index.html?service=video&videoType=${encodeURIComponent(type)}#quote`;
    orderLink.textContent = `Order ${label}`;
    if (selectedLabel) selectedLabel.textContent = `${label} selected.`;
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => selectCard(card));
    card.querySelector(".video-price-selector")?.addEventListener("change", () => {
      selectCard(card);
    });
  });

  selectCard(
    cards.find((card) => card.querySelector(".video-price-selector")?.checked) || cards[0]
  );
}

function initIoapInstitutionPicker() {
  const picker = document.querySelector(".ioap-institution-picker");
  const input = document.getElementById("ioap-institution-search");
  const menu = document.getElementById("ioap-institution-options");
  const status = document.getElementById("ioap-institution-status");
  const institutions = Array.isArray(window.IOAP_INSTITUTIONS)
    ? window.IOAP_INSTITUTIONS
    : [];
  if (!picker || !input || !menu || !institutions.length) return;

  const normalized = new Set(institutions.map((name) => name.toLocaleLowerCase()));
  let visibleInstitutions = institutions;
  let activeIndex = -1;

  const closeMenu = () => {
    menu.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  };

  const updateActiveOption = () => {
    const options = Array.from(menu.querySelectorAll("[role='option']"));
    options.forEach((option, index) => {
      const active = index === activeIndex;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-selected", String(active));
      if (active) {
        input.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
    });
  };

  const renderMenu = () => {
    const fragment = document.createDocumentFragment();
    visibleInstitutions.forEach((name, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.id = `ioap-institution-option-${index}`;
      option.className = "ioap-institution-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      option.dataset.institution = name;
      option.textContent = name;
      fragment.appendChild(option);
    });
    menu.replaceChildren(fragment);
    menu.classList.toggle("is-empty", visibleInstitutions.length === 0);
    menu.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
    activeIndex = -1;
  };

  const selectInstitution = (name) => {
    input.value = name;
    input.classList.add("is-valid");
    if (status) {
      status.textContent = "This institution appears on the current IOAP participants list.";
    }
    closeMenu();
  };

  const filterInstitutions = () => {
    const value = input.value.trim();
    const exactMatch = normalized.has(value.toLocaleLowerCase());
    input.classList.toggle("is-valid", exactMatch);
    const query = value.toLocaleLowerCase();
    visibleInstitutions = query
      ? institutions.filter((name) => name.toLocaleLowerCase().includes(query))
      : institutions;
    renderMenu();

    if (!status) return;
    if (exactMatch) {
      status.textContent = "This institution appears on the current IOAP participants list.";
      return;
    }
    if (!value) {
      status.textContent = `${institutions.length.toLocaleString()} participating institutions. Type to search.`;
      return;
    }
    status.textContent = visibleInstitutions.length
      ? `${visibleInstitutions.length} matching institution${visibleInstitutions.length === 1 ? "" : "s"}. Select one from the list.`
      : "No matching institution found. Check the full participant list or use your institutional email.";
  };

  input.addEventListener("focus", filterInstitutions);
  input.addEventListener("click", () => {
    if (menu.classList.contains("hidden")) filterInstitutions();
  });
  input.addEventListener("input", filterInstitutions);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (menu.classList.contains("hidden")) filterInstitutions();
      if (!visibleInstitutions.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeIndex = Math.max(
        0,
        Math.min(visibleInstitutions.length - 1, activeIndex + direction)
      );
      updateActiveOption();
      return;
    }
    if (
      event.key === "Enter" &&
      activeIndex >= 0 &&
      activeIndex < visibleInstitutions.length
    ) {
      event.preventDefault();
      selectInstitution(visibleInstitutions[activeIndex]);
    }
  });

  menu.addEventListener("mousedown", (event) => {
    const option = event.target.closest("[data-institution]");
    if (!option) return;
    event.preventDefault();
    selectInstitution(option.dataset.institution);
  });

  document.addEventListener("click", (event) => {
    if (!picker.contains(event.target)) closeMenu();
  });
}

function applyQuoteRequestFromUrl() {
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("service") !== "video") return;

  form.querySelectorAll('input[name="service"]').forEach((input) => {
    input.checked = input.value === "video";
  });

  const requestedType = params.get("videoType");
  const videoSelect = document.getElementById("video-type");
  if (
    videoSelect &&
    requestedType &&
    ["abstract", "short", "profile", "interview"].includes(requestedType)
  ) {
    videoSelect.value = requestedType;
  }
}

menuToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

if (form) {
  document.querySelectorAll(".select-tier").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tier = btn.dataset.tier;
      form.tier.value = tier;
      setServiceChecked("language", true);
      document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
      syncFormState();
      showToast(`${tier.charAt(0).toUpperCase() + tier.slice(1)} tier selected.`);
    });
  });

  form.addEventListener("input", (event) => {
    if (
      event.target?.id === "quote-include-figures" ||
      event.target?.id === "include-detected-figures" ||
      event.target?.id === "quote-include-layout" ||
      (event.target?.name === "service" &&
        ["figures", "layout"].includes(event.target?.value))
    ) {
      return;
    }
    syncFormState();
  });
  form.addEventListener("change", (event) => {
    // Selective opt-ins have their own handlers; ignore here to avoid resetting them.
    if (event.target?.id === "quote-include-figures") return;
    if (event.target?.id === "include-detected-figures") return;
    if (event.target?.id === "quote-include-layout") return;
    // Keep selective flag in sync if user toggles the main services checklist.
    if (event.target?.name === "service" && event.target?.value === "figures") {
      figuresSelectiveOptIn = !!event.target.checked;
      if (!event.target.checked && form.figures) {
        form.figures.value = "";
      } else if (
        event.target.checked &&
        lastManuscriptDetection?.items > 0 &&
        form.figures
      ) {
        form.figures.value = String(lastManuscriptDetection.items);
      }
    }
    if (
      event.target?.name === "service" &&
      event.target?.value === "layout" &&
      event.target.dataset.lockedByAcademic !== "1"
    ) {
      layoutSelectiveOptIn = !!event.target.checked;
    }
    // Academic locks Layout as included — ignore user uncheck attempts.
    if (
      event.target?.name === "service" &&
      event.target?.value === "layout" &&
      event.target.dataset.lockedByAcademic === "1" &&
      !event.target.checked
    ) {
      event.target.checked = true;
    }
    syncFormState();
  });

  // Ensure tier changes immediately refresh the Academic hint + Layout inclusion.
  form.tier?.addEventListener("change", () => {
    syncFormState();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const services = getSelectedServices();
    if (services.length === 0) {
      showToast("Please select at least one service.");
      return;
    }
    if (services.includes("language") && !(Number(form.words.value) > 0)) {
      showToast("Enter the word count for Language Editing.");
      return;
    }
    if (services.includes("figures") && !(Number(form.figures.value) > 0)) {
      showToast("Enter the number of figures and tables.");
      return;
    }
    if (services.includes("video") && !getVideoTypeValue()) {
      showToast("Select a video type for Video Production.");
      return;
    }
    const quote = calculateQuote();
    if (quote.total <= 0) {
      showToast("Complete the required fields for your selected services.");
      return;
    }
    saveOrderAndGoToCheckout();
  });

  document.getElementById("submit-order-btn")?.addEventListener("click", (event) => {
    event.preventDefault();
    const services = getSelectedServices();
    if (services.length === 0) {
      showToast("Please select at least one service before submitting.");
      return;
    }
    if (services.includes("language") && !(Number(form.words.value) > 0)) {
      showToast("Enter the word count for Language Editing.");
      return;
    }
    if (services.includes("figures") && !(Number(form.figures.value) > 0)) {
      showToast("Enter the number of figures and tables.");
      return;
    }
    if (services.includes("video") && !getVideoTypeValue()) {
      showToast("Select a video type for Video Production.");
      return;
    }
    const quote = calculateQuote();
    if (quote.total <= 0) {
      showToast("Complete the required fields for your selected services first.");
      return;
    }
    saveOrderAndGoToCheckout();
  });

  document.getElementById("check-ioap-btn")?.addEventListener("click", () => {
    document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
    syncFormState();
    form.email?.focus();
    showToast("Select a service and enter your institutional email for IOAP eligibility.");
  });

  applyQuoteRequestFromUrl();
  syncFormState();
  initPriceGuides();
  initManuscriptUpload();
  renderAddonPrices();
  updateVideoTypeOptions();
  renderVideoCampaignPrices();
}

initExampleModal();
initVideoExampleModal();
initVideoTypeOrdering();
initIoapInstitutionPicker();
// Upload UI can work even if quote form init order changes.
if (!document.getElementById("quote-form")) {
  initManuscriptUpload();
  renderAddonPrices();
  renderVideoCampaignPrices();
}

(function initUxChrome() {
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const sectionIds = ["services", "additional-services", "quote", "faqs"];
  const navLinks = Array.from(document.querySelectorAll(".main-nav a[href^='#']"));
  if (!navLinks.length) return;

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          const href = link.getAttribute("href") || "";
          link.classList.toggle("is-active", href === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => observer.observe(section));
})();
