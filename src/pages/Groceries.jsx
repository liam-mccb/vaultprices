import { useEffect, useMemo, useState } from 'react';
import PriceChart from '@/components/charts/PriceChart';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

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
    id: raw?.item ?? raw?.seriesId ?? fallback.id,
    name: raw?.name ?? fallback.name,
    unit: raw?.unit ?? fallback.unit,
    currentPrices,
    history,
  };
};

export default function Groceries() {
  const [selectedItem, setSelectedItem] = useState(SUPPORTED_ITEMS[0].id);
  const [selectedRange, setSelectedRange] = useState('max');
  const [grocery, setGrocery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedMeta = useMemo(
    () => SUPPORTED_ITEMS.find((item) => item.id === selectedItem) ?? SUPPORTED_ITEMS[0],
    [selectedItem]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadGrocery = async () => {
      setLoading(true);
      setError('');
      setGrocery(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/groceries/${selectedItem}`, {
          signal: controller.signal,
        });
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
  }, [selectedItem, selectedMeta]);

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

  return (
    <div className="container">
      <h1>Groceries</h1>
      <p>Compare recent grocery prices across stores.</p>

      <select
        value={selectedItem}
        onChange={(event) => setSelectedItem(event.target.value)}
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '0.65rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '1rem',
          background: 'var(--vp-surface)',
          color: 'var(--vp-text)',
        }}
      >
        {SUPPORTED_ITEMS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

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
