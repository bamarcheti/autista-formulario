// ==========================================
// Address Service - CEP lookup and city data
// ==========================================

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

interface CityData {
  nome: string;
}

// Cache para evitar requisições repetidas
const citiesCache: Record<string, CityData[]> = {};

/**
 * Busca endereço pelo CEP usando a API ViaCEP
 */
export async function fetchAddressByCEP(
  cep: string
): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return data;
  } catch {
    console.error("Erro ao buscar CEP");
    return null;
  }
}

/**
 * Busca cidades por estado usando a API do IBGE
 */
export async function fetchCitiesByState(uf: string): Promise<CityData[]> {
  if (citiesCache[uf]) {
    return citiesCache[uf];
  }

  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
    );
    const cities = await response.json();
    citiesCache[uf] = cities;
    return cities;
  } catch {
    console.error("Erro ao carregar cidades");
    return [];
  }
}
