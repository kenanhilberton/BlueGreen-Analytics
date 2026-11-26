import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const LEVERS = [
  { id: 'solar', label: 'Günəş energiyası', max: 0.35, color: '#FFBB00', description: 'Elektrik təchizatının 35%-ə qədəri' },
  { id: 'efficiency', label: 'Enerji səmərəliliyi', max: 0.25, color: '#00D2FF', description: 'İstehsalat xətlərində optimallaşdırma' },
  { id: 'process', label: 'Proses dəyişikliyi', max: 0.15, color: '#00FF87', description: 'Texnoloji yeniləmə və tullantı azaltma' },
  { id: 'fuel', label: 'Yanacaq keçidi', max: 0.1, color: '#9d4edd', description: 'Qaz və bioyanacağa keçid' }
];

const CarbonRoadmap = ({ co2 = 44 }) => {
  const [values, setValues] = useState({ solar: 35, efficiency: 25, process: 15, fuel: 10 });
  const [carbonPrice, setCarbonPrice] = useState(45);

  const reduction = LEVERS.reduce((sum, lever) => sum + lever.max * (values[lever.id] / 100), 0);
  const projected = Math.max(0, Math.round(co2 * (1 - reduction)));
  const target = Math.round(co2 * 0.7);
  const gap = projected - target;
  const onTrack = projected <= target;
  const estimatedCost = Math.round(co2 * reduction * carbonPrice * 0.6);
  const priceExposure = Math.round(co2 * carbonPrice);

  const chartData = [2026, 2028, 2030, 2032, 2035].map((year) => {
    const progress = Math.min(1, Math.max(0, (year - 2026) / 4));
    return {
      year: String(year),
      baseline: co2,
      target: Math.round(co2 + (target - co2) * progress),
      roadmap: Math.round(co2 + (projected - co2) * progress)
    };
  });

  const updateLever = (id, value) => setValues((current) => ({ ...current, [id]: Number(value) || 0 }));

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem 0', color: '#00FF87', fontWeight: 600 }}>Karbon Azaltma Yol Xəritəsi</h3>
      <div style={{ fontSize: '0.8rem', color: '#8a93a6', marginBottom: '1rem' }}>
        Kompensasiya əvəzinə real azaltma tədbirlərini seçin — 2030 hədəfinə çatma ehtimalı yenilənir.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(0, 1.25fr)', gap: '1.2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {LEVERS.map((lever) => (
            <div key={lever.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>{lever.label}</span>
                <strong style={{ color: lever.color }}>{values[lever.id]}%</strong>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6', marginBottom: '0.5rem' }}>{lever.description}</div>
              <input
                type="range"
                min="0"
                max="100"
                value={values[lever.id]}
                onChange={(event) => updateLever(lever.id, event.target.value)}
                style={{ width: '100%', accentColor: lever.color }}
                aria-label={lever.label}
              />
            </div>
          ))}

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0.8rem' }}>
            <label style={{ fontSize: '0.72rem', color: '#8a93a6', display: 'block', marginBottom: '0.4rem' }}>Daxili karbon qiyməti ($/tCO₂e)</label>
            <input
              type="number"
              min="0"
              value={carbonPrice}
              onChange={(event) => setCarbonPrice(Number(event.target.value) || 0)}
              className="profile-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ background: 'rgba(0,255,135,0.025)', border: '1px solid rgba(0,255,135,0.12)', borderRadius: '18px', padding: '0.75rem', marginBottom: '0.9rem' }}>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="roadmapFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF87" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#00FF87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="year" stroke="#5d6575" fontSize={10} />
                <YAxis stroke="#5d6575" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0a0f24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={28} />
                <Area type="monotone" dataKey="baseline" name="Cari emissiya" stroke="#ff4b4b" strokeWidth={2} strokeDasharray="5 4" fill="none" />
                <Area type="monotone" dataKey="target" name="2030 hədəfi" stroke="#00D2FF" strokeWidth={2} strokeDasharray="6 4" fill="none" />
                <Area type="monotone" dataKey="roadmap" name="Yol xəritəsi" stroke="#00FF87" strokeWidth={3} fill="url(#roadmapFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.7rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6' }}>Cari emissiya</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{co2} t</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.14)' }}>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6' }}>2030 hədəfi</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00D2FF' }}>{target} t</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.14)' }}>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6' }}>Proqnoz</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00FF87' }}>{projected} t</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: onTrack ? 'rgba(0,255,135,0.04)' : 'rgba(255,75,75,0.04)', border: `1px solid ${onTrack ? 'rgba(0,255,135,0.14)' : 'rgba(255,75,75,0.14)'}` }}>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6' }}>Hədəf boşluğu</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: onTrack ? '#00FF87' : '#ff4b4b' }}>
                {onTrack ? 'Hədəfə uyğun' : `+${gap} t`}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,187,0,0.04)', border: '1px solid rgba(255,187,0,0.14)' }}>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6' }}>Təxmini xərc</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFBB00' }}>${estimatedCost.toLocaleString()}</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(157,78,221,0.04)', border: '1px solid rgba(157,78,221,0.14)' }}>
              <div style={{ fontSize: '0.68rem', color: '#8a93a6' }}>Qiymət təsiri</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#9d4edd' }}>${priceExposure.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.7rem', color: '#8a93a6', marginTop: '0.9rem' }}>
        Methodologiya: GHG Protocol və SBTi 2030 azaltma trayektoriyası əsasında təxmini model.
      </div>
    </div>
  );
};

export default CarbonRoadmap;
