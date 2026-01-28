// ==========================================
// BPC/LOAS Form - Main form component (refactored)
// ==========================================

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Types
import type {
  AddressData,
  BeneficiaryData,
  BeneficiaryType,
  ContactData,
  ResponsibleData,
  SelectOption,
} from "@/types/form";
import {
  INITIAL_ADDRESS_DATA,
  INITIAL_BENEFICIARY_DATA,
  INITIAL_CONTACT_DATA,
  INITIAL_RESPONSIBLE_DATA,
} from "@/types/form";

// Hooks
import { useFormValidation } from "@/hooks/useFormValidation";

// Services
import {
  fetchAddressByCEP,
  fetchCitiesByState,
} from "@/services/addressService";

// Utilities
import { formatFieldValue, sanitizeFieldValue } from "@/lib/formFormatters";
import {
  calculateAge,
  capitalizeAddress,
  needsLegalGuardian,
  sanitizeText,
} from "@/lib/validations";

// Components
import {
  AddressSection,
  AgeInfoBox,
  BeneficiaryTypeSelector,
  ContactSection,
  PersonalDataSection,
  ResponsibleSection,
  SameAddressCheckbox,
} from "@/components/form";

// ==========================================
// Main Form Component
// ==========================================

export function BPCLOASForm() {
  const navigate = useNavigate();

  // ==========================================
  // Form State
  // ==========================================
  const [tipoBeneficiario, setTipoBeneficiario] = useState<BeneficiaryType>("");
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData>(
    INITIAL_BENEFICIARY_DATA,
  );
  const [responsibleData, setResponsibleData] = useState<ResponsibleData>(
    INITIAL_RESPONSIBLE_DATA,
  );
  const [addressData, setAddressData] =
    useState<AddressData>(INITIAL_ADDRESS_DATA);
  const [responsibleAddressData, setResponsibleAddressData] =
    useState<AddressData>(INITIAL_ADDRESS_DATA);
  const [contactData, setContactData] =
    useState<ContactData>(INITIAL_CONTACT_DATA);

  const [sameAddressAsResponsible, setSameAddressAsResponsible] =
    useState(false);
  const [needsAccompaniment, setNeedsAccompaniment] = useState(false);

  // Loading states
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingResponsibleCep, setLoadingResponsibleCep] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingResponsibleCities, setLoadingResponsibleCities] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // City options
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [responsibleCities, setResponsibleCities] = useState<SelectOption[]>(
    [],
  );

  // Validation hook
  const {
    validation,
    touched,
    updateValidation,
    markAsTouched,
    getFieldState,
    getError,
    isFieldValid,
  } = useFormValidation();

  // ==========================================
  // Computed Values
  // ==========================================

  const beneficiaryAge = useMemo(() => {
    if (tipoBeneficiario === "outro") {
      return calculateAge(beneficiaryData.dataNascimento);
    }
    return null;
  }, [tipoBeneficiario, beneficiaryData.dataNascimento]);

  const showResponsibleSection = useMemo(() => {
    if (tipoBeneficiario !== "outro") return false;
    return needsLegalGuardian(
      beneficiaryData.dataNascimento,
      needsAccompaniment,
    );
  }, [tipoBeneficiario, beneficiaryData.dataNascimento, needsAccompaniment]);

  // ==========================================
  // Field Handlers
  // ==========================================

  // Beneficiary handlers
  const beneficiaryHandlers = useMemo(() => {
    const prefix = tipoBeneficiario === "proprio" ? "proprio" : "beneficiario";
    return {
      onFieldChange: (field: keyof BeneficiaryData, value: string) => {
        const formattedValue = formatFieldValue(field, value);
        setBeneficiaryData((prev) => ({ ...prev, [field]: formattedValue }));
        const prefixedName = `${prefix}_${field}`;
        if (touched.has(prefixedName)) {
          updateValidation(prefixedName, formattedValue);
        }
      },
      onFieldBlur: (field: keyof BeneficiaryData) => {
        const prefixedName = `${prefix}_${field}`;
        markAsTouched(prefixedName);
        const sanitized = sanitizeFieldValue(field, beneficiaryData[field]);
        setBeneficiaryData((prev) => ({ ...prev, [field]: sanitized }));
        updateValidation(prefixedName, sanitized);
      },
    };
  }, [
    tipoBeneficiario,
    touched,
    updateValidation,
    markAsTouched,
    beneficiaryData,
  ]);

  // Responsible handlers
  const responsibleHandlers = useMemo(
    () => ({
      onFieldChange: (field: keyof ResponsibleData, value: string) => {
        const formattedValue = formatFieldValue(field, value);
        setResponsibleData((prev) => ({ ...prev, [field]: formattedValue }));
        const prefixedName = `responsavel_${field}`;
        if (touched.has(prefixedName)) {
          updateValidation(prefixedName, formattedValue);
        }
      },
      onFieldBlur: (field: keyof ResponsibleData) => {
        const prefixedName = `responsavel_${field}`;
        markAsTouched(prefixedName);
        const sanitized = sanitizeFieldValue(field, responsibleData[field]);
        setResponsibleData((prev) => ({ ...prev, [field]: sanitized }));
        updateValidation(prefixedName, sanitized);
      },
    }),
    [touched, updateValidation, markAsTouched, responsibleData],
  );

  // Contact handlers
  const contactHandlers = useMemo(
    () => ({
      onFieldChange: (field: keyof ContactData, value: string) => {
        const formattedValue = formatFieldValue(field, value);
        setContactData((prev) => ({ ...prev, [field]: formattedValue }));
        if (touched.has(field)) {
          updateValidation(field, formattedValue);
        }
      },
      onFieldBlur: (field: keyof ContactData) => {
        markAsTouched(field);
        const sanitized = sanitizeFieldValue(field, contactData[field]);
        setContactData((prev) => ({ ...prev, [field]: sanitized }));
        updateValidation(field, sanitized);
      },
      getFieldState: (field: string) => getFieldState(field),
      getError: (field: string) => getError(field),
    }),
    [
      touched,
      updateValidation,
      markAsTouched,
      getFieldState,
      getError,
      contactData,
    ],
  );

  // ==========================================
  // Address Handlers
  // ==========================================

  const createAddressHandlers = useCallback(
    (
      data: AddressData,
      setter: React.Dispatch<React.SetStateAction<AddressData>>,
      setCitiesList: React.Dispatch<React.SetStateAction<SelectOption[]>>,
      prefix: string = "",
    ) => ({
      onFieldChange: (field: keyof AddressData, value: string) => {
        const formattedValue = formatFieldValue(field, value);
        setter((prev) => ({ ...prev, [field]: formattedValue }));
        const fieldName = prefix ? `${prefix}_${field}` : field;
        if (touched.has(fieldName)) {
          updateValidation(fieldName, formattedValue);
        }
      },
      onFieldBlur: (field: keyof AddressData) => {
        const fieldName = prefix ? `${prefix}_${field}` : field;
        markAsTouched(fieldName);
        const sanitized = sanitizeFieldValue(field, data[field]);
        setter((prev) => ({ ...prev, [field]: sanitized }));
        updateValidation(fieldName, sanitized);
      },
      onStateChange: async (value: string) => {
        setter((prev) => ({ ...prev, estado: value, cidade: "" }));
        const fieldName = prefix ? `${prefix}_estado` : "estado";
        markAsTouched(fieldName);
        updateValidation(fieldName, value);

        if (value) {
          const setLoading =
            prefix === "resp_addr"
              ? setLoadingResponsibleCities
              : setLoadingCities;
          setLoading(true);
          const citiesData = await fetchCitiesByState(value);
          setCitiesList(
            citiesData.map((c) => ({ value: c.nome, label: c.nome })),
          );
          setLoading(false);
        }
      },
      getFieldState: (field: string) => getFieldState(field),
      getError: (field: string) => getError(field),
    }),
    [touched, updateValidation, markAsTouched, getFieldState, getError],
  );

  const addressHandlers = useMemo(
    () => createAddressHandlers(addressData, setAddressData, setCities),
    [createAddressHandlers, addressData],
  );

  const responsibleAddressHandlers = useMemo(
    () =>
      createAddressHandlers(
        responsibleAddressData,
        setResponsibleAddressData,
        setResponsibleCities,
        "resp_addr",
      ),
    [createAddressHandlers, responsibleAddressData],
  );

  // ==========================================
  // CEP Lookup Effects
  // ==========================================

  // Beneficiary CEP lookup
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
        }
      } catch {
        console.error("Erro ao buscar CEP");
      }
      setLoadingCep(false);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [addressData.cep]);

  // Responsible CEP lookup
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
        }
      } catch {
        console.error("Erro ao buscar CEP do responsável");
      }
      setLoadingResponsibleCep(false);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [responsibleAddressData.cep, sameAddressAsResponsible]);

  // ==========================================
  // Form Validation
  // ==========================================

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
    const contactFields: (keyof ContactData)[] = ["telefone", "email"];

    const addressValid = addressFields.every((f) =>
      isFieldValid(f, addressData[f]),
    );
    const contactValid = contactFields.every((f) =>
      isFieldValid(f, contactData[f]),
    );

    if (!addressValid || !contactValid) return false;

    const beneficiaryFields: (keyof BeneficiaryData)[] = [
      "nome",
      "dataNascimento",
      "nacionalidade",
      "estadoCivil",
      "profissao",
      "cpf",
    ];
    const prefix = tipoBeneficiario === "proprio" ? "proprio" : "beneficiario";
    const beneficiaryValid = beneficiaryFields.every((f) =>
      isFieldValid(`${prefix}_${f}`, beneficiaryData[f]),
    );

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
      const responsibleValid = responsibleFields.every((f) =>
        isFieldValid(`responsavel_${f}`, responsibleData[f]),
      );
      if (!responsibleValid) return false;

      if (!sameAddressAsResponsible) {
        const respAddrValid = addressFields.every((f) =>
          isFieldValid(`resp_addr_${f}`, responsibleAddressData[f]),
        );
        if (!respAddrValid) return false;
      }
    }

    return true;
  }, [
    tipoBeneficiario,
    beneficiaryData,
    responsibleData,
    addressData,
    responsibleAddressData,
    contactData,
    showResponsibleSection,
    sameAddressAsResponsible,
    isFieldValid,
  ]);

  // ==========================================
  // Form Submission
  // ==========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      tipo_caso: "bpc_loas_autismo",
      tipo_beneficiario: tipoBeneficiario,
      dataEnvio: new Date().toISOString(),
      telefone: contactData.telefone.replace(/\D/g, ""),
      email: contactData.email.trim().toLowerCase(),
    };

    if (tipoBeneficiario === "proprio") {
      Object.assign(payload, {
        nome: sanitizeText(beneficiaryData.nome),
        data_nascimento: beneficiaryData.dataNascimento,
        nacionalidade: beneficiaryData.nacionalidade,
        estadoCivil: beneficiaryData.estadoCivil,
        profissao: sanitizeText(beneficiaryData.profissao),
        cpf: beneficiaryData.cpf.replace(/\D/g, ""),
        rg: beneficiaryData.rg.trim(),
        cep: addressData.cep.replace(/\D/g, ""),
        endereco: sanitizeText(addressData.endereco),
        numero: addressData.numero.trim().toUpperCase(),
        complemento: sanitizeText(addressData.complemento),
        bairro: sanitizeText(addressData.bairro),
        cidade: addressData.cidade,
        estado: addressData.estado,
      });
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
        necessita_acompanhamento: needsAccompaniment,
        endereco: {
          cep: addressData.cep.replace(/\D/g, ""),
          logradouro: sanitizeText(addressData.endereco),
          numero: addressData.numero.trim().toUpperCase(),
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
          mesmo_endereco_beneficiario: sameAddressAsResponsible,
          endereco: {
            cep: respAddr.cep.replace(/\D/g, ""),
            logradouro: sanitizeText(respAddr.endereco),
            numero: respAddr.numero.trim().toUpperCase(),
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
        navigate("/sucesso");
      } else {
        throw new Error("Erro ao processar solicitação.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro ao enviar formulário. Tente novamente.");
    }

    setIsSubmitting(false);
  };

  // ==========================================
  // Type Change Handler
  // ==========================================

  const handleTypeChange = useCallback((type: BeneficiaryType) => {
    setTipoBeneficiario(type);
    setBeneficiaryData(INITIAL_BENEFICIARY_DATA);
    setResponsibleData(INITIAL_RESPONSIBLE_DATA);
    setNeedsAccompaniment(false);
    setSameAddressAsResponsible(false);
  }, []);

  // ==========================================
  // Render
  // ==========================================

  const prefix = tipoBeneficiario === "proprio" ? "proprio" : "beneficiario";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Seleção de tipo de beneficiário */}
      <BeneficiaryTypeSelector
        value={tipoBeneficiario}
        onChange={handleTypeChange}
      />

      {/* Dados do beneficiário */}
      {tipoBeneficiario && (
        <PersonalDataSection
          title={
            tipoBeneficiario === "proprio"
              ? "Seus Dados"
              : "Dados do Beneficiário"
          }
          data={beneficiaryData}
          prefix={prefix}
          onFieldChange={beneficiaryHandlers.onFieldChange}
          onFieldBlur={beneficiaryHandlers.onFieldBlur}
          getFieldState={(field) => getFieldState(`${prefix}_${field}`)}
          getError={(field) => getError(`${prefix}_${field}`)}
          birthDateInfo={
            tipoBeneficiario === "outro" && beneficiaryAge !== null ? (
              <AgeInfoBox
                age={beneficiaryAge}
                needsAccompaniment={needsAccompaniment}
                onAccompanimentChange={setNeedsAccompaniment}
              />
            ) : undefined
          }
        />
      )}

      {/* Endereço do beneficiário */}
      {tipoBeneficiario && (
        <AddressSection
          title={
            tipoBeneficiario === "proprio"
              ? "Endereço"
              : "Endereço do Beneficiário"
          }
          data={addressData}
          cities={cities}
          loadingCep={loadingCep}
          loadingCities={loadingCities}
          onFieldChange={addressHandlers.onFieldChange}
          onFieldBlur={addressHandlers.onFieldBlur}
          onStateChange={addressHandlers.onStateChange}
          getFieldState={getFieldState}
          getError={getError}
        />
      )}

      {/* Seção do responsável */}
      {showResponsibleSection && (
        <>
          <ResponsibleSection
            data={responsibleData}
            prefix="responsavel"
            onFieldChange={responsibleHandlers.onFieldChange}
            onFieldBlur={responsibleHandlers.onFieldBlur}
            getFieldState={(field) => getFieldState(`responsavel_${field}`)}
            getError={(field) => getError(`responsavel_${field}`)}
            description={
              beneficiaryAge !== null && beneficiaryAge < 18
                ? "Como o beneficiário é menor de 18 anos, precisamos dos dados do responsável legal."
                : "Como o beneficiário necessita de acompanhamento constante, precisamos dos dados do responsável legal ou curador."
            }
          />

          <SameAddressCheckbox
            checked={sameAddressAsResponsible}
            onChange={(checked) => {
              setSameAddressAsResponsible(checked);
              if (checked) {
                setResponsibleAddressData(INITIAL_ADDRESS_DATA);
              }
            }}
          />

          {/* Endereço do responsável */}
          {!sameAddressAsResponsible && (
            <AddressSection
              title="Endereço do Responsável"
              data={responsibleAddressData}
              prefix="resp_addr"
              cities={responsibleCities}
              loadingCep={loadingResponsibleCep}
              loadingCities={loadingResponsibleCities}
              onFieldChange={responsibleAddressHandlers.onFieldChange}
              onFieldBlur={responsibleAddressHandlers.onFieldBlur}
              onStateChange={responsibleAddressHandlers.onStateChange}
              getFieldState={(field) => getFieldState(`resp_addr_${field}`)}
              getError={(field) => getError(`resp_addr_${field}`)}
            />
          )}
        </>
      )}

      {/* Contato */}
      {tipoBeneficiario && (
        <ContactSection
          data={contactData}
          onFieldChange={contactHandlers.onFieldChange}
          onFieldBlur={contactHandlers.onFieldBlur}
          getFieldState={contactHandlers.getFieldState}
          getError={contactHandlers.getError}
        />
      )}

      {/* Botão de envio */}
      {tipoBeneficiario && (
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          className="w-full py-4 bg-primary text-primary-foreground font-semibold rounded-lg
            hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
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
