import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean;
  isInvalid?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, isValid, isInvalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-lg border-2 bg-secondary text-foreground",
          "placeholder:text-muted-foreground font-normal text-[15px]",
          "transition-all duration-300 outline-none",
          "focus:border-primary focus:ring-4 focus:ring-primary/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isValid && "border-success",
          isInvalid && "border-destructive",
          !isValid && !isInvalid && "border-border",
          className
        )}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";
