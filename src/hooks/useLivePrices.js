import { useState, useEffect, useRef } from 'react';

const COINGECKO_IDS = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana',
  bnb: 'binancecoin', avax: 'avalanche-2', matic: 'matic-network',
  link: 'chainlink', dot: 'polkadot', ada: 'cardano', xrp: 'ripple',
};

export function useLivePrices(coins) {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef(null);

  const fetchPrices = async () => {
    try {
      const ids = coins.map(c => COINGECKO_IDS[c.id]).join(',');
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_high_24h=true&include_low_24h=true`
      );
      if (!res.ok) throw new Error('API fejl');
      const data = await res.json();
      const mapped = {};
      coins.forEach(c => {
        const key = COINGECKO_IDS[c.id];
        if (data[key]) {
          mapped[c.id] = {
            price: data[key].usd,
            chg: data[key].usd_24h_change ?? c.chg,
            high: data[key].usd_24h_high ?? c.high,
            low:  data[key].usd_24h_low  ?? c.low,
          };
        }
      });
      setPrices(mapped);
      setConnected(true);
    } catch (e) {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return { prices, connected };
}
