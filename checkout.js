const PAYMENT_METHODS = [
  { id: "mastercard", type: "card" },
  { id: "visa", type: "card" },
  { id: "amex", type: "card" },
  { id: "paypal", type: "wallet" },
  { id: "unionpay", type: "card" },
  { id: "alipay", type: "wallet" },
  { id: "wechat", type: "wallet" },
];

const CARD_METHODS = new Set(["mastercard", "visa", "amex", "unionpay"]);

function t(key) {
  return window.MdpiI18n?.t(key) ?? key;
}

function externalLinkIcon() {
  return `<svg class="icon-external" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
}

/**
 * On-platform checkout wizard — reads quote payload from sessionStorage.
 */
const ORDER_STORAGE_KEY = "mdpi-as-order-v1";
const VAT_RATE = 0.081;

const AUTH_STORAGE_KEY = window.MdpiAuth?.AUTH_STORAGE_KEY || "mdpi-as-auth-v1";
const MDPI_CONNECT_URL =
  window.MdpiAuth?.MDPI_CONNECT_URL ||
  "https://www.figma.com/proto/FJTRlbOLVfbhF2b3NoezOX/MDPI-Connect?node-id=3412-8277&viewport=13665%2C-9872%2C0.64&t=vA1tgJ9ytFg4U40P-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=3412%3A8277&show-proto-sidebar=1&page-id=3198%3A21033";

function loadAuthState() {
  return window.MdpiAuth?.loadAuthState?.() ?? null;
}

function saveAuthState(state) {
  if (window.MdpiAuth?.saveAuthState) {
    window.MdpiAuth.saveAuthState(state);
    return;
  }
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function isLoggedIn() {
  return window.MdpiAuth?.isLoggedIn?.() ?? false;
}

function markLoggedIn(extra = {}) {
  if (window.MdpiAuth?.markLoggedIn) {
    window.MdpiAuth.markLoggedIn(extra);
    window.MdpiAuth.renderHeaderAuth?.();
    return;
  }
}

function getCheckoutReturnUrl() {
  return (
    window.MdpiAuth?.getAuthReturnUrl?.("checkout.html") ||
    new URL("checkout.html?auth=success", window.location.href).toString()
  );
}

function getLoginUrl() {
  return (
    window.MdpiAuth?.getLoginUrl?.(getCheckoutReturnUrl()) ||
    `https://login.mdpi.com/login?_target_path=${encodeURIComponent(getCheckoutReturnUrl())}`
  );
}

function beginLoginRedirect() {
  saveOrder();
  if (window.MdpiAuth?.beginLoginRedirect) {
    window.MdpiAuth.beginLoginRedirect(getCheckoutReturnUrl());
    return;
  }
  window.location.href = getLoginUrl();
}

function consumeAuthReturnParams() {
  const returned = window.MdpiAuth?.consumeAuthReturnParams?.() ?? false;
  if (returned) window.MdpiAuth?.renderHeaderAuth?.();
  return returned;
}

const SERVICE_TITLES = {
  language: "English Language Editing",
  figures: "Figure and Table Editing",
  layout: "Layout Editing",
  graphical: "Graphical Abstract",
  video: "Video Production",
};

const TIER_LABELS = {
  standard: "Standard",
  rapid: "Rapid",
  academic: "Academic",
};

const VIDEO_LABELS = {
  abstract: "Video Abstract",
  short: "Short Take",
  profile: "Scholar Profile",
  interview: "Scholar Interview",
};

function getVideoDetails() {
  const d = order.details || {};
  const r = order.review || {};
  return {
    videoType: d.videoType || order.videoType || "abstract",
    videoManuscriptLink: d.videoManuscriptLink ?? r.videoManuscriptLink ?? "",
    videoProducerNotes: d.videoProducerNotes ?? r.videoProducerNotes ?? "",
    videoPublishChannels: d.videoPublishChannels ?? r.videoPublishChannels ?? [],
  };
}

function syncVideoPricing() {
  if (!order.services.includes("video") || !order.videoType) return;
  order.details = order.details || {};
  order.details.videoType = order.videoType;
}

const CHECKOUT_STEPS = [
  "account",
  "details",
  "invoice",
  "review",
  "payment",
  "confirmation",
];

const MDPI_JOURNALS = [
  "Accounting and Auditing",
  "Animals",
  "Applied Sciences",
  "Biology",
  "Cancers",
  "Cells",
  "International Journal of Molecular Sciences",
  "Materials",
  "Sensors",
  "Sustainability",
  "Water",
];

let order = null;
let checkoutStep = "account";
let invoiceId = null;

