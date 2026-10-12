const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:3095/api';

export { API_BASE };

const TOKEN_KEY = 'aqf_token';
const USER_KEY  = 'aqf_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'manager'].includes(getRole());
}
export function isCommander() {
  return getRole() === 'admin';
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// 18 CRUD APIs
export const farmsApi                 = crud('farms');
export const netPensApi               = crud('net-pens');
export const fishGroupsApi            = crud('fish-groups');
export const feedInventoryApi         = crud('feed-inventory');
export const treatmentsApi            = crud('treatments');
export const mortalityLogsApi         = crud('mortality-logs');
export const waterQualityApi          = crud('water-quality');
export const biomassEstimatesApi      = crud('biomass-estimates');
export const seaLiceCountsApi         = crud('sea-lice-counts');
export const vesselsApi               = crud('vessels');
export const diversApi                = crud('divers');
export const harvestsApi              = crud('harvests');
export const customersApi             = crud('customers');
export const certificationsApi        = crud('certifications');
export const predatorIncidentsApi     = crud('predator-incidents');
export const environmentalImpactsApi  = crud('environmental-impacts');
export const vendorsApi               = crud('vendors');
export const auditLogApi              = crud('audit-log');
export const feedingSchedulesApi      = crud('feeding-schedules');

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// 16 AI verbs
export const aiBiomassVisionEstimate = (body, options = {}) => request('/ai/biomass-vision-estimate', { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiSeaLiceCountsClassify = (body, options = {}) => request('/ai/sea-lice-counts-classify', { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiFeedConversionOptimize= (body, options = {}) => request('/ai/feed-conversion-optimize',  { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiMortalityAnomalyDetect= (body, options = {}) => request('/ai/mortality-anomaly-detect',  { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiTreatmentRecommend    = (body, options = {}) => request('/ai/treatment-recommend',       { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief        = (body, options = {}) => request('/ai/executive-brief',           { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiHarvestSchedule       = (body, options = {}) => request('/ai/harvest-schedule',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiWaterQualityAnomaly   = (body, options = {}) => request('/ai/water-quality-anomaly',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiPredatorDeterrentPlan = (body, options = {}) => request('/ai/predator-deterrent-plan',   { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiEnvironmentalRiskBrief= (body, options = {}) => request('/ai/environmental-risk-brief',  { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiVesselShiftSchedule   = (body, options = {}) => request('/ai/vessel-shift-schedule',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiDiverSafetyBrief      = (body, options = {}) => request('/ai/diver-safety-brief',        { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiCustomerQualityReport = (body, options = {}) => request('/ai/customer-quality-report',   { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiCertificationReadiness= (body, options = {}) => request('/ai/certification-readiness',   { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiVendorQualityScore    = (body, options = {}) => request('/ai/vendor-quality-score',      { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiMarketPriceForecast   = (body, options = {}) => request('/ai/market-price-forecast',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// Apply pass 7 - backlog AI endpoints
export const aiFishHealthDiagnostic  = (body, options = {}) => request('/ai/fish-health-diagnostic',    { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiBiomassForecast       = (body, options = {}) => request('/ai/biomass-forecast',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiHarvestTiming         = (body, options = {}) => request('/ai/harvest-timing',            { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiMortalityPredict      = (body, options = {}) => request('/ai/mortality-predict',         { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiSustainabilityScore   = (body, options = {}) => request('/ai/sustainability-score',      { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiPenCameraAnalyze      = (body, options = {}) => request('/ai/pen-camera-analyze',        { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiEscapeDetect          = (body, options = {}) => request('/ai/escape-detect',             { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiStockingDensityRisk   = (body, options = {}) => request('/ai/stocking-density-risk',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// Sensor batch ingest (water quality)
export const ingestWaterQuality = (body) => request('/water-quality/ingest', { method: 'POST', body: JSON.stringify(body || {}) });
export const getWaterQualityIngestLog = (limit = 50) => request(`/water-quality/ingest/log?limit=${limit}`);

// Regulatory report exports - return raw text/csv via fetch since `request()` parses JSON.
export const listRegulatoryReports = () => request('/regulatory-reports');
export const downloadRegulatoryReport = async (slug, params = {}) => {
  const token = getToken();
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/regulatory-reports/${slug}${qs ? `?${qs}` : ''}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Report failed (${res.status})`);
  }
  return res.text();
};

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample fills
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};
