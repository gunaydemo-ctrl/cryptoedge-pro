import React, { useMemo, useState } from 'react';
import {
  ComposedChart, Area, Line, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend
} from 'recharts';
import { genPrices, genLabels } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const get = key => payload.find(p => p.dataKey === key)?.value;
  return (
    <div style={{ background:'#1e2329', border:'1px solid #2b3139', borderRadius:6, padding:'8px 12px', fontSize:11, fontFamily:"'IBM Plex Mono'" }}>
      <div style={{ color:'#848e9c', marginBottom:5 }}>{label}</div>
      {get('p')   && <div style={{ color:'#eaecef',  marginBottom:2 }}>Pris:  ${get('p')?.toLocaleString()}</div>}
      {get('ema9') && <div style={{ color:'#f0b90b',  marginBottom:2 }}>EMA 9: ${get('ema9')?.toLocaleString()}</div>}
      {get('ema21')&& <div style={{ color:'#7b61ff',  marginBottom:2 }}>EMA 21: ${get('ema21')?.toLocaleString()}</div>}
      {get('bbU')  && <div style={{ color:'#848e9c',  marginBottom:2 }}>BB Øvre: ${get('bbU')?.toLocaleString()}</div>}
      {get('bbL')  && <div style={{ color:'#848e9c',  marginBottom:2 }}>BB Nedre: ${get('bbL')?.toLocaleString()}</div>}
    </div>
  );
};

function genEMA(prices, period) {
  const k = 2 / (period + 1);
  const ema = [];
  let prev = prices.slice(0, period).reduce((a,b)=>a+b,0) / period;
  prices.forEach((p, i) => {
    if (i < period - 1) { ema.push(null); return; }
    if (i === period - 1) { ema.push(Math.round(prev)); return; }
    prev = p * k + prev * (1 - k);
    ema.push(Math.round(prev));
  });
  return ema;
}

function genBollinger(prices, period=20, multiplier=2) {
  return prices.map((_, i) => {
    if (i < period - 1) return { upper: null, lower: null };
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a,b)=>a+b,0) / period;
    const std = Math.sqrt(slice.reduce((a,b)=>a+(b-mean)**2,0) / period);
    return {
      upper: Math.round(mean + multiplier * std),
      lower: Math.round(mean - multiplier * std),
    };
  });
}

function genVolume(n) {
  return Array.from({ length: n }, () => Math.round(Math.random() * 800 + 100));
}

const OVERLAY_OPTIONS = ['EMA', 'BB', 'Vol'];