function loadOrder() {
  try {
    const raw =
      sessionStorage.getItem(ORDER_STORAGE_KEY) || localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveOrder() {
  if (!order) return;
  const json = JSON.stringify(order);
  sessionStorage.setItem(ORDER_STORAGE_KEY, json);
  // Mirror to localStorage so progress survives leaving and returning later.
  localStorage.setItem(ORDER_STORAGE_KEY, json);
}

function formatMoney(amount, currency = "CHF") {
  if (window.MdpiMoney?.formatMoney) {
    return window.MdpiMoney.formatMoney(amount, currency);
  }
  return `${currency} ${Number(amount).toFixed(2)}`;
}

function formatMoneyAmount(amount, currency = "CHF") {
  if (window.MdpiMoney?.formatMoneyAmount) {
    return window.MdpiMoney.formatMoneyAmount(amount, currency);
  }
  return Number(amount).toFixed(2);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function redirectToQuote() {
  window.location.href = "index.html#quote";
}

function getFees() {
  const pricing = order.pricing || {};
  const net = Number(pricing.total) || 0;
  const vat = net * VAT_RATE;
  const total = net + vat;
  return { net, vat, total };
}

function generateInvoiceId() {
  return `english-${Math.floor(10000 + Math.random() * 89999)}`;
}

function stepIndex(step) {
  return CHECKOUT_STEPS.indexOf(step);
}

function setCheckoutStep(step) {
  if (step !== "account" && step !== "confirmation" && !isLoggedIn()) {
    step = "account";
  }
  checkoutStep = step;
  if (step !== "confirmation") {
    order.checkoutStep = step;
  }
  if (step === "review" && !invoiceId) {
    invoiceId = generateInvoiceId();
    order.invoiceId = invoiceId;
  }
  saveOrder();
  renderCheckout();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateDetails() {
  if (order.services.includes("language") && !order.details.languageTitle?.trim()) {
    alert("Please enter the manuscript title for English Language Editing.");
    return false;
  }
  if (order.services.includes("layout") && !order.details.layoutJournal) {
    alert("Please select a journal for Layout Editing.");
    return false;
  }
  if (order.services.includes("video") && !order.videoType) {
    alert("Video type is missing. Please return to your quote and select a video type.");
    return false;
  }
  return true;
}

function validateInvoice() {
  const required = [
    ["invoiceFirstName", "First name"],
    ["invoiceLastName", "Last name"],
    ["invoiceEmail", "Email address"],
    ["invoiceCountry", "Country / Territory"],
    ["invoiceAddress", "Address"],
    ["invoiceCity", "City"],
    ["invoiceZip", "Zipcode"],
  ];
  for (const [key, label] of required) {
    if (!order.invoice[key]?.trim()) {
      alert(`Please enter ${label}.`);
      return false;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.invoice.invoiceEmail.trim())) {
    alert("Please enter a valid email address.");
    return false;
  }
  return true;
}

function validateReview() {
  if (!order.review.agreeTerms) {
    alert("Please confirm you have read and agree to the terms.");
    return false;
  }
  return true;
}

function collectDetailsFromForm() {
  // Only collect when the details form is mounted — never wipe saved values from another step.
  const hasDetailsForm = !!(
    document.getElementById("detail-manuscript-id") ||
    document.getElementById("detail-manuscript-title") ||
    document.getElementById("detail-figure-request") ||
    document.getElementById("detail-layout-journal") ||
    document.getElementById("detail-graphical-notes") ||
    document.getElementById("detail-video-doi") ||
    document.getElementById("detail-video-notes")
  );
  if (!hasDetailsForm) return;

  order.details = order.details || {};
  if (order.services.includes("language")) {
    const manuscriptIdEl = document.getElementById("detail-manuscript-id");
    const titleEl = document.getElementById("detail-manuscript-title");
    if (manuscriptIdEl) order.details.manuscriptId = manuscriptIdEl.value.trim();
    if (titleEl) order.details.languageTitle = titleEl.value.trim();
  }
  if (order.services.includes("figures")) {
    const figureEl = document.getElementById("detail-figure-request");
    if (figureEl) order.details.figureRequestDetails = figureEl.value.trim();
  }
  if (order.services.includes("layout")) {
    const journalEl = document.getElementById("detail-layout-journal");
    if (journalEl) order.details.layoutJournal = journalEl.value;
  }
  if (order.services.includes("graphical")) {
    const notesEl = document.getElementById("detail-graphical-notes");
    if (notesEl) order.details.graphicalNotes = notesEl.value.trim();
  }
  if (order.services.includes("video")) {
    const doiEl = document.getElementById("detail-video-doi");
    const notesEl = document.getElementById("detail-video-notes");
    order.details.videoType = order.videoType;
    if (doiEl) order.details.videoManuscriptLink = doiEl.value.trim();
    if (notesEl) order.details.videoProducerNotes = notesEl.value.trim();
    const channelInputs = document.querySelectorAll('input[name="detailVideoPublishChannels"]');
    if (channelInputs.length) {
      order.details.videoPublishChannels = [
        ...document.querySelectorAll('input[name="detailVideoPublishChannels"]:checked'),
      ].map((el) => el.value);
    }
    syncVideoPricing();
  }
  saveOrder();
}

function collectInvoiceFromForm() {
  // Guard: invoice fields are only present on the invoice step.
  const firstNameEl = document.getElementById("invoice-first-name");
  if (!firstNameEl) return;
  order.invoice = {
    ...(order.invoice || {}),
    invoiceFirstName: firstNameEl.value.trim(),
    invoiceLastName: document.getElementById("invoice-last-name")?.value.trim() || "",
    invoiceEmail: document.getElementById("invoice-email")?.value.trim() || "",
    invoiceCountry: document.getElementById("invoice-country")?.value || "",
    invoiceDepartment: document.getElementById("invoice-department")?.value.trim() || "",
    invoiceAffiliation: document.getElementById("invoice-affiliation")?.value.trim() || "",
    invoiceAddress: document.getElementById("invoice-address")?.value.trim() || "",
    invoiceCity: document.getElementById("invoice-city")?.value.trim() || "",
    invoiceZip: document.getElementById("invoice-zip")?.value.trim() || "",
    voucher: document.getElementById("invoice-voucher")?.value.trim() || "",
  };
  saveOrder();
}

function collectReviewFromForm() {
  const agreeEl = document.getElementById("review-agree-terms");
  if (!agreeEl) return;
  order.review = order.review || {};
  order.review.agreeTerms = !!agreeEl.checked;
  saveOrder();
}

/** Persist the currently visible checkout step without clobbering other steps. */
function persistCurrentCheckoutStep() {
  if (checkoutStep === "details") collectDetailsFromForm();
  else if (checkoutStep === "invoice") collectInvoiceFromForm();
  else if (checkoutStep === "review") collectReviewFromForm();
  order.checkoutStep = checkoutStep;
  order.savedAt = new Date().toISOString();
  saveOrder();
}

const STEP_META = {
  account: {
    eyebrow: "Step 1 of 5",
    title: "Log In",
    desc: "",
  },
  details: {
    eyebrow: "Step 2 of 5",
    title: "Service details",
    desc: "Provide the information our editors and producers need to begin your order.",
  },
  invoice: {
    eyebrow: "Step 3 of 5",
    title: "Invoice information",
    desc: "Enter your billing details. Fields marked with * are required.",
  },
  review: {
    eyebrow: "Step 4 of 5",
    title: "Review your order",
    desc: "Confirm your services and billing details before payment.",
  },
  payment: {
    eyebrow: "Step 5 of 5",
    title: "Payment",
    desc: "Choose your preferred payment method and pay securely to complete your order.",
  },
};

function renderStepHeader(step) {
  const meta = STEP_META[step] || {};
  return `
    <header class="checkout-step-header">
      <p class="checkout-step-eyebrow">${meta.eyebrow || ""}</p>
      <h1>${meta.title || ""}</h1>
      ${meta.desc ? `<p class="checkout-step-desc">${meta.desc}</p>` : ""}
    </header>`;
}

function renderSidebarSummary(options = {}) {
  const { showVat = false, showInvoiceId = false, note = "" } = options;
  const { currency, pricing } = order;
  const netTotal = Number(pricing?.total) || 0;
  let summaryHtml = "";

  if (showVat) {
    summaryHtml = renderFeesSummary();
  } else {
    summaryHtml = renderLineItems();
    summaryHtml += `<div class="checkout-summary-row is-total"><dt>${t("subtotal")}</dt><dd>${formatMoney(netTotal, currency)}</dd></div>`;
  }

  let invoiceBlock = "";
  if (showInvoiceId && (invoiceId || order.invoiceId)) {
    invoiceBlock = `
      <div class="checkout-sidebar-invoice-id">
        <span>Invoice ID</span>
        <strong>${escapeHtml(invoiceId || order.invoiceId)}</strong>
      </div>`;
  }

  return `
    <a href="${MDPI_CONNECT_URL}" class="checkout-submission-history" target="_blank" rel="noopener noreferrer">
      ${t("submissionHistory")}
      ${externalLinkIcon()}
    </a>
    <div class="checkout-sidebar-card">
      <div class="checkout-sidebar-head">
        <h2>${t("orderSummary")}</h2>
        <p>${order.services.length} service${order.services.length === 1 ? "" : "s"} · <span class="checkout-sidebar-currency">${currency}</span></p>
      </div>
      ${invoiceBlock}
      <dl>${summaryHtml}</dl>
      ${note ? `<p class="checkout-sidebar-note">${note}</p>` : `<p class="checkout-sidebar-note">Prices shown exclude VAT until the invoice step.</p>`}
    </div>`;
}

function wrapCheckoutLayout(step, contentHtml, sidebarOptions = {}) {
  const layoutClass = step === "payment" ? "checkout-layout checkout-payment-layout" : "checkout-layout";
  return `
    <div class="${layoutClass}">
      <div class="checkout-step-panel">
        ${contentHtml}
      </div>
      <aside class="checkout-sidebar" aria-label="Order summary">
        ${renderSidebarSummary(sidebarOptions)}
      </aside>
    </div>`;
}

function renderActions(backTarget, backLabel, nextTarget, nextLabel) {
  return `
    <div class="checkout-actions">
      <button type="button" class="btn btn-outline" data-checkout-back="${backTarget}">${backLabel}</button>
      <div class="checkout-actions-end">
        <button type="button" class="btn btn-primary" data-checkout-next="${nextTarget}">${nextLabel}</button>
      </div>
    </div>`;
}

function defaultFigureRequestDetails() {
  const count = Math.max(0, Number(order?.figures) || 0);
  if (count > 0) {
    return `I would like all ${count} figure/table item${count === 1 ? "" : "s"} included in this order to be edited to meet the journal guidelines. Please adjust this note with any specific figure or table numbers and requirements.`;
  }
  return "I would like my figures and tables to be edited to meet the journal guidelines. Please adjust this note with any specific figure or table numbers and requirements.";
}

let autoSaveTimer = null;

/** Silently persist the current step as the author types or changes fields. */
function scheduleAutoSave() {
  if (!["details", "invoice", "review"].includes(checkoutStep)) return;
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    persistCurrentCheckoutStep();
  }, 250);
}

function bindCheckoutAutoSave() {
  if (!["details", "invoice", "review"].includes(checkoutStep)) return;
  const panel = document.querySelector(".checkout-step-panel");
  if (!panel) return;

  const onFieldUpdate = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("input, select, textarea")) return;
    // Immediate save for discrete controls; debounced for typing.
    if (event.type === "change" || target.matches("select, input[type='checkbox'], input[type='radio']")) {
      clearTimeout(autoSaveTimer);
      persistCurrentCheckoutStep();
      return;
    }
    scheduleAutoSave();
  };

  panel.addEventListener("input", onFieldUpdate);
  panel.addEventListener("change", onFieldUpdate);
}

