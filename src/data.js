export const COINS = [
  { id:'btc',  sym:'BTC', pair:'BTC/USDT', price:65240, chg:2.41,  high:66100, low:63200, vol:'24,812',   mcap:'$1.28T', ema9:64200, ema21:63500, rsi:58.4, macd:124,  macdSig:88,  stoch:62, adx:38, cci:112, atr:1240, bbUpper:66800, bbLower:63600, vol_rel:1.4, support:63000, resistance:67000 },
  { id:'eth',  sym:'ETH', pair:'ETH/USDT', price:3412,  chg:1.87,  high:3480,  low:3310,  vol:'182,441',  mcap:'$409B', ema9:3380, ema21:3310, rsi:54.1, macd:22,   macdSig:15,  stoch:55, adx:29, cci:80,  atr:88,   bbUpper:3520, bbLower:3280, vol_rel:1.2, support:3250,  resistance:3600 },
  { id:'sol',  sym:'SOL', pair:'SOL/USDT', price:142.8, chg:-0.63, high:146.5, low:140.1, vol:'3.2M',     mcap:'$62B',  ema9:144.2,ema21:141.5,rsi:48.2, macd:-1.4, macdSig:0.8, stoch:42, adx:22, cci:-30, atr:5.2,  bbUpper:150, bbLower:138,  vol_rel:0.9, support:138,   resistance:155 },
  { id:'bnb',  sym:'BNB', pair:'BNB/USDT', price:578,   chg:0.94,  high:586,   low:569,   vol:'41,200',   mcap:'$85B',  ema9:572,  ema21:565,  rsi:56.0, macd:5.2,  macdSig:3.8, stoch:58, adx:31, cci:92,  atr:18,   bbUpper:592, bbLower:562,  vol_rel:1.1, support:562,   resistance:598 },
  { id:'avax', sym:'AVAX',pair:'AVAX/USDT',price:36.4,  chg:-1.22, high:37.8,  low:35.9,  vol:'892K',     mcap:'$15B',  ema9:37.1, ema21:36.8, rsi:44.5, macd:-0.6, macdSig:0.2, stoch:36, adx:19, cci:-60, atr:1.8,  bbUpper:39.5,bbLower:34.5, vol_rel:0.8, support:34.5,  resistance:39.0 },
  { id:'matic',sym:'MATIC',pair:'MATIC/USDT',price:0.84,chg:3.05,  high:0.87,  low:0.80,  vol:'210M',     mcap:'$7.8B', ema9:0.82, ema21:0.79, rsi:62.1, macd:0.018,macdSig:0.011,stoch:68,adx:34, cci:130, atr:0.03, bbUpper:0.90,bbLower:0.78, vol_rel:1.6, support:0.78,  resistance:0.92 },
  { id:'link', sym:'LINK',pair:'LINK/USDT', price:14.2,  chg:1.44,  high:14.6,  low:13.9,  vol:'8.1M',     mcap:'$8.3B', ema9:14.0, ema21:13.7, rsi:57.2, macd:0.28, macdSig:0.18, stoch:60, adx:28, cci:95,  atr:0.52, bbUpper:15.1,bbLower:13.5, vol_rel:1.1, support:13.5,  resistance:15.0 },
  { id:'dot',  sym:'DOT', pair:'DOT/USDT',  price:7.8,   chg:-0.81, high:8.1,   low:7.65,  vol:'12.4M',    mcap:'$10.1B',ema9:7.9,  ema21:7.75, rsi:46.8, macd:-0.08,macdSig:0.04, stoch:38, adx:21, cci:-45, atr:0.31, bbUpper:8.4, bbLower:7.4,  vol_rel:0.85,support:7.5,   resistance:8.4 },
  { id:'ada',  sym:'ADA', pair:'ADA/USDT',  price:0.452, chg:0.33,  high:0.461, low:0.441, vol:'380M',     mcap:'$15.9B',ema9:0.448,ema21:0.441,rsi:52.0, macd:0.003,macdSig:0.001,stoch:51, adx:18, cci:20,  atr:0.012,bbUpper:0.475,bbLower:0.430,vol_rel:1.0, support:0.440, resistance:0.475},
  { id:'xrp',  sym:'XRP', pair:'XRP/USDT',  price:0.621, chg:1.12,  high:0.638, low:0.608, vol:'520M',     mcap:'$34B',  ema9:0.615,ema21:0.601,rsi:55.8, macd:0.008,macdSig:0.005,stoch:57, adx:26, cci:72,  atr:0.018,bbUpper:0.652,bbLower:0.596,vol_rel:1.1, support:0.600, resistance:0.650},
];

