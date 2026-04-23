// أدوات تنسيق عربية
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export const toArabicDigits = (input: string | number): string => {
  return String(input).replace(/\d/g, (d) => ARABIC_DIGITS[parseInt(d)]);
};

export const formatNumber = (n: number, decimals = 2): string => {
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return toArabicDigits(formatted);
};

export const formatCurrency = (n: number, currency = "ج.م"): string => {
  return `${formatNumber(n)} ${currency}`;
};

export const formatInt = (n: number): string => toArabicDigits(n.toString());

export const formatDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  const date = d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return date;
};

export const formatDateTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${formatDate(timestamp)} - ${toArabicDigits(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }))}`;
};

export const formatHijri = (timestamp: number): string => {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString("ar-SA-u-ca-islamic", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return formatDate(timestamp);
  }
};
