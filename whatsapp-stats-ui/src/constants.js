export const STOPWORDS = new Set([
  // Spanish
  "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para", "con", "no", "una",
  "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque", "esta", "entre",
  "cuando", "muy", "sin", "sobre", "también", "me", "hasta", "hay", "donde", "quien", "desde", "todo",
  "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e",
  "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tú", "te", "tu",
  // English
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are", "was", "were", "be", "been",
  "i", "you", "he", "she", "it", "we", "they", "me", "my", "your", "yours", "his", "her", "their", "our",
]);

export const SENTIMENT_THRESHOLDS = {
  POSITIVE: 0.15,
  NEGATIVE: -0.15,
};

export const DEFAULT_DATE_RANGE = {
  from: "2025-01-01",
  to: "2025-12-01",
};