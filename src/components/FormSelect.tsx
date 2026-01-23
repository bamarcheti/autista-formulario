import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
  isValid?: boolean;
  isInvalid?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, options, placeholder = "Selecione", isValid, isInvalid, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full px-4 py-3 pr-10 rounded-lg border-2 bg-secondary text-foreground",
            "font-normal text-[15px] appearance-none cursor-pointer",
            "transition-all duration-300 outline-none",
            "focus:border-primary focus:ring-4 focus:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isValid && "border-success",
            isInvalid && "border-destructive",
            !isValid && !isInvalid && "border-border",
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
