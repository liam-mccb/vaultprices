import { useCallback, useEffect, useState } from 'react';
import { fetchUsdaReports } from '@/api/usdaReports';

const FALLBACK_VALUE = 'N/A';

const formatField = (value) => {
  if (value === null || value === undefined) return FALLBACK_VALUE;
  if (typeof value === 'string' && !value.trim()) return FALLBACK_VALUE;
  return value;
};

export default function UsdaReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const nextReports = await fetchUsdaReports({ limit: 25, signal });
      setReports(nextReports);
    } catch (requestError) {
      if (requestError.name === 'AbortError') return;
      setReports([]);
      setError(requestError?.message ?? 'Unable to load USDA reports right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadReports(controller.signal);
    return () => controller.abort();
  }, [loadReports]);

  const handleRefresh = () => {
    const controller = new AbortController();
    loadReports(controller.signal);
  };

  return (
    <div className="container">
      <h1>USDA Reports</h1>
      <p>Browse recent USDA report metadata from the backend service.</p>

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
        <button type="button" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <p>Loading USDA reports...</p>}

      {!loading && error && (
        <p style={{ color: '#b91c1c', textAlign: 'left' }}>{error}</p>
      )}

      {!loading && !error && reports.length === 0 && (
        <p style={{ textAlign: 'left' }}>No USDA reports available.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.6rem' }}>Title</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.6rem' }}>Commodity</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.6rem' }}>Market Type</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '0.6rem' }}>ID</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={`${report.id ?? 'report'}-${index}`}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.6rem' }}>
                    {formatField(report.title)}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.6rem' }}>
                    {formatField(report.commodity)}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.6rem' }}>
                    {formatField(report.marketType)}
                  </td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '0.6rem' }}>
                    {formatField(report.id)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
