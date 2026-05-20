import React from 'react';
import PenBiomassChart from '../components/PenBiomassChart';
import SeaLiceTrend from '../components/SeaLiceTrend';
import WaterParamsChart from '../components/WaterParamsChart';
import MortalityHeatmap from '../components/MortalityHeatmap';

export default function CustomViewsPage() {
  return (
    <div data-testid="custom-views-page">
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: '0 0 6px 0' }}>Farm Analytics</h2>
        <p style={{ margin: 0, color: '#64748b' }}>
          Four cross-cutting charts derived from biomass, sea lice, water quality and
          mortality logs across every pen and farm.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))',
          gap: 18,
        }}
      >
        <PenBiomassChart />
        <SeaLiceTrend />
        <WaterParamsChart />
        <MortalityHeatmap />
      </div>
    </div>
  );
}
