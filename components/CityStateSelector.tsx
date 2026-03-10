'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// All 27 Brazilian states (UFs)
const BRAZILIAN_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'TO', name: 'Tocantins' },
];

// Cache cities per state to avoid re-fetching
const citiesCache: Record<string, string[]> = {};

interface CityStateSelectorProps {
  value: string; // Format: "Cidade, UF" or just "Cidade"
  onChange: (value: string) => void;
  error?: string;
  labelColor?: string;
  required?: boolean;
}

/**
 * Parse a city value like "São Paulo, SP" into { city, uf }
 */
function parseCityValue(value: string): { city: string; uf: string } {
  if (!value) return { city: '', uf: '' };

  // Try to match "Cidade, UF" pattern
  const match = value.match(/^(.+),\s*([A-Z]{2})$/);
  if (match) {
    return { city: match[1].trim(), uf: match[2] };
  }

  // Try to match "Cidade - UF" pattern
  const dashMatch = value.match(/^(.+)\s*-\s*([A-Z]{2})$/);
  if (dashMatch) {
    return { city: dashMatch[1].trim(), uf: dashMatch[2] };
  }

  return { city: value, uf: '' };
}

export default function CityStateSelector({
  value,
  onChange,
  error,
  labelColor = 'text-blue-700',
  required = false
}: CityStateSelectorProps) {
  const parsed = parseCityValue(value);
  const [selectedUF, setSelectedUF] = useState(parsed.uf);
  const [cities, setCities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(parsed.city);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync from external value changes
  useEffect(() => {
    const p = parseCityValue(value);
    if (p.uf && p.uf !== selectedUF) {
      setSelectedUF(p.uf);
    }
    if (p.city !== searchTerm) {
      setSearchTerm(p.city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedUF) {
      setCities([]);
      return;
    }

    // Check cache first
    if (citiesCache[selectedUF]) {
      setCities(citiesCache[selectedUF]);
      return;
    }

    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios?orderBy=nome`
        );
        if (!res.ok) throw new Error('Failed to fetch cities');
        const data: Array<{ nome: string }> = await res.json();
        const cityNames = data.map(c => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        citiesCache[selectedUF] = cityNames;
        setCities(cityNames);
      } catch (err) {
        console.error('Error fetching cities from IBGE:', err);
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [selectedUF]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities by search term
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex]);

  const handleStateChange = (uf: string) => {
    setSelectedUF(uf);
    setSearchTerm('');
    setHighlightIndex(-1);
    onChange(''); // Reset value when state changes
    // Focus the city input after state selection
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectCity = useCallback((city: string) => {
    setSearchTerm(city);
    setIsDropdownOpen(false);
    setHighlightIndex(-1);
    onChange(`${city}, ${selectedUF}`);
  }, [selectedUF, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsDropdownOpen(true);
        setHighlightIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filteredCities.length) {
          selectCity(filteredCities[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
      {/* State selector */}
      <div>
        <label className={`block text-sm font-semibold ${labelColor} mb-2`}>
          Estado {required && '*'}
        </label>
        <select
          value={selectedUF}
          onChange={(e) => handleStateChange(e.target.value)}
          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
            error && !selectedUF ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="">UF</option>
          {BRAZILIAN_STATES.map(state => (
            <option key={state.uf} value={state.uf}>
              {state.uf}
            </option>
          ))}
        </select>
      </div>

      {/* City selector with search */}
      <div ref={dropdownRef} className="relative">
        <label className={`block text-sm font-semibold ${labelColor} mb-2`}>
          Cidade {required && '*'}
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              setHighlightIndex(0);
              // Clear the full value when user types (they need to select from list)
              if (value && parseCityValue(value).city !== e.target.value) {
                onChange('');
              }
            }}
            onFocus={() => {
              if (selectedUF && cities.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={!selectedUF}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10 ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } ${!selectedUF ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            placeholder={
              !selectedUF
                ? 'Selecione o estado primeiro'
                : isLoading
                  ? 'Carregando cidades...'
                  : 'Digite para buscar a cidade...'
            }
            autoComplete="off"
          />
          {/* Search/loading icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Dropdown list */}
        {isDropdownOpen && selectedUF && !isLoading && (
          <ul
            ref={listRef}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredCities.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                {searchTerm ? 'Nenhuma cidade encontrada' : 'Digite para buscar'}
              </li>
            ) : (
              filteredCities.slice(0, 100).map((city, idx) => (
                <li
                  key={city}
                  onClick={() => selectCity(city)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    idx === highlightIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${parseCityValue(value).city === city ? 'font-semibold bg-blue-50' : ''}`}
                >
                  {city}
                </li>
              ))
            )}
            {filteredCities.length > 100 && (
              <li className="px-4 py-2 text-xs text-gray-400 border-t">
                Mostrando 100 de {filteredCities.length} cidades. Digite mais para refinar.
              </li>
            )}
          </ul>
        )}

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
