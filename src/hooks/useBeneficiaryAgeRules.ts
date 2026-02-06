// ==========================================
// useBeneficiaryAgeRules - Hook para regras de idade e responsável legal
// ==========================================
// 
// REGRAS DE NEGÓCIO (para facilitar manutenção futura):
// 
// 1. MENOR DE 18 ANOS: Responsável legal é SEMPRE obrigatório
//    - Não há exceção para 14-17 anos
//    - Menores não podem responder por si mesmos
// 
// 2. MAIOR DE 18 ANOS:
//    - Responsável legal NÃO é obrigatório por padrão
//    - Se o beneficiário possui curatela/tutela/representação legal,
//      o responsável passa a ser obrigatório (toggle hasLegalRepresentative)
// 
// Para alterar essas regras, modifique as constantes abaixo:
// ==========================================

import { useMemo } from "react";
import { calculateAge } from "@/lib/validations";

/** Idade mínima para não precisar de responsável automático */
const ADULT_AGE = 18;

export interface BeneficiaryAgeRules {
  /** Idade calculada do beneficiário (null se data inválida) */
  age: number | null;
  
  /** Se o beneficiário é menor de idade */
  isMinor: boolean;
  
  /** Se o responsável é obrigatório automaticamente (menor de 18) */
  requiresGuardian: boolean;
  
  /** Se o responsável é opcional (>=18 sem toggle) */
  guardianOptional: boolean;
  
  /** Se o responsável é obrigatório pelo toggle de representante (>=18 && toggle true) */
  guardianRequiredByRepresentativeToggle: boolean;
  
  /** Resultado final: se a seção de responsável deve ser exibida/obrigatória */
  showResponsibleSection: boolean;
  
  /** Mensagem descritiva da situação atual */
  ageMessage: string;
  
  /** Descrição para a seção de responsável legal */
  responsibleSectionDescription: string;
}

interface UseBeneficiaryAgeRulesParams {
  /** Data de nascimento no formato YYYY-MM-DD */
  birthDate: string;
  
  /** Se foi marcado que o beneficiário possui representante legal (curatela/tutela) */
  hasLegalRepresentative: boolean;
  
  /** Tipo de beneficiário: 'proprio' ou 'outro' */
  beneficiaryType: "" | "proprio" | "outro";
}

/**
 * Hook que centraliza todas as regras de idade e responsável legal
 * 
 * @example
 * const rules = useBeneficiaryAgeRules({
 *   birthDate: "2010-05-15",
 *   hasLegalRepresentative: false,
 *   beneficiaryType: "proprio"
 * });
 * 
 * if (rules.showResponsibleSection) {
 *   // Mostrar seção de responsável
 * }
 */
export function useBeneficiaryAgeRules({
  birthDate,
  hasLegalRepresentative,
  beneficiaryType,
}: UseBeneficiaryAgeRulesParams): BeneficiaryAgeRules {
  return useMemo(() => {
    const age = calculateAge(birthDate);
    
    // Flags base
    const isMinor = age !== null && age < ADULT_AGE;
    const isAdult = age !== null && age >= ADULT_AGE;
    
    // Regra 1: Menor de 18 sempre precisa de responsável
    const requiresGuardian = isMinor;
    
    // Regra 2: Maior de 18 - responsável é opcional por padrão
    const guardianOptional = isAdult && !hasLegalRepresentative;
    
    // Regra 3: Maior de 18 com toggle marcado - responsável obrigatório
    const guardianRequiredByRepresentativeToggle = isAdult && hasLegalRepresentative;
    
    // Resultado final: mostrar seção de responsável
    const showResponsibleSection = requiresGuardian || guardianRequiredByRepresentativeToggle;
    
    // Mensagens
    const isSelf = beneficiaryType === "proprio";
    
    let ageMessage = "";
    if (age !== null) {
      ageMessage = `Idade do beneficiário: ${age} ano${age !== 1 ? "s" : ""}`;
      if (isMinor) {
        ageMessage += " • Menor de idade — é obrigatório informar o responsável legal.";
      }
    }
    
    let responsibleSectionDescription = "";
    if (showResponsibleSection) {
      if (isMinor) {
        responsibleSectionDescription = isSelf
          ? "Como você é menor de 18 anos, é obrigatório informar os dados do seu responsável legal."
          : "Como o beneficiário é menor de 18 anos, é obrigatório informar os dados do responsável legal.";
      } else if (guardianRequiredByRepresentativeToggle) {
        responsibleSectionDescription = "Informe os dados do responsável/representante legal do beneficiário.";
      }
    }
    
    return {
      age,
      isMinor,
      requiresGuardian,
      guardianOptional,
      guardianRequiredByRepresentativeToggle,
      showResponsibleSection,
      ageMessage,
      responsibleSectionDescription,
    };
  }, [birthDate, hasLegalRepresentative, beneficiaryType]);
}