function renderReviewDetailsSummary() {
  const d = order.details || {};
  const inv = order.invoice || {};
  let cards = "";

  if (order.services.includes("language")) {
    cards += `
      <article class="checkout-review-card">
        <h3>${SERVICE_TITLES.language}</h3>
        <dl class="checkout-review-list">
          ${d.manuscriptId ? `<div><dt>Manuscript ID</dt><dd>${escapeHtml(d.manuscriptId)}</dd></div>` : ""}
          <div><dt>Title</dt><dd>${escapeHtml(d.languageTitle) || "—"}</dd></div>
          <div><dt>Word count</dt><dd>${order.words.toLocaleString()}</dd></div>
          <div><dt>Tier</dt><dd>${TIER_LABELS[order.tier] || order.tier}</dd></div>
        </dl>
      </article>`;
  }

  if (order.services.includes("figures")) {
    cards += `
      <article class="checkout-review-card">
        <h3>${SERVICE_TITLES.figures}</h3>
        <dl class="checkout-review-list">
          <div><dt>Items</dt><dd>${order.figures} figure/table item${order.figures === 1 ? "" : "s"}</dd></div>
          <div><dt>Request</dt><dd>${escapeHtml(d.figureRequestDetails) || "—"}</dd></div>
        </dl>
      </article>`;
  }

  if (order.services.includes("layout")) {
    cards += `
      <article class="checkout-review-card">
        <h3>${SERVICE_TITLES.layout}</h3>
        <dl class="checkout-review-list">
          <div><dt>Journal</dt><dd>${escapeHtml(d.layoutJournal) || "—"}</dd></div>
        </dl>
      </article>`;
  }

  if (order.services.includes("graphical")) {
    cards += `
      <article class="checkout-review-card">
        <h3>${SERVICE_TITLES.graphical}</h3>
        <dl class="checkout-review-list">
          <div><dt>Notes</dt><dd>${escapeHtml(d.graphicalNotes) || "—"}</dd></div>
        </dl>
      </article>`;
  }

  if (order.services.includes("video")) {
    const v = getVideoDetails();
    const channelLabels = {
      journal: "MDPI Journal attached with your paper",
      encyclopedia: "Encyclopedia",
    };
    const channels = (v.videoPublishChannels || [])
      .map((c) => channelLabels[c] || c)
      .join(", ");
    cards += `
      <article class="checkout-review-card">
        <h3>${SERVICE_TITLES.video}</h3>
        <dl class="checkout-review-list">
          <div><dt>Video type</dt><dd>${escapeHtml(VIDEO_LABELS[v.videoType] || v.videoType)}</dd></div>
          ${v.videoManuscriptLink ? `<div><dt>Manuscript DOI/Link</dt><dd>${escapeHtml(v.videoManuscriptLink)}</dd></div>` : ""}
          ${v.videoProducerNotes ? `<div><dt>Producer notes</dt><dd>${escapeHtml(v.videoProducerNotes)}</dd></div>` : ""}
          ${channels ? `<div><dt>Publish channels</dt><dd>${escapeHtml(channels)}</dd></div>` : ""}
        </dl>
      </article>`;
  }

  let billing = "";
  if (inv.invoiceFirstName || inv.invoiceEmail) {
    billing = `
      <section class="checkout-review-billing">
        <h2 class="checkout-form-section-title">Billing contact</h2>
        <p class="checkout-form-section-desc">Invoice will be issued to the following details.</p>
        <article class="checkout-review-card">
          <dl class="checkout-review-list">
            <div><dt>Name</dt><dd>${escapeHtml(`${inv.invoiceFirstName || ""} ${inv.invoiceLastName || ""}`.trim()) || "—"}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(inv.invoiceEmail) || "—"}</dd></div>
            ${inv.invoiceAffiliation ? `<div><dt>Affiliation</dt><dd>${escapeHtml(inv.invoiceAffiliation)}</dd></div>` : ""}
            <div><dt>Address</dt><dd>${escapeHtml([inv.invoiceAddress, inv.invoiceCity, inv.invoiceZip, inv.invoiceCountry].filter(Boolean).join(", ")) || "—"}</dd></div>
          </dl>
        </article>
      </section>`;
  }

  return `<div class="checkout-review-grid">${cards}</div>${billing}`;
}

