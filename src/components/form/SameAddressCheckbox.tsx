// ==========================================
// Same Address Checkbox - Toggle for address sharing
// ==========================================

interface SameAddressCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SameAddressCheckbox({
  checked,
  onChange,
}: SameAddressCheckboxProps) {
  return (
    <div className="pt-4 border-t border-border">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-5 h-5 rounded border-2 border-border bg-secondary text-primary 
            focus:ring-primary focus:ring-offset-0 cursor-pointer
            checked:bg-primary checked:border-primary"
        />
        <div>
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            O endereço do responsável é o mesmo do beneficiário
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Marque esta opção se o responsável reside no mesmo endereço
          </p>
        </div>
      </label>
    </div>
  );
}