export function calcIndicators(coin) {
  const { price, ema9, ema21, rsi, macd, macdSig, stoch, adx, cci, atr, bbUpper, bbLower, vol_rel } = coin;
  const goldenCross = ema9 > ema21;
  return [
    { name:'RSI (14)',       val:rsi.toFixed(1),            cls:rsi>70?'sell':rsi<30?'buy':rsi>55?'buy':'sell',   badge:rsi>70?'OVERKØBT':rsi<30?'OVERSOLGT':rsi>55?'KØB':'SÆLG' },
    { name:'MACD',           val:(macd>0?'+':'')+macd,      cls:macd>macdSig?'buy':'sell',                        badge:macd>macdSig?'KØB':'SÆLG' },
    { name:'EMA 9',          val:'$'+ema9.toLocaleString(), cls:price>ema9?'buy':'sell',                           badge:price>ema9?'KØB':'SÆLG' },
    { name:'EMA 21',         val:'$'+ema21.toLocaleString(),cls:price>ema21?'buy':'sell',                          badge:price>ema21?'KØB':'SÆLG' },
    { name:'EMA Cross',      val:goldenCross?'Golden':'Death', cls:goldenCross?'buy':'sell',                        badge:goldenCross?'KØB':'SÆLG' },
    { name:'Bollinger Bands',val:'$'+bbUpper.toLocaleString(), cls:price<bbUpper&&price>bbLower?'neu':'buy',        badge:price<bbUpper&&price>bbLower?'NEUTRAL':'BREAKOUT' },
    { name:'Stochastic',     val:stoch,                     cls:stoch>80?'sell':stoch<20?'buy':stoch>50?'buy':'sell', badge:stoch>80?'OVERKØBT':stoch<20?'OVERSOLGT':stoch>50?'KØB':'SÆLG' },
    { name:'ADX (14)',       val:adx,                       cls:adx>25?'buy':'neu',                                badge:adx>25?'STÆRK TREND':'SVAG TREND' },
    { name:'CCI (20)',       val:cci,                       cls:cci>100?'buy':cci<-100?'sell':'neu',               badge:cci>100?'KØB':cci<-100?'SÆLG':'NEUTRAL' },
    { name:'ATR (14)',       val:'$'+atr,                   cls:'neu',                                             badge:'VOLATILITET' },
    { name:'Volume',         val:vol_rel.toFixed(1)+'x',    cls:vol_rel>=1.2?'buy':vol_rel<=0.8?'sell':'neu',      badge:vol_rel>=1.2?'HØJ':vol_rel<=0.8?'LAV':'NORMAL' },
    { name:'Pivot Point',    val:'$'+(price*0.995).toLocaleString('en',{maximumFractionDigits:0}), cls:'neu',      badge:'SUPPORT' },
  ];
}

export function calcSignal(indicators) {
  const buys = indicators.filter(i=>i.cls==='buy').length;
  const sells = indicators.filter(i=>i.cls==='sell').length;
  const neus = indicators.filter(i=>i.cls==='neu').length;
  const score = Math.round((buys / (buys + sells || 1)) * 100);
  const word = score>=65?'KØB':score<=35?'SÆLG':'NEUTRAL';
  const cls  = score>=65?'buy':score<=35?'sell':'neu';
  const conf = score>=70?'Høj':score>=50?'Middel':'Lav';
  return { score, word, cls, conf, buys, sells, neus };
}

export function calcTrade(coin, portfolio=10000, riskPct=2, rrRatio=2) {
  const { price, support } = coin;
  const slPct = support>0&&price>support ? Math.min((price-support)/price, 0.12) : 0.02;
  const stopLoss   = Math.round(price*(1-slPct));
  const tp1        = Math.round(price+(price-stopLoss)*rrRatio*0.5);
  const tp2        = Math.round(price+(price-stopLoss)*rrRatio);
  const riskAmt    = Math.round(portfolio*(riskPct/100));
  const posSize    = Math.min(Math.round(riskAmt/slPct), Math.round(portfolio*0.4));
  return { stopLoss, tp1, tp2, riskAmt, posSize, slPct:(slPct*100).toFixed(1) };
}

export function genPrices(base, n=48) {
  let p=base*0.96; const a=[];
  for(let i=0;i<n;i++){p+=p*(Math.random()*0.014-0.005);a.push(Math.round(p*100)/100);}
  a[a.length-1]=base; return a;
}
export function genLabels(n=48) {
  const now=new Date(),a=[];
  for(let i=n-1;i>=0;i--){const d=new Date(now-i*3600*1000);a.push(d.getHours().toString().padStart(2,'0')+':00');}
  return a;
}
export function fmtUSD(n) { return '$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:0}); }
