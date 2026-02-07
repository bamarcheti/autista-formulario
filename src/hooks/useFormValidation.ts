// ==========================================
// Form Validation Hook - Validation logic
// ==========================================

import { useCallback, useState } from "react";
import type { FieldValidation, ValidationState } from "@/types/form";
import {
  validateCPF,
  validatePassport,
  validatePhoneBR,
  validateRG,
  validateEmail,
  validateFullName,
  validateBirthDate,
  validateProfession,
  validateCEP,
  validateAddressField,
  validateAddressNumber,
  validateComplement,
  validateRequiredSelect,
} from "@/lib/validations";

interface ValidationContext {
  nacionalidade?: string;
}

/**
 * Hook para gerenciar validação de campos do formulário
 */
export function useFormValidation() {
  const [validation, setValidation] = useState<ValidationState>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  /**
   * Valida um campo específico baseado no nome
   */
  const validateField = useCallback(
    (name: string, value: string, context?: ValidationContext): FieldValidation => {
      // Remove prefixos para validação genérica
      const baseName = name.replace(
        /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
        ""
      );

      switch (baseName) {
        case "tipoBeneficiario":
          return validateRequiredSelect(value, "para quem é o atendimento");

        case "nome":
          return validateFullName(value);

        case "dataNascimento":
          return validateBirthDate(value);

        case "profissao":
          return validateProfession(value);

        case "cpf": {
          // Se for estrangeiro, valida passaporte
          const isEstrangeiro = context?.nacionalidade === "Estrangeiro(a)";
          if (isEstrangeiro) {
            const isValid = validatePassport(value);
            return {
              isValid,
              error: isValid ? "" : "Passaporte inválido. Formato: AA123456 (2 letras + 6 números)",
            };
          }
          return {
            isValid: validateCPF(value),
            error: validateCPF(value)
              ? ""
              : "CPF inválido. Verifique os números digitados",
          };
        }

        case "rg":
          return {
            isValid: validateRG(value),
            error: validateRG(value) ? "" : "RG inválido",
          };

        case "parentesco":
          return validateRequiredSelect(value, "o grau de parentesco");

        case "cep":
          return validateCEP(value);

        case "endereco":
        case "bairro":
          return validateAddressField(value);

        case "numero":
          return validateAddressNumber(value);

        case "complemento":
          return validateComplement(value);

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
          return validateRequiredSelect(value);

        default:
          return { isValid: true, error: "" };
      }
    },
    []
  );

  /**
   * Atualiza o estado de validação de um campo
   */
  const updateValidation = useCallback(
    (name: string, value: string, context?: ValidationContext) => {
      const result = validateField(name, value, context);
      setValidation((prev) => ({ ...prev, [name]: result }));
      return result;
    },
    [validateField]
  );

  /**
   * Marca um campo como tocado
   */
  const markAsTouched = useCallback((name: string) => {
    setTouched((prev) => new Set(prev).add(name));
  }, []);

  /**
   * Obtém o estado visual do campo (valid/invalid/"")
   */
  const getFieldState = useCallback(
    (name: string): "valid" | "invalid" | "" => {
      const v = validation[name];
      if (!touched.has(name) || !v) return "";
      return v.isValid ? "valid" : "invalid";
    },
    [validation, touched]
  );

  /**
   * Obtém mensagem de erro do campo
   */
  const getError = useCallback(
    (name: string): string | undefined => {
      const v = validation[name];
      if (!touched.has(name) || !v) return undefined;
      return v.error || undefined;
    },
    [validation, touched]
  );

  /**
   * Valida se um campo está válido
   */
  const isFieldValid = useCallback(
    (name: string, value: string, context?: ValidationContext): boolean => {
      return validateField(name, value, context).isValid;
    },
    [validateField]
  );

  return {
    validation,
    touched,
    validateField,
    updateValidation,
    markAsTouched,
    getFieldState,
    getError,
    isFieldValid,
  };
}
