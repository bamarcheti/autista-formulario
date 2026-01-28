// ==========================================
// Address Form Hook - CEP lookup and cities
// ==========================================

import { useCallback, useEffect, useState } from "react";
import type { AddressData, SelectOption } from "@/types/form";
import { INITIAL_ADDRESS_DATA } from "@/types/form";
import { fetchAddressByCEP, fetchCitiesByState } from "@/services/addressService";
import { capitalizeAddress } from "@/lib/validations";

interface UseAddressFormOptions {
  onAddressUpdate?: (updates: Partial<AddressData>) => void;
  onValidationUpdate?: (field: string, value: string) => void;
}

/**
 * Hook para gerenciar lógica de endereço com busca de CEP e cidades
 */
export function useAddressForm(options: UseAddressFormOptions = {}) {
  const [addressData, setAddressData] = useState<AddressData>(INITIAL_ADDRESS_DATA);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Busca endereço quando CEP muda
  useEffect(() => {
    const cep = addressData.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    const timeoutId = setTimeout(async () => {
      setLoadingCep(true);
      try {
        const data = await fetchAddressByCEP(cep);
        if (data) {
          const updates: Partial<AddressData> = {};
          if (data.logradouro) updates.endereco = capitalizeAddress(data.logradouro);
          if (data.bairro) updates.bairro = capitalizeAddress(data.bairro);
          if (data.uf) updates.estado = data.uf;

          setAddressData((prev) => ({ ...prev, ...updates }));

          if (data.uf) {
            setLoadingCities(true);
            const citiesData = await fetchCitiesByState(data.uf);
            const cityOptions = citiesData.map((c) => ({
              value: c.nome,
              label: c.nome,
            }));
            setCities(cityOptions);
            setLoadingCities(false);

            if (data.localidade) {
              const match = cityOptions.find(
                (c) => c.value.toLowerCase() === data.localidade?.toLowerCase()
              );
              if (match) {
                setAddressData((prev) => ({ ...prev, cidade: match.value }));
              }
            }
          }

          // Notifica validações
          options.onValidationUpdate?.("cep", cep);
          if (data.logradouro) options.onValidationUpdate?.("endereco", data.logradouro);
          if (data.bairro) options.onValidationUpdate?.("bairro", data.bairro);
          if (data.uf) options.onValidationUpdate?.("estado", data.uf);
        }
      } catch {
        console.error("Erro ao buscar CEP");
      }
      setLoadingCep(false);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [addressData.cep]);

  // Carrega cidades quando estado muda
  useEffect(() => {
    if (!addressData.estado) {
      setCities([]);
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const citiesData = await fetchCitiesByState(addressData.estado);
        setCities(citiesData.map((c) => ({ value: c.nome, label: c.nome })));
      } catch {
        console.error("Erro ao carregar cidades");
      }
      setLoadingCities(false);
    };

    loadCities();
  }, [addressData.estado]);

  const updateField = useCallback(
    <K extends keyof AddressData>(field: K, value: AddressData[K]) => {
      setAddressData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateState = useCallback((value: string) => {
    setAddressData((prev) => ({ ...prev, estado: value, cidade: "" }));
  }, []);

  const reset = useCallback(() => {
    setAddressData(INITIAL_ADDRESS_DATA);
    setCities([]);
  }, []);

  return {
    addressData,
    setAddressData,
    cities,
    loadingCep,
    loadingCities,
    updateField,
    updateState,
    reset,
  };
}
