// ==========================================
// Address Section - Address fields with CEP lookup
// ==========================================

import { ESTADOS_BR } from "@/constants/formOptions";
import {
  errorClassName,
  getInputClassName,
  getSelectClassName,
  labelClassName,
} from "@/lib/formStyles";
import type { AddressData, SelectOption } from "@/types/form";
import { Loader2, MapPin } from "lucide-react";

interface AddressSectionProps {
  title: string;
  data: AddressData;
  prefix?: string;
  cities: SelectOption[];
  loadingCep: boolean;
  loadingCities: boolean;
  onFieldChange: (field: keyof AddressData, value: string) => void;
  onFieldBlur: (field: keyof AddressData) => void;
  onStateChange: (value: string) => void;
  getFieldState: (field: string) => "valid" | "invalid" | "";
  getError: (field: string) => string | undefined;
}

export function AddressSection({
  title,
  data,
  prefix = "",
  cities,
  loadingCep,
  loadingCities,
  onFieldChange,
  onFieldBlur,
  onStateChange,
  getFieldState,
  getError,
}: AddressSectionProps) {
  const fieldKey = (field: string) => (prefix ? `${prefix}_${field}` : field);

  return (
    <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
      </div>
      {/* <h3 className={sectionTitleClassName}>{title}</h3> */}

      <div className="space-y-4">
        {/* CEP */}
        <div>
          <label className={labelClassName}>
            CEP<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.cep}
            onChange={(e) => onFieldChange("cep", e.target.value)}
            onBlur={() => onFieldBlur("cep")}
            placeholder="00000-000"
            maxLength={9}
            inputMode="numeric"
            className={getInputClassName(getFieldState(fieldKey("cep")))}
          />
          <p className="text-muted-foreground text-xs mt-1">
            O endereço será preenchido automaticamente
          </p>
          {loadingCep && (
            <p className="text-primary text-xs mt-1 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Buscando endereço...
            </p>
          )}
          {getError(fieldKey("cep")) && (
            <p className={errorClassName}>{getError(fieldKey("cep"))}</p>
          )}
        </div>

        {/* Logradouro */}
        <div>
          <label className={labelClassName}>
            Logradouro<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.endereco}
            onChange={(e) => onFieldChange("endereco", e.target.value)}
            onBlur={() => onFieldBlur("endereco")}
            placeholder="Rua, Avenida, etc."
            maxLength={150}
            className={`${getInputClassName(getFieldState(fieldKey("endereco")))} capitalize`}
          />
          {getError(fieldKey("endereco")) && (
            <p className={errorClassName}>{getError(fieldKey("endereco"))}</p>
          )}
        </div>

        {/* Número + Complemento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>
              Número<span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="text"
              value={data.numero}
              onChange={(e) => onFieldChange("numero", e.target.value)}
              onBlur={() => onFieldBlur("numero")}
              placeholder="Nº ou S/N"
              maxLength={10}
              className={getInputClassName(getFieldState(fieldKey("numero")))}
            />
            {getError(fieldKey("numero")) && (
              <p className={errorClassName}>{getError(fieldKey("numero"))}</p>
            )}
          </div>

          <div>
            <label className={labelClassName}>Complemento</label>
            <input
              type="text"
              value={data.complemento}
              onChange={(e) => onFieldChange("complemento", e.target.value)}
              onBlur={() => onFieldBlur("complemento")}
              placeholder="Apto, Bloco, etc."
              maxLength={50}
              className={`${getInputClassName("")} capitalize`}
            />
          </div>
        </div>

        {/* Bairro */}
        <div>
          <label className={labelClassName}>
            Bairro<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.bairro}
            onChange={(e) => onFieldChange("bairro", e.target.value)}
            onBlur={() => onFieldBlur("bairro")}
            placeholder="Digite o bairro"
            maxLength={80}
            className={`${getInputClassName(getFieldState(fieldKey("bairro")))} capitalize`}
          />
          {getError(fieldKey("bairro")) && (
            <p className={errorClassName}>{getError(fieldKey("bairro"))}</p>
          )}
        </div>

        {/* Estado + Cidade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>
              Estado<span className="text-destructive ml-1">*</span>
            </label>
            <select
              value={data.estado}
              onChange={(e) => onStateChange(e.target.value)}
              className={getSelectClassName(getFieldState(fieldKey("estado")))}
            >
              {ESTADOS_BR.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {getError(fieldKey("estado")) && (
              <p className={errorClassName}>{getError(fieldKey("estado"))}</p>
            )}
          </div>

          <div>
            <label className={labelClassName}>
              Cidade<span className="text-destructive ml-1">*</span>
            </label>
            <select
              value={data.cidade}
              onChange={(e) => onFieldChange("cidade", e.target.value)}
              disabled={!data.estado || loadingCities}
              className={getSelectClassName(getFieldState(fieldKey("cidade")))}
            >
              <option value="">
                {loadingCities
                  ? "Carregando..."
                  : data.estado
                    ? "Selecione a cidade"
                    : "Selecione o estado primeiro"}
              </option>
              {cities.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {getError(fieldKey("cidade")) && (
              <p className={errorClassName}>{getError(fieldKey("cidade"))}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
