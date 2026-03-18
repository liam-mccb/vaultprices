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
});

export const fetchUsdaReports = async ({ limit = 25, signal } = {}) => {
  const apiBaseUrl = getValidatedApiBaseUrl();
  const endpoint = `${apiBaseUrl}/api/groceries/usda/reports?limit=${encodeURIComponent(limit)}`;

  const response = await fetch(endpoint, { method: 'GET', signal });
  if (!response.ok) {
    throw new Error(`Unable to fetch USDA reports (${response.status}).`);
  }

  const payload = await response.json();
  const rawReports = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.reports)
      ? payload.reports
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return rawReports.map(normalizeReport);
};
