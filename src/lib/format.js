export const formatEUR = (value) => {
  const v = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(v);
};

export const monthKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export const parseMonth = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
};

const MONTHS_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const formatMonth = (key) => {
  const d = parseMonth(key);
  return `${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`;
};

export const shiftMonth = (key, delta) => {
  const d = parseMonth(key);
  d.setMonth(d.getMonth() + delta);
  return monthKey(d);
};

export const capitalize = (s) => {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
