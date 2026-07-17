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

window.MdpiMoney = { FX: MDPI_FX, convertFromChf, formatMoney, formatMoneyAmount };
