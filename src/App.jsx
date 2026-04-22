import React, { useState, useEffect, useMemo, useRef } from 'react';
import './styles.css';
import PriceChart from './components/PriceChart';
import VolumeProfile from './components/VolumeProfile';
import { COINS, calcIndicators, calcSignal, calcTrade, fmtUSD } from './data';
import { useLivePrices } from './hooks/useLivePrices';

const PAGES = ['Marked','Trade','Analyse','Portefølje'];
const TFS   = ['1m','5m','15m','1t','4t','1D','1U'];
const ANALYSIS_TABS = ['Indikatorer','Volume Profile'];

function OrderBook({ coin }) {
  const rows = useMemo(() => {
    const asks=[], bids=[];
    for(let i=5;i>=1;i--) asks.push({ p:(coin.price+i*coin.price*0.0003).toFixed(2), a:(Math.random()*2+0.05).toFixed(3), pct:Math.random()*70+10 });
    for(let i=1;i<=5;i++) bids.push({ p:(coin.price-i*coin.price*0.0003).toFixed(2), a:(Math.random()*2+0.05).toFixed(3), pct:Math.random()*70+10 });
    return { asks, bids };
  }, [coin.id, coin.price]);
  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#474d57', marginBottom:4, fontFamily:"'IBM Plex Mono'" }}>
        <span>PRIS (USDT)</span><span>MÆNGDE ({coin.sym})</span>
      </div>
      {rows.asks.map((r,i) => (
        <div key={i} className="ob-row">
          <span style={{ color:'#f6465d' }}>${Number(r.p).toLocaleString()}</span>
          <span style={{ color:'#848e9c' }}>{r.a}</span>
          <div className="ob-bg" style={{ width:r.pct+'%', background:'#f6465d' }}/>
        </div>
      ))}
      <div style={{ textAlign:'center', fontFamily:"'IBM Plex Mono'", fontSize:14, fontWeight:600, color:coin.chg>=0?'#0ecb81':'#f6465d', margin:'5px 0', borderTop:'1px solid #2b3139', borderBottom:'1px solid #2b3139', padding:'4px 0' }}>
        {fmtUSD(coin.price)}
      </div>
      {rows.bids.map((r,i) => (
        <div key={i} className="ob-row">
          <span style={{ color:'#0ecb81' }}>${Number(r.p).toLocaleString()}</span>
          <span style={{ color:'#848e9c' }}>{r.a}</span>
          <div className="ob-bg" style={{ width:r.pct+'%', background:'#0ecb81' }}/>
        </div>
      ))}
    </>
  );
}

