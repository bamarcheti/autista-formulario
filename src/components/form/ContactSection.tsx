// ==========================================
// Contact Section - Phone and email fields
// ==========================================

import {
  errorClassName,
  getInputClassName,
  labelClassName,
} from "@/lib/formStyles";
import type { ContactData } from "@/types/form";
import { Phone } from "lucide-react";

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
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Phone className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Contato</h3>
      </div>
      {/* <h3 className={sectionTitleClassName}>Contato</h3> */}

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
