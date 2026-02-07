// ==========================================
// Form Options - Static data for dropdowns
// ==========================================

import type { SelectOption } from "@/types/form";

export const NACIONALIDADES: SelectOption[] = [
  { value: "", label: "Selecione" },
  { value: "Brasileiro(a)", label: "Brasileiro(a)" },
  { value: "Estrangeiro(a)", label: "Estrangeiro(a)" },
];

export const ESTADOS_CIVIS: SelectOption[] = [
  { value: "", label: "Selecione" },
  { value: "Solteiro(a)", label: "Solteiro(a)" },
  { value: "Casado(a)", label: "Casado(a)" },
  { value: "Divorciado(a)", label: "Divorciado(a)" },
  { value: "Viúvo(a)", label: "Viúvo(a)" },
  { value: "União Estável", label: "União Estável" },
];

export const ESTADOS_BR: SelectOption[] = [
  { value: "", label: "Selecione o estado" },
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export const PARENTESCO_OPTIONS: SelectOption[] = [
  { value: "", label: "Selecione" },
  { value: "Pai", label: "Pai" },
  { value: "Mãe", label: "Mãe" },
  { value: "Avô", label: "Avô" },
  { value: "Avó", label: "Avó" },
  { value: "Tutor Legal", label: "Tutor Legal" },
  { value: "Curador", label: "Curador" },
  { value: "Outro", label: "Outro" },
];
