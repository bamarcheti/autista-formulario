// ==========================================
// Beneficiary Type Selector - Choose self or other
// ==========================================

import { User, Users } from "lucide-react";
import type { BeneficiaryType } from "@/types/form";

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
      <label className="block text-sm font-medium text-foreground/80">
        Para quem é o atendimento jurídico?
        <span className="text-destructive ml-1">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("proprio")}
          className={`p-5 rounded-xl border-2 text-left transition-all duration-200 group ${
            value === "proprio"
              ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                value === "proprio"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              }`}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-foreground block">
                Para mim mesmo
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Sou eu quem precisa do atendimento jurídico
              </p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange("outro")}
          className={`p-5 rounded-xl border-2 text-left transition-all duration-200 group ${
            value === "outro"
              ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                value === "outro"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-foreground block">
                Para outra pessoa
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                Estou cadastrando um familiar ou dependente
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
