import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  helper,
  loading,
  loadingText = "Carregando...",
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground/90">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {helper && !error && !loading && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {loading && (
        <p className="text-xs text-primary flex items-center gap-2">
          <span className="w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {loadingText}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