function renderProgress() {
  const list = document.getElementById("checkout-progress");
  if (!list) return;
  const current = stepIndex(checkoutStep);
  const labels = {
    account: t("stepAccount"),
    details: t("stepDetails"),
    invoice: t("stepInvoice"),
    review: t("stepReview"),
    payment: t("stepPayment"),
    confirmation: "Confirmation",
  };
  list.innerHTML = CHECKOUT_STEPS.filter((s) => s !== "confirmation")
    .map((step, index) => {
      const classes = [];
      if (index < current) classes.push("is-done");
      if (step === checkoutStep) classes.push("is-active");
      // Treat account as complete when the author is already signed in.
      if (step === "account" && isLoggedIn() && checkoutStep !== "account") {
        classes.push("is-done");
      }
      const marker = index < current || (step === "account" && isLoggedIn() && checkoutStep !== "account")
        ? "✓"
        : String(index + 1);
      return `<li class="${classes.join(" ")}" data-step="${step}"><span>${marker}</span>${labels[step]}</li>`;
    })
    .join("");
}

function buildSummaryRowsFromPricing(source = order) {
  const { pricing = {}, services = [], tier, words, figures, videoType } = source || {};
  const tierLabel = TIER_LABELS[tier] || tier;
  const rows = [];

  if (services.includes("language") && (pricing.language > 0 || pricing.languageBase > 0)) {
    const row = {
      id: "language",
      label: `${SERVICE_TITLES.language} (${tierLabel}, ${Number(words || 0).toLocaleString()} words)`,
      amount: Number(pricing.language) || 0,
    };
    if (pricing.editingCampaign && pricing.languageBase > pricing.language) {
      row.wasAmount = pricing.languageBase;
      row.note = "MDPI30 · CHF 30 off";
    }
    rows.push(row);
  }

  if (services.includes("figures") && Number(figures) > 0) {
    const amount = Number(pricing.figures) || 0;
    const row = {
      id: "figures",
      label: `${SERVICE_TITLES.figures} (${figures} item${figures === 1 ? "" : "s"})`,
      amount,
    };
    const figuresBase =
      Number(pricing.figuresBase) ||
      (pricing.figuresDiscountRate > 0 && amount > 0
        ? amount / (1 - pricing.figuresDiscountRate)
        : 0);
    if (pricing.figuresDiscountRate > 0 && figuresBase > amount) {
      row.wasAmount = figuresBase;
      row.note = `${Math.round(pricing.figuresDiscountRate * 100)}% off (${tierLabel})`;
    }
    rows.push(row);
  }

  if (services.includes("layout")) {
    const layoutIncluded = !!pricing.layoutIncluded;
    const amount = layoutIncluded ? 0 : Number(pricing.layout) || 0;
    const row = {
      id: "layout",
      label: SERVICE_TITLES.layout,
      amount,
    };
    if (layoutIncluded) {
      row.note = "Free for MDPI journals";
    } else if (pricing.layoutDiscountRate > 0) {
      const layoutBase =
        Number(pricing.layoutBase) ||
        (amount > 0 ? amount / (1 - pricing.layoutDiscountRate) : 0);
      if (layoutBase > amount) row.wasAmount = layoutBase;
      row.note = `${Math.round(pricing.layoutDiscountRate * 100)}% off (${tierLabel})`;
    }
    rows.push(row);
  }

  if (services.includes("graphical")) {
    rows.push({
      id: "graphical",
      label: SERVICE_TITLES.graphical,
      amount: Number(pricing.graphical) || 0,
    });
  }

  if (services.includes("video")) {
    const amount = Number(pricing.video) || 0;
    const row = {
      id: "video",
      label: `${SERVICE_TITLES.video} (${VIDEO_LABELS[videoType] || videoType || "Video"})`,
      amount,
    };
    if (pricing.videoCampaign && pricing.videoBase > amount) {
      row.wasAmount = pricing.videoBase;
      row.note = "VIDEO10 · 10% off";
    }
    rows.push(row);
  }

  if (pricing.ioapDiscount > 0) {
    rows.push({
      id: "ioap",
      label: "IOAP Discount (15% · Language Editing)",
      amount: -Number(pricing.ioapDiscount),
      isDiscount: true,
    });
  }

  return rows;
}

function getSummaryRows() {
  const stored = order.pricing?.lineItems;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.map((row) => ({
      label: row.label,
      amount: Number(row.amount) || 0,
      wasAmount: row.wasAmount != null ? Number(row.wasAmount) : undefined,
      note: row.note || null,
      isDiscount: !!row.isDiscount,
    }));
  }
  return buildSummaryRowsFromPricing(order);
}

function renderLineItems() {
  const { currency } = order;
  const rows = getSummaryRows();
  return rows
    .map((row) => {
      let value;
      if (row.isDiscount) {
        value = `−${formatMoney(Math.abs(row.amount), currency)}`;
      } else if (row.wasAmount != null && row.wasAmount > row.amount) {
        value = `<span class="price-was">${formatMoney(row.wasAmount, currency)}</span> ${formatMoney(row.amount, currency)}`;
        if (row.note) {
          value += ` <span class="checkout-line-note">${escapeHtml(row.note)}</span>`;
        }
      } else if (row.note && !(row.amount > 0)) {
        value = escapeHtml(row.note);
      } else if (row.note) {
        value = `${formatMoney(row.amount, currency)} <span class="checkout-line-note">${escapeHtml(row.note)}</span>`;
      } else {
        value = formatMoney(row.amount, currency);
      }
      return `<div class="checkout-summary-row${row.isDiscount ? " is-discount" : ""}"><dt>${escapeHtml(row.label)}</dt><dd>${value}</dd></div>`;
    })
    .join("");
}

