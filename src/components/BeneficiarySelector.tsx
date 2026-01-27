import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

interface BeneficiarySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BeneficiarySelector({
  value,
  onChange,
}: BeneficiarySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground/90">
        Para quem é o benefício BPC/LOAS?{" "}
        <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("proprio")}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300",
            "hover:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20",
            value === "proprio"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-secondary text-muted-foreground",
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              value === "proprio"
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            <User className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Para mim mesmo(a)</p>
            <p className="text-xs text-muted-foreground">Sou o beneficiário</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("outro")}
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-300",
            "hover:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/20",
            value === "outro"
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-secondary text-muted-foreground",
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              value === "outro"
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Para outra pessoa</p>
            <p className="text-xs text-muted-foreground">
              Sou responsável pelo beneficiário
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
