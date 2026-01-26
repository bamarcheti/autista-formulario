import {
  ESTADOS_BR,
  ESTADOS_CIVIS,
  fetchAddressByCEP,
  fetchCitiesByState,
  NACIONALIDADES,
} from "@/lib/brazilData";
import {
  capitalizeAddress,
  capitalizeFirstLetter,
  capitalizeName,
  formatCEP,
  formatCPF,
  formatPhone,
  formatRG,
  sanitizeText,
  validateCPF,
  validateEmail,
  validatePhoneBR,
  validateRG,
} from "@/lib/validations";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SuccessScreen } from "./SuccessScreen";

const formStyles = `
/* ===== Form Container ===== */
.bpc-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ===== Section Styles ===== */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: hsl(43, 65%, 51%);
  padding-bottom: 8px;
  border-bottom: 1px solid hsl(220, 26%, 22%);
  margin-bottom: 20px;
}

.section-description {
  font-size: 14px;
  color: hsl(220, 9%, 60%);
  margin-top: -12px;
  margin-bottom: 16px;
}

/* ===== Field Container ===== */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .field-row {
    grid-template-columns: 1fr 1fr;
  }
}

/* ===== Labels ===== */
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: hsl(220, 9%, 60%);
  margin-bottom: 8px;
}

.required-mark {
  color: hsl(0, 84%, 60%);
  margin-left: 4px;
}

/* ===== Inputs ===== */
.form-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid hsl(220, 26%, 22%);
  background-color: hsl(220, 26%, 22%);
  color: hsl(220, 14%, 90%);
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: hsl(220, 9%, 60%);
}

.form-input:focus {
  border-color: hsl(43, 65%, 51%);
}

.form-input.valid {
  border-color: hsl(160, 84%, 39%);
}

.form-input.invalid {
  border-color: hsl(0, 84%, 60%);
}

.form-input.capitalize {
  text-transform: capitalize;
}

.form-input.uppercase {
  text-transform: uppercase;
}

/* ===== Select ===== */
.form-select {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border-radius: 8px;
  border: 2px solid hsl(220, 26%, 22%);
  background-color: hsl(220, 26%, 22%);
  color: hsl(220, 14%, 90%);
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
}

.form-select:focus {
  border-color: hsl(43, 65%, 51%);
}

.form-select.valid {
  border-color: hsl(160, 84%, 39%);
}

.form-select.invalid {
  border-color: hsl(0, 84%, 60%);
}

.form-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-select option {
  background-color: hsl(220, 26%, 22%);
  color: hsl(220, 14%, 90%);
}

/* ===== Error Message ===== */
.error-message {
  color: hsl(0, 84%, 60%);
  font-size: 12px;
  margin-top: 4px;
}

.helper-text {
  color: hsl(220, 9%, 60%);
  font-size: 12px;
  margin-top: 4px;
}

.loading-text {
  color: hsl(43, 65%, 51%);
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== Beneficiary Type Selector ===== */
.type-selector {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .type-selector {
    grid-template-columns: 1fr 1fr;
  }
}

.type-button {
  padding: 16px;
  border-radius: 8px;
  border: 2px solid hsl(220, 26%, 22%);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.type-button:hover {
  border-color: hsla(43, 65%, 51%, 0.5);
}

.type-button.selected {
  border-color: hsl(43, 65%, 51%);
  background-color: hsla(43, 65%, 51%, 0.1);
}

.type-button-title {
  font-weight: 600;
  color: hsl(220, 14%, 90%);
  display: block;
}

.type-button-description {
  font-size: 14px;
  color: hsl(220, 9%, 60%);
  margin-top: 4px;
  display: block;
}

/* ===== Info Box ===== */
.info-box {
  padding: 16px;
  border-radius: 8px;
  background-color: hsla(220, 26%, 22%, 0.5);
  border: 1px solid hsl(220, 26%, 22%);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-box-text {
  font-size: 14px;
  color: hsl(220, 9%, 60%);
}

.info-box-highlight {
  font-weight: 600;
  color: hsl(220, 14%, 90%);
}

.info-box-accent {
  margin-left: 8px;
  color: hsl(43, 65%, 51%);
}

/* ===== Checkbox ===== */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
}

.checkbox-label:hover .checkbox-title {
  color: hsl(43, 65%, 51%);
}

.checkbox-input {
  margin-top: 4px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid hsl(220, 26%, 22%);
  background-color: hsl(220, 26%, 22%);
  cursor: pointer;
  accent-color: hsl(43, 65%, 51%);
}

.checkbox-content {
  display: flex;
  flex-direction: column;
}

.checkbox-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(220, 14%, 90%);
  transition: color 0.3s ease;
}

.checkbox-description {
  font-size: 12px;
  color: hsl(220, 9%, 60%);
  margin-top: 4px;
}

/* ===== Divider ===== */
.section-divider {
  padding-top: 16px;
  border-top: 1px solid hsl(220, 26%, 22%);
}

/* ===== Submit Button ===== */
.submit-button {
  width: 100%;
  padding: 14px 24px;
  background-color: hsl(43, 65%, 51%);
  color: hsl(224, 45%, 8%);
  font-weight: 600;
  font-size: 16px;
  font-family: inherit;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 10px 25px -5px hsla(43, 65%, 51%, 0.4);
  transform: translateY(-2px);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* ===== Spinner ===== */
.spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Autofill Override ===== */
.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus,
.form-input:-webkit-autofill:active,
.form-select:-webkit-autofill,
.form-select:-webkit-autofill:hover,
.form-select:-webkit-autofill:focus,
.form-select:-webkit-autofill:active {
  -webkit-text-fill-color: hsl(220, 14%, 90%) !important;
  -webkit-box-shadow: 0 0 0 1000px hsl(220, 26%, 22%) inset !important;
  box-shadow: 0 0 0 1000px hsl(220, 26%, 22%) inset !important;
  background-color: hsl(220, 26%, 22%) !important;
  border-color: hsl(220, 26%, 22%) !important;
  caret-color: hsl(220, 14%, 90%);
  transition: background-color 9999s ease-out 0s;
}

.form-input:-webkit-autofill:focus,
.form-select:-webkit-autofill:focus {
  border-color: hsl(43, 65%, 51%) !important;
}
`;

interface BeneficiaryData {
  nome: string;
  dataNascimento: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
}

interface ResponsibleData {
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
  parentesco: string;
}

interface AddressData {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
}

interface ContactData {
  telefone: string;
  email: string;
}

interface ProprioFormData {
  nome: string;
  dataNascimento: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
}

interface ValidationState {
  [key: string]: { isValid: boolean; error: string };
}

const initialBeneficiaryData: BeneficiaryData = {
  nome: "",
  dataNascimento: "",
  nacionalidade: "",
  estadoCivil: "",
  profissao: "",
  cpf: "",
  rg: "",
};

const initialResponsibleData: ResponsibleData = {
  nome: "",
  nacionalidade: "",
  estadoCivil: "",
  profissao: "",
  cpf: "",
  rg: "",
  parentesco: "",
};

const initialAddressData: AddressData = {
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  estado: "",
  cidade: "",
};

const initialContactData: ContactData = {
  telefone: "",
  email: "",
};

