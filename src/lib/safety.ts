// Safety Mode utility: masks his name, his nickname, her name, and her nickname across the app
export function createNameMasker(settings?: {
  his_name?: string | null;
  his_nickname?: string | null;
  her_name?: string | null;
  her_nickname?: string | null;
}) {
  const words = new Set<string>([
    'abanoub', 'bibo', 'jostena', 'jojo',
    'أبانوب', 'ابانوب', 'بيبو', 'جوستينا', 'جوجو'
  ]);

  if (settings) {
    if (settings.his_name && settings.his_name.trim()) words.add(settings.his_name.trim());
    if (settings.his_nickname && settings.his_nickname.trim()) words.add(settings.his_nickname.trim());
    if (settings.her_name && settings.her_name.trim()) words.add(settings.her_name.trim());
    if (settings.her_nickname && settings.her_nickname.trim()) words.add(settings.her_nickname.trim());
  }

  // Sort descending by length so longer phrases match first
  const sorted = Array.from(words).filter(Boolean).sort((a, b) => b.length - a.length);

  return function maskNames(text: string | null | undefined): string {
    if (!text || typeof text !== 'string') return text || '';
    let res = text;
    for (const w of sorted) {
      const isLatin = /^[A-Za-z0-9_]+$/.test(w);
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (isLatin) {
        // Matches word with optional possessive 's or 's
        const pat = new RegExp('\\b' + escaped + "(?:'s|’s)?\\b", 'gi');
        res = res.replace(pat, '••••');
      } else {
        // Matches Arabic with optional prefixes like و, ف, لـ, ل, ب, ك
        const pat = new RegExp('(?:^|(?<=[^\\u0621-\\u064A]))(?:و|ف)?(?:لـ|ل|ب|ك)?' + escaped + '(?=[^\\u0621-\\u064A]|$)', 'g');
        res = res.replace(pat, '••••');
      }
    }
    return res;
  };
}
