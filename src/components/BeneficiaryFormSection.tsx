import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { NACIONALIDADES, ESTADOS_CIVIS } from "@/lib/brazilData";

interface BeneficiaryData {
  nome: string;
  dataNascimento: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  cpf: string;
  rg: string;
}

interface ValidationState {
  [key: string]: { isValid: boolean; error: string };
}

interface BeneficiaryFormSectionProps {
  data: BeneficiaryData;
  validation: ValidationState;
  touched: Set<string>;
  onFieldChange: (name: keyof BeneficiaryData, value: string) => void;
  onFieldBlur: (name: keyof BeneficiaryData) => void;
  getFieldState: (name: keyof BeneficiaryData) => { isValid: boolean; isInvalid: boolean };
  prefix?: string;
}

export function BeneficiaryFormSection({
  data,
  validation,
  touched,
  onFieldChange,
  onFieldBlur,
  getFieldState,
  prefix = "beneficiario",
}: BeneficiaryFormSectionProps) {
  const fieldName = (name: string) => `${prefix}_${name}` as keyof BeneficiaryData;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <h3 className="text-lg font-semibold text-primary">Dados do Beneficiário</h3>
      </div>

      {/* Nome */}
      <FormField
        label="Nome Completo do Beneficiário"
        required
        error={touched.has("nome") ? validation.nome?.error : undefined}
      >
        <FormInput
          type="text"
          value={data.nome}
          onChange={(e) => onFieldChange("nome", e.target.value)}
          onBlur={() => onFieldBlur("nome")}
          placeholder="Digite o nome completo do beneficiário"
          maxLength={100}
          className="capitalize"
          {...getFieldState("nome")}
        />
      </FormField>

      {/* Data de Nascimento */}
      <FormField
        label="Data de Nascimento"
        required
        error={touched.has("dataNascimento") ? validation.dataNascimento?.error : undefined}
      >
        <FormInput
          type="date"
          value={data.dataNascimento}
          onChange={(e) => onFieldChange("dataNascimento", e.target.value)}
          onBlur={() => onFieldBlur("dataNascimento")}
          max={new Date().toISOString().split("T")[0]}
          {...getFieldState("dataNascimento")}
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
