import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import type { AddressSuggestion } from '../hooks/useDistance';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: AddressSuggestion[];
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
  onClearSuggestions: () => void;
  loading?: boolean;
  placeholder?: string;
  label: string;
  icon?: React.ReactNode;
  iconColor?: string;
  required?: boolean;
}

export function AddressInput({
  value,
  onChange,
  onSearch,
  suggestions,
  onSelectSuggestion,
  onClearSuggestions,
  loading = false,
  placeholder = 'Digite o endereço...',
  label,
  icon,
  iconColor = 'text-slate-400',
  required = false,
}: AddressInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    onSearch(val);
    setShowSuggestions(true);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    // Simplify the display name
    const parts = suggestion.display_name.split(',');
    const simplified = parts.slice(0, 3).join(',').trim();
    onChange(simplified);
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
    onClearSuggestions();
  };

  const formatSuggestion = (displayName: string) => {
    const parts = displayName.split(',');
    const main = parts.slice(0, 2).join(',').trim();
    const secondary = parts.slice(2, 4).join(',').trim();
    return { main, secondary };
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
        {icon && <span className={iconColor}>{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          required={required}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-10 transition-all"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-orange-500" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => {
            const { main, secondary } = formatSuggestion(suggestion.display_name);
            return (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-start gap-3 border-b border-slate-50 last:border-0"
              >
                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{main}</p>
                  {secondary && (
                    <p className="text-xs text-slate-400 truncate">{secondary}</p>
                  )}
                </div>
              </button>
            );
          })}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">
              Dados: © OpenStreetMap contributors
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
