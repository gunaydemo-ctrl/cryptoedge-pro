import React, { useMemo } from 'react';

function generateVolumeProfile(price, high, low, bars = 16) {
  const range = high - low;
  const step = range / bars;
  const poc = price; // Point of Control near current price
  const profile = [];

  for (let i = 0; i < bars; i++) {
    const level = low + i * step;
    const mid = level + step / 2;
    // Volume peaks near current price (POC), lower at extremes
    const distFromPoc = Math.abs(mid - poc) / range;
    const baseVol = Math.max(0.05, 1 - distFromPoc * 2.2);
    const noise = 0.7 + Math.random() * 0.6;
    const vol = baseVol * noise;
    const isBuy = mid <= price;
    profile.push({ level, mid, vol, isBuy, isPoc: Math.abs(mid - poc) < step });
  }

  const maxVol = Math.max(...profile.map(p => p.vol));
  return profile.map(p => ({ ...p, pct: (p.vol / maxVol) * 100 }));
}

export default function VolumeProfile({ coin }) {
  const profile = useMemo(
    () => generateVolumeProfile(coin.price, coin.high * 1.002, coin.low * 0.998),
    [coin.id, coin.price]
  );

  const fmt = (n) => {
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
    return '$' + n.toFixed(2);
  };

  return (
    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#848e9c', letterSpacing: '0.07em', marginBottom: 10 }}>
        VOLUME PROFILE · 24T · POC = {fmt(coin.price)}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Profile bars */}
        <div style={{ flex: 1 }}>
          {[...profile].reverse().map((bar, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <div style={{ width: 52, textAlign: 'right', fontFamily: "'IBM Plex Mono'", fontSize: 9, color: bar.isPoc ? '#f0b90b' : '#474d57', flexShrink: 0 }}>
                {fmt(bar.mid)}
              </div>
              <div style={{ flex: 1, height: 12, position: 'relative', background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: bar.pct + '%',
                  background: bar.isPoc ? '#f0b90b' : bar.isBuy ? 'rgba(14,203,129,0.5)' : 'rgba(246,70,93,0.4)',
                  borderRadius: 2,
                  transition: 'width 0.4s',
                }} />
                {bar.isPoc && (
                  <div style={{ position: 'absolute', right: -28, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 9, color: '#f0b90b', fontFamily: "'IBM Plex Mono'", fontWeight: 600 }}>
                    POC
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend + stats */}
        <div style={{ width: 100, flexShrink: 0 }}>
          <div style={{ background: '#1e2329', borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 6, letterSpacing: '0.05em' }}>FORKLARING</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(14,203,129,0.5)' }} />
              <span style={{ fontSize: 9, color: '#848e9c' }}>Købs-volumen</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(246,70,93,0.4)' }} />
              <span style={{ fontSize: 9, color: '#848e9c' }}>Salgs-volumen</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f0b90b' }} />
              <span style={{ fontSize: 9, color: '#848e9c' }}>POC (mest handel)</span>
            </div>
          </div>

          <div style={{ background: '#1e2329', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: '#848e9c', marginBottom: 6, letterSpacing: '0.05em' }}>NIVEAUER</div>
            <div style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 9, color: '#848e9c' }}>24T Højest</div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#0ecb81' }}>{fmt(coin.high)}</div>
            </div>
            <div style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 9, color: '#848e9c' }}>POC</div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#f0b90b' }}>{fmt(coin.price)}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#848e9c' }}>24T Lavest</div>
              <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 11, color: '#f6465d' }}>{fmt(coin.low)}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: '#2b3139', textAlign: 'center' }}>
        Volume Profile viser hvilke prisniveauer der har haft mest handel — høj volumen = stærk support/resistance
      </div>
    </div>
  );
}
