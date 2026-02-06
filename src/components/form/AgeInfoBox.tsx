// ==========================================
// Age Info Box - Shows age and legal representative toggle
// ==========================================

import { AlertCircle, User, Shield } from "lucide-react";

interface AgeInfoBoxProps {
  age: number;
  isMinor: boolean;
  hasLegalRepresentative: boolean;
  onLegalRepresentativeChange: (value: boolean) => void;
}

export function AgeInfoBox({
  age,
  isMinor,
  hasLegalRepresentative,
  onLegalRepresentativeChange,
}: AgeInfoBoxProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Box de informação de idade */}
      <div
        className={`p-4 rounded-xl border-2 ${
          isMinor
            ? "bg-destructive/10 border-destructive/30"
            : "bg-muted/50 border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          {isMinor ? (
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          ) : (
            <User className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Idade do beneficiário:{" "}
              <span className={isMinor ? "text-destructive" : "text-primary"}>
                {age} ano{age !== 1 ? "s" : ""}
              </span>
            </p>
            {isMinor && (
              <p className="text-sm text-destructive font-medium">
                Menor de idade — é obrigatório informar o responsável legal.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toggle de representante legal para maiores de 18 */}
      {!isMinor && (
        <div className="p-4 rounded-xl border-2 border-border bg-muted/30 hover:bg-muted/50 transition-colors">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={hasLegalRepresentative}
                onChange={(e) => onLegalRepresentativeChange(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                  ${
                    hasLegalRepresentative
                      ? "bg-primary border-primary"
                      : "bg-secondary border-border group-hover:border-primary/50"
                  }`}
              >
                {hasLegalRepresentative && (
                  <svg
                    className="w-4 h-4 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  O beneficiário possui curatela, tutela ou representação legal?
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Marque esta opção caso o beneficiário, mesmo sendo maior de idade,
                possua um responsável legal ou curador designado judicialmente, ou
                precise ser representado por outra pessoa.
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
