import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { Phone } from "lucide-react";

interface ContactData {
  telefone: string;
  email: string;
}

interface ValidationState {
  [key: string]: { isValid: boolean; error: string };
}

interface ContactFormSectionProps {
  data: ContactData;
  validation: ValidationState;
  touched: Set<string>;
  onFieldChange: (name: keyof ContactData, value: string) => void;
  onFieldBlur: (name: keyof ContactData) => void;
  getFieldState: (name: keyof ContactData) => { isValid: boolean; isInvalid: boolean };
}

export function ContactFormSection({
  data,
  validation,
  touched,
  onFieldChange,
  onFieldBlur,
  getFieldState,
}: ContactFormSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Phone className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Contato</h3>
      </div>

      {/* Telefone + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Telefone"
          required
          error={touched.has("telefone") ? validation.telefone?.error : undefined}
        >
          <FormInput
            type="text"
            value={data.telefone}
            onChange={(e) => onFieldChange("telefone", e.target.value)}
            onBlur={() => onFieldBlur("telefone")}
            placeholder="(00) 00000-0000"
            maxLength={15}
            inputMode="numeric"
            {...getFieldState("telefone")}
          />
        </FormField>

        <FormField
          label="E-mail"
          required
          error={touched.has("email") ? validation.email?.error : undefined}
        >
          <FormInput
            type="email"
            value={data.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            onBlur={() => onFieldBlur("email")}
            placeholder="seu@email.com"
            maxLength={100}
            {...getFieldState("email")}
          />
        </FormField>
      </div>
    </div>
  );
}
