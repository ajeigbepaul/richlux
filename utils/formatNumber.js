// Naira amount inputs display as "5,000,000" while typing -- strip
// everything but digits, then re-format with thousand separators. Consumers
// store this formatted string directly in form state; unformatNumber()
// strips the commas back out wherever the raw numeric value is actually
// needed (validation, submit payload).
export function formatNumberWithCommas(value) {
  const digits = String(value).replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

export function unformatNumber(value) {
  const digits = String(value).replace(/[^\d]/g, "");
  return digits === "" ? undefined : Number(digits);
}
