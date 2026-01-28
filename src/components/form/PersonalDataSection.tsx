// ==========================================
// Personal Data Section - Beneficiary/Responsible data fields
// ==========================================

import { Loader2 } from "lucide-react";
import type { BeneficiaryData } from "@/types/form";
import { NACIONALIDADES, ESTADOS_CIVIS } from "@/constants/formOptions";
import {
  getInputClassName,
  getSelectClassName,
  labelClassName,
  errorClassName,
  sectionTitleClassName,
} from "@/lib/formStyles";

interface PersonalDataSectionProps {
  title: string;
  data: BeneficiaryData;
  prefix: string;
  onFieldChange: (field: keyof BeneficiaryData, value: string) => void;
  onFieldBlur: (field: keyof BeneficiaryData) => void;
  getFieldState: (field: string) => "valid" | "invalid" | "";
  getError: (field: string) => string | undefined;
  showBirthDate?: boolean;
  birthDateInfo?: React.ReactNode;
}

export function PersonalDataSection({
  title,
  data,
  prefix,
  onFieldChange,
  onFieldBlur,
  getFieldState,
  getError,
  showBirthDate = true,
  birthDateInfo,
}: PersonalDataSectionProps) {
  const fieldKey = (field: string) => `${prefix}_${field}`;

  return (
    <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
      <h3 className={sectionTitleClassName}>{title}</h3>

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className={labelClassName}>
            Nome Completo<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.nome}
            onChange={(e) => onFieldChange("nome", e.target.value)}
            onBlur={() => onFieldBlur("nome")}
            placeholder="Digite o nome completo"
            maxLength={100}
            className={`${getInputClassName(getFieldState(fieldKey("nome")))} capitalize`}
          />
          {getError(fieldKey("nome")) && (
            <p className={errorClassName}>{getError(fieldKey("nome"))}</p>
          )}
        </div>

        {/* Data de Nascimento */}
        {showBirthDate && (
          <div>
            <label className={labelClassName}>
              Data de Nascimento<span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="date"
              value={data.dataNascimento}
              onChange={(e) => onFieldChange("dataNascimento", e.target.value)}
              onBlur={() => onFieldBlur("dataNascimento")}
              max={new Date().toISOString().split("T")[0]}
              className={getInputClassName(getFieldState(fieldKey("dataNascimento")))}
            />
            {getError(fieldKey("dataNascimento")) && (
              <p className={errorClassName}>
                {getError(fieldKey("dataNascimento"))}
              </p>
            )}
            {birthDateInfo}
          </div>
        )}

        {/* Nacionalidade + Estado Civil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>
              Nacionalidade<span className="text-destructive ml-1">*</span>
            </label>
            <select
              value={data.nacionalidade}
              onChange={(e) => onFieldChange("nacionalidade", e.target.value)}
              className={getSelectClassName(getFieldState(fieldKey("nacionalidade")))}
            >
              {NACIONALIDADES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {getError(fieldKey("nacionalidade")) && (
              <p className={errorClassName}>
                {getError(fieldKey("nacionalidade"))}
              </p>
            )}
          </div>

          <div>
            <label className={labelClassName}>
              Estado Civil<span className="text-destructive ml-1">*</span>
            </label>
            <select
              value={data.estadoCivil}
              onChange={(e) => onFieldChange("estadoCivil", e.target.value)}
              className={getSelectClassName(getFieldState(fieldKey("estadoCivil")))}
            >
              {ESTADOS_CIVIS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {getError(fieldKey("estadoCivil")) && (
              <p className={errorClassName}>
                {getError(fieldKey("estadoCivil"))}
              </p>
            )}
          </div>
        </div>

        {/* Profissão */}
        <div>
          <label className={labelClassName}>
            Profissão<span className="text-destructive ml-1">*</span>
          </label>
          <input
            type="text"
            value={data.profissao}
            onChange={(e) => onFieldChange("profissao", e.target.value)}
            onBlur={() => onFieldBlur("profissao")}
            placeholder="Digite a profissão"
            maxLength={80}
            className={`${getInputClassName(getFieldState(fieldKey("profissao")))} capitalize`}
          />
          {getError(fieldKey("profissao")) && (
            <p className={errorClassName}>{getError(fieldKey("profissao"))}</p>
          )}
        </div>

        {/* CPF + RG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>
              CPF<span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="text"
              value={data.cpf}
              onChange={(e) => onFieldChange("cpf", e.target.value)}
              onBlur={() => onFieldBlur("cpf")}
              placeholder="000.000.000-00"
              maxLength={14}
              inputMode="numeric"
              className={getInputClassName(getFieldState(fieldKey("cpf")))}
            />
            {getError(fieldKey("cpf")) && (
              <p className={errorClassName}>{getError(fieldKey("cpf"))}</p>
            )}
          </div>

          <div>
            <label className={labelClassName}>RG</label>
            <input
              type="text"
              value={data.rg}
              onChange={(e) => onFieldChange("rg", e.target.value)}
              onBlur={() => onFieldBlur("rg")}
              placeholder="Ex: 12.345.678-9"
              maxLength={26}
              className={`${getInputClassName(getFieldState(fieldKey("rg")))} uppercase`}
            />
            {getError(fieldKey("rg")) && (
              <p className={errorClassName}>{getError(fieldKey("rg"))}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
