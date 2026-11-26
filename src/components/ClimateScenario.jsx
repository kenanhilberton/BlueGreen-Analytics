import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const SCENARIOS = [
  { id: '1.5', label: '1.5°C', temp: 1.5, water: 14, heat: 16, flood: 9 },
  { id: '2', label: '2°C', temp: 2, water: 24, heat: 28, flood: 17 },
  { id: '4', label: '4°C', temp: 4, water: 46, heat: 62, flood: 38 }
];

const YEARS = [2030, 2040, 2050];

const ClimateScenario = ({ co2 = 44 }) => {
  const [scenarioId, setScenarioId] = useState('2');
  const [year, setYear] = useState(2030);

  const scenario = SCENARIOS.find((item) => item.id === scenarioId) || SCENARIOS[1];
  const progress = (year - 2030) / 20;
  const tempChange = (scenario.temp * progress * 0.6).toFixed(1);
  const waterStress = Math.round(scenario.water * (0.55 + 0.45 * progress));
  const heatDays = Math.round(scenario.heat * (0.5 + 0.5 * progress));
  const floodRisk = Math.round(scenario.flood * (0.6 + 0.4 * progress));

  const radarData = [
    { subject: 'Su', value: Math.max(8, 100 - waterStress) },
    { subject: 'İstilik', value: Math.max(8, 100 - heatDays) },
    { subject: 'Daşqın', value: Math.max(8, 100 - floodRisk) },
    { subject: 'Enerji', value: Math.round(86 - progress * 14) },
    { subject: 'Təchizat', value: Math.round(90 - progress * 18) }
  ];

  const resilience = Math.round(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length);
  const status = waterStress > 40 ? 'Yüksək risk' : waterStress > 25 ? 'Orta risk' : 'Aşağı risk';
  const statusColor = waterStress > 40 ? '#ff4b4b' : waterStress > 25 ? '#FFBB00' : '#00FF87';

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(157,78,221,0.2)', padding: '1.5rem', borderRadius: '24px', marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem 0', color: '#9d4edd', fontWeight: 600 }}>İqlim Ssenarisi Simulyatoru</h3>
      <div style={{ fontSize: '0.8rem', color: '#8a93a6', marginBottom: '1rem' }}>
        Ssenari və ili dəyişdirin — obyektlərin risk profili dərhal yenilənir.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '1.2rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#8a93a6', marginBottom: '0.45rem' }}>Ssenari</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {SCENARIOS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScenarioId(item.id)}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '10px',
                  border: scenarioId === item.id ? '1px solid #9d4edd' : '1px solid rgba(255,255,255,0.08)',
                  background: scenarioId === item.id ? 'rgba(157,78,221,0.18)' : 'transparent',
                  color: scenarioId === item.id ? '#fff' : '#b0b7c6',
                  fontWeight: scenarioId === item.id ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#8a93a6', marginBottom: '0.45rem' }}>Proqnoz ili</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {YEARS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setYear(item)}
                style={{
                  padding: '0.45rem 0.8rem',
                  borderRadius: '10px',
                  border: year === item ? '1px solid #00D2FF' : '1px solid rgba(255,255,255,0.08)',
                  background: year === item ? 'rgba(0,210,255,0.14)' : 'transparent',
                  color: year === item ? '#fff' : '#b0b7c6',
                  fontWeight: year === item ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 0.9fr) minmax(0, 1.4fr)', gap: '1.2rem', alignItems: 'center' }}>
        <div style={{ background: 'rgba(157,78,221,0.04)', border: '1px solid rgba(157,78,221,0.16)', borderRadius: '18px', padding: '0.5rem' }}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8a93a6', fontSize: 10 }} />
              <Radar name="Dayanıqlılıq" dataKey="value" stroke="#9d4edd" fill="#9d4edd" fillOpacity={0.28} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#8a93a6', paddingBottom: '0.5rem' }}>
            Dayanıqlılıq indeksi: <strong style={{ color: '#c77dff' }}>{resilience}/100</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
          <div style={{ padding: '0.9rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#8a93a6' }}>Temperatur artımı</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#9d4edd' }}>+{tempChange}°C</div>
          </div>
          <div style={{ padding: '0.9rem', borderRadius: '14px', background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.14)' }}>
            <div style={{ fontSize: '0.72rem', color: '#8a93a6' }}>Su stresi</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#00D2FF' }}>{waterStress}%</div>
          </div>
          <div style={{ padding: '0.9rem', borderRadius: '14px', background: 'rgba(255,187,0,0.04)', border: '1px solid rgba(255,187,0,0.14)' }}>
            <div style={{ fontSize: '0.72rem', color: '#8a93a6' }}>İstilik günləri</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFBB00' }}>{heatDays}</div>
          </div>
          <div style={{ padding: '0.9rem', borderRadius: '14px', background: 'rgba(255,75,75,0.04)', border: '1px solid rgba(255,75,75,0.14)' }}>
            <div style={{ fontSize: '0.72rem', color: '#8a93a6' }}>Daşqın riski</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ff4b4b' }}>{floodRisk}%</div>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 0.9rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#b0b7c6' }}>
              Cari emissiya fondu: <strong style={{ color: '#fff' }}>{co2} tCO₂e</strong>
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: statusColor }}>{status}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.7rem', color: '#8a93a6', marginTop: '0.9rem' }}>
        Mənbə: IPCC SSP ssenariləri əsasında təxmini model.
      </div>
    </div>
  );
};

export default ClimateScenario;
