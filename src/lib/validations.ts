// Capitalize first letter of each word
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const capitalizeWords = (text: string): string => {
  if (!text) return text;
  const prepositions = ["de", "da", "do", "das", "dos", "e"];
  return text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) =>
      prepositions.includes(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
};

// CPF Validation
export function validateCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;

  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let d = 11 - (s % 11);
  if (d >= 10) d = 0;
  if (d !== parseInt(c[9])) return false;

  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  d = 11 - (s % 11);
  if (d >= 10) d = 0;
  return d === parseInt(c[10]);
}

// Phone Validation (Brazilian)
const DDD_VALIDOS = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "21",
  "22",
  "24",
  "27",
  "28",
  "31",
  "32",
  "33",
  "34",
  "35",
  "37",
  "38",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "51",
  "53",
  "54",
  "55",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "71",
  "73",
  "74",
  "75",
  "77",
  "79",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
];

export function validatePhoneBR(value: string): boolean {
  const d = value.replace(/\D/g, "");
  if (!(d.length === 10 || d.length === 11)) return false;
  if (/^(\d)\1+$/.test(d)) return false;

  const ddd = d.slice(0, 2);
  if (!DDD_VALIDOS.includes(ddd)) return false;

  const firstSubscriber = d[2];
  if (d.length === 11) {
    if (firstSubscriber !== "9") return false;
  } else {
    if (!/[2-5]/.test(firstSubscriber)) return false;
  }
  return true;
}

// RG Validation
const UF_LIST = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
];

export function validateRG(rg: string): boolean {
  if (!rg || rg.trim() === "") return true;
  const txt = rg.toUpperCase().trim();

  const ini = txt.match(/^([A-Z]{2})(?:-|\s)?/);
  const hasIni = !!(ini && UF_LIST.includes(ini[1]));
  const fim = txt.match(/(?:\s*-\s*|\s+)([A-Z]{2})\s*$/);
  const hasFim = !!(fim && UF_LIST.includes(fim[1]));

  if (hasIni && hasFim) return false;

  let mid = txt;
  if (hasIni) mid = mid.replace(/^([A-Z]{2})(?:-|\s)?/, "");
  if (hasFim) mid = mid.replace(/(?:\s*-\s*|\s+)[A-Z]{2}\s*$/, "");
  if (/-[0-9X]\s*$/.test(mid)) mid = mid.replace(/-([0-9X])\s*$/, "");

  const len = mid.replace(/\D/g, "").length;
  return len >= 5 && len <= 12;
}

// Email Validation
export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Format Functions
export function formatCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6, 10)}`;
  if (d.length >= 7)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  return d;
}

export function formatCEP(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

function formatRgBase(d: string): string {
  const n = d.length;
  if (n >= 8) {
    const a = d.slice(0, 2),
      b = d.slice(2, 5),
      c = d.slice(5, 8);
    let out = `${a}.${b}.${c}`;
    let r = d.slice(8);
    while (r.length) {
      const take = Math.min(3, r.length);
      out += `.` + r.slice(0, take);
      r = r.slice(take);
    }
    return out.replace(/\.$/, "");
  }
  if (n === 7) return `${d.slice(0, 1)}.${d.slice(1, 4)}.${d.slice(4, 7)}`;
  if (n === 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}`;
  if (n >= 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

export function formatRG(value: string): string {
  let raw = (value || "")
    .toUpperCase()
    .replace(/[^0-9A-Z.\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
  const start = raw.match(/^[A-Z]{1,2}/);
  let ufPrefix = start ? start[0] : "";
  let rest = raw.slice(ufPrefix.length);
  if (ufPrefix.length === 2) rest = rest.replace(/^[-\s]/, "");

  let ufSuffix = "";
  if (!ufPrefix) {
    const suf = rest.match(/(?:\s*-\s*|\s+)([A-Z]{2})\s*$/);
    if (suf && UF_LIST.includes(suf[1])) {
      ufSuffix = suf[1];
      rest = rest.replace(/(?:\s*-\s*|\s+)[A-Z]{2}\s*$/, "");
    }
  }

  let dv = "";
  const dvMatch = rest.match(/\-([0-9X])\s*$/);
  if (dvMatch) {
    dv = dvMatch[1];
    rest = rest.replace(/\-([0-9X])\s*$/, "");
  }

  let baseDigits = rest.replace(/\D/g, "").slice(0, 12);
  if (!dv && baseDigits.length === 9) {
    dv = baseDigits.slice(-1);
    baseDigits = baseDigits.slice(0, 8);
  }

  const corpo = formatRgBase(baseDigits);
  let out = "";
  if (ufPrefix) out = ufPrefix + (corpo || dv || ufSuffix ? "-" : "");
  out += corpo;
  if (dv) out += `-${dv}`;
  if (ufSuffix) out += ` - ${ufSuffix}`;

  return out;
}

// Text utilities
export function capitalizeName(str: string): string {
  const preps = ["de", "da", "do", "das", "dos", "e"];
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((w) =>
      preps.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

export function capitalizeAddress(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function sanitizeText(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}
