// ==========================================
// Age Info Box - Shows age and accompaniment option
// ==========================================

interface AgeInfoBoxProps {
  age: number;
  needsAccompaniment: boolean;
  onAccompanimentChange: (value: boolean) => void;
}

export function AgeInfoBox({
  age,
  needsAccompaniment,
  onAccompanimentChange,
}: AgeInfoBoxProps) {
  const getAgeMessage = () => {
    if (age <= 13) {
      return (
        <span className="ml-2 text-primary">
          • Será necessário informar o responsável legal
        </span>
      );
    }
    if (age >= 14 && age < 18) {
      return (
        <span className="ml-2 text-muted-foreground">
          • Menor de idade, mas pode responder por si mesmo
        </span>
      );
    }
    return null;
  };

  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3 mt-4">
      <p className="text-sm text-muted-foreground">
        Idade do beneficiário:{" "}
        <span className="font-semibold text-foreground">{age} anos</span>
        {getAgeMessage()}
      </p>

      {/* Checkbox de acompanhamento para maiores de 18 */}
      {age >= 18 && (
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={needsAccompaniment}
            onChange={(e) => onAccompanimentChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-border bg-secondary accent-primary
              focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              O beneficiário necessita de acompanhamento constante
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Marque esta opção se o beneficiário, mesmo sendo maior de idade,
              precisa de um responsável legal ou curador
            </p>
          </div>
        </label>
      )}
    </div>
  );
}
