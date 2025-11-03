// Simulated market data feed
export interface MarketQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: Date;
  impliedVol: number;
}

export interface OptionChain {
  symbol: string;
  expiry: Date;
  strikes: {
    strike: number;
    call: {
      bid: number;
      ask: number;
      last: number;
      volume: number;
      impliedVol: number;
    };
    put: {
      bid: number;
      ask: number;
      last: number;
      volume: number;
      impliedVol: number;
    };
  }[];
}

// Simulate real-time price feed
export function createMarketDataStream(symbol: string, callback: (quote: MarketQuote) => void) {
  let price = 100;
  
  const interval = setInterval(() => {
    // Random walk
    const change = (Math.random() - 0.5) * 2;
    price = Math.max(50, Math.min(150, price + change));
    
    const spread = price * 0.001; // 0.1% spread
    
    callback({
      symbol,
      price,
      bid: price - spread / 2,
      ask: price + spread / 2,
      volume: Math.floor(Math.random() * 10000),
      timestamp: new Date(),
      impliedVol: 0.15 + Math.random() * 0.2,
    });
  }, 1000); // Update every second
  
  return () => clearInterval(interval);
}

// Generate simulated option chain
export function generateOptionChain(
  symbol: string,
  spotPrice: number,
  daysToExpiry: number
): OptionChain {
  const strikes = [];
  const baseStrike = Math.round(spotPrice / 5) * 5;
  
  for (let i = -5; i <= 5; i++) {
    const strike = baseStrike + i * 5;
    const moneyness = strike / spotPrice;
    const timeToExpiry = daysToExpiry / 365;
    
    // Simulate volatility smile
    const skew = Math.abs(moneyness - 1) * 0.1;
    const baseVol = 0.25;
    const impliedVol = baseVol + skew;
    
    // Rough option prices (simplified)
    const callIntrinsic = Math.max(0, spotPrice - strike);
    const putIntrinsic = Math.max(0, strike - spotPrice);
    
    const callTimeValue = spotPrice * impliedVol * Math.sqrt(timeToExpiry) * 0.4;
    const putTimeValue = strike * impliedVol * Math.sqrt(timeToExpiry) * 0.4;
    
    const callPrice = callIntrinsic + callTimeValue;
    const putPrice = putIntrinsic + putTimeValue;
    
    strikes.push({
      strike,
      call: {
        bid: callPrice * 0.98,
        ask: callPrice * 1.02,
        last: callPrice,
        volume: Math.floor(Math.random() * 1000),
        impliedVol: impliedVol,
      },
      put: {
        bid: putPrice * 0.98,
        ask: putPrice * 1.02,
        last: putPrice,
        volume: Math.floor(Math.random() * 1000),
        impliedVol: impliedVol,
      },
    });
  }
  
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysToExpiry);
  
  return {
    symbol,
    expiry,
    strikes,
  };
}