export default function PriceChart({ coin, timeframe }) {
  const [overlays, setOverlays] = useState(['EMA', 'Vol']);

  const toggle = (key) => setOverlays(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );

  const data = useMemo(() => {
    const n = timeframe==='1m'?60:timeframe==='5m'?60:timeframe==='15m'?48:timeframe==='1t'?48:timeframe==='4t'?42:timeframe==='1D'?30:24;
    const labels  = genLabels(n);
    const prices  = genPrices(coin.price, n);
    const ema9arr = genEMA(prices, 9);
    const ema21arr= genEMA(prices, 21);
    const bband   = genBollinger(prices, Math.min(20, n));
    const volArr  = genVolume(n);
    return labels.map((t, i) => ({
      t,
      p:    prices[i],
      ema9: ema9arr[i],
      ema21:ema21arr[i],
      bbU:  bband[i].upper,
      bbL:  bband[i].lower,
      vol:  volArr[i],
    }));
  }, [coin.id, timeframe]);

  const prices = data.map(d => d.p);
  const color  = coin.chg >= 0 ? '#0ecb81' : '#f6465d';
  const minP   = Math.min(...prices.filter(Boolean)) * 0.9985;
  const maxP   = Math.max(...prices.filter(Boolean)) * 1.0015;
  const showEMA = overlays.includes('EMA');
  const showBB  = overlays.includes('BB');
  const showVol = overlays.includes('Vol');

  return (
    <div>
      {/* Overlay toggle buttons */}
      <div style={{ display:'flex', gap:4, marginBottom:8 }}>
        <span style={{ fontSize:10, color:'#474d57', alignSelf:'center', marginRight:4 }}>OVERLAY:</span>
        {[
          { key:'EMA', label:'EMA 9/21', color:'#f0b90b' },
          { key:'BB',  label:'Bollinger Bands', color:'#7b61ff' },
          { key:'Vol', label:'Volumen', color:'#378ADD' },
        ].map(o => (
          <button key={o.key} onClick={() => toggle(o.key)} style={{
            padding:'3px 9px', fontSize:10, fontFamily:"'IBM Plex Mono'",
            borderRadius:3, border:`1px solid ${overlays.includes(o.key) ? o.color : '#2b3139'}`,
            background: overlays.includes(o.key) ? `${o.color}18` : 'transparent',
            color: overlays.includes(o.key) ? o.color : '#474d57',
            cursor:'pointer',
          }}>{o.label}</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center', fontSize:10 }}>
          {showEMA && <>
            <span style={{ color:'#f0b90b' }}>— EMA 9</span>
            <span style={{ color:'#7b61ff' }}>— EMA 21</span>
          </>}
          {showBB && <span style={{ color:'#848e9c' }}>⋯ Bollinger</span>}
        </div>
      </div>

      {/* Main price + indicators chart */}
      <ResponsiveContainer width="100%" height={showVol ? 185 : 220}>
        <ComposedChart data={data} margin={{ top:4, right:2, left:0, bottom:0 }}>
          <defs>
            <linearGradient id={`gp${coin.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
            {showBB && (
              <linearGradient id={`gbb${coin.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7b61ff" stopOpacity={0.06}/>
                <stop offset="100%" stopColor="#7b61ff" stopOpacity={0.06}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="t" tick={{ fill:'#474d57', fontSize:10, fontFamily:"'IBM Plex Mono'" }} axisLine={false} tickLine={false} interval={Math.floor(data.length/6)}/>
          <YAxis domain={[minP, maxP]} orientation="right" tick={{ fill:'#474d57', fontSize:10, fontFamily:"'IBM Plex Mono'" }} axisLine={false} tickLine={false} width={60}
            tickFormatter={v => v>=1000?'$'+(v/1000).toFixed(1)+'k':'$'+v.toFixed(2)}/>
          <Tooltip content={<CustomTooltip/>}/>
          <ReferenceLine y={coin.price} stroke={color} strokeDasharray="3 4" strokeOpacity={0.35}/>

          {/* Bollinger Bands — upper/lower as lines, fill between */}
          {showBB && <>
            <Area type="monotone" dataKey="bbU" stroke="#7b61ff" strokeWidth={0.8} strokeDasharray="3 3"
              fill={`url(#gbb${coin.id})`} dot={false} activeDot={false} legendType="none"/>
            <Line type="monotone" dataKey="bbL" stroke="#7b61ff" strokeWidth={0.8} strokeDasharray="3 3"
              dot={false} activeDot={false} legendType="none"/>
          </>}

          {/* Price area */}
          <Area type="monotone" dataKey="p" stroke={color} strokeWidth={1.5}
            fill={`url(#gp${coin.id})`} dot={false} activeDot={{ r:3, fill:color, strokeWidth:0 }}/>

          {/* EMA lines */}
          {showEMA && <>
            <Line type="monotone" dataKey="ema9"  stroke="#f0b90b" strokeWidth={1.2} dot={false} activeDot={false} legendType="none"/>
            <Line type="monotone" dataKey="ema21" stroke="#7b61ff" strokeWidth={1.2} dot={false} activeDot={false} legendType="none"/>
          </>}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Volume chart underneath */}
      {showVol && (
        <ResponsiveContainer width="100%" height={45}>
          <ComposedChart data={data} margin={{ top:2, right:2, left:0, bottom:0 }}>
            <XAxis dataKey="t" hide/>
            <YAxis hide/>
            <Bar dataKey="vol" fill="#378ADD" opacity={0.35} radius={[1,1,0,0]}
              label={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