function normalizeOrderPricing(rawOrder) {
  if (!rawOrder?.pricing) return rawOrder;

  const pricing = { ...rawOrder.pricing };
  const hadStaleFiguresIncluded = !!pricing.figuresIncluded;
  // Academic figures are discounted, never free — drop stale "included" flags.
  pricing.figuresIncluded = false;

  const normalized = { ...rawOrder, pricing };
  const rows = buildSummaryRowsFromPricing(normalized);
  const hasSnapshot = Array.isArray(pricing.lineItems) && pricing.lineItems.length > 0;

  // Rebuild when missing, or when an older payload marked figures as freely included.
  if (!hasSnapshot || hadStaleFiguresIncluded) {
    pricing.lineItems = rows;
  } else {
    // Ensure every selected service still appears if an older snapshot omitted it.
    const existingLabels = new Set(pricing.lineItems.map((row) => row.label));
    for (const row of rows) {
      if (!existingLabels.has(row.label)) {
        pricing.lineItems.push(row);
        existingLabels.add(row.label);
      }
    }
  }

  const storedTotal = Number(pricing.total) || 0;
  const lineSum = (pricing.lineItems || []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  );

  // Prefer the frozen quote total when present; only backfill from lines if missing.
  if (!(storedTotal > 0) && lineSum > 0) {
    pricing.total = lineSum;
    pricing.subtotal = lineSum + (Number(pricing.ioapDiscount) || 0);
  }

  return { ...rawOrder, pricing };
}

function renderFeesSummary() {
  const { currency } = order;
  const { net, vat, total } = getFees();
  return `
    ${renderLineItems()}
    <div class="checkout-summary-row"><dt>Subtotal without VAT</dt><dd>${formatMoney(net, currency)}</dd></div>
    <div class="checkout-summary-row"><dt>VAT (8.1%)</dt><dd>${formatMoney(vat, currency)}</dd></div>
    <div class="checkout-summary-row is-total"><dt>Total with VAT</dt><dd>${formatMoney(total, currency)}</dd></div>
  `;
}

function renderCountrySelect(selected = "") {
  if (window.MdpiCountries?.renderCountryOptions) {
    return `<select id="invoice-country" autocomplete="country-name">${window.MdpiCountries.renderCountryOptions(selected)}</select>`;
  }
  return `<select id="invoice-country" autocomplete="country-name"><option value="">Select country</option></select>`;
}

function renderAccountStep() {
  const loggedIn = isLoggedIn();
  const auth = loadAuthState();
  const serviceCount = order?.services?.length || 0;
  const serviceLabel =
    serviceCount === 1 ? "1 selected service" : `${serviceCount} selected services`;

  if (loggedIn) {
    return `
      ${renderStepHeader("account")}
      <section class="checkout-account-card is-signed-in">
        <div class="checkout-account-status" role="status">
          <span class="checkout-account-status-icon" aria-hidden="true">✓</span>
          <div>
            <h2>You're signed in</h2>
            <p>Your MDPI account is connected. Continue to enter details for your ${escapeHtml(serviceLabel)}.</p>
            ${auth?.email ? `<p class="form-hint">${escapeHtml(auth.email)}</p>` : ""}
          </div>
        </div>
        <div class="checkout-actions">
          <button type="button" class="btn btn-outline" data-checkout-back="quote">← Edit quote</button>
          <div class="checkout-actions-end">
            <button type="button" class="btn btn-primary" data-checkout-next="details">Continue to service details</button>
          </div>
        </div>
      </section>`;
  }

  return `
    ${renderStepHeader("account")}
    <section class="checkout-account-card">
      <p class="checkout-account-lead">
        You submitted an order with ${escapeHtml(String(serviceCount))} selected service${serviceCount === 1 ? "" : "s"}. Log in with your MDPI account to continue. After signing in, you will be returned here to complete the remaining checkout steps.
      </p>
      <div class="checkout-account-actions">
        <button type="button" class="btn btn-primary" id="checkout-login-btn">
          Log In
        </button>
      </div>
      <div class="checkout-actions">
        <button type="button" class="btn btn-outline" data-checkout-back="quote">← Edit quote</button>
        <div class="checkout-actions-end">
          <button type="button" class="btn btn-primary" id="checkout-auth-continue" data-checkout-next="details">
            Continue to service details
          </button>
        </div>
      </div>
    </section>`;
}