export default function App() {
  const [page, setPage]           = useState('Marked');
  const [coinBase, setCoinBase]   = useState(COINS[0]);
  const [tf, setTf]               = useState('1t');
  const [clock, setClock]         = useState(new Date());
  const [analysisTab, setAnalysisTab] = useState('Indikatorer');
  const [flashId, setFlashId]     = useState(null);
  const prevPrices                = useRef({});

  const { prices: livePrices, connected } = useLivePrices(COINS);

  const coins = useMemo(() => COINS.map(c => {
    const live = livePrices[c.id];
    if (!live) return c;
    return { ...c, price: live.price, chg: live.chg, high: live.high ?? c.high, low: live.low ?? c.low };
  }), [livePrices]);

  const coin = useMemo(() => coins.find(c => c.id === coinBase.id) || coins[0], [coins, coinBase.id]);

  useEffect(() => {
    const live = livePrices[coinBase.id];
    if (live && prevPrices.current[coinBase.id] !== live.price) {
      setFlashId(coinBase.id);
      setTimeout(() => setFlashId(null), 600);
      prevPrices.current[coinBase.id] = live.price;
    }
  }, [livePrices, coinBase.id]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const indicators = useMemo(() => calcIndicators(coin), [coin]);
  const signal     = useMemo(() => calcSignal(indicators), [indicators]);
  const trade      = useMemo(() => calcTrade(coin), [coin]);
  const scoreColor = signal.score>=65?'#0ecb81':signal.score<=35?'#f6465d':'#f0b90b';

  const sigPills = [
    { label:`RSI: ${coin.rsi.toFixed(1)}`, cls: coin.rsi>55?'buy':coin.rsi<45?'sell':'neu' },
    { label:`MACD: ${coin.macd>coin.macdSig?'Bullish':'Bearish'}`, cls: coin.macd>coin.macdSig?'buy':'sell' },
    { label:`EMA: ${coin.ema9>coin.ema21?'Golden Cross':'Death Cross'}`, cls: coin.ema9>coin.ema21?'buy':'sell' },
    { label:`ADX: ${coin.adx>25?'Stærk trend':'Svag trend'}`, cls: coin.adx>25?'buy':'neu' },
    { label:`Vol: ${coin.vol_rel.toFixed(1)}x`, cls: coin.vol_rel>=1.2?'buy':coin.vol_rel<=0.8?'sell':'neu' },
  ];

  return (
    <div className="app">
      <div className="topbar">
        <div className="logo">Crypto<span style={{ color:'#fff', fontWeight:400 }}>Edge</span></div>
        <div className="nav">
          {PAGES.map(p => (
            <div key={p} className={`nav-item ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</div>
          ))}
        </div>
        <div className="topright">
          <div className="live-pill">
            <div className="live-dot" style={{ background: connected?'#0ecb81':'#f6465d' }}/>
            <span style={{ color: connected?'#0ecb81':'#f6465d' }}>{connected?'LIVE':'SIMULERET'}</span>
          </div>
          <button className="btn-secondary">Log ind</button>
          <button className="btn-primary">Opret konto</button>
        </div>
      </div>

      <div className="coinbar">
        {coins.slice(0,8).map(c => (
          <div key={c.id} className={`coin-tab ${coinBase.id===c.id?'active':''}`} onClick={() => setCoinBase(c)}>
            <div>
              <div className="ct-sym">{c.pair}</div>
              <div className="ct-price" style={{ color:c.chg>=0?'#0ecb81':'#f6465d' }}>{fmtUSD(c.price)}</div>
            </div>
            <div className="ct-chg" style={{ color:c.chg>=0?'#0ecb81':'#f6465d' }}>{c.chg>=0?'+':''}{c.chg.toFixed(2)}%</div>
          </div>
        ))}
      </div>

      <div className="main-layout">
        <div className="left-panel">
          <div className="lp-search"><input placeholder="Søg marked..." /></div>
          <div className="lp-header"><span>PAR</span><span>ÆNDRING</span></div>
          <div className="market-list">
            {coins.map(c => (
              <div key={c.id} className={`market-row ${coinBase.id===c.id?'active':''}`} onClick={() => setCoinBase(c)}>
                <div><div className="mr-sym">{c.sym}</div><div className="mr-base">/USDT</div></div>
                <div style={{ textAlign:'right' }}>
                  <div className="mr-price" style={{ color:c.chg>=0?'#0ecb81':'#f6465d' }}>{fmtUSD(c.price)}</div>
                  <div className={`mr-chg ${c.chg>=0?'up':'dn'}`}>{c.chg>=0?'+':''}{c.chg.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="center-col">
          <div className="price-header">
            <div>
              <div style={{ fontSize:11, color:'#848e9c', marginBottom:2 }}>{coin.pair}</div>
              <div className="ph-bigprice" style={{ color:coin.chg>=0?'#0ecb81':'#f6465d', opacity:flashId===coin.id?0.5:1, transition:'opacity 0.3s' }}>
                {fmtUSD(coin.price)}
              </div>
            </div>
            <div className="ph-stat"><div className="ph-label">24T ÆNDRING</div><div className="ph-val" style={{ color:coin.chg>=0?'#0ecb81':'#f6465d' }}>{coin.chg>=0?'+':''}{coin.chg.toFixed(2)}%</div></div>
            <div className="ph-stat"><div className="ph-label">24T HØJEST</div><div className="ph-val">{fmtUSD(coin.high)}</div></div>
            <div className="ph-stat"><div className="ph-label">24T LAVEST</div><div className="ph-val">{fmtUSD(coin.low)}</div></div>
            <div className="ph-stat"><div className="ph-label">24T VOLUMEN</div><div className="ph-val">{coin.vol} {coin.sym}</div></div>
            <div className="ph-stat"><div className="ph-label">MARKET CAP</div><div className="ph-val">{coin.mcap}</div></div>
            {connected && (
              <div style={{ marginLeft:'auto', fontSize:10, color:'#0ecb81', fontFamily:"'IBM Plex Mono'", background:'rgba(14,203,129,0.08)', padding:'3px 8px', borderRadius:4, border:'1px solid rgba(14,203,129,0.2)' }}>
                ↻ Live · hvert 30. sek
              </div>
            )}
          </div>

          <div className="chart-area">
            <div className="tf-row">
              {TFS.map(t => <button key={t} className={`tf-btn ${tf===t?'active':''}`} onClick={() => setTf(t)}>{t}</button>)}
              <div className="tf-sep"/>
              <button className="tf-btn" style={{ fontSize:11, color:'#f0b90b' }}>Linje ✓</button>
            </div>
            <div className="sig-pills">
              {sigPills.map((s,i) => (
                <div key={i} className={`sig-pill ${s.cls}`}>
                  <div className="sp-dot" style={{ background:s.cls==='buy'?'#0ecb81':s.cls==='sell'?'#f6465d':'#848e9c' }}/>
                  {s.label}
                </div>
              ))}
            </div>
            <PriceChart coin={coin} timeframe={tf}/>
          </div>

          <div className="ind-section">
            <div style={{ display:'flex', gap:0, marginBottom:10, borderBottom:'1px solid #2b3139' }}>
              {ANALYSIS_TABS.map(tab => (
                <button key={tab} onClick={() => setAnalysisTab(tab)} style={{
                  padding:'6px 14px', fontSize:11, fontWeight:500,
                  color: analysisTab===tab?'#f0b90b':'#848e9c',
                  background:'transparent', border:'none',
                  borderBottom: analysisTab===tab?'2px solid #f0b90b':'2px solid transparent',
                  cursor:'pointer', fontFamily:"'IBM Plex Sans'", marginBottom:-1,
                }}>{tab}</button>
              ))}
              <div style={{ marginLeft:'auto', fontSize:10, color:'#474d57', alignSelf:'center', paddingRight:4 }}>
                {signal.buys} KØB · {signal.sells} SÆLG · {signal.neus} NEUTRAL
              </div>
            </div>
            {analysisTab==='Indikatorer' && (
              <div className="ind-grid">
                {indicators.map((ind,i) => (
                  <div key={i} className="ind-card">
                    <div className="ind-name">{ind.name}</div>
                    <div className="ind-val" style={{ color:ind.cls==='buy'?'#0ecb81':ind.cls==='sell'?'#f6465d':'#eaecef' }}>{ind.val}</div>
                    <div className={`ind-badge ib-${ind.cls}`}>{ind.badge}</div>
                  </div>
                ))}
              </div>
            )}
            {analysisTab==='Volume Profile' && <VolumeProfile coin={coin}/>}
          </div>
        </div>

        <div className="right-panel">
          <div className="rp-sec">
            <div className="rp-title">AI SIGNAL · {coin.pair}</div>
            <div className={`big-signal ${signal.cls}`}>
              <div className={`bs-word ${signal.cls}`}>{signal.word}</div>
              <div className="bs-conf">Styrke: {signal.score}/100 · {signal.conf} sikkerhed</div>
              <div className="bs-breakdown">
                <span className="bs-buy-count">{signal.buys} KØB</span>
                <span className="bs-neu-count">{signal.neus} NEUTRAL</span>
                <span className="bs-sell-count">{signal.sells} SÆLG</span>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#474d57' }}>
              <span>Bearish</span>
              <span style={{ color:scoreColor, fontFamily:"'IBM Plex Mono'" }}>{signal.score}/100</span>
              <span>Bullish</span>
            </div>
            <div className="score-outer"><div className="score-inner" style={{ width:signal.score+'%', background:scoreColor }}/></div>
          </div>

          <div className="rp-sec">
            <div className="rp-title">AUTOMATISK TRADE-PLAN</div>
            <div className="trade-rows">
              <div className="tr-row"><span className="tr-label">Entry</span><span className="tr-val">{fmtUSD(coin.price)}</span></div>
              <div className="tr-row"><span className="tr-label">Stop-loss</span><span className="tr-val" style={{ color:'#f6465d' }}>{fmtUSD(trade.stopLoss)} <span style={{ fontSize:10, color:'#848e9c' }}>(-{trade.slPct}%)</span></span></div>
              <div className="tr-row"><span className="tr-label">Take-profit 1</span><span className="tr-val" style={{ color:'#0ecb81' }}>{fmtUSD(trade.tp1)}</span></div>
              <div className="tr-row"><span className="tr-label">Take-profit 2</span><span className="tr-val" style={{ color:'#0ecb81' }}>{fmtUSD(trade.tp2)}</span></div>
              <div className="tr-row"><span className="tr-label">Anbefalet position</span><span className="tr-val">{fmtUSD(trade.posSize)}</span></div>
              <div className="tr-row"><span className="tr-label">Max tab</span><span className="tr-val" style={{ color:'#f6465d' }}>-{fmtUSD(trade.riskAmt)}</span></div>
            </div>
            <button className="btn-buy-full">Køb {coin.sym} — Long</button>
            <button className="btn-sell-full">Sælg {coin.sym} — Short</button>
            <div style={{ fontSize:10, color:'#474d57', textAlign:'center', marginTop:5 }}>Simuleret · Ikke rigtige ordrer</div>
          </div>

          <div className="rp-sec">
            <div className="rp-title">ORDREBOG</div>
            <OrderBook coin={coin}/>
          </div>

          <div className="rp-sec">
            <div className="rp-title">PORTEFØLJE</div>
            <div className="port-row"><span className="pr-label">Balance</span><span className="pr-val">$10,000</span></div>
            <div className="port-row"><span className="pr-label">Åbne positioner</span><span className="pr-val">0</span></div>
            <div className="port-row"><span className="pr-label">Daglig P&L</span><span className="pr-val up">+$340 (+3.4%)</span></div>
            <div className="port-row"><span className="pr-label">Total P&L</span><span className="pr-val up">+$840 (+8.4%)</span></div>
            <div className="port-row"><span className="pr-label">Win rate</span><span className="pr-val">64%</span></div>
            <div className="port-row"><span className="pr-label">Trades i dag</span><span className="pr-val">3</span></div>
          </div>
        </div>
      </div>

      <div className="bottombar">
        {coins.slice(0,6).map(c => (
          <div key={c.id} className="bb-item">
            <span className="bb-lbl">{c.sym}</span>
            <span className="bb-val">{fmtUSD(c.price)}</span>
            <span className={c.chg>=0?'up':'dn'}>{c.chg>=0?'+':''}{c.chg.toFixed(2)}%</span>
          </div>
        ))}
        <div className="bb-item"><span className="bb-lbl">FEAR/GREED</span><span className="bb-val">68</span><span className="up">Greed</span></div>
        <div className="bb-item"><span className="bb-lbl">BTC.D</span><span className="bb-val">54.2%</span><span className="up">+0.3%</span></div>
        <div className="bb-time">{clock.toLocaleTimeString('da-DK')} · {clock.toLocaleDateString('da-DK')}</div>
      </div>
    </div>
  );
}
