import React from 'react';
import AIPage from '../components/AIPage';
import { aiMarketPriceForecast } from '../services/api';

export default function AIMarketPriceForecastPage() {
  return (
    <AIPage
      title="AI - Market Price Forecast"
      feature="market-price-forecast"
      subtitle="Forecast wholesale price per kg over the requested horizon."
      inputs={[
        { key: 'species',        label: 'Species',         placeholder: 'e.g. Atlantic Salmon' },
        { key: 'horizon_weeks',  label: 'Horizon (weeks)', type: 'number', defaultValue: 12 },
        { key: 'notes',          label: 'Context',         type: 'textarea', placeholder: 'Baseline price, supply/demand drivers, hedging context...' },
      ]}
      run={(v) => aiMarketPriceForecast({ species: v.species, horizon_weeks: Number(v.horizon_weeks) || 12, notes: v.notes })}
      buttonLabel="Forecast Price"
    />
  );
}
