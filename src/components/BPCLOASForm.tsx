import { useState, useEffect, useCallback, useMemo } from "react";
import { BeneficiarySelector } from "./BeneficiarySelector";
import { BeneficiaryFormSection } from "./BeneficiaryFormSection";
import { ResponsibleFormSection } from "./ResponsibleFormSection";
import { AddressFormSection } from "./AddressFormSection";
import { ContactFormSection } from "./ContactFormSection";
import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { SuccessScreen } from "./SuccessScreen";
import {
  validateCPF,
  validatePhoneBR,
  validateRG,
  validateEmail,
  formatCPF,
  formatPhone,
  formatCEP,
  formatRG,
  capitalizeName,
  capitalizeAddress,
  sanitizeText,
} from "@/lib/validations";
import {
  ESTADOS_BR,
  NACIONALIDADES,
  ESTADOS_CIVIS,
  fetchCitiesByState,
  fetchAddressByCEP,
} from "@/lib/brazilData";
import { Loader2 } from "lucide-react";

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

// For "proprio" - user is the beneficiary
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

// Calculate age from birth date
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
  
  // For "proprio" - user fills their own data
  const [proprioData, setProprioData] = useState<ProprioFormData>({
    nome: "",
    dataNascimento: "",
    nacionalidade: "",
    estadoCivil: "",
    profissao: "",
    cpf: "",
    rg: "",
  });
  
  // For "outro" - separate beneficiary and responsible
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData>(initialBeneficiaryData);
  const [responsibleData, setResponsibleData] = useState<ResponsibleData>(initialResponsibleData);
  
  // Shared address and contact
  const [addressData, setAddressData] = useState<AddressData>(initialAddressData);
  const [contactData, setContactData] = useState<ContactData>(initialContactData);
  
  const [validation, setValidation] = useState<ValidationState>({});
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Calculate beneficiary age
  const beneficiaryAge = useMemo(() => {
    if (tipoBeneficiario === "outro") {
      return calculateAge(beneficiaryData.dataNascimento);
    }
    return null;
  }, [tipoBeneficiario, beneficiaryData.dataNascimento]);

  // Show responsible section if beneficiary is under 18
  const showResponsibleSection = useMemo(() => {
    return tipoBeneficiario === "outro" && beneficiaryAge !== null && beneficiaryAge < 18;
  }, [tipoBeneficiario, beneficiaryAge]);

  // Validate single field
  const validateField = useCallback((name: string, value: string): { isValid: boolean; error: string } => {
    // Handle prefixed field names
    const baseName = name.replace(/^(beneficiario_|responsavel_|proprio_)/, "");
    
    switch (baseName) {
      case "tipoBeneficiario":
        return {
          isValid: value !== "",
          error: value === "" ? "Selecione para quem é o benefício" : "",
        };
      case "nome": {
        const words = value.split(/\s+/).filter(Boolean);
        const isValid = words.length >= 2 && words.every((w) => /^[A-Za-zÀ-ÿ]+$/.test(w));
        return {
          isValid,
          error: isValid ? "" : "Digite nome e sobrenome completos (mínimo 2 palavras, apenas letras)",
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
      case "profissao":
        return {
          isValid: /^[A-Za-zÀ-ÿ0-9\s]+$/.test(value) && value.length >= 3,
          error: value.length < 3 ? "Digite pelo menos 3 caracteres" : "Digite apenas letras, números e espaços",
        };
      case "cpf":
        return {
          isValid: validateCPF(value),
          error: validateCPF(value) ? "" : "CPF inválido. Verifique os números digitados",
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
          error: value.replace(/\D/g, "").length !== 8 ? "CEP inválido ou não encontrado" : "",
        };
      case "endereco":
      case "bairro":
        return {
          isValid: value.length >= 3 && /^[A-Za-zÀ-ÿ0-9\s]+$/.test(value),
          error: value.length < 3 ? "Digite pelo menos 3 caracteres" : "Digite um endereço válido",
        };
      case "numero": {
        const n = value.toUpperCase().replace(/\s/g, "");
        const isValid = /^[0-9]+$/.test(n) || n === "S/N" || n === "SN";
        return { isValid, error: isValid ? "" : "Digite apenas números ou S/N" };
      }
      case "complemento":
        return {
          isValid: value.length === 0 || /^[A-Za-zÀ-ÿ0-9\s,.\-\/]+$/.test(value),
          error: "",
        };
      case "telefone":
        return {
          isValid: validatePhoneBR(value),
          error: validatePhoneBR(value) ? "" : "Telefone inválido (DDD + 8/9 dígitos)",
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
  }, []);

  // Update validation when field changes
  const updateValidation = useCallback((name: string, value: string) => {
    const result = validateField(name, value);
    setValidation((prev) => ({ ...prev, [name]: result }));
  }, [validateField]);

  // Format value based on field name
  const formatValue = (name: string, value: string): string => {
    const baseName = name.replace(/^(beneficiario_|responsavel_|proprio_)/, "");
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

  // Sanitize value on blur based on field name
  const sanitizeValue = (name: string, value: string): string => {
    const baseName = name.replace(/^(beneficiario_|responsavel_|proprio_)/, "");
    switch (baseName) {
      case "nome":
        return capitalizeName(sanitizeText(value));
      case "profissao":
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

  // Proprio handlers
  const handleProprioChange = (name: keyof ProprioFormData, value: string) => {
    const formattedValue = formatValue(name, value);
    setProprioData((prev) => ({ ...prev, [name]: formattedValue }));
    const prefixedName = `proprio_${name}`;
    if (touched.has(prefixedName)) {
      updateValidation(prefixedName, formattedValue);
    }
  };

  const handleProprioBlur = (name: keyof ProprioFormData) => {
    const prefixedName = `proprio_${name}`;
    setTouched((prev) => new Set(prev).add(prefixedName));
    const sanitized = sanitizeValue(name, proprioData[name]);
    setProprioData((prev) => ({ ...prev, [name]: sanitized }));
    updateValidation(prefixedName, sanitized);
  };

  const getProprioFieldState = (name: keyof ProprioFormData) => {
    const prefixedName = `proprio_${name}`;
    const v = validation[prefixedName];
    if (!touched.has(prefixedName) || !v) return { isValid: false, isInvalid: false };
    return { isValid: v.isValid, isInvalid: !v.isValid };
  };

  // Beneficiary handlers
  const handleBeneficiaryChange = (name: keyof BeneficiaryData, value: string) => {
    const formattedValue = formatValue(name, value);
    setBeneficiaryData((prev) => ({ ...prev, [name]: formattedValue }));
    const prefixedName = `beneficiario_${name}`;
    if (touched.has(prefixedName)) {
      updateValidation(prefixedName, formattedValue);
    }
  };

  const handleBeneficiaryBlur = (name: keyof BeneficiaryData) => {
    const prefixedName = `beneficiario_${name}`;
    setTouched((prev) => new Set(prev).add(prefixedName));
    const sanitized = sanitizeValue(name, beneficiaryData[name]);
    setBeneficiaryData((prev) => ({ ...prev, [name]: sanitized }));
    updateValidation(prefixedName, sanitized);
  };

  const getBeneficiaryFieldState = (name: keyof BeneficiaryData) => {
    const prefixedName = `beneficiario_${name}`;
    const v = validation[prefixedName];
    if (!touched.has(prefixedName) || !v) return { isValid: false, isInvalid: false };
    return { isValid: v.isValid, isInvalid: !v.isValid };
  };

  // Responsible handlers
  const handleResponsibleChange = (name: keyof ResponsibleData, value: string) => {
    const formattedValue = formatValue(name, value);
    setResponsibleData((prev) => ({ ...prev, [name]: formattedValue }));
    const prefixedName = `responsavel_${name}`;
    if (touched.has(prefixedName)) {
      updateValidation(prefixedName, formattedValue);
    }
  };

  const handleResponsibleBlur = (name: keyof ResponsibleData) => {
    const prefixedName = `responsavel_${name}`;
    setTouched((prev) => new Set(prev).add(prefixedName));
    const sanitized = sanitizeValue(name, responsibleData[name]);
    setResponsibleData((prev) => ({ ...prev, [name]: sanitized }));
    updateValidation(prefixedName, sanitized);
  };

  const getResponsibleFieldState = (name: keyof ResponsibleData) => {
    const prefixedName = `responsavel_${name}`;
    const v = validation[prefixedName];
    if (!touched.has(prefixedName) || !v) return { isValid: false, isInvalid: false };
    return { isValid: v.isValid, isInvalid: !v.isValid };
  };

  // Address handlers
  const handleAddressChange = (name: keyof AddressData, value: string) => {
    const formattedValue = formatValue(name, value);
    setAddressData((prev) => ({ ...prev, [name]: formattedValue }));
    if (touched.has(name)) {
      updateValidation(name, formattedValue);
    }
  };

  const handleAddressBlur = (name: keyof AddressData) => {
    setTouched((prev) => new Set(prev).add(name));
    const sanitized = sanitizeValue(name, addressData[name]);
    setAddressData((prev) => ({ ...prev, [name]: sanitized }));
    updateValidation(name, sanitized);
  };

  const getAddressFieldState = (name: keyof AddressData) => {
    const v = validation[name];
    if (!touched.has(name) || !v) return { isValid: false, isInvalid: false };
    return { isValid: v.isValid, isInvalid: !v.isValid };
  };

  const handleStateChange = (value: string) => {
    setAddressData((prev) => ({ ...prev, estado: value, cidade: "" }));
    setTouched((prev) => new Set(prev).add("estado"));
    updateValidation("estado", value);
  };

  // Contact handlers
  const handleContactChange = (name: keyof ContactData, value: string) => {
    const formattedValue = formatValue(name, value);
    setContactData((prev) => ({ ...prev, [name]: formattedValue }));
    if (touched.has(name)) {
      updateValidation(name, formattedValue);
    }
  };

  const handleContactBlur = (name: keyof ContactData) => {
    setTouched((prev) => new Set(prev).add(name));
    const sanitized = sanitizeValue(name, contactData[name]);
    setContactData((prev) => ({ ...prev, [name]: sanitized }));
    updateValidation(name, sanitized);
  };

  const getContactFieldState = (name: keyof ContactData) => {
    const v = validation[name];
    if (!touched.has(name) || !v) return { isValid: false, isInvalid: false };
    return { isValid: v.isValid, isInvalid: !v.isValid };
  };

  // CEP lookup
  useEffect(() => {
    const cep = addressData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    const timeoutId = setTimeout(async () => {
      setLoadingCep(true);
      try {
        const data = await fetchAddressByCEP(cep);
        if (data) {
          const updates: Partial<AddressData> = {};
          if (data.logradouro) updates.endereco = capitalizeAddress(data.logradouro);
          if (data.bairro) updates.bairro = capitalizeAddress(data.bairro);
          if (data.uf) updates.estado = data.uf;
          
          setAddressData((prev) => ({ ...prev, ...updates }));
          
          if (data.uf) {
            setLoadingCities(true);
            const citiesData = await fetchCitiesByState(data.uf);
            const cityOptions = citiesData.map((c) => ({ value: c.nome, label: c.nome }));
            setCities(cityOptions);
            setLoadingCities(false);
            
            if (data.localidade) {
              const match = cityOptions.find(
                (c) => c.value.toLowerCase() === data.localidade?.toLowerCase()
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

  // Load cities when state changes
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

  // Check if form is valid
  const isFormValid = useCallback(() => {
    // Must select beneficiary type
    if (!tipoBeneficiario) return false;

    // Address validation
    const addressFields: (keyof AddressData)[] = ["cep", "endereco", "numero", "bairro", "estado", "cidade"];
    const addressValid = addressFields.every((field) => {
      const result = validateField(field, addressData[field]);
      return result.isValid;
    });

    // Contact validation
    const contactFields: (keyof ContactData)[] = ["telefone", "email"];
    const contactValid = contactFields.every((field) => {
      const result = validateField(field, contactData[field]);
      return result.isValid;
    });

    if (!addressValid || !contactValid) return false;

    if (tipoBeneficiario === "proprio") {
      // Validate proprio data
      const proprioFields: (keyof ProprioFormData)[] = ["nome", "dataNascimento", "nacionalidade", "estadoCivil", "profissao", "cpf"];
      return proprioFields.every((field) => {
        const result = validateField(`proprio_${field}`, proprioData[field]);
        return result.isValid;
      });
    } else {
      // Validate beneficiary data
      const beneficiaryFields: (keyof BeneficiaryData)[] = ["nome", "dataNascimento", "nacionalidade", "estadoCivil", "profissao", "cpf"];
      const beneficiaryValid = beneficiaryFields.every((field) => {
        const result = validateField(`beneficiario_${field}`, beneficiaryData[field]);
        return result.isValid;
      });

      if (!beneficiaryValid) return false;

      // If minor, validate responsible data
      if (showResponsibleSection) {
        const responsibleFields: (keyof ResponsibleData)[] = ["nome", "nacionalidade", "estadoCivil", "profissao", "cpf", "parentesco"];
        return responsibleFields.every((field) => {
          const result = validateField(`responsavel_${field}`, responsibleData[field]);
          return result.isValid;
        });
      }

      return true;
    }
  }, [tipoBeneficiario, proprioData, beneficiaryData, responsibleData, addressData, contactData, showResponsibleSection, validateField]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      tipo_caso: "bpc_loas_autismo",
      tipo_beneficiario: tipoBeneficiario,
      dataEnvio: new Date().toISOString(),
      
      // Address
      cep: addressData.cep.replace(/\D/g, ""),
      endereco: sanitizeText(addressData.endereco),
      numero: addressData.numero.trim().toUpperCase().replace(/\s/g, ""),
      complemento: sanitizeText(addressData.complemento),
      bairro: sanitizeText(addressData.bairro),
      cidade: addressData.cidade,
      estado: addressData.estado,
      
      // Contact
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
      payload.rg_normalizado = proprioData.rg.toUpperCase().replace(/[^\dX]/g, "");
    } else {
      // Beneficiary data
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
      };

      // Responsible data (if minor)
      if (showResponsibleSection) {
        payload.responsavel = {
          parentesco: responsibleData.parentesco,
          nome: sanitizeText(responsibleData.nome),
          nacionalidade: responsibleData.nacionalidade,
          estadoCivil: responsibleData.estadoCivil,
          profissao: sanitizeText(responsibleData.profissao),
          cpf: responsibleData.cpf.replace(/\D/g, ""),
          rg: responsibleData.rg.trim(),
          rg_normalizado: responsibleData.rg.toUpperCase().replace(/[^\dX]/g, ""),
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
        }
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
        msg = "Sem conexão com a internet. Verifique sua conexão e tente novamente.";
      }
      alert(msg);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return <SuccessScreen />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Beneficiary Type Selection */}
      <BeneficiarySelector
        value={tipoBeneficiario}
        onChange={(value) => {
          setTipoBeneficiario(value);
          setTouched((prev) => new Set(prev).add("tipoBeneficiario"));
          // Reset data when switching type
          if (value === "proprio") {
            setBeneficiaryData(initialBeneficiaryData);
            setResponsibleData(initialResponsibleData);
          } else {
            setProprioData({
              nome: "",
              dataNascimento: "",
              nacionalidade: "",
              estadoCivil: "",
              profissao: "",
              cpf: "",
              rg: "",
            });
          }
        }}
      />

      {/* "Para mim mesmo" - Show proprio form */}
      {tipoBeneficiario === "proprio" && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <h3 className="text-lg font-semibold text-primary">Seus Dados</h3>
          </div>

          {/* Nome */}
          <FormField
            label="Nome Completo"
            required
            error={touched.has("proprio_nome") ? validation.proprio_nome?.error : undefined}
          >
            <FormInput
              type="text"
              value={proprioData.nome}
              onChange={(e) => handleProprioChange("nome", e.target.value)}
              onBlur={() => handleProprioBlur("nome")}
              placeholder="Digite seu nome completo"
              maxLength={100}
              className="capitalize"
              {...getProprioFieldState("nome")}
            />
          </FormField>

          {/* Data de Nascimento */}
          <FormField
            label="Data de Nascimento"
            required
            error={touched.has("proprio_dataNascimento") ? validation.proprio_dataNascimento?.error : undefined}
          >
            <FormInput
              type="date"
              value={proprioData.dataNascimento}
              onChange={(e) => handleProprioChange("dataNascimento", e.target.value)}
              onBlur={() => handleProprioBlur("dataNascimento")}
              max={new Date().toISOString().split("T")[0]}
              {...getProprioFieldState("dataNascimento")}
            />
          </FormField>

          {/* Nacionalidade + Estado Civil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nacionalidade"
              required
              error={touched.has("proprio_nacionalidade") ? validation.proprio_nacionalidade?.error : undefined}
            >
              <FormSelect
                value={proprioData.nacionalidade}
                onChange={(e) => {
                  handleProprioChange("nacionalidade", e.target.value);
                  setTouched((prev) => new Set(prev).add("proprio_nacionalidade"));
                  updateValidation("proprio_nacionalidade", e.target.value);
                }}
                options={NACIONALIDADES}
                {...getProprioFieldState("nacionalidade")}
              />
            </FormField>

            <FormField
              label="Estado Civil"
              required
              error={touched.has("proprio_estadoCivil") ? validation.proprio_estadoCivil?.error : undefined}
            >
              <FormSelect
                value={proprioData.estadoCivil}
                onChange={(e) => {
                  handleProprioChange("estadoCivil", e.target.value);
                  setTouched((prev) => new Set(prev).add("proprio_estadoCivil"));
                  updateValidation("proprio_estadoCivil", e.target.value);
                }}
                options={ESTADOS_CIVIS}
                {...getProprioFieldState("estadoCivil")}
              />
            </FormField>
          </div>

          {/* Profissão */}
          <FormField
            label="Profissão"
            required
            error={touched.has("proprio_profissao") ? validation.proprio_profissao?.error : undefined}
          >
            <FormInput
              type="text"
              value={proprioData.profissao}
              onChange={(e) => handleProprioChange("profissao", e.target.value)}
              onBlur={() => handleProprioBlur("profissao")}
              placeholder="Digite sua profissão"
              maxLength={80}
              className="capitalize"
              {...getProprioFieldState("profissao")}
            />
          </FormField>

          {/* CPF + RG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="CPF"
              required
              error={touched.has("proprio_cpf") ? validation.proprio_cpf?.error : undefined}
            >
              <FormInput
                type="text"
                value={proprioData.cpf}
                onChange={(e) => handleProprioChange("cpf", e.target.value)}
                onBlur={() => handleProprioBlur("cpf")}
                placeholder="000.000.000-00"
                maxLength={14}
                inputMode="numeric"
                {...getProprioFieldState("cpf")}
              />
            </FormField>

            <FormField
              label="RG"
              error={touched.has("proprio_rg") ? validation.proprio_rg?.error : undefined}
            >
              <FormInput
                type="text"
                value={proprioData.rg}
                onChange={(e) => handleProprioChange("rg", e.target.value)}
                onBlur={() => handleProprioBlur("rg")}
                placeholder="Ex: 12.345.678-9"
                maxLength={26}
                className="uppercase"
                {...getProprioFieldState("rg")}
              />
            </FormField>
          </div>
        </div>
      )}

      {/* "Para outra pessoa" - Show beneficiary section */}
      {tipoBeneficiario === "outro" && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <BeneficiaryFormSection
            data={beneficiaryData}
            validation={{
              nome: validation.beneficiario_nome,
              dataNascimento: validation.beneficiario_dataNascimento,
              nacionalidade: validation.beneficiario_nacionalidade,
              estadoCivil: validation.beneficiario_estadoCivil,
              profissao: validation.beneficiario_profissao,
              cpf: validation.beneficiario_cpf,
              rg: validation.beneficiario_rg,
            }}
            touched={new Set([...touched].filter(t => t.startsWith("beneficiario_")).map(t => t.replace("beneficiario_", "")))}
            onFieldChange={handleBeneficiaryChange}
            onFieldBlur={handleBeneficiaryBlur}
            getFieldState={getBeneficiaryFieldState}
          />

          {/* Show age info after selecting date */}
          {beneficiaryAge !== null && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                Idade do beneficiário: <span className="font-semibold text-foreground">{beneficiaryAge} anos</span>
                {beneficiaryAge < 18 && (
                  <span className="ml-2 text-primary">• Será necessário informar o responsável legal</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Responsible section - only if beneficiary is under 18 */}
      {showResponsibleSection && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <ResponsibleFormSection
            data={responsibleData}
            validation={{
              nome: validation.responsavel_nome,
              nacionalidade: validation.responsavel_nacionalidade,
              estadoCivil: validation.responsavel_estadoCivil,
              profissao: validation.responsavel_profissao,
              cpf: validation.responsavel_cpf,
              rg: validation.responsavel_rg,
              parentesco: validation.responsavel_parentesco,
            }}
            touched={new Set([...touched].filter(t => t.startsWith("responsavel_")).map(t => t.replace("responsavel_", "")))}
            onFieldChange={handleResponsibleChange}
            onFieldBlur={handleResponsibleBlur}
            getFieldState={getResponsibleFieldState}
          />
        </div>
      )}

      {/* Address section - always show after selecting beneficiary type */}
      {tipoBeneficiario && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <AddressFormSection
            data={addressData}
            validation={validation}
            touched={touched}
            cities={cities}
            loadingCep={loadingCep}
            loadingCities={loadingCities}
            onFieldChange={handleAddressChange}
            onFieldBlur={handleAddressBlur}
            getFieldState={getAddressFieldState}
            onStateChange={handleStateChange}
          />
        </div>
      )}

      {/* Contact section - always show after selecting beneficiary type */}
      {tipoBeneficiario && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <ContactFormSection
            data={contactData}
            validation={validation}
            touched={touched}
            onFieldChange={handleContactChange}
            onFieldBlur={handleContactBlur}
            getFieldState={getContactFieldState}
          />
        </div>
      )}

      {/* Submit Button */}
      {tipoBeneficiario && (
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="w-full py-3.5 px-6 bg-primary text-primary-foreground font-semibold rounded-lg
            transition-all duration-300 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
            flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
