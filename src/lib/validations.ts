// ==========================================
// Validations - Centralized validation and formatting utilities
// ==========================================

// ==========================================
// TEXT UTILITIES
// ==========================================

/**
 * Capitaliza primeira letra de um texto
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Capitaliza palavras respeitando preposições em português
 */
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

/**
 * Capitaliza nome completo respeitando preposições
 */
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

/**
 * Capitaliza endereço (todas as palavras)
 */
export function capitalizeAddress(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Remove espaços extras e faz trim
 */
export function sanitizeText(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

// ==========================================
// BRAZILIAN DOCUMENT VALIDATIONS
// ==========================================

/**
 * Valida CPF brasileiro
 */
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

// Lista de DDDs válidos no Brasil
const DDD_VALIDOS = [
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
];

/**
 * Valida telefone brasileiro (DDD + 8/9 dígitos)
 */
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

// Lista de UFs brasileiras
const UF_LIST = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

/**
 * Valida RG brasileiro (formato flexível)
 */
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

/**
 * Valida e-mail
 */
export function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// ==========================================
// FIELD-SPECIFIC VALIDATIONS
// ==========================================

export interface FieldValidationResult {
  isValid: boolean;
  error: string;
}

/**
 * Valida nome completo (mínimo 2 palavras, apenas letras)
 */
export function validateFullName(value: string): FieldValidationResult {
  const words = value.split(/\s+/).filter(Boolean);
  const isValid =
    words.length >= 2 && words.every((w) => /^[A-Za-zÀ-ÿ]+$/.test(w));
  return {
    isValid,
    error: isValid
      ? ""
      : "Digite nome e sobrenome completos (mínimo 2 palavras, apenas letras)",
  };
}

/**
 * Valida data de nascimento
 */
export function validateBirthDate(value: string): FieldValidationResult {
  if (!value) {
    return { isValid: false, error: "Informe a data de nascimento" };
  }
  const date = new Date(value);
  const today = new Date();
  const isValid = !isNaN(date.getTime()) && date <= today;
  return {
    isValid,
    error: isValid ? "" : "Data de nascimento inválida",
  };
}

/**
 * Valida profissão (mínimo 3 caracteres, letras, números e espaços)
 */
export function validateProfession(value: string): FieldValidationResult {
  const trimmed = value.trim();
  const isValid =
    trimmed.length >= 3 && /^[\p{L}\p{N}\s]+$/u.test(trimmed);
  return {
    isValid,
    error: isValid
      ? ""
      : trimmed.length < 3
        ? "Digite pelo menos 3 caracteres"
        : "Digite apenas letras, números e espaços",
  };
}

/**
 * Valida CEP (8 dígitos)
 */
export function validateCEP(value: string): FieldValidationResult {
  const digits = value.replace(/\D/g, "");
  const isValid = digits.length === 8;
  return {
    isValid,
    error: isValid ? "" : "CEP inválido ou não encontrado",
  };
}

/**
 * Valida endereço/bairro (mínimo 3 caracteres, alfanumérico)
 */
export function validateAddressField(value: string): FieldValidationResult {
  const isValid = value.length >= 3 && /^[A-Za-zÀ-ÿ0-9\s]+$/.test(value);
  return {
    isValid,
    error: value.length < 3
      ? "Digite pelo menos 3 caracteres"
      : isValid
        ? ""
        : "Digite um endereço válido",
  };
}

/**
 * Valida número do endereço (números ou S/N)
 */
export function validateAddressNumber(value: string): FieldValidationResult {
  const n = value.toUpperCase().replace(/\s/g, "");
  const isValid = /^[0-9]+$/.test(n) || n === "S/N" || n === "SN";
  return {
    isValid,
    error: isValid ? "" : "Digite apenas números ou S/N",
  };
}

/**
 * Valida complemento (opcional, caracteres permitidos)
 */
export function validateComplement(value: string): FieldValidationResult {
  const isValid =
    value.length === 0 || /^[A-Za-zÀ-ÿ0-9\s,.\-\/]+$/.test(value);
  return {
    isValid,
    error: "",
  };
}

/**
 * Valida campo de seleção obrigatório
 */
export function validateRequiredSelect(value: string, fieldLabel?: string): FieldValidationResult {
  const isValid = value.length > 0;
  return {
    isValid,
    error: isValid ? "" : fieldLabel ? `Selecione ${fieldLabel}` : "Selecione uma opção",
  };
}

// ==========================================
// FORMAT FUNCTIONS
// ==========================================

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Formata telefone: (00) 00000-0000 ou (00) 0000-0000
 */
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

/**
 * Formata CEP: 00000-000
 */
export function formatCEP(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return d;
}

// ==========================================
// AGE CALCULATIONS
// ==========================================

/**
 * Calcula a idade baseada na data de nascimento
 */
export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Verifica se é menor de idade
 */
export function isMinor(birthDate: string): boolean {
  const age = calculateAge(birthDate);
  return age !== null && age < 18;
}

/**
 * Verifica se precisa de responsável legal
 * 
 * REGRAS (v2 - atualizado):
 * - Menor de 18 anos: SEMPRE precisa de responsável (sem exceção)
 * - Maior de 18 anos: apenas se hasLegalRepresentative = true
 * 
 * @deprecated Use o hook useBeneficiaryAgeRules para lógica centralizada
 */
export function needsLegalGuardian(
  birthDate: string,
  hasLegalRepresentative: boolean
): boolean {
  const age = calculateAge(birthDate);
  if (age === null) return false;
  
  // Menor de 18: sempre precisa de responsável
  if (age < 18) return true;
  
  // Maior de 18: apenas se marcou que tem representante
  return hasLegalRepresentative;
}

/**
 * Formata base do RG (números)
 */
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

/**
 * Formata RG brasileiro (formato flexível com UF)
 */
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

/**
 * Formata número de endereço (permite apenas números e S/N)
 */
export function formatAddressNumber(value: string): string {
  return value.toUpperCase().replace(/[^0-9SN\/]/g, "");
}
