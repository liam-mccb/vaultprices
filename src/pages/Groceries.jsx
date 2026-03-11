import { useEffect, useMemo, useRef, useState } from 'react';
import PriceChart from '@/components/charts/PriceChart';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_GROCERY_ITEM = 'eggs';

const SUPPORTED_ITEMS = [
  { id: 'eggs', name: 'Eggs', unit: '12 ct' },
  { id: 'milk', name: 'Milk', unit: '1 gal' },
  { id: 'bread', name: 'Bread', unit: '20 oz loaf' },
  { id: 'bananas', name: 'Bananas', unit: 'per lb' },
  { id: 'chicken', name: 'Chicken', unit: 'per lb' },
];

const RANGE_OPTIONS = [
  { id: '1y', label: '1Y', years: 1 },
  { id: '5y', label: '5Y', years: 5 },
  { id: '10y', label: '10Y', years: 10 },
  { id: 'max', label: 'Max', years: null },
];

const formatLabel = (value) => {
  if (typeof value !== 'string') return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatItemName = (value) => {
  if (typeof value !== 'string' || !value.trim()) return '';
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeRequestValue = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

const buildFallbackMeta = (item) => {
  const supportedMatch = SUPPORTED_ITEMS.find(({ id }) => id === item);
  if (supportedMatch) return supportedMatch;

  return {
    id: item,
    name: formatItemName(item),
    unit: '',
  };
};

const DEFAULT_ITEM = buildFallbackMeta(DEFAULT_GROCERY_ITEM);

const normalizeGroceryResponse = (raw, fallback) => {
  const historySource = Array.isArray(raw?.history)
    ? raw.history
    : Array.isArray(raw?.data)
      ? raw.data
      : [];

  const currentPrices = Array.isArray(raw?.currentPrices)
    ? raw.currentPrices
        .map((price) => ({
          store: price?.store ?? price?.vendor ?? 'Store',
          price: Number(price?.price ?? price?.value ?? price?.cost),
        }))
        .filter((price) => Number.isFinite(price.price))
    : [];

  const history = Array.isArray(historySource)
    ? historySource
        .map((entry, index) => {
          const rawDate = entry?.date ?? entry?.time ?? entry?.label;
          const parsedDate = typeof rawDate === 'string' ? new Date(rawDate) : null;
          return {
            label: formatLabel(rawDate ?? `Point ${index + 1}`),
            price: Number(entry?.price ?? entry?.value ?? entry?.cost),
            dateMs: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.getTime() : null,
          };
        })
        .filter((entry) => Number.isFinite(entry.price))
    : [];

  return {
    id: raw?.item ?? raw?.requestedItem ?? raw?.seriesId ?? fallback.id,
    name:
      raw?.canonicalName ??
      raw?.name ??
      raw?.title ??
      fallback.name,
    unit: raw?.unit ?? raw?.units ?? fallback.unit,
    sourceName: raw?.sourceName ?? raw?.source ?? raw?.provider ?? raw?.dataset ?? '',
    currentPrices,
    history,
  };
};

const dedupeSuggestions = (suggestions) => {
  const seen = new Set();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.requestValue}::${suggestion.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildSuggestions = (payload, query) => {
  const topCandidate = Array.isArray(payload?.candidates) ? payload.candidates[0] : null;
  const topCandidateTitle =
    typeof topCandidate?.title === 'string' && topCandidate.title.trim()
      ? topCandidate.title.trim()
      : '';

  const curated = payload?.curatedMatch?.canonicalItem
    ? [{
        id: `curated-${payload.curatedMatch.canonicalItem}`,
        label: payload?.curatedMatch?.canonicalName ?? formatItemName(payload.curatedMatch.canonicalItem),
        canonicalItem: payload.curatedMatch.canonicalItem,
        secondaryLabel: 'Best match',
        requestValue: normalizeRequestValue(payload.curatedMatch.canonicalItem),
        sourceLabel: topCandidateTitle,
        fallbackName: payload?.curatedMatch?.canonicalName ?? formatItemName(payload.curatedMatch.canonicalItem),
      }]
    : [];

  const candidates = Array.isArray(payload?.candidates)
    ? payload.candidates.slice(0, 5).map((candidate) => {
        const canonicalItem = payload?.curatedMatch?.canonicalItem ?? '';
        const canonicalName = payload?.curatedMatch?.canonicalName ?? '';
        const readableLabel = candidate?.title ?? canonicalName ?? formatItemName(candidate?.seriesId) ?? query;
        const safeRequestValue =
          normalizeRequestValue(canonicalItem) ||
          normalizeRequestValue(payload?.normalizedQuery) ||
          normalizeRequestValue(payload?.query) ||
          normalizeRequestValue(query) ||
          (typeof candidate?.title === 'string' ? candidate.title.trim() : '');
        const secondaryParts = [
          canonicalName && canonicalName !== readableLabel ? canonicalName : '',
          candidate?.units || '',
          candidate?.frequencyShort || candidate?.frequency || '',
        ].filter(Boolean);

        return {
          id: candidate?.seriesId ?? readableLabel,
          label: readableLabel,
          canonicalItem,
          secondaryLabel: secondaryParts.join(' - '),
          requestValue: safeRequestValue,
          sourceLabel: readableLabel,
          fallbackName: canonicalName || readableLabel,
        };
      })
    : [];

  return dedupeSuggestions([...curated, ...candidates]).slice(0, 5);
};

export default function Groceries() {
  const [selectedRange, setSelectedRange] = useState('max');
  const [grocery, setGrocery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(DEFAULT_ITEM.name);
  const [historyRequest, setHistoryRequest] = useState({
    item: DEFAULT_GROCERY_ITEM,
    displayValue: DEFAULT_ITEM.name,
    fallbackMeta: DEFAULT_ITEM,
  });
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchContainerRef = useRef(null);
  const skipNextSearchRef = useRef(false);

  const selectedMeta = useMemo(
    () => historyRequest.fallbackMeta ?? buildFallbackMeta(historyRequest.item),
    [historyRequest]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadGrocery = async () => {
      setLoading(true);
      setError('');
      setGrocery(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/groceries/${encodeURIComponent(historyRequest.item)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const payload = await response.json();
        const groceryPayload = Array.isArray(payload) ? payload[0] : payload;
        setGrocery(normalizeGroceryResponse(groceryPayload, selectedMeta));
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setGrocery(null);
        setError(
          `Unable to load grocery data right now. ${
            requestError?.message ?? ''
          }`.trim()
        );
      } finally {
        setLoading(false);
      }
    };

    loadGrocery();

    return () => controller.abort();
  }, [historyRequest, selectedMeta]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      setSuggestions([]);
      setSearchLoading(false);
      setSearchError('');
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return undefined;
    }

    const trimmedQuery = searchInput.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setSearchLoading(false);
      setSearchError('');
      setActiveSuggestionIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/groceries/search?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const payload = await response.json();
        const nextSuggestions = buildSuggestions(payload, trimmedQuery);
        setSuggestions(nextSuggestions);
        setSuggestionsOpen(true);
        setActiveSuggestionIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setSuggestions([]);
        setSearchError(
          `Unable to search grocery items right now. ${
            requestError?.message ?? ''
          }`.trim()
        );
        setSuggestionsOpen(true);
        setActiveSuggestionIndex(-1);
      } finally {
        setSearchLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const filteredHistory = useMemo(() => {
    if (!grocery?.history || selectedRange === 'max') return grocery?.history ?? [];

    const rangeMeta = RANGE_OPTIONS.find((range) => range.id === selectedRange);
    if (!rangeMeta?.years) return grocery.history;

    const validDates = grocery.history
      .map((entry) => entry.dateMs)
      .filter((dateMs) => Number.isFinite(dateMs));

    if (validDates.length === 0) return grocery.history;

    const latestDateMs = Math.max(...validDates);
    const cutoff = new Date(latestDateMs);
    cutoff.setFullYear(cutoff.getFullYear() - rangeMeta.years);

    return grocery.history.filter(
      (entry) => !Number.isFinite(entry.dateMs) || entry.dateMs >= cutoff.getTime()
    );
  }, [grocery, selectedRange]);

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);

  const showUnit = Boolean(grocery?.unit) && grocery.unit.toLowerCase() !== 'lin';

  const submitSelection = (selection) => {
    const nextValue =
      normalizeRequestValue(selection?.canonicalItem) ||
      normalizeRequestValue(selection?.requestValue) ||
      (typeof selection?.label === 'string' ? selection.label.trim() : '');
    if (!nextValue) return;

    const fallbackMeta = selection?.canonicalItem
      ? buildFallbackMeta(selection.canonicalItem)
      : buildFallbackMeta(nextValue);

    setHistoryRequest({
      item: nextValue,
      displayValue: selection?.sourceLabel ?? selection?.label ?? nextValue,
      fallbackMeta: {
        ...fallbackMeta,
        name: selection?.fallbackName ?? selection?.label ?? fallbackMeta.name,
      },
    });
    skipNextSearchRef.current = true;
    setSearchInput(selection?.label ?? nextValue);
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    setSearchError('');
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = searchInput.trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const highlightedSuggestion = suggestions[activeSuggestionIndex];
    const firstSuggestion = suggestions[0];
    submitSelection(
      highlightedSuggestion ?? firstSuggestion ?? {
        requestValue: normalizeRequestValue(trimmedQuery),
        label: trimmedQuery,
        fallbackName: formatItemName(trimmedQuery),
      }
    );
  };

  const handleInputKeyDown = (event) => {
    if (!suggestionsOpen || suggestions.length === 0) {
      if (event.key === 'Enter') handleSearchSubmit(event);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex >= suggestions.length - 1 ? 0 : currentIndex + 1
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) =>
        currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1
      );
      return;
    }

    if (event.key === 'Escape') {
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const showSuggestionPanel =
    suggestionsOpen &&
    (searchLoading || searchError || suggestions.length > 0 || searchInput.trim().length > 0);

  return (
    <div className="container">
      <h1>Groceries</h1>
      <p>Compare recent grocery prices across stores.</p>

      <div
        ref={searchContainerRef}
        style={{ position: 'relative', width: '100%', maxWidth: '520px', marginBottom: '1rem' }}
      >
        <form onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (searchInput.trim()) setSuggestionsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search groceries"
            autoComplete="off"
            aria-label="Search grocery items"
            aria-expanded={showSuggestionPanel}
            aria-controls="grocery-search-suggestions"
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: 'var(--vp-surface)',
              color: 'var(--vp-text)',
              boxSizing: 'border-box',
            }}
          />
        </form>

        {showSuggestionPanel && (
          <div
            id="grocery-search-suggestions"
            role="listbox"
            aria-label="Grocery search suggestions"
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.4rem)',
              left: 0,
              right: 0,
              zIndex: 10,
              border: '1px solid #ddd',
              borderRadius: '12px',
              background: 'var(--vp-surface)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
            }}
          >
            {searchLoading && (
              <p style={{ margin: 0, padding: '0.85rem 1rem' }}>
                Searching grocery items...
              </p>
            )}

            {!searchLoading && searchError && (
              <p style={{ margin: 0, padding: '0.85rem 1rem', color: '#b91c1c' }}>
                {searchError}
              </p>
            )}

            {!searchLoading && !searchError && suggestions.length === 0 && searchInput.trim() && (
              <p style={{ margin: 0, padding: '0.85rem 1rem' }}>
                No matching grocery items found.
              </p>
            )}

            {!searchLoading && !searchError && suggestions.length > 0 && (
              <div>
                {suggestions.map((suggestion, index) => {
                  const isActive = index === activeSuggestionIndex;
                  return (
                    <button
                      key={suggestion.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => submitSelection(suggestion)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: 0,
                        border: 'none',
                        borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #e5e5e5',
                        background: isActive ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
                        color: 'var(--vp-text)',
                        padding: '0.8rem 1rem',
                      }}
                    >
                      <span style={{ display: 'block', fontWeight: 600 }}>{suggestion.label}</span>
                      {suggestion.secondaryLabel ? (
                        <span style={{ display: 'block', fontSize: '0.9rem', opacity: 0.75 }}>
                          {suggestion.secondaryLabel}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <p style={{ marginTop: '0.25rem' }}>Loading grocery data...</p>}
      {error && (
        <p style={{ marginTop: '0.25rem', color: '#b91c1c' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {!loading && !error && !grocery && (
          <p>No grocery data available.</p>
        )}

        {grocery && (
          <article
            key={grocery.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '1rem',
              background: 'var(--vp-surface)',
              textAlign: 'left',
            }}
          >
            <h2 style={{ marginBottom: '0.25rem' }}>
              {grocery.name} {showUnit ? <span style={{ opacity: 0.75 }}>({grocery.unit})</span> : null}
            </h2>
            {historyRequest.displayValue && historyRequest.displayValue !== grocery.name ? (
              <p style={{ marginTop: 0, marginBottom: '0.75rem', opacity: 0.75 }}>
                Showing results for {historyRequest.displayValue}
                {grocery.sourceName ? ` (${grocery.sourceName})` : ''}.
              </p>
            ) : null}
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {grocery.currentPrices.length === 0 && <span>No current store price quotes are available from the backend.</span>}
              {grocery.currentPrices.map((price) => (
                <span key={price.store}>
                  {price.store}: <strong>{formatPrice(price.price)}</strong>
                </span>
              ))}
            </div>

            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {RANGE_OPTIONS.map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setSelectedRange(range.id)}
                  style={{
                    padding: '0.4rem 0.65rem',
                    borderRadius: '999px',
                    border: '1px solid #ccc',
                    background: selectedRange === range.id ? '#d4af37' : 'var(--vp-surface)',
                    color: selectedRange === range.id ? '#111' : 'var(--vp-text)',
                    cursor: 'pointer',
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {grocery.history.length === 0 ? (
              <p style={{ margin: 0 }}>No historical chart data available.</p>
            ) : filteredHistory.length === 0 ? (
              <p style={{ margin: 0 }}>No chart data in the selected range.</p>
            ) : (
              <PriceChart
                data={filteredHistory}
                xKey="label"
                yKey="price"
                height={200}
                color="#d4af37"
                showHorizontalGrid
                standardizeYAxis
              />
            )}
          </article>
        )}
      </div>
    </div>
  );
}
