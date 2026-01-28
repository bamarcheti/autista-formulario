// ==========================================
// Contact Section - Phone and email fields
// ==========================================

import type { ContactData } from "@/types/form";
import {
  getInputClassName,
  labelClassName,
  errorClassName,
  sectionTitleClassName,
} from "@/lib/formStyles";

interface ContactSectionProps {
  data: ContactData;
  onFieldChange: (field: keyof ContactData, value: string) => void;
  onFieldBlur: (field: keyof ContactData) => void;
  getFieldState: (field: string) => "valid" | "invalid" | "";
  getError: (field: string) => string | undefined;
}

export function ContactSection({
  data,
  onFieldChange,
  onFieldBlur,
  getFieldState,
  getError,
}: ContactSectionProps) {
  return (
    <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
      <h3 className={sectionTitleClassName}>Contato</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClassName}>
            Telefone<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.telefone}
            onChange={(e) => onFieldChange("telefone", e.target.value)}
            onBlur={() => onFieldBlur("telefone")}
            placeholder="(00) 00000-0000"
            maxLength={15}
            inputMode="numeric"
            className={getInputClassName(getFieldState("telefone"))}
          />
          {getError("telefone") && (
            <p className={errorClassName}>{getError("telefone")}</p>
          )}
        </div>

        <div>
          <label className={labelClassName}>
            E-mail<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            onBlur={() => onFieldBlur("email")}
            placeholder="seu@email.com"
            maxLength={100}
            className={getInputClassName(getFieldState("email"))}
          />
          {getError("email") && (
            <p className={errorClassName}>{getError("email")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
