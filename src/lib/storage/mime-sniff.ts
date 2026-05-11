/**
 * Sniff image / PDF MIME from magic bytes (do not trust client Content-Type alone).
 */
export function sniffMimeFromBuffer(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buf.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }
  return null;
}

const DANGEROUS_MIMES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-dosexec",
  "application/javascript",
  "text/javascript",
  "application/x-sh",
  "application/x-csh",
]);

export function isDangerousMime(mime: string): boolean {
  const m = mime.trim().toLowerCase();
  if (DANGEROUS_MIMES.has(m)) return true;
  if (m.startsWith("video/") || m.startsWith("audio/")) return true;
  return false;
}

const DANGEROUS_EXT = /\.(exe|bat|cmd|msi|dll|scr|pif|com|sh|ps1|js|jar)(\.|$)/i;

export function isDangerousExtension(name: string): boolean {
  return DANGEROUS_EXT.test(name.toLowerCase());
}
