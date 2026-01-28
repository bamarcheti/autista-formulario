import { Check } from "lucide-react";

export function SuccessScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 animate-slide-up">
      <div className="w-20 h-20 bg-gradient-to-br from-success to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-white stroke-[3]" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-3">
        Cadastro Concluído!
      </h2>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Seus dados foram registrados com sucesso e serão utilizados para
        elaboração dos documentos do benefício BPC/LOAS.
      </p>
    </div>
  );
}
