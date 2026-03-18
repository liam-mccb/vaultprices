const sanitizeBaseUrl = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\/+$/, '');
};

export const getValidatedApiBaseUrl = () => {
  const rawValue = import.meta.env.VITE_API_BASE_URL;
  const apiBaseUrl = sanitizeBaseUrl(rawValue);

  if (!apiBaseUrl) {
    throw new Error('Missing VITE_API_BASE_URL. Set it in your environment to load USDA reports.');
  }

  return apiBaseUrl;
};

const normalizeReport = (report) => ({
  title: report?.title ?? null,
  commodity: report?.commodity ?? null,
  marketType: report?.marketType ?? null,
  id: report?.id ?? null,
  url: report?.url ?? report?.link ?? null,
});

const getReportCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.reports)) return payload.reports;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const fetchUsdaReports = async ({ query = '', limit = 25, signal } = {}) => {
  const apiBaseUrl = getValidatedApiBaseUrl();
  const trimmedQuery = typeof query === 'string' ? query.trim() : '';
  const encodedLimit = encodeURIComponent(limit);
  const encodedQuery = encodeURIComponent(trimmedQuery);
  const searchEndpoint = `${apiBaseUrl}/api/groceries/usda/reports/search?q=${encodedQuery}&limit=${encodedLimit}`;
  const fallbackEndpoint = `${apiBaseUrl}/api/groceries/usda/reports?q=${encodedQuery}&limit=${encodedLimit}`;

  const endpoints = trimmedQuery ? [searchEndpoint, fallbackEndpoint] : [fallbackEndpoint];
  let lastError = null;

  for (const endpoint of endpoints) {
    if (import.meta.env.DEV) {
      console.debug('[USDA] Request URL:', endpoint);
    }

    const response = await fetch(endpoint, { method: 'GET', signal });
    if (!response.ok) {
      lastError = new Error(`Unable to fetch USDA reports (${response.status}).`);
      if (endpoint === fallbackEndpoint || !trimmedQuery) {
        throw lastError;
      }
      continue;
    }

    const payload = await response.json();
    if (import.meta.env.DEV) {
      console.debug('[USDA] Response payload:', payload);
    }

    return getReportCollection(payload).map(normalizeReport);
  }

  throw lastError ?? new Error('Unable to fetch USDA reports.');
};