function renderDetailsStep() {
  const d = order.details || {};
  let blocks = "";

  if (order.services.includes("language")) {
    blocks += `
      <section class="checkout-service-block">
        <span class="checkout-service-badge">Language editing</span>
        <h2>${SERVICE_TITLES.language}</h2>
        <div class="form-field">
          <label for="detail-manuscript-id">Select ID if attached to an MDPI manuscript</label>
          <input type="text" id="detail-manuscript-id" value="${escapeHtml(d.manuscriptId)}" placeholder="Enter Manuscript ID" />
        </div>
        <div class="form-field">
          <label for="detail-manuscript-title">Manuscript Title <span class="required-mark">*</span></label>
          <input type="text" id="detail-manuscript-title" value="${escapeHtml(d.languageTitle)}" placeholder="Enter manuscript title" required />
        </div>
        <p class="form-hint">Word count (${order.words.toLocaleString()} words) and file type were captured from your uploaded manuscript.</p>
      </section>`;
  }

  if (order.services.includes("figures")) {
    const figureRequestValue =
      d.figureRequestDetails?.trim() || defaultFigureRequestDetails();
    blocks += `
      <section class="checkout-service-block">
        <span class="checkout-service-badge">Figures &amp; tables</span>
        <h2>${SERVICE_TITLES.figures}</h2>
        <p class="form-hint">${order.figures} figure/table item${order.figures === 1 ? "" : "s"} included from your quote.</p>
        <div class="form-field">
          <label for="detail-figure-request">Figure and Table Editing Request Details</label>
          <textarea id="detail-figure-request" rows="5" placeholder="Add any specific figure or table numbers and requirements.">${escapeHtml(figureRequestValue)}</textarea>
          <p class="form-hint">Optional. Edit the note above or leave it blank if you prefer.</p>
        </div>
      </section>`;
  }

  if (order.services.includes("layout")) {
    const options = MDPI_JOURNALS.map(
      (name) =>
        `<option value="${escapeHtml(name)}"${d.layoutJournal === name ? " selected" : ""}>${escapeHtml(name)}</option>`
    ).join("");
    blocks += `
      <section class="checkout-service-block">
        <span class="checkout-service-badge">Layout</span>
        <h2>${SERVICE_TITLES.layout}</h2>
        <div class="form-field">
          <label for="detail-layout-journal">Journal <span class="required-mark">*</span></label>
          <select id="detail-layout-journal" required>
            <option value="">Select journal</option>
            ${options}
          </select>
        </div>
      </section>`;
  }

  if (order.services.includes("graphical")) {
    blocks += `
      <section class="checkout-service-block">
        <span class="checkout-service-badge">Graphical abstract</span>
        <h2>${SERVICE_TITLES.graphical}</h2>
        <div class="form-field">
          <label for="detail-graphical-notes">Notes for the Graphical Abstract Editing</label>
          <textarea id="detail-graphical-notes" rows="5" placeholder="Add any design notes or instructions for the graphical abstract team.">${escapeHtml(d.graphicalNotes || "")}</textarea>
          <p class="form-hint">Optional. Edit the note above or leave it blank if you prefer.</p>
        </div>
      </section>`;
  }

  if (order.services.includes("video")) {
    const v = getVideoDetails();
    const channels = v.videoPublishChannels || [];
    blocks += `
      <section class="checkout-service-block">
        <span class="checkout-service-badge">Video production</span>
        <h2>${SERVICE_TITLES.video}</h2>
        <p class="form-hint"><strong>${escapeHtml(VIDEO_LABELS[order.videoType] || order.videoType)}</strong> selected from your quote.</p>
        <div class="form-field">
          <label for="detail-video-doi">Manuscript DOI/Link</label>
          <input type="text" id="detail-video-doi" value="${escapeHtml(v.videoManuscriptLink)}" placeholder="Please provide the DOI or Link of the manuscript if available." />
        </div>
        <div class="form-field">
          <label for="detail-video-notes">Notes for Video Producer</label>
          <textarea id="detail-video-notes" rows="4" placeholder="You can leave your requirements and comments to the video producer if needed.">${escapeHtml(v.videoProducerNotes)}</textarea>
        </div>
        <fieldset class="video-publish-fieldset">
          <legend>Would you like to publish your video in the following channels after the video is completed?</legend>
          <div class="video-publish-options">
            <label class="video-publish-option">
              <input type="checkbox" name="detailVideoPublishChannels" value="journal"${channels.includes("journal") ? " checked" : ""} />
              <span>MDPI Journal attached with your paper</span>
            </label>
            <label class="video-publish-option">
              <input type="checkbox" name="detailVideoPublishChannels" value="encyclopedia"${channels.includes("encyclopedia") ? " checked" : ""} />
              <span>Encyclopedia</span>
            </label>
          </div>
        </fieldset>
        <p class="video-production-disclaimer" role="note">
          <strong>Disclaimer:</strong> When your order is placed, your video will be produced by the Encyclopedia team at MDPI. Both Encyclopedia and MDPI Author Services are part of MDPI.
        </p>
      </section>`;
  }

  const body = `
    ${renderStepHeader("details")}
    ${blocks}
    ${renderActions("quote", "← Back to Edit Services", "invoice", "Continue to invoice")}`;

  return wrapCheckoutLayout("details", body, {
    note: "Complete each service section, then continue to billing.",
  });
}

function renderInvoiceStep() {
  const inv = order.invoice || {};
  const body = `
    ${renderStepHeader("invoice")}
    <section class="checkout-form-section">
      <h2 class="checkout-form-section-title">Contact details</h2>
      <p class="checkout-form-section-desc">Who should receive the invoice and order updates?</p>
      <div class="checkout-invoice-grid">
        <div class="form-field">
          <label for="invoice-first-name">First Name <span class="required-mark">*</span></label>
          <input type="text" id="invoice-first-name" value="${escapeHtml(inv.invoiceFirstName)}" autocomplete="given-name" />
        </div>
        <div class="form-field">
          <label for="invoice-last-name">Last Name <span class="required-mark">*</span></label>
          <input type="text" id="invoice-last-name" value="${escapeHtml(inv.invoiceLastName)}" autocomplete="family-name" />
        </div>
        <div class="form-field form-field-full">
          <label for="invoice-email">Email Address <span class="required-mark">*</span></label>
          <input type="email" id="invoice-email" value="${escapeHtml(inv.invoiceEmail || order.email)}" autocomplete="email" />
        </div>
        <div class="form-field form-field-full">
          <label for="invoice-affiliation">Affiliation</label>
          <input type="text" id="invoice-affiliation" value="${escapeHtml(inv.invoiceAffiliation)}" placeholder="University or institute" autocomplete="organization" />
        </div>
        <div class="form-field form-field-full">
          <label for="invoice-department">Department</label>
          <input type="text" id="invoice-department" value="${escapeHtml(inv.invoiceDepartment)}" placeholder="Department" />
        </div>
      </div>
    </section>
    <section class="checkout-form-section">
      <h2 class="checkout-form-section-title">Billing address</h2>
      <p class="checkout-form-section-desc">Address that will appear on your invoice.</p>
      <div class="checkout-invoice-grid">
        <div class="form-field form-field-full">
          <label for="invoice-address">Address <span class="required-mark">*</span></label>
          <input type="text" id="invoice-address" value="${escapeHtml(inv.invoiceAddress)}" autocomplete="street-address" />
        </div>
        <div class="form-field">
          <label for="invoice-city">City <span class="required-mark">*</span></label>
          <input type="text" id="invoice-city" value="${escapeHtml(inv.invoiceCity)}" autocomplete="address-level2" />
        </div>
        <div class="form-field">
          <label for="invoice-zip">Zipcode <span class="required-mark">*</span></label>
          <input type="text" id="invoice-zip" value="${escapeHtml(inv.invoiceZip)}" autocomplete="postal-code" />
        </div>
        <div class="form-field form-field-full">
          <label for="invoice-country">Country / Territory <span class="required-mark">*</span></label>
          ${renderCountrySelect(inv.invoiceCountry)}
        </div>
      </div>
    </section>
    <section class="checkout-form-section">
      <h2 class="checkout-form-section-title">Discount code</h2>
      <p class="checkout-form-section-desc">Apply a voucher before your invoice is issued.</p>
      <div class="form-field">
        <label for="invoice-voucher">Voucher</label>
        <div class="checkout-voucher-row">
          <input type="text" id="invoice-voucher" value="${escapeHtml(inv.voucher)}" placeholder="Enter discount code" />
          <button type="button" class="btn btn-outline btn-sm" id="apply-voucher-btn">Apply</button>
        </div>
      </div>
    </section>
    <ul class="checkout-footnotes">
      <li>Vouchers cannot be applied once an invoice is issued.</li>
      <li>Your order will commence only after payment is received.</li>
    </ul>
    ${renderActions("details", "← Back to details", "review", "Review order")}`;

  return wrapCheckoutLayout("invoice", body, {
    showVat: true,
    note: "VAT (8.1%) is calculated on the subtotal. Final amount is due at payment.",
  });
}

