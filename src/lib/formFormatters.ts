// ==========================================
// Form Formatters - Input formatting utilities
// ==========================================

import {
  formatCPF,
  formatPhone,
  formatCEP,
  formatRG,
  capitalizeName,
  capitalizeAddress,
  capitalizeFirstLetter,
  sanitizeText,
} from "@/lib/validations";

/**
 * Formata valor baseado no tipo de campo durante digitação
 */
export function formatFieldValue(fieldName: string, value: string): string {
  const baseName = fieldName.replace(
    /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
    ""
  );

  switch (baseName) {
    case "cpf":
      return formatCPF(value);
    case "telefone":
      return formatPhone(value);
    case "cep":
      return formatCEP(value);
    case "rg":
      return formatRG(value);
    case "numero":
      return value.toUpperCase().replace(/[^0-9SN\/]/g, "");
    default:
      return value;
  }
}

/**
 * Sanitiza valor no blur (perda de foco)
 */
export function sanitizeFieldValue(fieldName: string, value: string): string {
  const baseName = fieldName.replace(
    /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
    ""
  );

  switch (baseName) {
    case "nome":
      return capitalizeName(sanitizeText(value));
    case "profissao":
      return capitalizeFirstLetter(sanitizeText(value));
    case "complemento":
      return sanitizeText(value);
    case "endereco":
    case "bairro":
      return capitalizeAddress(sanitizeText(value));
    case "email":
      return value.trim().toLowerCase();
    default:
      return value;
  }
}
