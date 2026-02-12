export const ESTADOS_BR = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export const NACIONALIDADES = [
  { value: "Brasileiro(a)", label: "Brasileiro(a)" },
  { value: "Estrangeiro(a)", label: "Estrangeiro(a)" },
];

export const ESTADOS_CIVIS = [
  { value: "Solteiro(a)", label: "Solteiro(a)" },
  { value: "Casado(a)", label: "Casado(a)" },
  { value: "Divorciado(a)", label: "Divorciado(a)" },
  { value: "Viúvo(a)", label: "Viúvo(a)" },
  { value: "União Estável", label: "União Estável" },
];

export const BENEFICIARIO_TIPO = [
  { value: "proprio", label: "Para mim mesmo(a)" },
  { value: "paraOutro", label: "Para outra pessoa (filho, dependente, etc.)" },
];

export const PARENTESCO_OPTIONS = [
  { value: "", label: "Selecione" },
  { value: "Pai", label: "Pai" },
  { value: "Mãe", label: "Mãe" },
  { value: "Avô", label: "Avô" },
  { value: "Avó", label: "Avó" },
  { value: "Tutor Legal", label: "Tutor Legal" },
  { value: "Curador", label: "Curador" },
  { value: "Outro", label: "Outro" },
];

interface Cidade {
  nome: string;
}

const citiesCache: Record<string, Cidade[]> = {};

export async function fetchCitiesByState(uf: string): Promise<Cidade[]> {
  if (citiesCache[uf]) return citiesCache[uf];

  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
  );
  const cities = await response.json();
  citiesCache[uf] = cities;
  return cities;
}

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export async function fetchAddressByCEP(
  cep: string,
): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  const data = await response.json();

  if (data.erro) return null;
  return data;
}