function renderReviewStep() {
  const r = order.review || {};
  const body = `
    ${renderStepHeader("review")}
    ${renderReviewDetailsSummary()}
    <label class="checkout-terms">
      <input type="checkbox" id="review-agree-terms"${r.agreeTerms ? " checked" : ""} />
      <span>I have reviewed my service selections and billing details. I understand that payment is required before work begins.</span>
    </label>
    ${renderActions("invoice", "← Back to invoice", "payment", "Proceed to payment")}`;

  return wrapCheckoutLayout("review", body, {
    showVat: true,
    showInvoiceId: true,
    note: "An invoice will be generated when you proceed to payment.",
  });
}

function renderPaymentMethods() {
  const selected = order.paymentMethod || "mastercard";
  return `
    <fieldset class="checkout-payment-methods">
      <legend>${t("paymentMethod")}</legend>
      <div class="payment-method-grid">
        ${PAYMENT_METHODS.map(
          (method) => `
          <label class="payment-method-option${selected === method.id ? " is-selected" : ""}">
            <input type="radio" name="payment-method" value="${method.id}"${selected === method.id ? " checked" : ""} />
            <span class="payment-method-label">${t(`paymentMethods.${method.id}`)}</span>
          </label>`
        ).join("")}
      </div>
    </fieldset>`;
}

function renderWalletPaymentContent(method) {
  if (method === "alipay" || method === "wechat") {
    const qrSrc = method === "alipay" ? "assets/qr-alipay-test.svg" : "assets/qr-wechat-test.svg";
    return `
      <div class="checkout-qr-payment">
        <img src="${qrSrc}" alt="" width="220" height="220" class="checkout-qr-image" />
        <p class="checkout-qr-caption">${t("scanToPay")} ${t(`paymentMethods.${method}`)}</p>
        <p class="form-hint">${t("qrTestHint")}</p>
      </div>`;
  }
  return `<p class="form-hint">${t("walletRedirectHint").replace("{method}", t(`paymentMethods.${method}`))}</p>`;
}

function renderPaymentStep() {
  const { currency } = order;
  const { total } = getFees();
  const displayTotal = formatMoneyAmount(total, currency);
  const selectedMethod = order.paymentMethod || "mastercard";
  const isCard = CARD_METHODS.has(selectedMethod);
  const isQrWallet = selectedMethod === "alipay" || selectedMethod === "wechat";

  const body = `
    ${renderStepHeader("payment")}
    <p class="checkout-secure-note">Secure payment processed by Stripe</p>
    <div class="checkout-payment-amount-card">
      <dl>
        <dt>Amount due</dt>
        <dd>${formatMoney(total, currency)}</dd>
      </dl>
    </div>
    ${renderPaymentMethods()}
    <div class="checkout-payment-box">
      <h2>Transfer information</h2>
      <dl class="checkout-payment-meta">
        <dt>Invoice ID</dt>
        <dd>${escapeHtml(invoiceId || order.invoiceId)}</dd>
        <dt>Currency</dt>
        <dd>${currency}</dd>
      </dl>
      <label class="checkout-terms">
        <input type="checkbox" id="payment-agree-terms" />
        <span>I have read and agree to the Standard Terms and Conditions of Business of MDPI AG.</span>
      </label>
      <button type="button" class="btn btn-primary btn-block" id="proceed-payment-btn">Proceed to payment</button>
    </div>
    <div id="stripe-panel" class="checkout-stripe-mock checkout-hidden">
      <h3>${isCard ? "Enter card details" : isQrWallet ? t("scanToPay") + " " + t(`paymentMethods.${selectedMethod}`) : `Continue with ${t(`paymentMethods.${selectedMethod}`)}`}</h3>
      <p class="form-hint">Your payment is encrypted and processed securely.</p>
      ${
        isCard
          ? `<div class="checkout-grid-2">
        <div class="form-field form-field-full">
          <label for="pay-email">Email</label>
          <input type="email" id="pay-email" value="${escapeHtml(order.invoice?.invoiceEmail || order.email)}" placeholder="email@example.com" autocomplete="email" />
        </div>
        <div class="form-field form-field-full checkout-card-input-wrap">
          <label for="pay-card">Card number</label>
          <input type="text" id="pay-card" placeholder="1234 1234 1234 1234" inputmode="numeric" autocomplete="cc-number" />
        </div>
        <div class="form-field">
          <label for="pay-exp">Expiry</label>
          <input type="text" id="pay-exp" placeholder="MM / YY" autocomplete="cc-exp" />
        </div>
        <div class="form-field">
          <label for="pay-cvc">CVC</label>
          <input type="text" id="pay-cvc" placeholder="CVC" autocomplete="cc-csc" />
        </div>
        <div class="form-field form-field-full">
          <label for="pay-name">Name on card</label>
          <input type="text" id="pay-name" placeholder="Full name on card" autocomplete="cc-name" value="${escapeHtml(`${order.invoice?.invoiceFirstName || ""} ${order.invoice?.invoiceLastName || ""}`.trim())}" />
        </div>
      </div>`
          : renderWalletPaymentContent(selectedMethod)
      }
      <div class="checkout-actions">
        <button type="button" class="btn btn-outline" data-checkout-back="review">← Back to review</button>
        <div class="checkout-actions-end">
          <button type="button" class="btn btn-primary" id="complete-payment-btn">Pay ${currency} ${displayTotal}</button>
        </div>
      </div>
    </div>`;

  return wrapCheckoutLayout("payment", body, {
    showVat: true,
    showInvoiceId: true,
    note: "Select your preferred payment method, then proceed.",
  });
}

