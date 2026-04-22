import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { genPrices, genLabels } from '../data';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1e2329', border:'1px solid #2b3139', borderRadius:4, padding:'6px 10px' }}>
      <div style={{ fontSize:10, color:'#848e9c', marginBottom:2, fontFamily:"'IBM Plex Mono'" }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:500, fontFamily:"'IBM Plex Mono'", color:'#eaecef' }}>
        ${payload[0].value.toLocaleString()}
      </div>
    </div>
  );
};

export default function PriceChart({ coin, timeframe }) {
  const { labels, prices } = useMemo(() => {
    const n = timeframe==='1m'?60:timeframe==='5m'?60:timeframe==='15m'?48:timeframe==='1t'?48:timeframe==='4t'?42:timeframe==='1D'?30:24;
    return { labels: genLabels(n), prices: genPrices(coin.price, n) };
  }, [coin.id, timeframe]);

  const data = labels.map((l,i) => ({ t:l, p:prices[i] }));
  const color = coin.chg >= 0 ? '#0ecb81' : '#f6465d';
  const min = Math.min(...prices)*0.9992;
  const max = Math.max(...prices)*1.0008;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top:4, right:0, left:0, bottom:0 }}>
        <defs>
          <linearGradient id={`g${coin.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2}/>
            <stop offset="100%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.04)" vertical={false}/>
        <XAxis dataKey="t" tick={{ fill:'#474d57', fontSize:10, fontFamily:"'IBM Plex Mono'" }} axisLine={false} tickLine={false} interval={Math.floor(data.length/6)}/>
        <YAxis domain={[min,max]} orientation="right" tick={{ fill:'#474d57', fontSize:10, fontFamily:"'IBM Plex Mono'" }} axisLine={false} tickLine={false} width={58}
          tickFormatter={v => v>=1000?'$'+(v/1000).toFixed(1)+'k':'$'+v.toFixed(2)}/>
        <Tooltip content={<Tip/>}/>
        <ReferenceLine y={coin.price} stroke={color} strokeDasharray="3 4" strokeOpacity={0.4}/>
        <Area type="monotone" dataKey="p" stroke={color} strokeWidth={1.5} fill={`url(#g${coin.id})`} dot={false} activeDot={{ r:3, fill:color, strokeWidth:0 }}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}
