/**
 * CHF-base FX rates and formatting for quote + checkout.
 */
const MDPI_FX = {
  CHF: 1,
  EUR: 0.95,
  USD: 1.12,
  GBP: 0.88,
  CNY: 8.15,
  THB: 39.5,
  JPY: 175,
  KRW: 1520,
  TRY: 36.5,
  SAR: 4.2,
};

const MDPI_ZERO_DECIMAL = new Set(["JPY", "KRW"]);

const MDPI_EDITING_CAMPAIGN = {
  code: "MDPI30",
  amountChf: 30,
  tiers: ["rapid", "academic"],
  start: new Date("2026-07-01T00:00:00"),
  end: new Date("2026-08-30T23:59:59"),
};

function isEditingCampaignActive(date = new Date()) {
  return date >= MDPI_EDITING_CAMPAIGN.start && date <= MDPI_EDITING_CAMPAIGN.end;
}

function isEditingCampaignEligible(tier, date = new Date()) {
  return (
    isEditingCampaignActive(date) &&
    MDPI_EDITING_CAMPAIGN.tiers.includes(String(tier || "").toLowerCase())
  );
}

function getEditingCampaignDiscountChf(tier, languagePriceChf, date = new Date()) {
  if (!isEditingCampaignEligible(tier, date) || languagePriceChf <= 0) return 0;
  return Math.min(MDPI_EDITING_CAMPAIGN.amountChf, languagePriceChf);
}

function convertFromChf(amountChf, currency = "CHF") {
  return amountChf * (MDPI_FX[currency] ?? 1);
}

function formatMoney(amountChf, currency = "CHF") {
  const converted = convertFromChf(amountChf, currency);
  if (MDPI_ZERO_DECIMAL.has(currency)) {
    return `${currency} ${Math.round(converted).toLocaleString()}`;
  }
  return `${currency} ${converted.toFixed(2)}`;
}

function formatMoneyAmount(amountChf, currency = "CHF") {
  const converted = convertFromChf(amountChf, currency);
  if (MDPI_ZERO_DECIMAL.has(currency)) {
    return Math.round(converted).toLocaleString();
  }
  return converted.toFixed(2);
}

window.MdpiMoney = {
  FX: MDPI_FX,
  EDITING_CAMPAIGN: MDPI_EDITING_CAMPAIGN,
  convertFromChf,
  formatMoney,
  formatMoneyAmount,
  isEditingCampaignActive,
  isEditingCampaignEligible,
  getEditingCampaignDiscountChf,
};