const PARENTESCO_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "Pai", label: "Pai" },
  { value: "Mãe", label: "Mãe" },
  { value: "Avô", label: "Avô" },
  { value: "Avó", label: "Avó" },
  { value: "Tutor Legal", label: "Tutor Legal" },
  { value: "Curador", label: "Curador" },
  { value: "Outro", label: "Outro" },
];

function calculateAge(birthDate: string): number | null {
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

export function BPCLOASForm() {
  const [tipoBeneficiario, setTipoBeneficiario] = useState<string>("");

  const [proprioData, setProprioData] = useState<ProprioFormData>({
    nome: "",
    dataNascimento: "",
    nacionalidade: "",
    estadoCivil: "",
    profissao: "",
    cpf: "",
    rg: "",
  });

  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData>(
    initialBeneficiaryData,
  );
  const [responsibleData, setResponsibleData] = useState<ResponsibleData>(
    initialResponsibleData,
  );

  const [addressData, setAddressData] =
    useState<AddressData>(initialAddressData);

  const [responsibleAddressData, setResponsibleAddressData] =
    useState<AddressData>(initialAddressData);
  const [sameAddressAsResponsible, setSameAddressAsResponsible] =
    useState(false);

  const [needsAccompaniment, setNeedsAccompaniment] = useState(false);

  const [contactData, setContactData] =
    useState<ContactData>(initialContactData);

  const [validation, setValidation] = useState<ValidationState>({});
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [responsibleCities, setResponsibleCities] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingResponsibleCep, setLoadingResponsibleCep] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingResponsibleCities, setLoadingResponsibleCities] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Inject CSS styles into document
  useEffect(() => {
    const styleId = "bpc-form-styles";
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = formStyles;
      document.head.appendChild(styleElement);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const beneficiaryAge = useMemo(() => {
    if (tipoBeneficiario === "outro") {
      return calculateAge(beneficiaryData.dataNascimento);
    }
    return null;
  }, [tipoBeneficiario, beneficiaryData.dataNascimento]);

  const showResponsibleSection = useMemo(() => {
    if (tipoBeneficiario !== "outro") return false;
    if (beneficiaryAge === null) return false;
    return beneficiaryAge < 18 || needsAccompaniment;
  }, [tipoBeneficiario, beneficiaryAge, needsAccompaniment]);

  const validateField = useCallback(
    (name: string, value: string): { isValid: boolean; error: string } => {
      const baseName = name.replace(
        /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
        "",
      );

      switch (baseName) {
        case "tipoBeneficiario":
          return {
            isValid: value !== "",
            error: value === "" ? "Selecione para quem é o benefício" : "",
          };
        case "nome": {
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
        case "dataNascimento": {
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
        case "profissao": {
          const trimmed = value.trim();
          const isValid = trimmed.length >= 3 && /^[\p{L}\p{N}\s]+$/u.test(trimmed);
          return {
            isValid,
            error: isValid ? "" : trimmed.length < 3 
              ? "Digite pelo menos 3 caracteres" 
              : "Digite apenas letras, números e espaços",
          };
        }
        case "cpf":
          return {
            isValid: validateCPF(value),
            error: validateCPF(value)
              ? ""
              : "CPF inválido. Verifique os números digitados",
          };
        case "rg":
          return {
            isValid: validateRG(value),
            error: validateRG(value) ? "" : "RG inválido",
          };
        case "parentesco":
          return {
            isValid: value.length > 0,
            error: value.length === 0 ? "Selecione o grau de parentesco" : "",
          };
        case "cep":
          return {
            isValid: value.replace(/\D/g, "").length === 8,
            error:
              value.replace(/\D/g, "").length !== 8
                ? "CEP inválido ou não encontrado"
                : "",
          };
        case "endereco":
        case "bairro":
          return {
            isValid: value.length >= 3 && /^[A-Za-zÀ-ÿ0-9\s]+$/.test(value),
            error:
              value.length < 3
                ? "Digite pelo menos 3 caracteres"
                : "Digite um endereço válido",
          };
        case "numero": {
          const n = value.toUpperCase().replace(/\s/g, "");
          const isValid = /^[0-9]+$/.test(n) || n === "S/N" || n === "SN";
          return {
            isValid,
            error: isValid ? "" : "Digite apenas números ou S/N",
          };
        }
        case "complemento":
          return {
            isValid:
              value.length === 0 || /^[A-Za-zÀ-ÿ0-9\s,.\-\/]+$/.test(value),
            error: "",
          };
        case "telefone":
          return {
            isValid: validatePhoneBR(value),
            error: validatePhoneBR(value)
              ? ""
              : "Telefone inválido (DDD + 8/9 dígitos)",
          };
        case "email":
          return {
            isValid: validateEmail(value),
            error: validateEmail(value) ? "" : "E-mail inválido",
          };
        case "nacionalidade":
        case "estadoCivil":
        case "estado":
        case "cidade":
          return {
            isValid: value.length > 0,
            error: value.length === 0 ? "Selecione uma opção" : "",
          };
        default:
          return { isValid: true, error: "" };
      }
    },
    [],
  );

  const updateValidation = useCallback(
    (name: string, value: string) => {
      const result = validateField(name, value);
      setValidation((prev) => ({ ...prev, [name]: result }));
    },
    [validateField],
  );

  const formatValue = (name: string, value: string): string => {
    const baseName = name.replace(
      /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
      "",
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
  };

  const sanitizeValue = (name: string, value: string): string => {
    const baseName = name.replace(
      /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
      "",
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
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    name: string,
    value: string,
    prefix: string,
  ) => {
    const formattedValue = formatValue(name, value);
    setter((prev: any) => ({ ...prev, [name]: formattedValue }));
    const prefixedName = `${prefix}_${name}`;
    if (touched.has(prefixedName)) {
      updateValidation(prefixedName, formattedValue);
    }
  };

  const handleInputBlur = (
    data: any,
    setter: React.Dispatch<React.SetStateAction<any>>,
    name: string,
    prefix: string,
  ) => {
    const prefixedName = `${prefix}_${name}`;
    setTouched((prev) => new Set(prev).add(prefixedName));
    const sanitized = sanitizeValue(name, data[name]);
    setter((prev: any) => ({ ...prev, [name]: sanitized }));
    updateValidation(prefixedName, sanitized);
  };

  const getFieldState = (prefix: string, name: string) => {
    const prefixedName = `${prefix}_${name}`;
    const v = validation[prefixedName];
    if (!touched.has(prefixedName) || !v) return "";
    return v.isValid ? "valid" : "invalid";
  };

  const getError = (prefix: string, name: string) => {
    const prefixedName = `${prefix}_${name}`;
    const v = validation[prefixedName];
    if (!touched.has(prefixedName) || !v) return undefined;
    return v.error;
  };

  // CEP lookup for beneficiary
  useEffect(() => {
    const cep = addressData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    const timeoutId = setTimeout(async () => {
      setLoadingCep(true);
      try {
        const data = await fetchAddressByCEP(cep);
        if (data) {
          const updates: Partial<AddressData> = {};
          if (data.logradouro)
            updates.endereco = capitalizeAddress(data.logradouro);
          if (data.bairro) updates.bairro = capitalizeAddress(data.bairro);
          if (data.uf) updates.estado = data.uf;

          setAddressData((prev) => ({ ...prev, ...updates }));

          if (data.uf) {
            setLoadingCities(true);
            const citiesData = await fetchCitiesByState(data.uf);
            const cityOptions = citiesData.map((c) => ({
              value: c.nome,
              label: c.nome,
            }));
            setCities(cityOptions);
            setLoadingCities(false);

            if (data.localidade) {
              const match = cityOptions.find(
                (c) => c.value.toLowerCase() === data.localidade?.toLowerCase(),
              );
              if (match) {
                setAddressData((prev) => ({ ...prev, cidade: match.value }));
              }
            }
          }

          updateValidation("cep", cep);
          if (data.logradouro) updateValidation("endereco", data.logradouro);
          if (data.bairro) updateValidation("bairro", data.bairro);
          if (data.uf) updateValidation("estado", data.uf);
        }
      } catch {
        console.error("Erro ao buscar CEP");
      }
      setLoadingCep(false);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [addressData.cep, updateValidation]);

  // CEP lookup for responsible
  useEffect(() => {
    if (sameAddressAsResponsible) return;
    const cep = responsibleAddressData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    const timeoutId = setTimeout(async () => {
      setLoadingResponsibleCep(true);
      try {
        const data = await fetchAddressByCEP(cep);
        if (data) {
          const updates: Partial<AddressData> = {};
          if (data.logradouro)
            updates.endereco = capitalizeAddress(data.logradouro);
          if (data.bairro) updates.bairro = capitalizeAddress(data.bairro);
          if (data.uf) updates.estado = data.uf;

          setResponsibleAddressData((prev) => ({ ...prev, ...updates }));

          if (data.uf) {
            setLoadingResponsibleCities(true);
            const citiesData = await fetchCitiesByState(data.uf);
            const cityOptions = citiesData.map((c) => ({
              value: c.nome,
              label: c.nome,
            }));
            setResponsibleCities(cityOptions);
            setLoadingResponsibleCities(false);

            if (data.localidade) {
              const match = cityOptions.find(
                (c) => c.value.toLowerCase() === data.localidade?.toLowerCase(),
              );
              if (match) {
                setResponsibleAddressData((prev) => ({
                  ...prev,
                  cidade: match.value,
                }));
              }
            }
          }

          updateValidation("resp_addr_cep", cep);
          if (data.logradouro)
            updateValidation("resp_addr_endereco", data.logradouro);
          if (data.bairro) updateValidation("resp_addr_bairro", data.bairro);
          if (data.uf) updateValidation("resp_addr_estado", data.uf);
        }
      } catch {
        console.error("Erro ao buscar CEP do responsável");
      }
      setLoadingResponsibleCep(false);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [responsibleAddressData.cep, sameAddressAsResponsible, updateValidation]);

  // Load cities when beneficiary state changes
  useEffect(() => {
    if (!addressData.estado) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await fetchCitiesByState(addressData.estado);
        setCities(citiesData.map((c) => ({ value: c.nome, label: c.nome })));
      } catch {
        console.error("Erro ao carregar cidades");
      }
      setLoadingCities(false);
    };

    loadCities();
  }, [addressData.estado]);

  // Load cities when responsible state changes
  useEffect(() => {
    if (!responsibleAddressData.estado || sameAddressAsResponsible) {
      setResponsibleCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingResponsibleCities(true);
      try {
        const citiesData = await fetchCitiesByState(
          responsibleAddressData.estado,
        );
        setResponsibleCities(
          citiesData.map((c) => ({ value: c.nome, label: c.nome })),
        );
      } catch {
        console.error("Erro ao carregar cidades");
      }
      setLoadingResponsibleCities(false);
    };

    loadCities();
  }, [responsibleAddressData.estado, sameAddressAsResponsible]);

  const isFormValid = useCallback(() => {
    if (!tipoBeneficiario) return false;

    const addressFields: (keyof AddressData)[] = [
      "cep",
      "endereco",
      "numero",
      "bairro",
      "estado",
      "cidade",
    ];
    const addressValid = addressFields.every((field) => {
      const result = validateField(field, addressData[field]);
      return result.isValid;
    });

    const contactFields: (keyof ContactData)[] = ["telefone", "email"];
    const contactValid = contactFields.every((field) => {
      const result = validateField(field, contactData[field]);
      return result.isValid;
    });

    if (!addressValid || !contactValid) return false;

    if (tipoBeneficiario === "proprio") {
      const proprioFields: (keyof ProprioFormData)[] = [
        "nome",
        "dataNascimento",
        "nacionalidade",
        "estadoCivil",
        "profissao",
        "cpf",
      ];
      return proprioFields.every((field) => {
        const result = validateField(`proprio_${field}`, proprioData[field]);
        return result.isValid;
      });
    } else {
      const beneficiaryFields: (keyof BeneficiaryData)[] = [
        "nome",
        "dataNascimento",
        "nacionalidade",
        "estadoCivil",
        "profissao",
        "cpf",
      ];
      const beneficiaryValid = beneficiaryFields.every((field) => {
        const result = validateField(
          `beneficiario_${field}`,
          beneficiaryData[field],
        );
        return result.isValid;
      });

      if (!beneficiaryValid) return false;

      if (showResponsibleSection) {
        const responsibleFields: (keyof ResponsibleData)[] = [
          "nome",
          "nacionalidade",
          "estadoCivil",
          "profissao",
          "cpf",
          "parentesco",
        ];
        const responsibleValid = responsibleFields.every((field) => {
          const result = validateField(
            `responsavel_${field}`,
            responsibleData[field],
          );
          return result.isValid;
        });

        if (!responsibleValid) return false;

        if (!sameAddressAsResponsible) {
          const respAddrValid = addressFields.every((field) => {
            const result = validateField(
              `resp_addr_${field}`,
              responsibleAddressData[field],
            );
            return result.isValid;
          });
          if (!respAddrValid) return false;
        }
      }

      return true;
    }
  }, [
    tipoBeneficiario,
    proprioData,
    beneficiaryData,
    responsibleData,
    addressData,
    responsibleAddressData,
    contactData,
    showResponsibleSection,
    sameAddressAsResponsible,
    validateField,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      tipo_caso: "bpc_loas_autismo",
      tipo_beneficiario: tipoBeneficiario,
      dataEnvio: new Date().toISOString(),

      telefone: contactData.telefone.replace(/\D/g, ""),
      email: contactData.email.trim().toLowerCase(),
    };

    if (tipoBeneficiario === "proprio") {
      payload.nome = sanitizeText(proprioData.nome);
      payload.data_nascimento = proprioData.dataNascimento;
      payload.nacionalidade = proprioData.nacionalidade;
      payload.estadoCivil = proprioData.estadoCivil;
      payload.profissao = sanitizeText(proprioData.profissao);
      payload.cpf = proprioData.cpf.replace(/\D/g, "");
      payload.rg = proprioData.rg.trim();
      payload.rg_normalizado = proprioData.rg
        .toUpperCase()
        .replace(/[^\dX]/g, "");

      payload.cep = addressData.cep.replace(/\D/g, "");
      payload.endereco = sanitizeText(addressData.endereco);
      payload.numero = addressData.numero
        .trim()
        .toUpperCase()
        .replace(/\s/g, "");
      payload.complemento = sanitizeText(addressData.complemento);
      payload.bairro = sanitizeText(addressData.bairro);
      payload.cidade = addressData.cidade;
      payload.estado = addressData.estado;
    } else {
      payload.beneficiario = {
        nome: sanitizeText(beneficiaryData.nome),
        data_nascimento: beneficiaryData.dataNascimento,
        idade: beneficiaryAge,
        nacionalidade: beneficiaryData.nacionalidade,
        estadoCivil: beneficiaryData.estadoCivil,
        profissao: sanitizeText(beneficiaryData.profissao),
        cpf: beneficiaryData.cpf.replace(/\D/g, ""),
        rg: beneficiaryData.rg.trim(),
        rg_normalizado: beneficiaryData.rg.toUpperCase().replace(/[^\dX]/g, ""),
        necessita_acompanhamento: needsAccompaniment,
        endereco: {
          cep: addressData.cep.replace(/\D/g, ""),
          logradouro: sanitizeText(addressData.endereco),
          numero: addressData.numero.trim().toUpperCase().replace(/\s/g, ""),
          complemento: sanitizeText(addressData.complemento),
          bairro: sanitizeText(addressData.bairro),
          cidade: addressData.cidade,
          estado: addressData.estado,
        },
      };

      if (showResponsibleSection) {
        const respAddr = sameAddressAsResponsible
          ? addressData
          : responsibleAddressData;
        payload.responsavel = {
          parentesco: responsibleData.parentesco,
          nome: sanitizeText(responsibleData.nome),
          nacionalidade: responsibleData.nacionalidade,
          estadoCivil: responsibleData.estadoCivil,
          profissao: sanitizeText(responsibleData.profissao),
          cpf: responsibleData.cpf.replace(/\D/g, ""),
          rg: responsibleData.rg.trim(),
          rg_normalizado: responsibleData.rg
            .toUpperCase()
            .replace(/[^\dX]/g, ""),
          mesmo_endereco_beneficiario: sameAddressAsResponsible,
          endereco: {
            cep: respAddr.cep.replace(/\D/g, ""),
            logradouro: sanitizeText(respAddr.endereco),
            numero: respAddr.numero.trim().toUpperCase().replace(/\s/g, ""),
            complemento: sanitizeText(respAddr.complemento),
            bairro: sanitizeText(respAddr.bairro),
            cidade: respAddr.cidade,
            estado: respAddr.estado,
          },
        };
      }
    }

    try {
      const response = await fetch(
        "https://whatsapp-n8n-webhook.movr0n.easypanel.host/webhook/processar-assinatura",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error("Erro ao processar solicitação.");
      }
    } catch (err) {
      console.error("Erro:", err);
      let msg = "Erro ao enviar formulário.";
      if (!navigator.onLine) {
        msg =
          "Sem conexão com a internet. Verifique sua conexão e tente novamente.";
      }
      alert(msg);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return <SuccessScreen />;
  }

  const getInputClass = (state: string, extra?: string) => {
    let cls = "form-input";
    if (state === "valid") cls += " valid";
    if (state === "invalid") cls += " invalid";
    if (extra) cls += ` ${extra}`;
    return cls;
  };

  const getSelectClass = (state: string) => {
    let cls = "form-select";
    if (state === "valid") cls += " valid";
    if (state === "invalid") cls += " invalid";
    return cls;
  };

  return (
    <form onSubmit={handleSubmit} className="bpc-form">
      {/* Beneficiary Type Selection */}
      <div className="field">
        <label className="form-label">
          Para quem é o benefício?<span className="required-mark">*</span>
        </label>
        <div className="type-selector">
          <button
            type="button"
            onClick={() => {
              setTipoBeneficiario("proprio");
              setBeneficiaryData(initialBeneficiaryData);
              setResponsibleData(initialResponsibleData);
              setNeedsAccompaniment(false);
            }}
            className={`type-button ${tipoBeneficiario === "proprio" ? "selected" : ""}`}
          >
            <span className="type-button-title">Para mim mesmo</span>
            <span className="type-button-description">Eu sou o beneficiário</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTipoBeneficiario("outro");
              setProprioData({
                nome: "",
                dataNascimento: "",
                nacionalidade: "",
                estadoCivil: "",
                profissao: "",
                cpf: "",
                rg: "",
              });
            }}
            className={`type-button ${tipoBeneficiario === "outro" ? "selected" : ""}`}
          >
            <span className="type-button-title">Para outra pessoa</span>
            <span className="type-button-description">Sou responsável pelo beneficiário</span>
          </button>
        </div>
      </div>

      {/* "Para mim mesmo" - Own Data */}
      {tipoBeneficiario === "proprio" && (
        <div className="form-section">
          <h3 className="section-title">Seus Dados</h3>

          <div className="field-group">
            <div className="field">
              <label className="form-label">
                Nome Completo<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={proprioData.nome}
                onChange={(e) =>
                  handleInputChange(
                    setProprioData,
                    "nome",
                    e.target.value,
                    "proprio",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    proprioData,
                    setProprioData,
                    "nome",
                    "proprio",
                  )
                }
                placeholder="Digite seu nome completo"
                maxLength={100}
                className={getInputClass(getFieldState("proprio", "nome"), "capitalize")}
              />
              {getError("proprio", "nome") && (
                <p className="error-message">{getError("proprio", "nome")}</p>
              )}
            </div>

            <div className="field">
              <label className="form-label">
                Data de Nascimento<span className="required-mark">*</span>
              </label>
              <input
                type="date"
                value={proprioData.dataNascimento}
                onChange={(e) =>
                  handleInputChange(
                    setProprioData,
                    "dataNascimento",
                    e.target.value,
                    "proprio",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    proprioData,
                    setProprioData,
                    "dataNascimento",
                    "proprio",
                  )
                }
                max={new Date().toISOString().split("T")[0]}
                className={getInputClass(getFieldState("proprio", "dataNascimento"))}
              />
              {getError("proprio", "dataNascimento") && (
                <p className="error-message">{getError("proprio", "dataNascimento")}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  Nacionalidade<span className="required-mark">*</span>
                </label>
                <select
                  value={proprioData.nacionalidade}
                  onChange={(e) => {
                    handleInputChange(
                      setProprioData,
                      "nacionalidade",
                      e.target.value,
                      "proprio",
                    );
                    setTouched((prev) =>
                      new Set(prev).add("proprio_nacionalidade"),
                    );
                    updateValidation("proprio_nacionalidade", e.target.value);
                  }}
                  className={getSelectClass(getFieldState("proprio", "nacionalidade"))}
                >
                  {NACIONALIDADES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("proprio", "nacionalidade") && (
                  <p className="error-message">{getError("proprio", "nacionalidade")}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">
                  Estado Civil<span className="required-mark">*</span>
                </label>
                <select
                  value={proprioData.estadoCivil}
                  onChange={(e) => {
                    handleInputChange(
                      setProprioData,
                      "estadoCivil",
                      e.target.value,
                      "proprio",
                    );
                    setTouched((prev) =>
                      new Set(prev).add("proprio_estadoCivil"),
                    );
                    updateValidation("proprio_estadoCivil", e.target.value);
                  }}
                  className={getSelectClass(getFieldState("proprio", "estadoCivil"))}
                >
                  {ESTADOS_CIVIS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("proprio", "estadoCivil") && (
                  <p className="error-message">{getError("proprio", "estadoCivil")}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label className="form-label">
                Profissão<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={proprioData.profissao}
                onChange={(e) =>
                  handleInputChange(
                    setProprioData,
                    "profissao",
                    e.target.value,
                    "proprio",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    proprioData,
                    setProprioData,
                    "profissao",
                    "proprio",
                  )
                }
                placeholder="Digite sua profissão"
                maxLength={80}
                className={getInputClass(getFieldState("proprio", "profissao"), "capitalize")}
              />
              {getError("proprio", "profissao") && (
                <p className="error-message">{getError("proprio", "profissao")}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  CPF<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={proprioData.cpf}
                  onChange={(e) =>
                    handleInputChange(
                      setProprioData,
                      "cpf",
                      e.target.value,
                      "proprio",
                    )
                  }
                  onBlur={() =>
                    handleInputBlur(
                      proprioData,
                      setProprioData,
                      "cpf",
                      "proprio",
                    )
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                  className={getInputClass(getFieldState("proprio", "cpf"))}
                />
                {getError("proprio", "cpf") && (
                  <p className="error-message">{getError("proprio", "cpf")}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">RG</label>
                <input
                  type="text"
                  value={proprioData.rg}
                  onChange={(e) =>
                    handleInputChange(
                      setProprioData,
                      "rg",
                      e.target.value,
                      "proprio",
                    )
                  }
                  onBlur={() =>
                    handleInputBlur(
                      proprioData,
                      setProprioData,
                      "rg",
                      "proprio",
                    )
                  }
                  placeholder="Ex: 12.345.678-9"
                  maxLength={26}
                  className={getInputClass(getFieldState("proprio", "rg"), "uppercase")}
                />
                {getError("proprio", "rg") && (
                  <p className="error-message">{getError("proprio", "rg")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Para outra pessoa" - Beneficiary Data */}
      {tipoBeneficiario === "outro" && (
        <div className="form-section">
          <h3 className="section-title">Dados do Beneficiário</h3>

          <div className="field-group">
            <div className="field">
              <label className="form-label">
                Nome Completo do Beneficiário<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={beneficiaryData.nome}
                onChange={(e) =>
                  handleInputChange(
                    setBeneficiaryData,
                    "nome",
                    e.target.value,
                    "beneficiario",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    beneficiaryData,
                    setBeneficiaryData,
                    "nome",
                    "beneficiario",
                  )
                }
                placeholder="Digite o nome completo do beneficiário"
                maxLength={100}
                className={getInputClass(getFieldState("beneficiario", "nome"), "capitalize")}
              />
              {getError("beneficiario", "nome") && (
                <p className="error-message">{getError("beneficiario", "nome")}</p>
              )}
            </div>

            <div className="field">
              <label className="form-label">
                Data de Nascimento<span className="required-mark">*</span>
              </label>
              <input
                type="date"
                value={beneficiaryData.dataNascimento}
                onChange={(e) =>
                  handleInputChange(
                    setBeneficiaryData,
                    "dataNascimento",
                    e.target.value,
                    "beneficiario",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    beneficiaryData,
                    setBeneficiaryData,
                    "dataNascimento",
                    "beneficiario",
                  )
                }
                max={new Date().toISOString().split("T")[0]}
                className={getInputClass(getFieldState("beneficiario", "dataNascimento"))}
              />
              {getError("beneficiario", "dataNascimento") && (
                <p className="error-message">{getError("beneficiario", "dataNascimento")}</p>
              )}
            </div>

            {/* Show age and accompaniment option */}
            {beneficiaryAge !== null && (
              <div className="info-box">
                <p className="info-box-text">
                  Idade do beneficiário:{" "}
                  <span className="info-box-highlight">{beneficiaryAge} anos</span>
                  {beneficiaryAge < 18 && (
                    <span className="info-box-accent">
                      • Será necessário informar o responsável legal
                    </span>
                  )}
                </p>

                {beneficiaryAge >= 18 && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={needsAccompaniment}
                      onChange={(e) => setNeedsAccompaniment(e.target.checked)}
                      className="checkbox-input"
                    />
                    <div className="checkbox-content">
                      <span className="checkbox-title">
                        O beneficiário necessita de acompanhamento constante
                      </span>
                      <p className="checkbox-description">
                        Marque esta opção se o beneficiário, mesmo sendo maior
                        de idade, precisa de um responsável legal ou curador
                      </p>
                    </div>
                  </label>
                )}
              </div>
            )}

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  Nacionalidade<span className="required-mark">*</span>
                </label>
                <select
                  value={beneficiaryData.nacionalidade}
                  onChange={(e) => {
                    handleInputChange(
                      setBeneficiaryData,
                      "nacionalidade",
                      e.target.value,
                      "beneficiario",
                    );
                    setTouched((prev) =>
                      new Set(prev).add("beneficiario_nacionalidade"),
                    );
                    updateValidation(
                      "beneficiario_nacionalidade",
                      e.target.value,
                    );
                  }}
                  className={getSelectClass(getFieldState("beneficiario", "nacionalidade"))}
                >
                  {NACIONALIDADES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("beneficiario", "nacionalidade") && (
                  <p className="error-message">{getError("beneficiario", "nacionalidade")}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">
                  Estado Civil<span className="required-mark">*</span>
                </label>
                <select
                  value={beneficiaryData.estadoCivil}
                  onChange={(e) => {
                    handleInputChange(
                      setBeneficiaryData,
                      "estadoCivil",
                      e.target.value,
                      "beneficiario",
                    );
                    setTouched((prev) =>
                      new Set(prev).add("beneficiario_estadoCivil"),
                    );
                    updateValidation(
                      "beneficiario_estadoCivil",
                      e.target.value,
                    );
                  }}
                  className={getSelectClass(getFieldState("beneficiario", "estadoCivil"))}
                >
                  {ESTADOS_CIVIS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("beneficiario", "estadoCivil") && (
                  <p className="error-message">{getError("beneficiario", "estadoCivil")}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label className="form-label">
                Profissão<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={beneficiaryData.profissao}
                onChange={(e) =>
                  handleInputChange(
                    setBeneficiaryData,
                    "profissao",
                    e.target.value,
                    "beneficiario",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    beneficiaryData,
                    setBeneficiaryData,
                    "profissao",
                    "beneficiario",
                  )
                }
                placeholder="Digite a profissão"
                maxLength={80}
                className={getInputClass(getFieldState("beneficiario", "profissao"), "capitalize")}
              />
              {getError("beneficiario", "profissao") && (
                <p className="error-message">{getError("beneficiario", "profissao")}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  CPF<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={beneficiaryData.cpf}
                  onChange={(e) =>
                    handleInputChange(
                      setBeneficiaryData,
                      "cpf",
                      e.target.value,
                      "beneficiario",
                    )
                  }
                  onBlur={() =>
                    handleInputBlur(
                      beneficiaryData,
                      setBeneficiaryData,
                      "cpf",
                      "beneficiario",
                    )
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                  className={getInputClass(getFieldState("beneficiario", "cpf"))}
                />
                {getError("beneficiario", "cpf") && (
                  <p className="error-message">{getError("beneficiario", "cpf")}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">RG</label>
                <input
                  type="text"
                  value={beneficiaryData.rg}
                  onChange={(e) =>
                    handleInputChange(
                      setBeneficiaryData,
                      "rg",
                      e.target.value,
                      "beneficiario",
                    )
                  }
                  onBlur={() =>
                    handleInputBlur(
                      beneficiaryData,
                      setBeneficiaryData,
                      "rg",
                      "beneficiario",
                    )
                  }
                  placeholder="Ex: 12.345.678-9"
                  maxLength={26}
                  className={getInputClass(getFieldState("beneficiario", "rg"), "uppercase")}
                />
                {getError("beneficiario", "rg") && (
                  <p className="error-message">{getError("beneficiario", "rg")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Address Section */}
      {tipoBeneficiario && (
        <div className="form-section">
          <h3 className="section-title">
            {tipoBeneficiario === "proprio"
              ? "Endereço"
              : "Endereço do Beneficiário"}
          </h3>

          <div className="field-group">
            <div className="field">
              <label className="form-label">
                CEP<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={addressData.cep}
                onChange={(e) => {
                  const formatted = formatCEP(e.target.value);
                  setAddressData((prev) => ({ ...prev, cep: formatted }));
                  if (touched.has("cep")) updateValidation("cep", formatted);
                }}
                onBlur={() => {
                  setTouched((prev) => new Set(prev).add("cep"));
                  updateValidation("cep", addressData.cep);
                }}
                placeholder="00000-000"
                maxLength={9}
                inputMode="numeric"
                className={getInputClass(
                  touched.has("cep") && validation.cep
                    ? validation.cep.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                )}
              />
              <p className="helper-text">O endereço será preenchido automaticamente</p>
              {loadingCep && (
                <p className="loading-text">
                  <Loader2 className="spinner" />
                  Buscando endereço...
                </p>
              )}
              {touched.has("cep") && validation.cep?.error && (
                <p className="error-message">{validation.cep.error}</p>
              )}
            </div>

            <div className="field">
              <label className="form-label">
                Logradouro<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={addressData.endereco}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    endereco: e.target.value,
                  }));
                  if (touched.has("endereco"))
                    updateValidation("endereco", e.target.value);
                }}
                onBlur={() => {
                  setTouched((prev) => new Set(prev).add("endereco"));
                  const sanitized = capitalizeAddress(
                    sanitizeText(addressData.endereco),
                  );
                  setAddressData((prev) => ({ ...prev, endereco: sanitized }));
                  updateValidation("endereco", sanitized);
                }}
                placeholder="Rua, Avenida, etc."
                maxLength={150}
                className={getInputClass(
                  touched.has("endereco") && validation.endereco
                    ? validation.endereco.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                  "capitalize",
                )}
              />
              {touched.has("endereco") && validation.endereco?.error && (
                <p className="error-message">{validation.endereco.error}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  Número<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={addressData.numero}
                  onChange={(e) => {
                    const formatted = e.target.value
                      .toUpperCase()
                      .replace(/[^0-9SN\/]/g, "");
                    setAddressData((prev) => ({ ...prev, numero: formatted }));
                    if (touched.has("numero"))
                      updateValidation("numero", formatted);
                  }}
                  onBlur={() => {
                    setTouched((prev) => new Set(prev).add("numero"));
                    updateValidation("numero", addressData.numero);
                  }}
                  placeholder="Nº ou S/N"
                  maxLength={10}
                  className={getInputClass(
                    touched.has("numero") && validation.numero
                      ? validation.numero.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                  )}
                />
                {touched.has("numero") && validation.numero?.error && (
                  <p className="error-message">{validation.numero.error}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">Complemento</label>
                <input
                  type="text"
                  value={addressData.complemento}
                  onChange={(e) =>
                    setAddressData((prev) => ({
                      ...prev,
                      complemento: e.target.value,
                    }))
                  }
                  onBlur={() => {
                    const sanitized = sanitizeText(addressData.complemento);
                    setAddressData((prev) => ({
                      ...prev,
                      complemento: sanitized,
                    }));
                  }}
                  placeholder="Apto, Bloco, etc."
                  maxLength={50}
                  className={getInputClass("", "capitalize")}
                />
              </div>
            </div>

            <div className="field">
              <label className="form-label">
                Bairro<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={addressData.bairro}
                onChange={(e) => {
                  setAddressData((prev) => ({
                    ...prev,
                    bairro: e.target.value,
                  }));
                  if (touched.has("bairro"))
                    updateValidation("bairro", e.target.value);
                }}
                onBlur={() => {
                  setTouched((prev) => new Set(prev).add("bairro"));
                  const sanitized = capitalizeAddress(
                    sanitizeText(addressData.bairro),
                  );
                  setAddressData((prev) => ({ ...prev, bairro: sanitized }));
                  updateValidation("bairro", sanitized);
                }}
                placeholder="Digite o bairro"
                maxLength={80}
                className={getInputClass(
                  touched.has("bairro") && validation.bairro
                    ? validation.bairro.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                  "capitalize",
                )}
              />
              {touched.has("bairro") && validation.bairro?.error && (
                <p className="error-message">{validation.bairro.error}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  Estado<span className="required-mark">*</span>
                </label>
                <select
                  value={addressData.estado}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      estado: e.target.value,
                      cidade: "",
                    }));
                    setTouched((prev) => new Set(prev).add("estado"));
                    updateValidation("estado", e.target.value);
                  }}
                  className={getSelectClass(
                    touched.has("estado") && validation.estado
                      ? validation.estado.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                  )}
                >
                  {ESTADOS_BR.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {touched.has("estado") && validation.estado?.error && (
                  <p className="error-message">{validation.estado.error}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">
                  Cidade<span className="required-mark">*</span>
                </label>
                <select
                  value={addressData.cidade}
                  onChange={(e) => {
                    setAddressData((prev) => ({
                      ...prev,
                      cidade: e.target.value,
                    }));
                    setTouched((prev) => new Set(prev).add("cidade"));
                    updateValidation("cidade", e.target.value);
                  }}
                  disabled={!addressData.estado || loadingCities}
                  className={getSelectClass(
                    touched.has("cidade") && validation.cidade
                      ? validation.cidade.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                  )}
                >
                  <option value="">
                    {loadingCities
                      ? "Carregando..."
                      : addressData.estado
                        ? "Selecione a cidade"
                        : "Selecione o estado primeiro"}
                  </option>
                  {cities.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {touched.has("cidade") && validation.cidade?.error && (
                  <p className="error-message">{validation.cidade.error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsible Section */}
      {showResponsibleSection && (
        <div className="form-section">
          <h3 className="section-title">Dados do Responsável Legal</h3>

          <p className="section-description">
            {beneficiaryAge !== null && beneficiaryAge < 18
              ? "Como o beneficiário é menor de 18 anos, precisamos dos dados do responsável legal."
              : "Como o beneficiário necessita de acompanhamento constante, precisamos dos dados do responsável legal ou curador."}
          </p>

          <div className="field-group">
            <div className="field">
              <label className="form-label">
                Grau de Parentesco<span className="required-mark">*</span>
              </label>
              <select
                value={responsibleData.parentesco}
                onChange={(e) => {
                  handleInputChange(
                    setResponsibleData,
                    "parentesco",
                    e.target.value,
                    "responsavel",
                  );
                  setTouched((prev) =>
                    new Set(prev).add("responsavel_parentesco"),
                  );
                  updateValidation("responsavel_parentesco", e.target.value);
                }}
                className={getSelectClass(getFieldState("responsavel", "parentesco"))}
              >
                {PARENTESCO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {getError("responsavel", "parentesco") && (
                <p className="error-message">{getError("responsavel", "parentesco")}</p>
              )}
            </div>

            <div className="field">
              <label className="form-label">
                Nome Completo do Responsável<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={responsibleData.nome}
                onChange={(e) =>
                  handleInputChange(
                    setResponsibleData,
                    "nome",
                    e.target.value,
                    "responsavel",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    responsibleData,
                    setResponsibleData,
                    "nome",
                    "responsavel",
                  )
                }
                placeholder="Digite o nome completo do responsável"
                maxLength={100}
                className={getInputClass(getFieldState("responsavel", "nome"), "capitalize")}
              />
              {getError("responsavel", "nome") && (
                <p className="error-message">{getError("responsavel", "nome")}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  Nacionalidade<span className="required-mark">*</span>
                </label>
                <select
                  value={responsibleData.nacionalidade}
                  onChange={(e) => {
                    handleInputChange(
                      setResponsibleData,
                      "nacionalidade",
                      e.target.value,
                      "responsavel",
                    );
                    setTouched((prev) =>
                      new Set(prev).add("responsavel_nacionalidade"),
                    );
                    updateValidation(
                      "responsavel_nacionalidade",
                      e.target.value,
                    );
                  }}
                  className={getSelectClass(getFieldState("responsavel", "nacionalidade"))}
                >
                  {NACIONALIDADES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("responsavel", "nacionalidade") && (
                  <p className="error-message">{getError("responsavel", "nacionalidade")}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">
                  Estado Civil<span className="required-mark">*</span>
                </label>
                <select
                  value={responsibleData.estadoCivil}
                  onChange={(e) => {
                    handleInputChange(
                      setResponsibleData,
                      "estadoCivil",
                      e.target.value,
                      "responsavel",
                    );
                    setTouched((prev) =>
                      new Set(prev).add("responsavel_estadoCivil"),
                    );
                    updateValidation("responsavel_estadoCivil", e.target.value);
                  }}
                  className={getSelectClass(getFieldState("responsavel", "estadoCivil"))}
                >
                  {ESTADOS_CIVIS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("responsavel", "estadoCivil") && (
                  <p className="error-message">{getError("responsavel", "estadoCivil")}</p>
                )}
              </div>
            </div>

            <div className="field">
              <label className="form-label">
                Profissão<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={responsibleData.profissao}
                onChange={(e) =>
                  handleInputChange(
                    setResponsibleData,
                    "profissao",
                    e.target.value,
                    "responsavel",
                  )
                }
                onBlur={() =>
                  handleInputBlur(
                    responsibleData,
                    setResponsibleData,
                    "profissao",
                    "responsavel",
                  )
                }
                placeholder="Digite a profissão"
                maxLength={80}
                className={getInputClass(getFieldState("responsavel", "profissao"), "capitalize")}
              />
              {getError("responsavel", "profissao") && (
                <p className="error-message">{getError("responsavel", "profissao")}</p>
              )}
            </div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  CPF<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={responsibleData.cpf}
                  onChange={(e) =>
                    handleInputChange(
                      setResponsibleData,
                      "cpf",
                      e.target.value,
                      "responsavel",
                    )
                  }
                  onBlur={() =>
                    handleInputBlur(
                      responsibleData,
                      setResponsibleData,
                      "cpf",
                      "responsavel",
                    )
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                  className={getInputClass(getFieldState("responsavel", "cpf"))}
                />
                {getError("responsavel", "cpf") && (
                  <p className="error-message">{getError("responsavel", "cpf")}</p>
                )}
              </div>

              <div className="field">
                <label className="form-label">RG</label>
                <input
                  type="text"
                  value={responsibleData.rg}
                  onChange={(e) =>
                    handleInputChange(
                      setResponsibleData,
                      "rg",
                      e.target.value,
                      "responsavel",
                    )
                  }
                  onBlur={() =>
                    handleInputBlur(
                      responsibleData,
                      setResponsibleData,
                      "rg",
                      "responsavel",
                    )
                  }
                  placeholder="Ex: 12.345.678-9"
                  maxLength={26}
                  className={getInputClass(getFieldState("responsavel", "rg"), "uppercase")}
                />
                {getError("responsavel", "rg") && (
                  <p className="error-message">{getError("responsavel", "rg")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Same Address Checkbox */}
          <div className="section-divider">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={sameAddressAsResponsible}
                onChange={(e) => {
                  setSameAddressAsResponsible(e.target.checked);
                  if (e.target.checked) {
                    setResponsibleAddressData(initialAddressData);
                  }
                }}
                className="checkbox-input"
              />
              <div className="checkbox-content">
                <span className="checkbox-title">
                  O endereço do responsável é o mesmo do beneficiário
                </span>
                <p className="checkbox-description">
                  Marque esta opção se o responsável reside no mesmo endereço
                </p>
              </div>
            </label>
          </div>

          {/* Responsible Address Section */}
          {!sameAddressAsResponsible && (
            <div className="field-group">
              <h4 className="section-title">Endereço do Responsável</h4>

              <div className="field">
                <label className="form-label">
                  CEP<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={responsibleAddressData.cep}
                  onChange={(e) => {
                    const formatted = formatCEP(e.target.value);
                    setResponsibleAddressData((prev) => ({
                      ...prev,
                      cep: formatted,
                    }));
                    if (touched.has("resp_addr_cep"))
                      updateValidation("resp_addr_cep", formatted);
                  }}
                  onBlur={() => {
                    setTouched((prev) => new Set(prev).add("resp_addr_cep"));
                    updateValidation("resp_addr_cep", responsibleAddressData.cep);
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  inputMode="numeric"
                  className={getInputClass(
                    touched.has("resp_addr_cep") && validation.resp_addr_cep
                      ? validation.resp_addr_cep.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                  )}
                />
                <p className="helper-text">O endereço será preenchido automaticamente</p>
                {loadingResponsibleCep && (
                  <p className="loading-text">
                    <Loader2 className="spinner" />
                    Buscando endereço...
                  </p>
                )}
                {touched.has("resp_addr_cep") &&
                  validation.resp_addr_cep?.error && (
                    <p className="error-message">{validation.resp_addr_cep.error}</p>
                  )}
              </div>

              <div className="field">
                <label className="form-label">
                  Logradouro<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={responsibleAddressData.endereco}
                  onChange={(e) => {
                    setResponsibleAddressData((prev) => ({
                      ...prev,
                      endereco: e.target.value,
                    }));
                    if (touched.has("resp_addr_endereco"))
                      updateValidation("resp_addr_endereco", e.target.value);
                  }}
                  onBlur={() => {
                    setTouched((prev) =>
                      new Set(prev).add("resp_addr_endereco"),
                    );
                    const sanitized = capitalizeAddress(
                      sanitizeText(responsibleAddressData.endereco),
                    );
                    setResponsibleAddressData((prev) => ({
                      ...prev,
                      endereco: sanitized,
                    }));
                    updateValidation("resp_addr_endereco", sanitized);
                  }}
                  placeholder="Rua, Avenida, etc."
                  maxLength={150}
                  className={getInputClass(
                    touched.has("resp_addr_endereco") && validation.resp_addr_endereco
                      ? validation.resp_addr_endereco.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                    "capitalize",
                  )}
                />
                {touched.has("resp_addr_endereco") &&
                  validation.resp_addr_endereco?.error && (
                    <p className="error-message">{validation.resp_addr_endereco.error}</p>
                  )}
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="form-label">
                    Número<span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    value={responsibleAddressData.numero}
                    onChange={(e) => {
                      const formatted = e.target.value
                        .toUpperCase()
                        .replace(/[^0-9SN\/]/g, "");
                      setResponsibleAddressData((prev) => ({
                        ...prev,
                        numero: formatted,
                      }));
                      if (touched.has("resp_addr_numero"))
                        updateValidation("resp_addr_numero", formatted);
                    }}
                    onBlur={() => {
                      setTouched((prev) =>
                        new Set(prev).add("resp_addr_numero"),
                      );
                      updateValidation(
                        "resp_addr_numero",
                        responsibleAddressData.numero,
                      );
                    }}
                    placeholder="Nº ou S/N"
                    maxLength={10}
                    className={getInputClass(
                      touched.has("resp_addr_numero") && validation.resp_addr_numero
                        ? validation.resp_addr_numero.isValid
                          ? "valid"
                          : "invalid"
                        : "",
                    )}
                  />
                  {touched.has("resp_addr_numero") &&
                    validation.resp_addr_numero?.error && (
                      <p className="error-message">{validation.resp_addr_numero.error}</p>
                    )}
                </div>

                <div className="field">
                  <label className="form-label">Complemento</label>
                  <input
                    type="text"
                    value={responsibleAddressData.complemento}
                    onChange={(e) =>
                      setResponsibleAddressData((prev) => ({
                        ...prev,
                        complemento: e.target.value,
                      }))
                    }
                    onBlur={() => {
                      const sanitized = sanitizeText(
                        responsibleAddressData.complemento,
                      );
                      setResponsibleAddressData((prev) => ({
                        ...prev,
                        complemento: sanitized,
                      }));
                    }}
                    placeholder="Apto, Bloco, etc."
                    maxLength={50}
                    className={getInputClass("", "capitalize")}
                  />
                </div>
              </div>

              <div className="field">
                <label className="form-label">
                  Bairro<span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  value={responsibleAddressData.bairro}
                  onChange={(e) => {
                    setResponsibleAddressData((prev) => ({
                      ...prev,
                      bairro: e.target.value,
                    }));
                    if (touched.has("resp_addr_bairro"))
                      updateValidation("resp_addr_bairro", e.target.value);
                  }}
                  onBlur={() => {
                    setTouched((prev) => new Set(prev).add("resp_addr_bairro"));
                    const sanitized = capitalizeAddress(
                      sanitizeText(responsibleAddressData.bairro),
                    );
                    setResponsibleAddressData((prev) => ({
                      ...prev,
                      bairro: sanitized,
                    }));
                    updateValidation("resp_addr_bairro", sanitized);
                  }}
                  placeholder="Digite o bairro"
                  maxLength={80}
                  className={getInputClass(
                    touched.has("resp_addr_bairro") && validation.resp_addr_bairro
                      ? validation.resp_addr_bairro.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                    "capitalize",
                  )}
                />
                {touched.has("resp_addr_bairro") &&
                  validation.resp_addr_bairro?.error && (
                    <p className="error-message">{validation.resp_addr_bairro.error}</p>
                  )}
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="form-label">
                    Estado<span className="required-mark">*</span>
                  </label>
                  <select
                    value={responsibleAddressData.estado}
                    onChange={(e) => {
                      setResponsibleAddressData((prev) => ({
                        ...prev,
                        estado: e.target.value,
                        cidade: "",
                      }));
                      setTouched((prev) =>
                        new Set(prev).add("resp_addr_estado"),
                      );
                      updateValidation("resp_addr_estado", e.target.value);
                    }}
                    className={getSelectClass(
                      touched.has("resp_addr_estado") && validation.resp_addr_estado
                        ? validation.resp_addr_estado.isValid
                          ? "valid"
                          : "invalid"
                        : "",
                    )}
                  >
                    {ESTADOS_BR.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {touched.has("resp_addr_estado") &&
                    validation.resp_addr_estado?.error && (
                      <p className="error-message">{validation.resp_addr_estado.error}</p>
                    )}
                </div>

                <div className="field">
                  <label className="form-label">
                    Cidade<span className="required-mark">*</span>
                  </label>
                  <select
                    value={responsibleAddressData.cidade}
                    onChange={(e) => {
                      setResponsibleAddressData((prev) => ({
                        ...prev,
                        cidade: e.target.value,
                      }));
                      setTouched((prev) =>
                        new Set(prev).add("resp_addr_cidade"),
                      );
                      updateValidation("resp_addr_cidade", e.target.value);
                    }}
                    disabled={
                      !responsibleAddressData.estado || loadingResponsibleCities
                    }
                    className={getSelectClass(
                      touched.has("resp_addr_cidade") && validation.resp_addr_cidade
                        ? validation.resp_addr_cidade.isValid
                          ? "valid"
                          : "invalid"
                        : "",
                    )}
                  >
                    <option value="">
                      {loadingResponsibleCities
                        ? "Carregando..."
                        : responsibleAddressData.estado
                          ? "Selecione a cidade"
                          : "Selecione o estado primeiro"}
                    </option>
                    {responsibleCities.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {touched.has("resp_addr_cidade") &&
                    validation.resp_addr_cidade?.error && (
                      <p className="error-message">{validation.resp_addr_cidade.error}</p>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact Section */}
      {tipoBeneficiario && (
        <div className="form-section">
          <h3 className="section-title">Contato</h3>

          <div className="field-row">
            <div className="field">
              <label className="form-label">
                Telefone<span className="required-mark">*</span>
              </label>
              <input
                type="text"
                value={contactData.telefone}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setContactData((prev) => ({ ...prev, telefone: formatted }));
                  if (touched.has("telefone"))
                    updateValidation("telefone", formatted);
                }}
                onBlur={() => {
                  setTouched((prev) => new Set(prev).add("telefone"));
                  updateValidation("telefone", contactData.telefone);
                }}
                placeholder="(00) 00000-0000"
                maxLength={15}
                inputMode="numeric"
                className={getInputClass(
                  touched.has("telefone") && validation.telefone
                    ? validation.telefone.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                )}
              />
              {touched.has("telefone") && validation.telefone?.error && (
                <p className="error-message">{validation.telefone.error}</p>
              )}
            </div>

            <div className="field">
              <label className="form-label">
                E-mail<span className="required-mark">*</span>
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => {
                  setContactData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));
                  if (touched.has("email"))
                    updateValidation("email", e.target.value);
                }}
                onBlur={() => {
                  setTouched((prev) => new Set(prev).add("email"));
                  const sanitized = contactData.email.trim().toLowerCase();
                  setContactData((prev) => ({ ...prev, email: sanitized }));
                  updateValidation("email", sanitized);
                }}
                placeholder="seu@email.com"
                maxLength={100}
                className={getInputClass(
                  touched.has("email") && validation.email
                    ? validation.email.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                )}
              />
              {touched.has("email") && validation.email?.error && (
                <p className="error-message">{validation.email.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {tipoBeneficiario && (
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="spinner" />
              Enviando...
            </>
          ) : (
            "Enviar Cadastro"
          )}
        </button>
      )}
    </form>
  );
}
