import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { NACIONALIDADES, ESTADOS_CIVIS } from "@/lib/brazilData";
import { UserCheck } from "lucide-react";

interface ResponsibleData {
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
  parentesco: string;
}

interface ValidationState {
  [key: string]: { isValid: boolean; error: string };
}

interface ResponsibleFormSectionProps {
  data: ResponsibleData;
  validation: ValidationState;
  touched: Set<string>;
  onFieldChange: (name: keyof ResponsibleData, value: string) => void;
  onFieldBlur: (name: keyof ResponsibleData) => void;
  getFieldState: (name: keyof ResponsibleData) => { isValid: boolean; isInvalid: boolean };
}

const PARENTESCO_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "Pai", label: "Pai" },
  { value: "Mãe", label: "Mãe" },
  { value: "Avô", label: "Avô" },
  { value: "Avó", label: "Avó" },
  { value: "Tutor Legal", label: "Tutor Legal" },
  { value: "Curador", label: "Curador" },
  { value: "Outro", label: "Outro" },
];

export function ResponsibleFormSection({
  data,
  validation,
  touched,
  onFieldChange,
  onFieldBlur,
  getFieldState,
}: ResponsibleFormSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Dados do Responsável Legal</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Como o beneficiário é menor de 18 anos, precisamos dos dados do responsável legal.
      </p>

      {/* Parentesco */}
      <FormField
        label="Grau de Parentesco"
        required
        error={touched.has("parentesco") ? validation.parentesco?.error : undefined}
      >
        <FormSelect
          value={data.parentesco}
          onChange={(e) => onFieldChange("parentesco", e.target.value)}
          options={PARENTESCO_OPTIONS}
          {...getFieldState("parentesco")}
        />
      </FormField>

      {/* Nome */}
      <FormField
        label="Nome Completo do Responsável"
        required
        error={touched.has("nome") ? validation.nome?.error : undefined}
      >
        <FormInput
          type="text"
          value={data.nome}
          onChange={(e) => onFieldChange("nome", e.target.value)}
          onBlur={() => onFieldBlur("nome")}
          placeholder="Digite o nome completo do responsável"
          maxLength={100}
          className="capitalize"
          {...getFieldState("nome")}
        />
      </FormField>

      {/* Nacionalidade + Estado Civil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nacionalidade"
          required
          error={touched.has("nacionalidade") ? validation.nacionalidade?.error : undefined}
        >
          <FormSelect
            value={data.nacionalidade}
            onChange={(e) => onFieldChange("nacionalidade", e.target.value)}
            options={NACIONALIDADES}
            {...getFieldState("nacionalidade")}
          />
        </FormField>

        <FormField
          label="Estado Civil"
          required
          error={touched.has("estadoCivil") ? validation.estadoCivil?.error : undefined}
        >
          <FormSelect
            value={data.estadoCivil}
            onChange={(e) => onFieldChange("estadoCivil", e.target.value)}
            options={ESTADOS_CIVIS}
            {...getFieldState("estadoCivil")}
          />
        </FormField>
      </div>

      {/* Profissão */}
      <FormField
        label="Profissão"
        required
        error={touched.has("profissao") ? validation.profissao?.error : undefined}
      >
        <FormInput
          type="text"
          value={data.profissao}
          onChange={(e) => onFieldChange("profissao", e.target.value)}
          onBlur={() => onFieldBlur("profissao")}
          placeholder="Digite a profissão"
          maxLength={80}
          className="capitalize"
          {...getFieldState("profissao")}
        />
      </FormField>

      {/* CPF + RG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="CPF"
          required
          error={touched.has("cpf") ? validation.cpf?.error : undefined}
        >
          <FormInput
            type="text"
            value={data.cpf}
            onChange={(e) => onFieldChange("cpf", e.target.value)}
            onBlur={() => onFieldBlur("cpf")}
            placeholder="000.000.000-00"
            maxLength={14}
            inputMode="numeric"
            {...getFieldState("cpf")}
          />
        </FormField>

        <FormField
          label="RG"
          error={touched.has("rg") ? validation.rg?.error : undefined}
        >
          <FormInput
            type="text"
            value={data.rg}
            onChange={(e) => onFieldChange("rg", e.target.value)}
            onBlur={() => onFieldBlur("rg")}
            placeholder="Ex: 12.345.678-9"
            maxLength={26}
            className="uppercase"
            {...getFieldState("rg")}
          />
        </FormField>
      </div>
    </div>
  );
}
