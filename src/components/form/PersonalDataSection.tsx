// ==========================================
// Personal Data Section - Beneficiary/Responsible data fields
// ==========================================

import { NACIONALIDADES, ESTADOS_CIVIS } from "@/constants/formOptions";
import {
  errorClassName,
  getInputClassName,
  getSelectClassName,
  labelClassName,
} from "@/lib/formStyles";
import { formatPassport } from "@/lib/validations";
import type { BeneficiaryData } from "@/types/form";
import { User } from "lucide-react";

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
  const isEstrangeiro = data.nacionalidade === "Estrangeiro(a)";

  return (
    <div className="space-y-5 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
      </div>

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
              onChange={(e) => {
                onFieldChange("nacionalidade", e.target.value);
                // Limpa o CPF quando muda a nacionalidade
                if (e.target.value === "Estrangeiro(a)" || e.target.value === "Brasileiro(a)") {
                  onFieldChange("cpf", "");
                }
              }}
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
           <p className="text-muted-foreground text-xs mt-1">
             ex.: Desempregada(o) ou Não tenho
           </p>
           {getError(fieldKey("profissao")) && (
             <p className={errorClassName}>{getError(fieldKey("profissao"))}</p>
           )}
        </div>

        {/* CPF/Passaporte + RG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>
              {isEstrangeiro ? "Passaporte" : "CPF"}
              <span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="text"
              value={data.cpf}
              onChange={(e) => {
                if (isEstrangeiro) {
                  onFieldChange("cpf", formatPassport(e.target.value));
                } else {
                  onFieldChange("cpf", e.target.value);
                }
              }}
              onBlur={() => onFieldBlur("cpf")}
              placeholder={isEstrangeiro ? "AB123456" : "000.000.000-00"}
              maxLength={isEstrangeiro ? 8 : 14}
              inputMode={isEstrangeiro ? "text" : "numeric"}
              className={`${getInputClassName(getFieldState(fieldKey("cpf")))} ${isEstrangeiro ? "uppercase" : ""}`}
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
