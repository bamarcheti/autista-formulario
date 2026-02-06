// ==========================================
// Same Address Checkbox - Toggle for address sharing
// ==========================================

import { Home } from "lucide-react";

interface SameAddressCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SameAddressCheckbox({
  checked,
  onChange,
}: SameAddressCheckboxProps) {
  return (
    <div className="p-4 rounded-xl border-2 border-border bg-muted/30 hover:bg-muted/50 transition-colors">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center
              ${
                checked
                  ? "bg-primary border-primary"
                  : "bg-secondary border-border group-hover:border-primary/50"
              }`}
          >
            {checked && (
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
            <Home className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              O endereço do responsável é o mesmo do beneficiário
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Marque esta opção se o responsável legal reside no mesmo endereço do
            beneficiário. O endereço será copiado automaticamente.
          </p>
        </div>
      </label>
    </div>
  );
}
