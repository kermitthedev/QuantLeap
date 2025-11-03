const API_BASE_URL = 'http://localhost:3001/api';

export interface RealMarketQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  timestamp: Date;
}

export async function getRealTimeQuote(symbol: string): Promise<RealMarketQuote | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/quote/${symbol}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    
    const data = await response.json();
    
    return {
      ...data,
      timestamp: new Date(data.timestamp),
    };
  } catch (error) {
    console.error('Error fetching real-time quote:', error);
    return null;
  }
}

export async function getRealOptionsChain(symbol: string, expirationDate?: Date) {
  try {
    let url = `${API_BASE_URL}/options/${symbol}`;
    if (expirationDate) {
      url += `?date=${expirationDate.toISOString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch options chain');
    }
    
    const data = await response.json();
    
    return {
      ...data,
      expirationDate: new Date(data.expirationDate),
      availableExpirations: data.availableExpirations.map((d: string) => new Date(d)),
    };
  } catch (error) {
    console.error('Error fetching options chain:', error);
    return null;
  }
}

export async function getHistoricalData(
  symbol: string,
  period1: Date,
  period2: Date,
  interval: '1d' | '1wk' | '1mo' = '1d'
) {
  try {
    const url = `${API_BASE_URL}/historical/${symbol}?period1=${period1.toISOString()}&period2=${period2.toISOString()}&interval=${interval}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    
    const data = await response.json();
    
    return data.map((bar: any) => ({
      ...bar,
      date: new Date(bar.date),
    }));
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

export async function searchSymbols(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/search/${query}`);
    
    if (!response.ok) {
      throw new Error('Failed to search symbols');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

export async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
