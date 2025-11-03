// Simplified version - replace with advanced-options-pricing.ts
export interface OptionParameters {
  spotPrice: number;
  strikePrice: number;
  volatility: number;
  timeToMaturity: number;
  riskFreeRate: number;
  dividendYield: number;
  optionType: "call" | "put";
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
}

function normalPDF(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

export function calculateBlackScholes(params: OptionParameters): { price: number; greeks: Greeks } {
  const { spotPrice: S, strikePrice: K, volatility: sigma, timeToMaturity: T, riskFreeRate: r, dividendYield: q, optionType } = params;

  const d1 = (Math.log(S / K) + (r - q + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  let price: number;
  if (optionType === "call") {
    price = S * Math.exp(-q * T) * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    price = K * Math.exp(-r * T) * normalCDF(-d2) - S * Math.exp(-q * T) * normalCDF(-d1);
  }

  const delta = optionType === "call" ? Math.exp(-q * T) * normalCDF(d1) : -Math.exp(-q * T) * normalCDF(-d1);
  const gamma = (Math.exp(-q * T) * normalPDF(d1)) / (S * sigma * Math.sqrt(T));
  const theta = 0; // Simplified
  const vega = S * Math.exp(-q * T) * normalPDF(d1) * Math.sqrt(T) / 100;
  const rho = 0; // Simplified

  return { price, greeks: { delta, gamma, theta, vega, rho } };
}

export function calculateMonteCarlo(params: OptionParameters) {
  return calculateBlackScholes(params);
}

export function calculateBinomial(params: OptionParameters) {
  return calculateBlackScholes(params);
}
