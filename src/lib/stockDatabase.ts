export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
}

export const STOCK_DATABASE: Stock[] = [
  // Tech Giants
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 185.50, change: 2.35, volume: 52000000 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 378.25, change: -1.20, volume: 28000000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 142.30, change: 3.45, volume: 31000000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', price: 178.80, change: 1.90, volume: 45000000 },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', price: 485.20, change: 5.60, volume: 19000000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', price: 242.50, change: -3.75, volume: 95000000 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: 875.30, change: 15.20, volume: 62000000 },
  
  // Financial
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', price: 185.90, change: 1.15, volume: 12000000 },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial', price: 34.25, change: 0.45, volume: 38000000 },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Financial', price: 425.80, change: -2.10, volume: 2500000 },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 156.75, change: 0.85, volume: 8500000 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', price: 512.30, change: 3.20, volume: 3200000 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', price: 28.45, change: -0.35, volume: 45000000 },
  
  // Consumer
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Defensive', price: 62.30, change: 0.55, volume: 15000000 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive', price: 175.80, change: 1.10, volume: 4200000 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', price: 168.90, change: 0.75, volume: 8700000 },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services', price: 98.50, change: -1.25, volume: 11000000 },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Cyclical', price: 102.45, change: 2.15, volume: 9800000 },
  
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', price: 112.80, change: 1.85, volume: 19000000 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', price: 156.25, change: 2.10, volume: 8500000 },
  
  // ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'ETF', price: 485.30, change: 1.45, volume: 78000000 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF', price: 412.85, change: 2.35, volume: 42000000 },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'ETF', price: 445.60, change: 1.30, volume: 5200000 },
];

export function searchStocks(query: string): Stock[] {
  if (!query) return STOCK_DATABASE.slice(0, 10);
  
  const lowerQuery = query.toLowerCase();
  return STOCK_DATABASE.filter(stock => 
    stock.symbol.toLowerCase().includes(lowerQuery) ||
    stock.name.toLowerCase().includes(lowerQuery)
  );
}

export function getStock(symbol: string): Stock | undefined {
  return STOCK_DATABASE.find(s => s.symbol === symbol);
}

export function generateOptionsChain(stock: Stock) {
  const strikes = [];
  const baseStrike = Math.floor(stock.price / 5) * 5;
  
  for (let i = -5; i <= 5; i++) {
    const strike = baseStrike + (i * 5);
    strikes.push({
      strike,
      call: {
        bid: Math.max(0.01, (stock.price - strike) + Math.random() * 2),
        ask: Math.max(0.02, (stock.price - strike) + Math.random() * 2.5),
        volume: Math.floor(Math.random() * 5000),
        openInterest: Math.floor(Math.random() * 10000),
        delta: Math.max(0, Math.min(1, (stock.price - strike) / stock.price + 0.5)),
        iv: 0.15 + Math.random() * 0.3,
      },
      put: {
        bid: Math.max(0.01, (strike - stock.price) + Math.random() * 2),
        ask: Math.max(0.02, (strike - stock.price) + Math.random() * 2.5),
        volume: Math.floor(Math.random() * 5000),
        openInterest: Math.floor(Math.random() * 10000),
        delta: Math.max(-1, Math.min(0, (stock.price - strike) / stock.price - 0.5)),
        iv: 0.15 + Math.random() * 0.3,
      },
    });
  }
  
  return strikes;
}
