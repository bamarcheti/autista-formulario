// ==========================================
// Beneficiary Type Selector - Choose self or other
// ==========================================

import type { BeneficiaryType } from "@/types/form";
import { labelClassName } from "@/lib/formStyles";

interface BeneficiaryTypeSelectorProps {
  value: BeneficiaryType;
  onChange: (type: BeneficiaryType) => void;
}

export function BeneficiaryTypeSelector({
  value,
  onChange,
}: BeneficiaryTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className={labelClassName}>
        Para quem é o benefício?
        <span className="text-destructive ml-1">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("proprio")}
          className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
            value === "proprio"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
        >
          <span className="font-semibold text-foreground">Para mim mesmo</span>
          <p className="text-sm text-muted-foreground mt-1">
            Eu sou o beneficiário
          </p>
        </button>
        <button
          type="button"
          onClick={() => onChange("outro")}
          className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
            value === "outro"
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
  );
}
