const NL_MONTHS_SHORT = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

const NL_DAYS_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = NL_DAYS_SHORT[d.getDay()];
  return `${day} ${d.getDate()} ${NL_MONTHS_SHORT[d.getMonth()]}`;
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const NL_MONTHS = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
  ];
  return `${d.getDate()} ${NL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatPutts(
  puttsTotal: number | null,
  puttsPerHole: number | null
): string {
  if (puttsTotal == null && puttsPerHole == null) return "-";
  if (puttsTotal != null && puttsPerHole != null) {
    return `${puttsTotal} (${puttsPerHole.toFixed(1)}/hole)`;
  }
  if (puttsTotal != null) return `${puttsTotal}`;
  return `${puttsPerHole!.toFixed(1)}/hole`;
}
