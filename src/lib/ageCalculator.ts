// ==========================================
// Age Calculator - Utility for age calculations
// ==========================================

/**
 * Calcula a idade baseada na data de nascimento
 */
export function calculateAge(birthDate: string): number | null {
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

/**
 * Verifica se é menor de idade
 */
export function isMinor(birthDate: string): boolean {
  const age = calculateAge(birthDate);
  return age !== null && age < 18;
}

/**
 * Verifica se precisa de responsável legal
 */
export function needsLegalGuardian(
  birthDate: string,
  needsAccompaniment: boolean
): boolean {
  const age = calculateAge(birthDate);
  if (age === null) return false;
  return age < 18 || needsAccompaniment;
}
