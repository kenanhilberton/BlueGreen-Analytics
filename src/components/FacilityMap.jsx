import React, { useState } from 'react';

const AZERBAIJAN_PATH = 'M52 150 C66 126 96 108 132 100 C166 92 196 74 232 70 C268 66 296 80 328 92 C360 104 392 100 416 118 C440 136 446 166 430 188 C414 210 384 218 358 230 C330 242 310 262 278 272 C244 282 210 292 178 280 C148 268 124 246 102 226 C80 206 60 188 52 150 Z';
const NAKHCHIVAN_PATH = 'M42 256 C58 244 82 242 100 250 C112 256 116 270 106 282 C94 296 68 300 50 290 C36 282 32 266 42 256 Z';

const FACILITIES = [
  {
    id: 'sumqayit',
    name: 'Sumqayıt',
    x: 356,
    y: 162,
    risk: 'Kritik',
    color: '#ff4b4b',
    share: 27,
    energy: 46,
    water: 4200,
    note: 'Emissiya və su təhlükəsizliyi baxımından ən yüksək yük bu obyektdədir.'
  },
  {
    id: 'baku',
    name: 'Bakı',
    x: 382,
    y: 198,
    risk: 'Yüksək',
    color: '#ff8c00',
    share: 38,
    energy: 52,
    water: 3100,
    note: 'Stasionar yanma və logistika əsas emissiya mənbələridir.'
  },
  {
    id: 'ganja',
    name: 'Gəncə',
    x: 154,
    y: 140,
    risk: 'Orta',
    color: '#ffbb00',
    share: 18,
    energy: 34,
    water: 2400,
    note: 'Enerji səmərəliliyi tədbirləri planlaşdırılır.'
  },
  {
    id: 'shirvan',
    name: 'Şirvan',
    x: 334,
    y: 218,
    risk: 'Aşağı',
    color: '#00d2ff',
    share: 10,
    energy: 22,
    water: 1800,
    note: 'Göstəricilər sektor ortalamasından yaxşıdır.'
  },
  {
    id: 'mingachevir',
    name: 'Mingəçevir',
    x: 204,
    y: 186,
    risk: 'Çox aşağı',
    color: '#00ff87',
    share: 7,
    energy: 18,
    water: 1500,
    note: 'Bərpa olunan enerji payı digər obyektlərdən yüksəkdir.'
  }
];

const LEGEND = [
  { label: 'Kritik', color: '#ff4b4b' },
  { label: 'Yüksək', color: '#ff8c00' },
  { label: 'Orta', color: '#ffbb00' },
  { label: 'Aşağı', color: '#00d2ff' },
  { label: 'Çox aşağı', color: '#00ff87' }
];

const FacilityMap = ({ co2 = 44 }) => {
  const [selectedId, setSelectedId] = useState('baku');
  const selected = FACILITIES.find((item) => item.id === selectedId) || FACILITIES[1];
  const selectedCo2 = Math.round((co2 * selected.share) / 100);
  const updatedAt = new Date().toLocaleString('az-AZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const select = (id) => setSelectedId(id);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px', marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem 0', color: '#00D2FF', fontWeight: 600 }}>Müəssisə Xəritəsi</h3>
      <div style={{ fontSize: '0.8rem', color: '#8a93a6', marginBottom: '1rem' }}>
        Obyektlərin emissiya və risk vəziyyəti — markerə basaraq detalları görün.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(220px, 1fr)', gap: '1.2rem', alignItems: 'start' }}>
        <div style={{ background: 'rgba(0,210,255,0.03)', border: '1px solid rgba(0,210,255,0.12)', borderRadius: '18px', padding: '0.75rem' }}>
          <svg viewBox="0 0 480 320" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Azərbaycan üzrə müəssisələrin xəritəsi">
            <defs>
              <linearGradient id="facilityMapFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d2b46" />
                <stop offset="100%" stopColor="#071426" />
              </linearGradient>
            </defs>
            <path d={AZERBAIJAN_PATH} fill="url(#facilityMapFill)" stroke="rgba(0,210,255,0.45)" strokeWidth="1.5" />
            <path d={NAKHCHIVAN_PATH} fill="url(#facilityMapFill)" stroke="rgba(0,210,255,0.35)" strokeWidth="1.2" />
            <text x="404" y="268" fill="rgba(160,190,220,0.55)" fontSize="11" transform="rotate(-52 404 268)">Xəzər dənizi</text>

            {FACILITIES.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <g
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={item.name}
                  onClick={() => select(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      select(item.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={item.x} cy={item.y} r={isSelected ? 15 : 11} fill={item.color} opacity={isSelected ? 0.28 : 0.16} />
                  <circle cx={item.x} cy={item.y} r={isSelected ? 7 : 5} fill={item.color} stroke="#fff" strokeWidth="1.5" />
                  <text x={item.x + 12} y={item.y + 4} fill={isSelected ? '#fff' : '#b0b7c6'} fontSize="11" fontWeight={isSelected ? 700 : 500}>
                    {item.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#8a93a6', marginBottom: '0.3rem' }}>Seçilmiş obyekt</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
            <strong style={{ fontSize: '1.15rem', color: '#fff' }}>{selected.name}</strong>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: selected.color, border: `1px solid ${selected.color}55`, background: `${selected.color}18`, borderRadius: '999px', padding: '0.2rem 0.55rem' }}>
              {selected.risk}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: '#8a93a6' }}>Emissiya</span>
              <strong style={{ color: '#00FF87' }}>{selectedCo2} tCO₂e · {selected.share}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: '#8a93a6' }}>Enerji</span>
              <strong style={{ color: '#FFBB00' }}>{selected.energy} kWh</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: '#8a93a6' }}>Su</span>
              <strong style={{ color: '#00D2FF' }}>{selected.water.toLocaleString()} m³</strong>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#b0b7c6', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
              {selected.note}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8a93a6' }}>Son ölçmə: {updatedAt}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', marginTop: '1rem', fontSize: '0.7rem', color: '#8a93a6', flexWrap: 'wrap' }}>
        {LEGEND.map((item) => (
          <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FacilityMap;
