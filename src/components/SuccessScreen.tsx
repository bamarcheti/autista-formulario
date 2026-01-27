export function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-600 mb-2">
        Formulário Enviado!
      </h2>
      <p className="text-gray-600">Seus dados foram enviados com sucesso.</p>
    </div>
  );
}
