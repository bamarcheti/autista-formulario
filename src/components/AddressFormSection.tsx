import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { ESTADOS_BR } from "@/lib/brazilData";
import { MapPin } from "lucide-react";

interface AddressData {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
}

interface ValidationState {
  [key: string]: { isValid: boolean; error: string };
}

interface AddressFormSectionProps {
  data: AddressData;
  validation: ValidationState;
  touched: Set<string>;
  cities: { value: string; label: string }[];
  loadingCep: boolean;
  loadingCities: boolean;
  onFieldChange: (name: keyof AddressData, value: string) => void;
  onFieldBlur: (name: keyof AddressData) => void;
  getFieldState: (name: keyof AddressData) => { isValid: boolean; isInvalid: boolean };
  onStateChange: (value: string) => void;
}

export function AddressFormSection({
  data,
  validation,
  touched,
  cities,
  loadingCep,
  loadingCities,
  onFieldChange,
  onFieldBlur,
  getFieldState,
  onStateChange,
}: AddressFormSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">Endereço</h3>
      </div>

      {/* CEP */}
      <FormField
        label="CEP"
        required
        error={touched.has("cep") ? validation.cep?.error : undefined}
        helper="O endereço será preenchido automaticamente"
        loading={loadingCep}
        loadingText="Buscando endereço..."
      >
        <FormInput
          type="text"
          value={data.cep}
          onChange={(e) => onFieldChange("cep", e.target.value)}
          onBlur={() => onFieldBlur("cep")}
          placeholder="00000-000"
          maxLength={9}
          inputMode="numeric"
          {...getFieldState("cep")}
        />
      </FormField>

      {/* Logradouro */}
      <FormField
        label="Logradouro"
        required
        error={touched.has("endereco") ? validation.endereco?.error : undefined}
      >
        <FormInput
          type="text"
          value={data.endereco}
          onChange={(e) => onFieldChange("endereco", e.target.value)}
          onBlur={() => onFieldBlur("endereco")}
          placeholder="Rua, Avenida, etc."
          maxLength={150}
          className="capitalize"
          {...getFieldState("endereco")}
        />
      </FormField>

      {/* Número + Complemento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Número"
          required
          error={touched.has("numero") ? validation.numero?.error : undefined}
        >
          <FormInput
            type="text"
            value={data.numero}
            onChange={(e) => onFieldChange("numero", e.target.value)}
            onBlur={() => onFieldBlur("numero")}
            placeholder="Nº ou S/N"
            maxLength={10}
            {...getFieldState("numero")}
          />
        </FormField>

        <FormField label="Complemento">
          <FormInput
            type="text"
            value={data.complemento}
            onChange={(e) => onFieldChange("complemento", e.target.value)}
            onBlur={() => onFieldBlur("complemento")}
            placeholder="Apto, Bloco, etc."
            maxLength={50}
            className="capitalize"
          />
        </FormField>
      </div>

      {/* Bairro */}
      <FormField
        label="Bairro"
        required
        error={touched.has("bairro") ? validation.bairro?.error : undefined}
      >
        <FormInput
          type="text"
          value={data.bairro}
          onChange={(e) => onFieldChange("bairro", e.target.value)}
          onBlur={() => onFieldBlur("bairro")}
          placeholder="Digite o bairro"
          maxLength={80}
          className="capitalize"
          {...getFieldState("bairro")}
        />
      </FormField>

      {/* Estado + Cidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Estado"
          required
          error={touched.has("estado") ? validation.estado?.error : undefined}
        >
          <FormSelect
            value={data.estado}
            onChange={(e) => onStateChange(e.target.value)}
            options={ESTADOS_BR}
            {...getFieldState("estado")}
          />
        </FormField>

        <FormField
          label="Cidade"
          required
          error={touched.has("cidade") ? validation.cidade?.error : undefined}
        >
          <FormSelect
            value={data.cidade}
            onChange={(e) => onFieldChange("cidade", e.target.value)}
            options={cities}
            placeholder={loadingCities ? "Carregando..." : data.estado ? "Selecione a cidade" : "Selecione o estado primeiro"}
            disabled={!data.estado || loadingCities}
            {...getFieldState("cidade")}
          />
        </FormField>
      </div>
    </div>
  );
}
