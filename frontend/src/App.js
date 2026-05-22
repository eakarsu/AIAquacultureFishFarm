import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 CRUD pages
import FarmsPage                from './pages/FarmsPage';
import NetPensPage              from './pages/NetPensPage';
import FishGroupsPage           from './pages/FishGroupsPage';
import FeedInventoryPage        from './pages/FeedInventoryPage';
import TreatmentsPage           from './pages/TreatmentsPage';
import MortalityLogsPage        from './pages/MortalityLogsPage';
import WaterQualityPage         from './pages/WaterQualityPage';
import BiomassEstimatesPage     from './pages/BiomassEstimatesPage';
import SeaLiceCountsPage        from './pages/SeaLiceCountsPage';
import VesselsPage              from './pages/VesselsPage';
import DiversPage               from './pages/DiversPage';
import HarvestsPage             from './pages/HarvestsPage';
import CustomersPage            from './pages/CustomersPage';
import CertificationsPage       from './pages/CertificationsPage';
import PredatorIncidentsPage    from './pages/PredatorIncidentsPage';
import EnvironmentalImpactsPage from './pages/EnvironmentalImpactsPage';
import VendorsPage              from './pages/VendorsPage';
import AuditLogPage             from './pages/AuditLogPage';

// 16 AI pages
import AIBiomassVisionPage           from './pages/AIBiomassVisionPage';
import AISeaLiceClassifyPage         from './pages/AISeaLiceClassifyPage';
import AIFeedConversionPage          from './pages/AIFeedConversionPage';
import AIMortalityAnomalyPage        from './pages/AIMortalityAnomalyPage';
import AITreatmentRecommendPage      from './pages/AITreatmentRecommendPage';
import AIExecutiveBriefPage          from './pages/AIExecutiveBriefPage';
import AIHarvestSchedulePage         from './pages/AIHarvestSchedulePage';
import AIWaterQualityAnomalyPage     from './pages/AIWaterQualityAnomalyPage';
import AIStockingDensityRiskPage     from './pages/AIStockingDensityRiskPage';
import AIPredatorDeterrentPage       from './pages/AIPredatorDeterrentPage';
import AIEnvironmentalRiskPage       from './pages/AIEnvironmentalRiskPage';
import AIVesselShiftPage             from './pages/AIVesselShiftPage';
import AIDiverSafetyPage             from './pages/AIDiverSafetyPage';
import AICustomerQualityPage         from './pages/AICustomerQualityPage';
import AICertificationReadinessPage  from './pages/AICertificationReadinessPage';
import AIVendorQualityPage           from './pages/AIVendorQualityPage';
import AIMarketPriceForecastPage     from './pages/AIMarketPriceForecastPage';

// Apply pass 7 - backlog AI + non-AI pages
import AIFishHealthDiagnosticPage    from './pages/AIFishHealthDiagnosticPage';
import AIBiomassForecastPage         from './pages/AIBiomassForecastPage';
import AIHarvestTimingPage           from './pages/AIHarvestTimingPage';
import AIMortalityPredictPage        from './pages/AIMortalityPredictPage';
import AISustainabilityScorePage     from './pages/AISustainabilityScorePage';
import AIPenCameraAnalyzePage        from './pages/AIPenCameraAnalyzePage';
import AIEscapeDetectPage            from './pages/AIEscapeDetectPage';
import FeedingSchedulesPage          from './pages/FeedingSchedulesPage';
import WaterQualityIngestPage        from './pages/WaterQualityIngestPage';
import RegulatoryReportsPage         from './pages/RegulatoryReportsPage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom Farm Analytics views
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

            <Route path="/" element={<Dashboard />} />

            <Route path="/farms"                  element={<FarmsPage />} />
            <Route path="/net-pens"               element={<NetPensPage />} />
            <Route path="/fish-groups"            element={<FishGroupsPage />} />
            <Route path="/feed-inventory"         element={<FeedInventoryPage />} />
            <Route path="/treatments"             element={<TreatmentsPage />} />
            <Route path="/mortality-logs"         element={<MortalityLogsPage />} />
            <Route path="/water-quality"          element={<WaterQualityPage />} />
            <Route path="/biomass-estimates"      element={<BiomassEstimatesPage />} />
            <Route path="/sea-lice-counts"        element={<SeaLiceCountsPage />} />
            <Route path="/vessels"                element={<VesselsPage />} />
            <Route path="/divers"                 element={<DiversPage />} />
            <Route path="/harvests"               element={<HarvestsPage />} />
            <Route path="/customers"              element={<CustomersPage />} />
            <Route path="/certifications"         element={<CertificationsPage />} />
            <Route path="/predator-incidents"     element={<PredatorIncidentsPage />} />
            <Route path="/environmental-impacts"  element={<EnvironmentalImpactsPage />} />
            <Route path="/vendors"                element={<VendorsPage />} />
            <Route path="/audit-log"              element={<AuditLogPage />} />

            <Route path="/ai/biomass-vision-estimate"  element={<AIBiomassVisionPage />} />
            <Route path="/ai/sea-lice-counts-classify" element={<AISeaLiceClassifyPage />} />
            <Route path="/ai/feed-conversion-optimize" element={<AIFeedConversionPage />} />
            <Route path="/ai/mortality-anomaly-detect" element={<AIMortalityAnomalyPage />} />
            <Route path="/ai/treatment-recommend"      element={<AITreatmentRecommendPage />} />
            <Route path="/ai/executive-brief"          element={<AIExecutiveBriefPage />} />
            <Route path="/ai/harvest-schedule"         element={<AIHarvestSchedulePage />} />
            <Route path="/ai/water-quality-anomaly"    element={<AIWaterQualityAnomalyPage />} />
            <Route path="/ai/stocking-density-risk"    element={<AIStockingDensityRiskPage />} />
            <Route path="/ai/predator-deterrent-plan"  element={<AIPredatorDeterrentPage />} />
            <Route path="/ai/environmental-risk-brief" element={<AIEnvironmentalRiskPage />} />
            <Route path="/ai/vessel-shift-schedule"    element={<AIVesselShiftPage />} />
            <Route path="/ai/diver-safety-brief"       element={<AIDiverSafetyPage />} />
            <Route path="/ai/customer-quality-report"  element={<AICustomerQualityPage />} />
            <Route path="/ai/certification-readiness"  element={<AICertificationReadinessPage />} />
            <Route path="/ai/vendor-quality-score"     element={<AIVendorQualityPage />} />
            <Route path="/ai/market-price-forecast"    element={<AIMarketPriceForecastPage />} />

            {/* Apply pass 7 - backlog routes */}
            <Route path="/ai/fish-health-diagnostic"   element={<AIFishHealthDiagnosticPage />} />
            <Route path="/ai/biomass-forecast"         element={<AIBiomassForecastPage />} />
            <Route path="/ai/harvest-timing"           element={<AIHarvestTimingPage />} />
            <Route path="/ai/mortality-predict"        element={<AIMortalityPredictPage />} />
            <Route path="/ai/sustainability-score"     element={<AISustainabilityScorePage />} />
            <Route path="/ai/pen-camera-analyze"       element={<AIPenCameraAnalyzePage />} />
            <Route path="/ai/escape-detect"            element={<AIEscapeDetectPage />} />
            <Route path="/feeding-schedules"           element={<FeedingSchedulesPage />} />
            <Route path="/water-quality-ingest"        element={<WaterQualityIngestPage />} />
            <Route path="/regulatory-reports"          element={<RegulatoryReportsPage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
