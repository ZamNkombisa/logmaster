import { useState, useRef, useEffect } from 'react';

interface Result {
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  label: string;
  placeholder: string;
  onSelect: (result: { address: string; lat: number; lng: number }) => void;
  selectedAddress: string | null;
}

export function AddressAutocomplete({ label, placeholder, onSelect, selectedAddress }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        );
        const data: Result[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // debounce: avoids hammering Nominatim's free public API on every keystroke

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelect(r: Result) {
    onSelect({ address: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {selectedAddress ? (
        <div className="flex items-center justify-between bg-graphite-input border border-lime/40 rounded-lg px-3 py-2 text-sm">
          <span className="truncate">{selectedAddress}</span>
          <button
            type="button"
            onClick={() => onSelect({ address: '', lat: NaN, lng: NaN })}
            className="text-gray-500 hover:text-violation-text text-xs ml-2 shrink-0"
          >
            change
          </button>
        </div>
      ) : (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className="w-full bg-graphite-input border border-graphite-border rounded-lg px-3 py-2 text-sm placeholder:text-gray-600"
          />
          {loading && <p className="text-xs text-gray-600 mt-1">Searching…</p>}
          {open && results.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-graphite-card border border-graphite-border rounded-lg overflow-hidden shadow-xl">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-graphite-input truncate"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}