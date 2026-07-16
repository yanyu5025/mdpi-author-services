/**
 * On-platform checkout wizard — reads quote payload from sessionStorage.
 */
const ORDER_STORAGE_KEY = "mdpi-as-order-v1";
const VAT_RATE = 0.081;

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

const CHECKOUT_STEPS = ["details", "invoice", "review", "payment", "confirmation"];

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
let checkoutStep = "details";
let invoiceId = null;

function loadOrder() {
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveOrder() {
  sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
}

function formatMoney(amount, currency = "CHF") {
  return `${currency} ${Number(amount).toFixed(2)}`;
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
  const net = order.pricing.total;
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
  checkoutStep = step;
  if (step === "review" && !invoiceId) {
    invoiceId = generateInvoiceId();
    order.invoiceId = invoiceId;
    saveOrder();
  }
  renderCheckout();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateDetails() {
  if (order.services.includes("language") && !order.details.languageTitle?.trim()) {
    alert("Please enter the manuscript title for English Language Editing.");
    return false;
  }
  if (order.services.includes("figures") && !order.details.figureRequestDetails?.trim()) {
    alert("Please enter Figure and Table Editing request details.");
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
  order.details = order.details || {};
  if (order.services.includes("language")) {
    order.details.manuscriptId = document.getElementById("detail-manuscript-id")?.value.trim() || "";
    order.details.languageTitle = document.getElementById("detail-manuscript-title")?.value.trim() || "";
  }
  if (order.services.includes("figures")) {
    order.details.figureRequestDetails =
      document.getElementById("detail-figure-request")?.value.trim() || "";
  }
  if (order.services.includes("layout")) {
    order.details.layoutJournal = document.getElementById("detail-layout-journal")?.value || "";
  }
  if (order.services.includes("video")) {
    order.details.videoType = order.videoType;
    order.details.videoManuscriptLink =
      document.getElementById("detail-video-doi")?.value.trim() || "";
    order.details.videoProducerNotes =
      document.getElementById("detail-video-notes")?.value.trim() || "";
    order.details.videoPublishChannels = [
      ...document.querySelectorAll('input[name="detailVideoPublishChannels"]:checked'),
    ].map((el) => el.value);
    syncVideoPricing();
  }
  saveOrder();
}

function collectInvoiceFromForm() {
  order.invoice = {
    invoiceFirstName: document.getElementById("invoice-first-name")?.value.trim() || "",
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
  order.review = order.review || {};
  order.review.agreeTerms = !!document.getElementById("review-agree-terms")?.checked;
  saveOrder();
}

const STEP_META = {
  details: {
    eyebrow: "Step 1 of 4",
    title: "Service details",
    desc: "Provide the information our editors and producers need to begin your order.",
  },
  invoice: {
    eyebrow: "Step 2 of 4",
    title: "Invoice information",
    desc: "Enter your billing details. Fields marked with * are required.",
  },
  review: {
    eyebrow: "Step 3 of 4",
    title: "Review your order",
    desc: "Confirm your services and billing details before payment.",
  },
  payment: {
    eyebrow: "Step 4 of 4",
    title: "Payment by credit card",
    desc: "Pay securely to complete your order. Work begins once payment is received.",
  },
};

function renderStepHeader(step) {
  const meta = STEP_META[step] || {};
  return `
    <header class="checkout-step-header">
      <p class="checkout-step-eyebrow">${meta.eyebrow || ""}</p>
      <h1>${meta.title || ""}</h1>
      <p class="checkout-step-desc">${meta.desc || ""}</p>
    </header>`;
}

function renderSidebarSummary(options = {}) {
  const { showVat = false, showInvoiceId = false, note = "" } = options;
  const { currency, pricing } = order;
  let summaryHtml = "";

  if (showVat) {
    summaryHtml = renderFeesSummary();
  } else {
    summaryHtml = renderLineItems();
    summaryHtml += `<div class="checkout-summary-row is-total"><dt>Subtotal</dt><dd>${formatMoney(pricing.total, currency)}</dd></div>`;
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
    <div class="checkout-sidebar-card">
      <div class="checkout-sidebar-head">
        <h2>Order summary</h2>
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
          <div><dt>Status</dt><dd>Materials to be collected after order</dd></div>
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
    details: "Details",
    invoice: "Invoice Information",
    review: "Review",
    payment: "Payment",
    confirmation: "Confirmation",
  };
  list.innerHTML = CHECKOUT_STEPS.filter((s) => s !== "confirmation")
    .map((step, index) => {
      const classes = [];
      if (index < current) classes.push("is-done");
      if (step === checkoutStep) classes.push("is-active");
      const marker = index < current ? "✓" : String(index + 1);
      return `<li class="${classes.join(" ")}" data-step="${step}"><span>${marker}</span>${labels[step]}</li>`;
    })
    .join("");
}

function renderLineItems() {
  const { pricing, currency, services, tier, words, figures, videoType } = order;
  const rows = [];
  if (services.includes("language") && pricing.language > 0) {
    rows.push({
      label: `${SERVICE_TITLES.language} (${TIER_LABELS[tier] || tier}, ${words.toLocaleString()} words)`,
      amount: pricing.language,
    });
  }
  if (services.includes("figures") && (pricing.figures > 0 || pricing.figuresIncluded)) {
    rows.push({
      label: `${SERVICE_TITLES.figures} (${figures} item${figures === 1 ? "" : "s"})`,
      amount: pricing.figuresIncluded ? 0 : pricing.figures,
      note: pricing.figuresIncluded ? "Included (Academic)" : null,
    });
  }
  if (services.includes("layout") && (pricing.layout > 0 || pricing.layoutIncluded)) {
    rows.push({
      label: SERVICE_TITLES.layout,
      amount: pricing.layoutIncluded ? 0 : pricing.layout,
      note: pricing.layoutIncluded ? "Included (Academic)" : null,
    });
  }
  if (services.includes("graphical") && pricing.graphical > 0) {
    rows.push({ label: SERVICE_TITLES.graphical, amount: pricing.graphical });
  }
  if (services.includes("video") && pricing.video > 0) {
    rows.push({
      label: `${SERVICE_TITLES.video} (${VIDEO_LABELS[videoType] || videoType})`,
      amount: pricing.video,
      note: pricing.videoCampaign ? "VIDEO10 · 10% off" : null,
    });
  }
  if (pricing.ioapDiscount > 0) {
    rows.push({ label: "IOAP Discount (15%)", amount: -pricing.ioapDiscount, isDiscount: true });
  }
  return rows
    .map((row) => {
      const value = row.note
        ? row.note
        : row.isDiscount
          ? `−${formatMoney(Math.abs(row.amount), currency)}`
          : formatMoney(row.amount, currency);
      return `<div class="checkout-summary-row${row.isDiscount ? " is-discount" : ""}"><dt>${escapeHtml(row.label)}</dt><dd>${value}</dd></div>`;
    })
    .join("");
}

function renderFeesSummary() {
  const { currency } = order;
  const { net, vat, total } = getFees();
  return `
    ${renderLineItems()}
    <div class="checkout-summary-row"><dt>Subtotal without VAT</dt><dd>${formatMoney(net, currency)}</dd></div>
    <div class="checkout-summary-row"><dt>VAT</dt><dd>${formatMoney(vat, currency)}</dd></div>
    <div class="checkout-summary-row is-total"><dt>Total with VAT</dt><dd>${formatMoney(total, currency)}</dd></div>
  `;
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
    blocks += `
      <section class="checkout-service-block">
        <span class="checkout-service-badge">Figures &amp; tables</span>
        <h2>${SERVICE_TITLES.figures}</h2>
        <p class="form-hint">${order.figures} figure/table item${order.figures === 1 ? "" : "s"} included from your quote.</p>
        <div class="form-field">
          <label for="detail-figure-request">Figure and Table Editing Request Details <span class="required-mark">*</span></label>
          <textarea id="detail-figure-request" rows="4" placeholder="e.g., I would like Figures 1,2,x... and Tables 1,2,x... to be edited to meet the journal guidelines." required>${escapeHtml(d.figureRequestDetails)}</textarea>
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
        <div class="checkout-skip-note">
          <div class="checkout-skip-note-copy">
            <strong>Details not required</strong>
            <p>For the Graphical Abstract service, please proceed to the next step. After submission, you will receive an email with the list of materials we need to begin your design.</p>
          </div>
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
    ${renderActions("quote", "← Edit quote", "invoice", "Continue to invoice")}`;

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
          <select id="invoice-country" autocomplete="country-name">
            <option value="">Select country</option>
            <option value="Switzerland"${inv.invoiceCountry === "Switzerland" ? " selected" : ""}>Switzerland</option>
            <option value="Germany"${inv.invoiceCountry === "Germany" ? " selected" : ""}>Germany</option>
            <option value="United Kingdom"${inv.invoiceCountry === "United Kingdom" ? " selected" : ""}>United Kingdom</option>
            <option value="United States"${inv.invoiceCountry === "United States" ? " selected" : ""}>United States</option>
            <option value="China"${inv.invoiceCountry === "China" ? " selected" : ""}>China</option>
          </select>
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

function renderPaymentStep() {
  const { currency } = order;
  const { total } = getFees();
  const fx = currency === "USD" ? total * 1.12 : total;
  const displayCurrency = currency === "USD" ? "USD" : currency;
  const displayTotal = currency === "USD" ? fx : total;

  const body = `
    ${renderStepHeader("payment")}
    <p class="checkout-secure-note">Secure payment processed by Stripe</p>
    <div class="checkout-payment-amount-card">
      <dl>
        <dt>Amount due</dt>
        <dd>${displayTotal.toFixed(2)} ${displayCurrency}</dd>
      </dl>
      <div class="checkout-card-brands" aria-hidden="true">
        <span class="checkout-card-brand">VISA</span>
        <span class="checkout-card-brand">Mastercard</span>
        <span class="checkout-card-brand">Amex</span>
        <span class="checkout-card-brand">UnionPay</span>
      </div>
    </div>
    <div class="checkout-payment-box">
      <h2>Transfer information</h2>
      <dl class="checkout-payment-meta">
        <dt>Invoice ID</dt>
        <dd>${escapeHtml(invoiceId || order.invoiceId)}</dd>
        <dt>Currency</dt>
        <dd>${displayCurrency}</dd>
      </dl>
      <label class="checkout-terms">
        <input type="checkbox" id="payment-agree-terms" />
        <span>I have read and agree to the Standard Terms and Conditions of Business of MDPI AG.</span>
      </label>
      <button type="button" class="btn btn-primary btn-block" id="proceed-payment-btn">Proceed to payment</button>
    </div>
    <div id="stripe-panel" class="checkout-stripe-mock checkout-hidden">
      <h3>Enter card details</h3>
      <p class="form-hint">Your payment is encrypted and processed securely.</p>
      <div class="checkout-grid-2">
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
      </div>
      <div class="checkout-actions">
        <button type="button" class="btn btn-outline" data-checkout-back="review">← Back to review</button>
        <div class="checkout-actions-end">
          <button type="button" class="btn btn-primary" id="complete-payment-btn">Pay ${displayCurrency} ${displayTotal.toFixed(2)}</button>
        </div>
      </div>
    </div>`;

  return wrapCheckoutLayout("payment", body, {
    showVat: true,
    showInvoiceId: true,
    note: "Click Proceed to payment to open the secure card form.",
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
    details: renderDetailsStep,
    invoice: renderInvoiceStep,
    review: renderReviewStep,
    payment: renderPaymentStep,
    confirmation: renderConfirmationStep,
  };

  main.innerHTML = `<div class="checkout-shell">${panels[checkoutStep]()}</div>`;
  bindCheckoutEvents();
}

function bindCheckoutEvents() {
  document.querySelectorAll("[data-checkout-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-checkout-back");
      if (target === "quote") {
        redirectToQuote();
        return;
      }
      if (checkoutStep === "invoice") collectDetailsFromForm();
      if (checkoutStep === "review") collectReviewFromForm();
      if (checkoutStep === "payment") collectInvoiceFromForm();
      setCheckoutStep(target);
    });
  });

  document.querySelectorAll("[data-checkout-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-checkout-next");
      if (checkoutStep === "details") {
        collectDetailsFromForm();
        if (!validateDetails()) return;
      }
      if (checkoutStep === "invoice") {
        collectInvoiceFromForm();
        if (!validateInvoice()) return;
      }
      if (checkoutStep === "review") {
        collectReviewFromForm();
        if (!validateReview()) return;
      }
      setCheckoutStep(target);
    });
  });

  document.getElementById("apply-voucher-btn")?.addEventListener("click", () => {
    collectInvoiceFromForm();
    const code = order.invoice.voucher.toUpperCase();
    if (code === "VIDEO10" && order.services.includes("video")) {
      alert("VIDEO10 is already applied in your video production quote.");
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

  document.getElementById("complete-payment-btn")?.addEventListener("click", () => {
    order.status = "paid";
    order.paidAt = new Date().toISOString();
    saveOrder();
    setCheckoutStep("confirmation");
  });
}

function initCheckout() {
  order = loadOrder();
  if (!order || !order.services?.length || !order.pricing?.total) {
    redirectToQuote();
    return;
  }
  order.details = order.details || {};
  order.invoice = order.invoice || {};
  order.review = order.review || {};
  invoiceId = order.invoiceId || null;
  if (order.status === "paid") {
    checkoutStep = "confirmation";
  }
  renderCheckout();
}

initCheckout();
