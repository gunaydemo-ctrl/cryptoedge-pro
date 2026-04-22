import React, { useState, useEffect, useMemo } from 'react';
import './styles.css';
import PriceChart from './components/PriceChart';
import { COINS, calcIndicators, calcSignal, calcTrade, fmtUSD } from './data';

const PAGES = ['Marked','Trade','Signaler','Portefølje','Analyse'];
const TFS   = ['1m','5m','15m','1t','4t','1D','1U'];

function OrderBook({ coin }) {
  const rows = useMemo(() => {
    const asks=[], bids=[];
    for(let i=5;i>=1;i--) asks.push({ p:(coin.price+i*coin.price*0.0003).toFixed(2), a:(Math.random()*2+0.05).toFixed(3), pct:Math.random()*70+10, side:'ask' });
    for(let i=1;i<=5;i++) bids.push({ p:(coin.price-i*coin.price*0.0003).toFixed(2), a:(Math.random()*2+0.05).toFixed(3), pct:Math.random()*70+10, side:'bid' });
    return { asks, bids };
  }, [coin.id]);

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
        {fmtUSD(coin.price)} <span style={{ fontSize:10, color:'#848e9c' }}>{coin.chg>=0?'▲':'▼'}</span>
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
  const [page, setPage]     = useState('Marked');
  const [coin, setCoin]     = useState(COINS[0]);
  const [tf, setTf]         = useState('1t');
  const [clock, setClock]   = useState(new Date());
  const [livePrice, setLivePrice] = useState(COINS[0].price);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date());
      setLivePrice(p => Math.round(p + (Math.random()-0.5)*p*0.0008));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { setLivePrice(coin.price); }, [coin]);

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
      {/* Topbar */}
      <div className="topbar">
        <div className="logo">Crypto<span style={{ color:'#fff', fontWeight:400 }}>Edge</span></div>
        <div className="nav">
          {PAGES.map(p => (
            <div key={p} className={`nav-item ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</div>
          ))}
        </div>
        <div className="topright">
          <div className="live-pill"><div className="live-dot"/><span>LIVE</span></div>
          <button className="btn-secondary">Log ind</button>
          <button className="btn-primary">Opret konto</button>
        </div>
      </div>

      {/* Coin bar */}
      <div className="coinbar">
        {COINS.slice(0,8).map(c => (
          <div key={c.id} className={`coin-tab ${coin.id===c.id?'active':''}`} onClick={() => setCoin(c)}>
            <div>
              <div className="ct-sym">{c.pair}</div>
              <div className="ct-price" style={{ color:c.chg>=0?'#0ecb81':'#f6465d' }}>
                {fmtUSD(c.price)}
              </div>
            </div>
            <div className="ct-chg" style={{ color:c.chg>=0?'#0ecb81':'#f6465d' }}>
              {c.chg>=0?'+':''}{c.chg.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="main-layout">

        {/* Left panel */}
        <div className="left-panel">
          <div className="lp-search">
            <input placeholder="Søg marked..." />
          </div>
          <div className="lp-header"><span>PAR</span><span>ÆNDRING</span></div>
          <div className="market-list">
            {COINS.map(c => (
              <div key={c.id} className={`market-row ${coin.id===c.id?'active':''}`} onClick={() => setCoin(c)}>
                <div>
                  <div className="mr-sym">{c.sym}</div>
                  <div className="mr-base">/USDT</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="mr-price" style={{ color:c.chg>=0?'#0ecb81':'#f6465d' }}>{fmtUSD(c.price)}</div>
                  <div className={`mr-chg ${c.chg>=0?'up':'dn'}`}>{c.chg>=0?'+':''}{c.chg.toFixed(2)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="center-col">
          {/* Price header */}
          <div className="price-header">
            <div>
              <div style={{ fontSize:11, color:'#848e9c', marginBottom:2 }}>{coin.pair}</div>
              <div className="ph-bigprice" style={{ color:coin.chg>=0?'#0ecb81':'#f6465d' }}>
                {fmtUSD(livePrice)}
              </div>
            </div>
            <div className="ph-stat"><div className="ph-label">24T ÆNDRING</div><div className="ph-val" style={{ color:coin.chg>=0?'#0ecb81':'#f6465d' }}>{coin.chg>=0?'+':''}{coin.chg.toFixed(2)}%</div></div>
            <div className="ph-stat"><div className="ph-label">24T HØJEST</div><div className="ph-val">{fmtUSD(coin.high)}</div></div>
            <div className="ph-stat"><div className="ph-label">24T LAVEST</div><div className="ph-val">{fmtUSD(coin.low)}</div></div>
            <div className="ph-stat"><div className="ph-label">24T VOLUMEN</div><div className="ph-val">{coin.vol} {coin.sym}</div></div>
            <div className="ph-stat"><div className="ph-label">MARKET CAP</div><div className="ph-val">{coin.mcap}</div></div>
          </div>

          {/* Chart */}
          <div className="chart-area">
            <div className="tf-row">
              {TFS.map(t => <button key={t} className={`tf-btn ${tf===t?'active':''}`} onClick={() => setTf(t)}>{t}</button>)}
              <div className="tf-sep"/>
              <button className="tf-btn" style={{ fontSize:11 }}>Candlestick</button>
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

          {/* Indicator grid */}
          <div className="ind-section">
            <div className="ind-section-title">
              TEKNISKE INDIKATORER — AUTOMATISK BEREGNET · {signal.buys} KØB · {signal.sells} SÆLG · {signal.neus} NEUTRAL
            </div>
            <div className="ind-grid">
              {indicators.map((ind,i) => (
                <div key={i} className="ind-card">
                  <div className="ind-name">{ind.name}</div>
                  <div className="ind-val" style={{ color:ind.cls==='buy'?'#0ecb81':ind.cls==='sell'?'#f6465d':'#eaecef' }}>{ind.val}</div>
                  <div className={`ind-badge ib-${ind.cls}`}>{ind.badge}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          {/* AI Signal */}
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

          {/* Trade plan */}
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
            <div style={{ fontSize:10, color:'#474d57', textAlign:'center', marginTop:5 }}>
              Simuleret · Ikke rigtige ordrer
            </div>
          </div>

          {/* Order book */}
          <div className="rp-sec">
            <div className="rp-title">ORDREBOG</div>
            <OrderBook coin={coin}/>
          </div>

          {/* Portfolio */}
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

      {/* Bottom ticker */}
      <div className="bottombar">
        {COINS.slice(0,6).map(c => (
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
