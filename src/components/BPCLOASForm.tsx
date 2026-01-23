import { useState, useEffect, useCallback } from "react";
import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { BeneficiarySelector } from "./BeneficiarySelector";
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

interface FormData {
  tipoBeneficiario: string;
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
  telefone: string;
  email: string;
}

interface ValidationState {
  [key: string]: { isValid: boolean; error: string };
}

const initialFormData: FormData = {
  tipoBeneficiario: "",
  nome: "",
  nacionalidade: "",
  estadoCivil: "",
  profissao: "",
  cpf: "",
  rg: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  estado: "",
  cidade: "",
  telefone: "",
  email: "",
};

export function BPCLOASForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [validation, setValidation] = useState<ValidationState>({});
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Validate single field
  const validateField = useCallback((name: string, value: string): { isValid: boolean; error: string } => {
    switch (name) {
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

  // Handle input change
  const handleChange = (name: keyof FormData, value: string) => {
    let formattedValue = value;

    switch (name) {
      case "cpf":
        formattedValue = formatCPF(value);
        break;
      case "telefone":
        formattedValue = formatPhone(value);
        break;
      case "cep":
        formattedValue = formatCEP(value);
        break;
      case "rg":
        formattedValue = formatRG(value);
        break;
      case "numero":
        formattedValue = value.toUpperCase().replace(/[^0-9SN\/]/g, "");
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    if (touched.has(name)) {
      updateValidation(name, formattedValue);
    }
  };

  // Handle blur (format and validate)
  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => new Set(prev).add(name));
    
    let value = formData[name];
    
    switch (name) {
      case "nome":
        value = capitalizeName(sanitizeText(value));
        break;
      case "profissao":
      case "complemento":
        value = sanitizeText(value);
        break;
      case "endereco":
      case "bairro":
        value = capitalizeAddress(sanitizeText(value));
        break;
      case "email":
        value = value.trim().toLowerCase();
        break;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    updateValidation(name, value);
  };

  // CEP lookup
  useEffect(() => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    const timeoutId = setTimeout(async () => {
      setLoadingCep(true);
      try {
        const data = await fetchAddressByCEP(cep);
        if (data) {
          const updates: Partial<FormData> = {};
          if (data.logradouro) updates.endereco = capitalizeAddress(data.logradouro);
          if (data.bairro) updates.bairro = capitalizeAddress(data.bairro);
          if (data.uf) updates.estado = data.uf;
          
          setFormData((prev) => ({ ...prev, ...updates }));
          
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
                setFormData((prev) => ({ ...prev, cidade: match.value }));
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
  }, [formData.cep, updateValidation]);

  // Load cities when state changes
  useEffect(() => {
    if (!formData.estado) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await fetchCitiesByState(formData.estado);
        setCities(citiesData.map((c) => ({ value: c.nome, label: c.nome })));
      } catch {
        console.error("Erro ao carregar cidades");
      }
      setLoadingCities(false);
    };

    loadCities();
  }, [formData.estado]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const requiredFields: (keyof FormData)[] = [
      "tipoBeneficiario",
      "nome",
      "nacionalidade",
      "estadoCivil",
      "profissao",
      "cpf",
      "cep",
      "endereco",
      "numero",
      "bairro",
      "estado",
      "cidade",
      "telefone",
      "email",
    ];

    return requiredFields.every((field) => {
      const result = validateField(field, formData[field]);
      return result.isValid;
    });
  }, [formData, validateField]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    setIsSubmitting(true);

    const payload = {
      tipo_caso: "bpc_loas_autismo",
      tipo_beneficiario: formData.tipoBeneficiario,
      nome: sanitizeText(formData.nome),
      nacionalidade: formData.nacionalidade,
      estadoCivil: formData.estadoCivil,
      profissao: sanitizeText(formData.profissao),
      cpf: formData.cpf.replace(/\D/g, ""),
      rg: formData.rg.trim(),
      rg_normalizado: formData.rg.toUpperCase().replace(/[^\dX]/g, ""),
      cep: formData.cep.replace(/\D/g, ""),
      endereco: sanitizeText(formData.endereco),
      numero: formData.numero.trim().toUpperCase().replace(/\s/g, ""),
      complemento: sanitizeText(formData.complemento),
      bairro: sanitizeText(formData.bairro),
      cidade: formData.cidade,
      estado: formData.estado,
      telefone: formData.telefone.replace(/\D/g, ""),
      email: formData.email.trim().toLowerCase(),
      dataEnvio: new Date().toISOString(),
    };

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

  const getFieldState = (name: keyof FormData) => {
    const v = validation[name];
    if (!touched.has(name) || !v) return { isValid: false, isInvalid: false };
    return { isValid: v.isValid, isInvalid: !v.isValid };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Beneficiary Type Selection */}
      <BeneficiarySelector
        value={formData.tipoBeneficiario}
        onChange={(value) => {
          handleChange("tipoBeneficiario", value);
          setTouched((prev) => new Set(prev).add("tipoBeneficiario"));
          updateValidation("tipoBeneficiario", value);
        }}
      />

      {/* Nome */}
      <FormField
        label="Nome Completo"
        required
        error={touched.has("nome") ? validation.nome?.error : undefined}
      >
        <FormInput
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange("nome", e.target.value)}
          onBlur={() => handleBlur("nome")}
          placeholder="Digite seu nome completo"
          maxLength={100}
          className="capitalize"
          {...getFieldState("nome")}
        />
      </FormField>

      {/* Nacionalidade + Estado Civil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nacionalidade"
          required
          error={touched.has("nacionalidade") ? validation.nacionalidade?.error : undefined}
        >
          <FormSelect
            value={formData.nacionalidade}
            onChange={(e) => {
              handleChange("nacionalidade", e.target.value);
              setTouched((prev) => new Set(prev).add("nacionalidade"));
              updateValidation("nacionalidade", e.target.value);
            }}
            options={NACIONALIDADES}
            {...getFieldState("nacionalidade")}
          />
        </FormField>

        <FormField
          label="Estado Civil"
          required
          error={touched.has("estadoCivil") ? validation.estadoCivil?.error : undefined}
        >
          <FormSelect
            value={formData.estadoCivil}
            onChange={(e) => {
              handleChange("estadoCivil", e.target.value);
              setTouched((prev) => new Set(prev).add("estadoCivil"));
              updateValidation("estadoCivil", e.target.value);
            }}
            options={ESTADOS_CIVIS}
            {...getFieldState("estadoCivil")}
          />
        </FormField>
      </div>

      {/* Profissão */}
      <FormField
        label="Profissão"
        required
        error={touched.has("profissao") ? validation.profissao?.error : undefined}
      >
        <FormInput
          type="text"
          value={formData.profissao}
          onChange={(e) => handleChange("profissao", e.target.value)}
          onBlur={() => handleBlur("profissao")}
          placeholder="Digite sua profissão"
          maxLength={80}
          className="capitalize"
          {...getFieldState("profissao")}
        />
      </FormField>

      {/* CPF + RG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="CPF"
          required
          error={touched.has("cpf") ? validation.cpf?.error : undefined}
        >
          <FormInput
            type="text"
            value={formData.cpf}
            onChange={(e) => handleChange("cpf", e.target.value)}
            onBlur={() => handleBlur("cpf")}
            placeholder="000.000.000-00"
            maxLength={14}
            inputMode="numeric"
            {...getFieldState("cpf")}
          />
        </FormField>

        <FormField
          label="RG"
          error={touched.has("rg") ? validation.rg?.error : undefined}
        >
          <FormInput
            type="text"
            value={formData.rg}
            onChange={(e) => handleChange("rg", e.target.value)}
            onBlur={() => handleBlur("rg")}
            placeholder="Ex: 12.345.678-9"
            maxLength={26}
            className="uppercase"
            {...getFieldState("rg")}
          />
        </FormField>
      </div>

      {/* CEP */}
      <FormField
        label="CEP"
        required
        error={touched.has("cep") ? validation.cep?.error : undefined}
        helper="O endereço será preenchido automaticamente"
        loading={loadingCep}
        loadingText="Buscando endereço..."
      >
        <FormInput
          type="text"
          value={formData.cep}
          onChange={(e) => handleChange("cep", e.target.value)}
          onBlur={() => handleBlur("cep")}
          placeholder="00000-000"
          maxLength={9}
          inputMode="numeric"
          {...getFieldState("cep")}
        />
      </FormField>

      {/* Logradouro */}
      <FormField
        label="Logradouro"
        required
        error={touched.has("endereco") ? validation.endereco?.error : undefined}
      >
        <FormInput
          type="text"
          value={formData.endereco}
          onChange={(e) => handleChange("endereco", e.target.value)}
          onBlur={() => handleBlur("endereco")}
          placeholder="Rua, Avenida, etc."
          maxLength={150}
          className="capitalize"
          {...getFieldState("endereco")}
        />
      </FormField>

      {/* Número + Complemento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Número"
          required
          error={touched.has("numero") ? validation.numero?.error : undefined}
        >
          <FormInput
            type="text"
            value={formData.numero}
            onChange={(e) => handleChange("numero", e.target.value)}
            onBlur={() => handleBlur("numero")}
            placeholder="Nº ou S/N"
            maxLength={10}
            {...getFieldState("numero")}
          />
        </FormField>

        <FormField label="Complemento">
          <FormInput
            type="text"
            value={formData.complemento}
            onChange={(e) => handleChange("complemento", e.target.value)}
            onBlur={() => handleBlur("complemento")}
            placeholder="Apto, Bloco, etc."
            maxLength={50}
            className="capitalize"
          />
        </FormField>
      </div>

      {/* Bairro */}
      <FormField
        label="Bairro"
        required
        error={touched.has("bairro") ? validation.bairro?.error : undefined}
      >
        <FormInput
          type="text"
          value={formData.bairro}
          onChange={(e) => handleChange("bairro", e.target.value)}
          onBlur={() => handleBlur("bairro")}
          placeholder="Digite seu bairro"
          maxLength={80}
          className="capitalize"
          {...getFieldState("bairro")}
        />
      </FormField>

      {/* Estado + Cidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Estado"
          required
          error={touched.has("estado") ? validation.estado?.error : undefined}
        >
          <FormSelect
            value={formData.estado}
            onChange={(e) => {
              handleChange("estado", e.target.value);
              handleChange("cidade", "");
              setTouched((prev) => new Set(prev).add("estado"));
              updateValidation("estado", e.target.value);
            }}
            options={ESTADOS_BR}
            {...getFieldState("estado")}
          />
        </FormField>

        <FormField
          label="Cidade"
          required
          error={touched.has("cidade") ? validation.cidade?.error : undefined}
        >
          <FormSelect
            value={formData.cidade}
            onChange={(e) => {
              handleChange("cidade", e.target.value);
              setTouched((prev) => new Set(prev).add("cidade"));
              updateValidation("cidade", e.target.value);
            }}
            options={cities}
            placeholder={loadingCities ? "Carregando..." : formData.estado ? "Selecione a cidade" : "Selecione o estado primeiro"}
            disabled={!formData.estado || loadingCities}
            {...getFieldState("cidade")}
          />
        </FormField>
      </div>

      {/* Telefone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Telefone"
          required
          error={touched.has("telefone") ? validation.telefone?.error : undefined}
        >
          <FormInput
            type="text"
            value={formData.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            onBlur={() => handleBlur("telefone")}
            placeholder="(00) 00000-0000"
            maxLength={15}
            inputMode="numeric"
            {...getFieldState("telefone")}
          />
        </FormField>

        <FormField
          label="E-mail"
          required
          error={touched.has("email") ? validation.email?.error : undefined}
        >
          <FormInput
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="seu@email.com"
            maxLength={100}
            {...getFieldState("email")}
          />
        </FormField>
      </div>

      {/* Submit Button */}
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
    </form>
  );
}
