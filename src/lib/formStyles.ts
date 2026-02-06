// ==========================================
// Form Styles - Reusable className utilities
// ==========================================

/**
 * Classes para inputs baseado no estado de validação
 */
export function getInputClassName(state: "valid" | "invalid" | ""): string {
  const baseClasses = `
    w-full px-4 py-3.5 rounded-xl border-2 bg-secondary text-foreground
    placeholder:text-muted-foreground transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/20
    text-sm
  `;

  const stateClasses =
    state === "valid"
      ? "border-success/50 focus:border-success"
      : state === "invalid"
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-primary hover:border-primary/50";

  return `${baseClasses} ${stateClasses}`;
}

/**
 * Classes para selects baseado no estado de validação
 */
export function getSelectClassName(state: "valid" | "invalid" | ""): string {
  const baseClasses = `
    w-full px-4 py-3.5 rounded-xl border-2 bg-secondary text-foreground
    transition-all duration-200 cursor-pointer appearance-none
    focus:outline-none focus:ring-2 focus:ring-primary/20
    text-sm
    bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")]
    bg-no-repeat bg-[right_14px_center] bg-[length:18px]
  `;

  const stateClasses =
    state === "valid"
      ? "border-success/50 focus:border-success"
      : state === "invalid"
        ? "border-destructive focus:border-destructive"
        : "border-border focus:border-primary hover:border-primary/50";

  return `${baseClasses} ${stateClasses}`;
}

/** Classes para labels */
export const labelClassName = "block text-sm font-medium text-foreground/80 mb-2";

/** Span para indicar campo obrigatório */
export const requiredIndicator = "text-destructive ml-1";

/** Classes para mensagens de erro */
export const errorClassName = "text-destructive text-xs mt-1.5 font-medium";

/** Classes para títulos de seção */
export const sectionTitleClassName =
  "text-lg font-semibold text-primary pb-3 border-b border-border";
