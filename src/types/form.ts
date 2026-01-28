// ==========================================
// Form Types - BPC/LOAS Form Data Structures
// ==========================================

/** Dados pessoais do beneficiário */
export interface BeneficiaryData {
  nome: string;
  dataNascimento: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
}

/** Dados do responsável legal */
export interface ResponsibleData {
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
  parentesco: string;
}

/** Dados de endereço */
export interface AddressData {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
}

/** Dados de contato */
export interface ContactData {
  telefone: string;
  email: string;
}

/** Estado de validação de um campo */
export interface FieldValidation {
  isValid: boolean;
  error: string;
}

/** Estado de validação de todos os campos */
export interface ValidationState {
  [key: string]: FieldValidation;
}

/** Opção para select/dropdown */
export interface SelectOption {
  value: string;
  label: string;
}

/** Tipo de beneficiário: próprio ou terceiro */
export type BeneficiaryType = "" | "proprio" | "outro";

/** Props base para seções de formulário */
export interface FormSectionBaseProps {
  validation: ValidationState;
  touched: Set<string>;
  onFieldBlur: (fieldName: string) => void;
  getFieldState: (fieldName: string) => "valid" | "invalid" | "";
  getError: (fieldName: string) => string | undefined;
}

/** Valores iniciais do formulário */
export const INITIAL_BENEFICIARY_DATA: BeneficiaryData = {
  nome: "",
  dataNascimento: "",
  nacionalidade: "",
  estadoCivil: "",
  profissao: "",
  cpf: "",
  rg: "",
};

export const INITIAL_RESPONSIBLE_DATA: ResponsibleData = {
  nome: "",
  nacionalidade: "",
  estadoCivil: "",
  profissao: "",
  cpf: "",
  rg: "",
  parentesco: "",
};

export const INITIAL_ADDRESS_DATA: AddressData = {
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  estado: "",
  cidade: "",
};

export const INITIAL_CONTACT_DATA: ContactData = {
  telefone: "",
  email: "",
};
