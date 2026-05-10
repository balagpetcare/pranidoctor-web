/**
 * Normalizes Bangladesh mobile numbers to digits-only `8801XXXXXXXXX` (13 digits).
 * Accepts: `01…`, `8801…`, `+8801…`, optional spaces/dashes.
 */
export function normalizeBdMobilePhone(raw: string): string | null {
  let s = raw.trim();
  if (s.startsWith("+")) {
    s = s.slice(1);
  }
  const digits = s.replace(/[\s-]/g, "");
  if (!/^\d+$/.test(digits)) return null;

  if (digits.length === 11 && digits.startsWith("01")) {
    return `88${digits}`;
  }
  if (digits.length === 13 && digits.startsWith("8801")) {
    return digits;
  }
  /* Less common: national significant number without leading 0 */
  if (digits.length === 10 && digits.startsWith("1")) {
    return `880${digits}`;
  }
  return null;
}
