import { BPCLOASForm } from "@/components/BPCLOASForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy to-primary/30 flex items-center justify-center p-5">
      <div className="w-full max-w-[600px]">
        <div className="bg-card rounded-2xl shadow-2xl p-8 sm:p-10 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              Cadastro
            </h1>
            <p className="text-muted-foreground text-sm">
              Preencha <strong>corretamente</strong> para que possamos te
              representar com excelência.
            </p>
          </div>

          <BPCLOASForm />
        </div>

        <p className="text-center text-muted-foreground/60 text-xs mt-6">
          Fiorin Advocacia © {new Date().getFullYear()} - Todos os direitos
          reservados
        </p>
      </div>
    </div>
  );
};

export default Index;