function renderConfirmationStep() {
  return `
    <div class="checkout-card-single">
      <div class="checkout-success">
        <div class="checkout-success-icon" aria-hidden="true">✓</div>
        <h1>Order confirmed</h1>
        <p>Thank you. Your order <strong>${escapeHtml(invoiceId || order.invoiceId)}</strong> has been received and payment was successful.</p>
        <p class="form-hint">You will receive a confirmation email at ${escapeHtml(order.invoice?.invoiceEmail || order.email)} with next steps.</p>
        <div class="checkout-success-actions">
          <a href="index.html" class="btn btn-primary">Return to Author Services</a>
        </div>
      </div>
    </div>`;
}

function renderCheckout() {
  const main = document.getElementById("checkout-main");
  if (!main) return;
  renderProgress();

  const panels = {
    account: renderAccountStep,
    details: renderDetailsStep,
    invoice: renderInvoiceStep,
    review: renderReviewStep,
    payment: renderPaymentStep,
    confirmation: renderConfirmationStep,
  };

  main.innerHTML = `<div class="container"><div class="checkout-shell">${panels[checkoutStep]()}</div></div>`;
  bindCheckoutEvents();
  bindCheckoutAutoSave();
}

function bindCheckoutEvents() {
  document.querySelectorAll("[data-checkout-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-checkout-back");
      // Always persist the current step before leaving so Back never wipes other steps.
      clearTimeout(autoSaveTimer);
      persistCurrentCheckoutStep();
      if (target === "quote") {
        redirectToQuote();
        return;
      }
      setCheckoutStep(target);
    });
  });

  document.querySelectorAll("[data-checkout-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-checkout-next");
      if (checkoutStep === "account") {
        if (!isLoggedIn()) {
          alert("Please log in with your MDPI account before continuing.");
          document.getElementById("checkout-login-btn")?.focus();
          return;
        }
      }
      if (checkoutStep === "details") {
        clearTimeout(autoSaveTimer);
        collectDetailsFromForm();
        if (!validateDetails()) return;
        persistCurrentCheckoutStep();
      }
      if (checkoutStep === "invoice") {
        clearTimeout(autoSaveTimer);
        collectInvoiceFromForm();
        if (!validateInvoice()) return;
        persistCurrentCheckoutStep();
      }
      if (checkoutStep === "review") {
        clearTimeout(autoSaveTimer);
        collectReviewFromForm();
        if (!validateReview()) return;
        persistCurrentCheckoutStep();
      }
      setCheckoutStep(target);
    });
  });

  document.getElementById("checkout-login-btn")?.addEventListener("click", () => {
    beginLoginRedirect();
  });

  // If the author started login and returned without an SSO callback (e.g. local demo), confirm manually.
  if (checkoutStep === "account" && !isLoggedIn() && loadAuthState()?.loginPending) {
    const lead = document.querySelector(".checkout-account-lead");
    if (lead) {
      lead.textContent =
        "Welcome back. If you finished signing in with MDPI, confirm below to continue your order.";
    }
    const actionsEnd = document.querySelector(".checkout-account-card .checkout-actions-end");
    if (actionsEnd && !document.getElementById("checkout-confirm-login")) {
      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "btn btn-primary";
      confirmBtn.id = "checkout-confirm-login";
      confirmBtn.textContent = "I've logged in — continue";
      confirmBtn.addEventListener("click", () => {
        markLoggedIn({ source: "login-return" });
        window.MdpiAuth?.renderHeaderAuth?.();
        setCheckoutStep("details");
      });
      actionsEnd.innerHTML = "";
      actionsEnd.appendChild(confirmBtn);
    }
  }

  document.getElementById("apply-voucher-btn")?.addEventListener("click", () => {
    collectInvoiceFromForm();
    const code = order.invoice.voucher.toUpperCase();
    if (code === "VIDEO10" && order.services.includes("video")) {
      alert("VIDEO10 is already applied in your video production quote.");
    } else if (
      code === "MDPI30" &&
      order.services.includes("language") &&
      ["rapid", "academic"].includes(order.tier) &&
      order.pricing?.editingCampaign
    ) {
      alert("MDPI30 is already applied to your Rapid or Academic editing order.");
    } else if (code === "MDPI30" && order.services.includes("language") && order.tier === "standard") {
      alert("MDPI30 applies to Rapid and Academic editing only.");
    } else if (code) {
      alert("Voucher code noted. Discount codes are validated at payment in this prototype.");
    }
  });

  document.getElementById("proceed-payment-btn")?.addEventListener("click", () => {
    if (!document.getElementById("payment-agree-terms")?.checked) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    document.getElementById("stripe-panel")?.classList.remove("checkout-hidden");
    document.getElementById("proceed-payment-btn")?.classList.add("checkout-hidden");
  });

  document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    input.addEventListener("change", () => {
      order.paymentMethod = input.value;
      saveOrder();
      if (checkoutStep === "payment") {
        renderCheckout();
        document.getElementById("stripe-panel")?.classList.add("checkout-hidden");
        document.getElementById("proceed-payment-btn")?.classList.remove("checkout-hidden");
      }
    });
  });

  document.getElementById("complete-payment-btn")?.addEventListener("click", () => {
    order.status = "paid";
    order.paidAt = new Date().toISOString();
    saveOrder();
    setCheckoutStep("confirmation");
  });
}

function initCheckout() {
  order = normalizeOrderPricing(loadOrder());
  if (!order || !order.services?.length || !(Number(order.pricing?.total) > 0)) {
    redirectToQuote();
    return;
  }
  order.details = order.details || {};
  order.invoice = order.invoice || {};
  order.review = order.review || {};
  // Persist normalized pricing so totals stay stable across checkout steps.
  saveOrder();
  invoiceId = order.invoiceId || null;

  const returnedFromAuth = consumeAuthReturnParams();
  const savedStep =
    order.checkoutStep &&
    CHECKOUT_STEPS.includes(order.checkoutStep) &&
    order.checkoutStep !== "confirmation"
      ? order.checkoutStep
      : null;

  if (order.status === "paid") {
    checkoutStep = "confirmation";
  } else if (returnedFromAuth) {
    checkoutStep = savedStep && savedStep !== "account" ? savedStep : "details";
  } else if (isLoggedIn()) {
    checkoutStep = savedStep && savedStep !== "account" ? savedStep : "details";
  } else if (savedStep === "account" || !savedStep) {
    checkoutStep = "account";
  } else {
    // Resume requires login before returning to a later saved step.
    checkoutStep = "account";
  }

  renderCheckout();
}

window.addEventListener("mdpi-language-change", () => {
  if (order) renderCheckout();
});

initCheckout();
