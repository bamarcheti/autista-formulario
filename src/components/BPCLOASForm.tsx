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

  // Beneficiary address
  const [addressData, setAddressData] =
    useState<AddressData>(initialAddressData);

  // Responsible address (separate)
  const [responsibleAddressData, setResponsibleAddressData] =
    useState<AddressData>(initialAddressData);
  const [sameAddressAsResponsible, setSameAddressAsResponsible] =
    useState(false);

  // New: Adult who needs constant accompaniment
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

  // Calculate beneficiary age
  const beneficiaryAge = useMemo(() => {
    if (tipoBeneficiario === "outro") {
      return calculateAge(beneficiaryData.dataNascimento);
    }
    return null;
  }, [tipoBeneficiario, beneficiaryData.dataNascimento]);

  // Show responsible section if beneficiary is under 18 OR if adult needs accompaniment
  const showResponsibleSection = useMemo(() => {
    if (tipoBeneficiario !== "outro") return false;
    if (beneficiaryAge === null) return false;
    return beneficiaryAge < 18 || needsAccompaniment;
  }, [tipoBeneficiario, beneficiaryAge, needsAccompaniment]);

  // Validate single field
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

  // Generic input handler
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

  // Check if form is valid
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

        // Validate responsible address if not same
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

  // Submit handler
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

      // Address
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

      // Responsible data
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

  const inputClassName = (state: string) => `
    w-full px-4 py-3 rounded-lg border-2 bg-secondary text-foreground
    placeholder:text-muted-foreground transition-all duration-300
    focus:outline-none focus:ring-0
    ${state === "valid" ? "border-emerald-500" : state === "invalid" ? "border-destructive" : "border-border focus:border-primary"}
  `;

  const selectClassName = (state: string) => `
    w-full px-4 py-3 rounded-lg border-2 bg-secondary text-foreground
    transition-all duration-300 cursor-pointer appearance-none
    focus:outline-none focus:ring-0
    ${state === "valid" ? "border-emerald-500" : state === "invalid" ? "border-destructive" : "border-border focus:border-primary"}
    bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")]
    bg-no-repeat bg-[right_14px_center] bg-[length:18px]
  `;

  const labelClassName = "block text-sm font-medium text-muted-foreground mb-2";
  const requiredSpan = <span className="text-destructive ml-1">*</span>;
  const errorClassName = "text-destructive text-xs mt-1";
  const sectionTitleClassName =
    "text-lg font-semibold text-primary pb-2 border-b border-border mb-5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Beneficiary Type Selection */}
      <div className="space-y-4">
        <label className={labelClassName}>
          Para quem é o benefício?{requiredSpan}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setTipoBeneficiario("proprio");
              setBeneficiaryData(initialBeneficiaryData);
              setResponsibleData(initialResponsibleData);
              setNeedsAccompaniment(false);
            }}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
              tipoBeneficiario === "proprio"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="font-semibold text-foreground">
              Para mim mesmo
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              Eu sou o beneficiário
            </p>
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
            className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
              tipoBeneficiario === "outro"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="font-semibold text-foreground">
              Para outra pessoa
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              Sou responsável pelo beneficiário
            </p>
          </button>
        </div>
      </div>

      {/* "Para mim mesmo" - Own Data */}
      {tipoBeneficiario === "proprio" && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className={sectionTitleClassName}>Seus Dados</h3>

          <div className="space-y-4">
            <div>
              <label className={labelClassName}>
                Nome Completo{requiredSpan}
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
                className={`${inputClassName(getFieldState("proprio", "nome"))} capitalize`}
              />
              {getError("proprio", "nome") && (
                <p className={errorClassName}>{getError("proprio", "nome")}</p>
              )}
            </div>

            <div>
              <label className={labelClassName}>
                Data de Nascimento{requiredSpan}
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
                className={inputClassName(
                  getFieldState("proprio", "dataNascimento"),
                )}
              />
              {getError("proprio", "dataNascimento") && (
                <p className={errorClassName}>
                  {getError("proprio", "dataNascimento")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>
                  Nacionalidade{requiredSpan}
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
                  className={selectClassName(
                    getFieldState("proprio", "nacionalidade"),
                  )}
                >
                  {NACIONALIDADES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("proprio", "nacionalidade") && (
                  <p className={errorClassName}>
                    {getError("proprio", "nacionalidade")}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClassName}>
                  Estado Civil{requiredSpan}
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
                  className={selectClassName(
                    getFieldState("proprio", "estadoCivil"),
                  )}
                >
                  {ESTADOS_CIVIS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("proprio", "estadoCivil") && (
                  <p className={errorClassName}>
                    {getError("proprio", "estadoCivil")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClassName}>Profissão{requiredSpan}</label>
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
                className={`${inputClassName(getFieldState("proprio", "profissao"))} capitalize`}
              />
              {getError("proprio", "profissao") && (
                <p className={errorClassName}>
                  {getError("proprio", "profissao")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>CPF{requiredSpan}</label>
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
                  className={inputClassName(getFieldState("proprio", "cpf"))}
                />
                {getError("proprio", "cpf") && (
                  <p className={errorClassName}>{getError("proprio", "cpf")}</p>
                )}
              </div>

              <div>
                <label className={labelClassName}>RG</label>
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
                  className={`${inputClassName(getFieldState("proprio", "rg"))} uppercase`}
                />
                {getError("proprio", "rg") && (
                  <p className={errorClassName}>{getError("proprio", "rg")}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Para outra pessoa" - Beneficiary Data */}
      {tipoBeneficiario === "outro" && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className={sectionTitleClassName}>Dados do Beneficiário</h3>

          <div className="space-y-4">
            <div>
              <label className={labelClassName}>
                Nome Completo do Beneficiário{requiredSpan}
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
                className={`${inputClassName(getFieldState("beneficiario", "nome"))} capitalize`}
              />
              {getError("beneficiario", "nome") && (
                <p className={errorClassName}>
                  {getError("beneficiario", "nome")}
                </p>
              )}
            </div>

            <div>
              <label className={labelClassName}>
                Data de Nascimento{requiredSpan}
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
                className={inputClassName(
                  getFieldState("beneficiario", "dataNascimento"),
                )}
              />
              {getError("beneficiario", "dataNascimento") && (
                <p className={errorClassName}>
                  {getError("beneficiario", "dataNascimento")}
                </p>
              )}
            </div>

            {/* Show age and accompaniment option */}
            {beneficiaryAge !== null && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <p className="text-sm text-muted-foreground">
                  Idade do beneficiário:{" "}
                  <span className="font-semibold text-foreground">
                    {beneficiaryAge} anos
                  </span>
                  {beneficiaryAge < 18 && (
                    <span className="ml-2 text-primary">
                      • Será necessário informar o responsável legal
                    </span>
                  )}
                </p>

                {/* Show accompaniment checkbox for adults (18+) */}
                {beneficiaryAge >= 18 && (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={needsAccompaniment}
                      onChange={(e) => setNeedsAccompaniment(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-2 border-border bg-secondary accent-primary
                      focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        O beneficiário necessita de acompanhamento constante
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Marque esta opção se o beneficiário, mesmo sendo maior
                        de idade, precisa de um responsável legal ou curador
                      </p>
                    </div>
                  </label>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>
                  Nacionalidade{requiredSpan}
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
                  className={selectClassName(
                    getFieldState("beneficiario", "nacionalidade"),
                  )}
                >
                  {NACIONALIDADES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("beneficiario", "nacionalidade") && (
                  <p className={errorClassName}>
                    {getError("beneficiario", "nacionalidade")}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClassName}>
                  Estado Civil{requiredSpan}
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
                  className={selectClassName(
                    getFieldState("beneficiario", "estadoCivil"),
                  )}
                >
                  {ESTADOS_CIVIS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("beneficiario", "estadoCivil") && (
                  <p className={errorClassName}>
                    {getError("beneficiario", "estadoCivil")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClassName}>Profissão{requiredSpan}</label>
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
                className={`${inputClassName(getFieldState("beneficiario", "profissao"))} capitalize`}
              />
              {getError("beneficiario", "profissao") && (
                <p className={errorClassName}>
                  {getError("beneficiario", "profissao")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>CPF{requiredSpan}</label>
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
                  className={inputClassName(
                    getFieldState("beneficiario", "cpf"),
                  )}
                />
                {getError("beneficiario", "cpf") && (
                  <p className={errorClassName}>
                    {getError("beneficiario", "cpf")}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClassName}>RG</label>
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
                  className={`${inputClassName(getFieldState("beneficiario", "rg"))} uppercase`}
                />
                {getError("beneficiario", "rg") && (
                  <p className={errorClassName}>
                    {getError("beneficiario", "rg")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Address Section */}
      {tipoBeneficiario && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className={sectionTitleClassName}>
            {tipoBeneficiario === "proprio"
              ? "Endereço"
              : "Endereço do Beneficiário"}
          </h3>

          <div className="space-y-4">
            <div>
              <label className={labelClassName}>CEP{requiredSpan}</label>
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
                className={inputClassName(
                  touched.has("cep") && validation.cep
                    ? validation.cep.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                )}
              />
              <p className="text-muted-foreground text-xs mt-1">
                O endereço será preenchido automaticamente
              </p>
              {loadingCep && (
                <p className="text-primary text-xs mt-1 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Buscando endereço...
                </p>
              )}
              {touched.has("cep") && validation.cep?.error && (
                <p className={errorClassName}>{validation.cep.error}</p>
              )}
            </div>

            <div>
              <label className={labelClassName}>Logradouro{requiredSpan}</label>
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
                className={`${inputClassName(touched.has("endereco") && validation.endereco ? (validation.endereco.isValid ? "valid" : "invalid") : "")} capitalize`}
              />
              {touched.has("endereco") && validation.endereco?.error && (
                <p className={errorClassName}>{validation.endereco.error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Número{requiredSpan}</label>
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
                  className={inputClassName(
                    touched.has("numero") && validation.numero
                      ? validation.numero.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                  )}
                />
                {touched.has("numero") && validation.numero?.error && (
                  <p className={errorClassName}>{validation.numero.error}</p>
                )}
              </div>

              <div>
                <label className={labelClassName}>Complemento</label>
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
                  className={`${inputClassName("")} capitalize`}
                />
              </div>
            </div>

            <div>
              <label className={labelClassName}>Bairro{requiredSpan}</label>
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
                className={`${inputClassName(touched.has("bairro") && validation.bairro ? (validation.bairro.isValid ? "valid" : "invalid") : "")} capitalize`}
              />
              {touched.has("bairro") && validation.bairro?.error && (
                <p className={errorClassName}>{validation.bairro.error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Estado{requiredSpan}</label>
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
                  className={selectClassName(
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
                  <p className={errorClassName}>{validation.estado.error}</p>
                )}
              </div>

              <div>
                <label className={labelClassName}>Cidade{requiredSpan}</label>
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
                  className={selectClassName(
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
                  <p className={errorClassName}>{validation.cidade.error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsible Section */}
      {showResponsibleSection && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className={sectionTitleClassName}>Dados do Responsável Legal</h3>

          <p className="text-sm text-muted-foreground -mt-3 mb-4">
            {beneficiaryAge !== null && beneficiaryAge < 18
              ? "Como o beneficiário é menor de 18 anos, precisamos dos dados do responsável legal."
              : "Como o beneficiário necessita de acompanhamento constante, precisamos dos dados do responsável legal ou curador."}
          </p>

          <div className="space-y-4">
            <div>
              <label className={labelClassName}>
                Grau de Parentesco{requiredSpan}
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
                className={selectClassName(
                  getFieldState("responsavel", "parentesco"),
                )}
              >
                {PARENTESCO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {getError("responsavel", "parentesco") && (
                <p className={errorClassName}>
                  {getError("responsavel", "parentesco")}
                </p>
              )}
            </div>

            <div>
              <label className={labelClassName}>
                Nome Completo do Responsável{requiredSpan}
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
                className={`${inputClassName(getFieldState("responsavel", "nome"))} capitalize`}
              />
              {getError("responsavel", "nome") && (
                <p className={errorClassName}>
                  {getError("responsavel", "nome")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>
                  Nacionalidade{requiredSpan}
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
                  className={selectClassName(
                    getFieldState("responsavel", "nacionalidade"),
                  )}
                >
                  {NACIONALIDADES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("responsavel", "nacionalidade") && (
                  <p className={errorClassName}>
                    {getError("responsavel", "nacionalidade")}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClassName}>
                  Estado Civil{requiredSpan}
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
                  className={selectClassName(
                    getFieldState("responsavel", "estadoCivil"),
                  )}
                >
                  {ESTADOS_CIVIS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {getError("responsavel", "estadoCivil") && (
                  <p className={errorClassName}>
                    {getError("responsavel", "estadoCivil")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClassName}>Profissão{requiredSpan}</label>
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
                className={`${inputClassName(getFieldState("responsavel", "profissao"))} capitalize`}
              />
              {getError("responsavel", "profissao") && (
                <p className={errorClassName}>
                  {getError("responsavel", "profissao")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>CPF{requiredSpan}</label>
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
                  className={inputClassName(
                    getFieldState("responsavel", "cpf"),
                  )}
                />
                {getError("responsavel", "cpf") && (
                  <p className={errorClassName}>
                    {getError("responsavel", "cpf")}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClassName}>RG</label>
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
                  className={`${inputClassName(getFieldState("responsavel", "rg"))} uppercase`}
                />
                {getError("responsavel", "rg") && (
                  <p className={errorClassName}>
                    {getError("responsavel", "rg")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Same Address Checkbox */}
          <div className="pt-4 border-t border-border">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={sameAddressAsResponsible}
                onChange={(e) => {
                  setSameAddressAsResponsible(e.target.checked);
                  if (e.target.checked) {
                    setResponsibleAddressData(initialAddressData);
                  }
                }}
                className="mt-1 w-5 h-5 rounded border-2 border-border bg-secondary text-primary 
                  focus:ring-primary focus:ring-offset-0 cursor-pointer
                  checked:bg-primary checked:border-primary"
              />
              <div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  O endereço do responsável é o mesmo do beneficiário
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  Marque esta opção se o responsável reside no mesmo endereço
                </p>
              </div>
            </label>
          </div>

          {/* Responsible Address (if different) */}
          {!sameAddressAsResponsible && (
            <div className="space-y-4 pt-4 animate-in slide-in-from-top-4 duration-300">
              <h4 className="text-base font-semibold text-primary/80">
                Endereço do Responsável
              </h4>

              <div>
                <label className={labelClassName}>CEP{requiredSpan}</label>
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
                    updateValidation(
                      "resp_addr_cep",
                      responsibleAddressData.cep,
                    );
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  inputMode="numeric"
                  className={inputClassName(
                    touched.has("resp_addr_cep") && validation.resp_addr_cep
                      ? validation.resp_addr_cep.isValid
                        ? "valid"
                        : "invalid"
                      : "",
                  )}
                />
                <p className="text-muted-foreground text-xs mt-1">
                  O endereço será preenchido automaticamente
                </p>
                {loadingResponsibleCep && (
                  <p className="text-primary text-xs mt-1 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Buscando endereço...
                  </p>
                )}
                {touched.has("resp_addr_cep") &&
                  validation.resp_addr_cep?.error && (
                    <p className={errorClassName}>
                      {validation.resp_addr_cep.error}
                    </p>
                  )}
              </div>

              <div>
                <label className={labelClassName}>
                  Logradouro{requiredSpan}
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
                  className={`${inputClassName(touched.has("resp_addr_endereco") && validation.resp_addr_endereco ? (validation.resp_addr_endereco.isValid ? "valid" : "invalid") : "")} capitalize`}
                />
                {touched.has("resp_addr_endereco") &&
                  validation.resp_addr_endereco?.error && (
                    <p className={errorClassName}>
                      {validation.resp_addr_endereco.error}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>Número{requiredSpan}</label>
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
                    className={inputClassName(
                      touched.has("resp_addr_numero") &&
                        validation.resp_addr_numero
                        ? validation.resp_addr_numero.isValid
                          ? "valid"
                          : "invalid"
                        : "",
                    )}
                  />
                  {touched.has("resp_addr_numero") &&
                    validation.resp_addr_numero?.error && (
                      <p className={errorClassName}>
                        {validation.resp_addr_numero.error}
                      </p>
                    )}
                </div>

                <div>
                  <label className={labelClassName}>Complemento</label>
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
                    className={`${inputClassName("")} capitalize`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Bairro{requiredSpan}</label>
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
                  className={`${inputClassName(touched.has("resp_addr_bairro") && validation.resp_addr_bairro ? (validation.resp_addr_bairro.isValid ? "valid" : "invalid") : "")} capitalize`}
                />
                {touched.has("resp_addr_bairro") &&
                  validation.resp_addr_bairro?.error && (
                    <p className={errorClassName}>
                      {validation.resp_addr_bairro.error}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>Estado{requiredSpan}</label>
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
                    className={selectClassName(
                      touched.has("resp_addr_estado") &&
                        validation.resp_addr_estado
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
                      <p className={errorClassName}>
                        {validation.resp_addr_estado.error}
                      </p>
                    )}
                </div>

                <div>
                  <label className={labelClassName}>Cidade{requiredSpan}</label>
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
                    className={selectClassName(
                      touched.has("resp_addr_cidade") &&
                        validation.resp_addr_cidade
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
                      <p className={errorClassName}>
                        {validation.resp_addr_cidade.error}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact Section */}
      {tipoBeneficiario && (
        <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className={sectionTitleClassName}>Contato</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>Telefone{requiredSpan}</label>
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
                className={inputClassName(
                  touched.has("telefone") && validation.telefone
                    ? validation.telefone.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                )}
              />
              {touched.has("telefone") && validation.telefone?.error && (
                <p className={errorClassName}>{validation.telefone.error}</p>
              )}
            </div>

            <div>
              <label className={labelClassName}>E-mail{requiredSpan}</label>
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
                className={inputClassName(
                  touched.has("email") && validation.email
                    ? validation.email.isValid
                      ? "valid"
                      : "invalid"
                    : "",
                )}
              />
              {touched.has("email") && validation.email?.error && (
                <p className={errorClassName}>{validation.email.error}</p>
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
