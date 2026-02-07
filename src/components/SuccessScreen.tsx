import { Check } from "lucide-react";

export function SuccessScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-card rounded-2xl shadow-2xl border border-border p-8 sm:p-12 max-w-md w-full animate-slide-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary-foreground stroke-[3]" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Cadastro Concluído!
          </h2>
          <p className="text-muted-foreground">
            Seus dados foram registrados com sucesso. Em breve, nossa equipe entrará
            em contato para dar continuidade ao seu atendimento.
          </p>
        </div>
      </div>
    </div>
  );
}
