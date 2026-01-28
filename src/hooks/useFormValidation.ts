// ==========================================
// Form Validation Hook - Validation logic
// ==========================================

import { useCallback, useState } from "react";
import type { FieldValidation, ValidationState } from "@/types/form";
import {
  validateCPF,
  validatePhoneBR,
  validateRG,
  validateEmail,
} from "@/lib/validations";

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
    (name: string, value: string): FieldValidation => {
      // Remove prefixos para validação genérica
      const baseName = name.replace(
        /^(beneficiario_|responsavel_|proprio_|resp_addr_)/,
        ""
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
    []
  );

  /**
   * Atualiza o estado de validação de um campo
   */
  const updateValidation = useCallback(
    (name: string, value: string) => {
      const result = validateField(name, value);
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
    (name: string, value: string): boolean => {
      return validateField(name, value).isValid;
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
