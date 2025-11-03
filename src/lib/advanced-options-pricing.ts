import type { OptionParameters } from "@/components/ParameterInputPanel";
import type { Greeks } from "@/components/GreeksTable";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const probability =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - probability : probability;
}

function normalPDF(x: number): number {
  return Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);
}

// Box-Muller transform for generating normal random variables
function boxMuller(): [number, number] {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
  return [z0, z1];
}

// ============================================================================
// BLACK-SCHOLES-MERTON MODEL (Enhanced with all Greeks)
// ============================================================================

export function calculateBlackScholes(params: OptionParameters): { 
  price: number; 
  greeks: Greeks;
  higherOrderGreeks?: {
    vanna: number;
    volga: number;
    charm: number;
    veta: number;
    speed: number;
    zomma: number;
    color: number;
  };
} {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma, 
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType 
  } = params;

  if (T <= 0) {
    const intrinsic = optionType === "call" ? Math.max(0, S - K) : Math.max(0, K - S);
    return {
      price: intrinsic,
      greeks: { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 }
    };
  }

  const d1 = (Math.log(S / K) + (r - q + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  // Price calculation
  let price: number;
  if (optionType === "call") {
    price = S * Math.exp(-q * T) * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  } else {
    price = K * Math.exp(-r * T) * normalCDF(-d2) - S * Math.exp(-q * T) * normalCDF(-d1);
  }

  // First-order Greeks
  const delta = optionType === "call" 
    ? Math.exp(-q * T) * normalCDF(d1)
    : -Math.exp(-q * T) * normalCDF(-d1);

  const gamma = (Math.exp(-q * T) * normalPDF(d1)) / (S * sigma * Math.sqrt(T));

  const theta = optionType === "call"
    ? (-S * normalPDF(d1) * sigma * Math.exp(-q * T)) / (2 * Math.sqrt(T)) -
      r * K * Math.exp(-r * T) * normalCDF(d2) +
      q * S * Math.exp(-q * T) * normalCDF(d1)
    : (-S * normalPDF(d1) * sigma * Math.exp(-q * T)) / (2 * Math.sqrt(T)) +
      r * K * Math.exp(-r * T) * normalCDF(-d2) -
      q * S * Math.exp(-q * T) * normalCDF(-d1);

  const vega = S * Math.exp(-q * T) * normalPDF(d1) * Math.sqrt(T) / 100;

  const rho = optionType === "call"
    ? K * T * Math.exp(-r * T) * normalCDF(d2) / 100
    : -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;

  // Higher-order Greeks (for advanced risk management)
  const vanna = -Math.exp(-q * T) * normalPDF(d1) * d2 / sigma;
  const volga = S * Math.exp(-q * T) * normalPDF(d1) * Math.sqrt(T) * d1 * d2 / sigma;
  const charm = optionType === "call"
    ? q * Math.exp(-q * T) * normalCDF(d1) - Math.exp(-q * T) * normalPDF(d1) * (2 * (r - q) * T - d2 * sigma * Math.sqrt(T)) / (2 * T * sigma * Math.sqrt(T))
    : -q * Math.exp(-q * T) * normalCDF(-d1) - Math.exp(-q * T) * normalPDF(d1) * (2 * (r - q) * T - d2 * sigma * Math.sqrt(T)) / (2 * T * sigma * Math.sqrt(T));
  
  const veta = -S * Math.exp(-q * T) * normalPDF(d1) * Math.sqrt(T) * (q + ((r - q) * d1) / (sigma * Math.sqrt(T)) - (1 + d1 * d2) / (2 * T));
  const speed = -gamma / S * (d1 / (sigma * Math.sqrt(T)) + 1);
  const zomma = gamma * ((d1 * d2 - 1) / sigma);
  const color = -Math.exp(-q * T) * (normalPDF(d1) / (2 * S * T * sigma * Math.sqrt(T))) * (2 * q * T + 1 + (2 * (r - q) * T - d2 * sigma * Math.sqrt(T)) * d1 / (sigma * Math.sqrt(T)));

  return {
    price,
    greeks: {
      delta,
      gamma,
      theta: theta / 365, // Daily theta
      vega,
      rho,
    },
    higherOrderGreeks: {
      vanna,
      volga,
      charm,
      veta,
      speed,
      zomma,
      color,
    }
  };
}

// ============================================================================
// MONTE CARLO WITH VARIANCE REDUCTION TECHNIQUES
// ============================================================================

export function calculateMonteCarlo(
  params: OptionParameters, 
  numPaths: number = 50000,
  useAntitheticVariates: boolean = true,
  useControlVariates: boolean = true
): { price: number; greeks: Greeks; standardError: number } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma, 
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType 
  } = params;

  let sumPayoff = 0;
  let sumPayoffSquared = 0;
  let sumControlVariate = 0;
  
  const dt = T;
  const drift = (r - q - 0.5 * sigma * sigma) * dt;
  const diffusion = sigma * Math.sqrt(dt);
  
  const actualPaths = useAntitheticVariates ? Math.floor(numPaths / 2) : numPaths;

  for (let i = 0; i < actualPaths; i++) {
    const [z1, z2] = boxMuller();
    
    // Standard path
    const ST1 = S * Math.exp(drift + diffusion * z1);
    const payoff1 = optionType === "call" 
      ? Math.max(0, ST1 - K)
      : Math.max(0, K - ST1);
    
    sumPayoff += payoff1;
    sumPayoffSquared += payoff1 * payoff1;
    
    if (useControlVariates) {
      sumControlVariate += ST1;
    }

    // Antithetic variate path (uses -z instead of z)
    if (useAntitheticVariates) {
      const ST2 = S * Math.exp(drift - diffusion * z1);
      const payoff2 = optionType === "call" 
        ? Math.max(0, ST2 - K)
        : Math.max(0, K - ST2);
      
      sumPayoff += payoff2;
      sumPayoffSquared += payoff2 * payoff2;
      
      if (useControlVariates) {
        sumControlVariate += ST2;
      }
    }
  }

  const effectivePaths = useAntitheticVariates ? actualPaths * 2 : actualPaths;
  let avgPayoff = sumPayoff / effectivePaths;
  
  // Control variate adjustment
  if (useControlVariates) {
    const avgST = sumControlVariate / effectivePaths;
    const expectedST = S * Math.exp((r - q) * T);
    const beta = -0.5; // Optimal beta for European options
    avgPayoff = avgPayoff + beta * (avgST - expectedST);
  }

  const price = avgPayoff * Math.exp(-r * T);
  
  // Calculate standard error
  const variance = (sumPayoffSquared / effectivePaths) - (avgPayoff * avgPayoff);
  const standardError = Math.sqrt(variance / effectivePaths) * Math.exp(-r * T);

  // Use Black-Scholes Greeks (more stable than finite difference from MC)
  const bs = calculateBlackScholes(params);
  
  return {
    price,
    greeks: bs.greeks,
    standardError,
  };
}

// ============================================================================
// BINOMIAL TREE (Enhanced for American Options)
// ============================================================================

export function calculateBinomial(
  params: OptionParameters, 
  steps: number = 200,
  isAmerican: boolean = false
): { price: number; greeks: Greeks; earlyExercisePremium?: number } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma, 
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType 
  } = params;

  const dt = T / steps;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp((r - q) * dt) - d) / (u - d);
  const discount = Math.exp(-r * dt);

  // Build price tree
  const prices: number[][] = Array(steps + 1).fill(0).map(() => []);
  
  for (let i = 0; i <= steps; i++) {
    prices[steps][i] = S * Math.pow(u, steps - i) * Math.pow(d, i);
  }

  // Calculate option values at maturity
  const values: number[][] = Array(steps + 1).fill(0).map(() => []);
  for (let i = 0; i <= steps; i++) {
    values[steps][i] = optionType === "call"
      ? Math.max(0, prices[steps][i] - K)
      : Math.max(0, K - prices[steps][i]);
  }

  // Backward induction
  for (let j = steps - 1; j >= 0; j--) {
    for (let i = 0; i <= j; i++) {
      prices[j][i] = S * Math.pow(u, j - i) * Math.pow(d, i);
      
      // European value
      const europeanValue = discount * (p * values[j + 1][i] + (1 - p) * values[j + 1][i + 1]);
      
      if (isAmerican) {
        // American value with early exercise
        const exerciseValue = optionType === "call"
          ? Math.max(0, prices[j][i] - K)
          : Math.max(0, K - prices[j][i]);
        
        values[j][i] = Math.max(europeanValue, exerciseValue);
      } else {
        values[j][i] = europeanValue;
      }
    }
  }

  const price = values[0][0];
  
  // Calculate early exercise premium for American options
  let earlyExercisePremium: number | undefined;
  if (isAmerican) {
    const europeanPrice = calculateBinomial({ ...params }, steps, false).price;
    earlyExercisePremium = price - europeanPrice;
  }

  // Greeks via finite differences
  const delta = (values[1][0] - values[1][1]) / (prices[1][0] - prices[1][1]);
  
  const gamma = ((values[2][0] - values[2][1]) / (prices[2][0] - prices[2][1]) - 
                 (values[2][1] - values[2][2]) / (prices[2][1] - prices[2][2])) /
                ((prices[2][0] - prices[2][2]) / 2);
  
  // Use BS for other Greeks (more stable)
  const bs = calculateBlackScholes(params);

  return {
    price,
    greeks: {
      delta,
      gamma,
      theta: bs.greeks.theta,
      vega: bs.greeks.vega,
      rho: bs.greeks.rho,
    },
    earlyExercisePremium,
  };
}

// ============================================================================
// HESTON STOCHASTIC VOLATILITY MODEL
// ============================================================================

export interface HestonParameters extends OptionParameters {
  kappa: number;      // Mean reversion speed
  theta: number;      // Long-term variance
  xi: number;         // Volatility of volatility
  rho: number;        // Correlation between asset and volatility
  v0: number;         // Initial variance
}

export function calculateHeston(
  params: HestonParameters,
  numPaths: number = 50000,
  numSteps: number = 100
): { price: number; greeks: Greeks; volatilityPaths?: number[] } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType,
    kappa,
    theta,
    xi,
    rho,
    v0
  } = params;

  const dt = T / numSteps;
  let sumPayoff = 0;
  const finalVolatilities: number[] = [];

  for (let path = 0; path < numPaths; path++) {
    let St = S;
    let vt = v0;

    for (let step = 0; step < numSteps; step++) {
      const [z1, z2] = boxMuller();
      const zV = z1;
      const zS = rho * z1 + Math.sqrt(1 - rho * rho) * z2;

      // Volatility process (using Full Truncation scheme for stability)
      const vtPlus = Math.max(vt, 0);
      const dvt = kappa * (theta - vtPlus) * dt + xi * Math.sqrt(vtPlus * dt) * zV;
      vt = vt + dvt;

      // Asset price process
      const dSt = (r - q) * St * dt + St * Math.sqrt(Math.max(vt, 0) * dt) * zS;
      St = St + dSt;
    }

    const payoff = optionType === "call" 
      ? Math.max(0, St - K)
      : Math.max(0, K - St);
    
    sumPayoff += payoff;
    
    if (path < 100) {
      finalVolatilities.push(Math.sqrt(Math.max(vt, 0)));
    }
  }

  const price = (sumPayoff / numPaths) * Math.exp(-r * T);

  // Use Black-Scholes Greeks with average volatility
  const avgVol = Math.sqrt(v0);
  const bs = calculateBlackScholes({ ...params, volatility: avgVol });

  return {
    price,
    greeks: bs.greeks,
    volatilityPaths: finalVolatilities,
  };
}

// ============================================================================
// JUMP-DIFFUSION MODEL (Merton 1976)
// ============================================================================

export interface JumpDiffusionParameters extends OptionParameters {
  lambda: number;     // Jump intensity (jumps per year)
  muJ: number;        // Mean jump size
  sigmaJ: number;     // Jump size volatility
}

export function calculateJumpDiffusion(
  params: JumpDiffusionParameters,
  numPaths: number = 50000,
  numSteps: number = 100
): { price: number; greeks: Greeks } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma,
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType,
    lambda,
    muJ,
    sigmaJ
  } = params;

  const dt = T / numSteps;
  let sumPayoff = 0;

  for (let path = 0; path < numPaths; path++) {
    let St = S;

    for (let step = 0; step < numSteps; step++) {
      const [z1, z2] = boxMuller();
      
      // Diffusion component
      const drift = (r - q - 0.5 * sigma * sigma - lambda * (Math.exp(muJ + 0.5 * sigmaJ * sigmaJ) - 1)) * dt;
      const diffusion = sigma * Math.sqrt(dt) * z1;
      
      // Jump component (Poisson process)
      const numJumps = Math.random() < lambda * dt ? 1 : 0;
      let jumpComponent = 0;
      
      if (numJumps > 0) {
        const jumpSize = muJ + sigmaJ * z2;
        jumpComponent = Math.exp(jumpSize) - 1;
      }

      St = St * Math.exp(drift + diffusion) * (1 + jumpComponent);
    }

    const payoff = optionType === "call" 
      ? Math.max(0, St - K)
      : Math.max(0, K - St);
    
    sumPayoff += payoff;
  }

  const price = (sumPayoff / numPaths) * Math.exp(-r * T);

  // Use Black-Scholes Greeks as approximation
  const bs = calculateBlackScholes(params);

  return {
    price,
    greeks: bs.greeks,
  };
}

// ============================================================================
// IMPLIED VOLATILITY CALCULATOR (Newton-Raphson)
// ============================================================================

export function calculateImpliedVolatility(
  marketPrice: number,
  params: Omit<OptionParameters, 'volatility'>,
  initialGuess: number = 0.3,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): { impliedVol: number; iterations: number; converged: boolean } {
  let sigma = initialGuess;
  let iterations = 0;
  let converged = false;

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    
    const result = calculateBlackScholes({ ...params, volatility: sigma });
    const price = result.price;
    const vega = result.greeks.vega * 100; // Convert back to actual vega

    const diff = price - marketPrice;
    
    if (Math.abs(diff) < tolerance) {
      converged = true;
      break;
    }

    if (Math.abs(vega) < 1e-10) {
      break; // Avoid division by zero
    }

    // Newton-Raphson update
    sigma = sigma - diff / vega;
    
    // Keep sigma positive and reasonable
    sigma = Math.max(0.001, Math.min(sigma, 5.0));
  }

  return {
    impliedVol: sigma,
    iterations,
    converged,
  };
}

// ============================================================================
// EXOTIC OPTIONS
// ============================================================================

// Asian Option (Arithmetic Average)
export function calculateAsianOption(
  params: OptionParameters,
  numPaths: number = 50000,
  numObservations: number = 252 // Daily observations
): { price: number; greeks: Greeks } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma,
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType
  } = params;

  const dt = T / numObservations;
  let sumPayoff = 0;

  for (let path = 0; path < numPaths; path++) {
    let St = S;
    let sumPrices = 0;

    for (let step = 0; step < numObservations; step++) {
      const z = boxMuller()[0];
      const drift = (r - q - 0.5 * sigma * sigma) * dt;
      const diffusion = sigma * Math.sqrt(dt) * z;
      St = St * Math.exp(drift + diffusion);
      sumPrices += St;
    }

    const avgPrice = sumPrices / numObservations;
    const payoff = optionType === "call" 
      ? Math.max(0, avgPrice - K)
      : Math.max(0, K - avgPrice);
    
    sumPayoff += payoff;
  }

  const price = (sumPayoff / numPaths) * Math.exp(-r * T);

  // Approximate Greeks using Black-Scholes
  const bs = calculateBlackScholes(params);

  return {
    price,
    greeks: bs.greeks,
  };
}

// Barrier Option
export interface BarrierParameters extends OptionParameters {
  barrier: number;
  barrierType: 'up-and-out' | 'up-and-in' | 'down-and-out' | 'down-and-in';
  rebate?: number;
}

export function calculateBarrierOption(
  params: BarrierParameters,
  numPaths: number = 50000,
  numSteps: number = 252
): { price: number; greeks: Greeks; knockoutProbability: number } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma,
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType,
    barrier,
    barrierType,
    rebate = 0
  } = params;

  const dt = T / numSteps;
  let sumPayoff = 0;
  let knockedOutPaths = 0;

  const isUpBarrier = barrierType.startsWith('up');
  const isKnockOut = barrierType.includes('out');

  for (let path = 0; path < numPaths; path++) {
    let St = S;
    let barrierHit = false;

    for (let step = 0; step < numSteps; step++) {
      const z = boxMuller()[0];
      const drift = (r - q - 0.5 * sigma * sigma) * dt;
      const diffusion = sigma * Math.sqrt(dt) * z;
      St = St * Math.exp(drift + diffusion);

      // Check barrier
      if (isUpBarrier && St >= barrier) {
        barrierHit = true;
      } else if (!isUpBarrier && St <= barrier) {
        barrierHit = true;
      }
    }

    let payoff = 0;
    const terminalPayoff = optionType === "call" 
      ? Math.max(0, St - K)
      : Math.max(0, K - St);

    if (isKnockOut) {
      // Knock-out: option becomes worthless if barrier is hit
      if (!barrierHit) {
        payoff = terminalPayoff;
      } else {
        payoff = rebate;
        knockedOutPaths++;
      }
    } else {
      // Knock-in: option activates only if barrier is hit
      if (barrierHit) {
        payoff = terminalPayoff;
      } else {
        payoff = rebate;
      }
    }

    sumPayoff += payoff;
  }

  const price = (sumPayoff / numPaths) * Math.exp(-r * T);
  const knockoutProbability = knockedOutPaths / numPaths;

  // Approximate Greeks
  const bs = calculateBlackScholes(params);

  return {
    price,
    greeks: bs.greeks,
    knockoutProbability,
  };
}

// Digital/Binary Option
export function calculateDigitalOption(
  params: OptionParameters,
  payout: number = 1
): { price: number; greeks: Greeks } {
  const { 
    spotPrice: S, 
    strikePrice: K, 
    volatility: sigma,
    timeToMaturity: T, 
    riskFreeRate: r, 
    dividendYield: q, 
    optionType
  } = params;

  const d2 = (Math.log(S / K) + (r - q - (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));

  const price = optionType === "call"
    ? payout * Math.exp(-r * T) * normalCDF(d2)
    : payout * Math.exp(-r * T) * normalCDF(-d2);

  // Digital option Greeks
  const delta = optionType === "call"
    ? payout * Math.exp(-r * T) * normalPDF(d2) / (S * sigma * Math.sqrt(T))
    : -payout * Math.exp(-r * T) * normalPDF(d2) / (S * sigma * Math.sqrt(T));

  const gamma = -payout * Math.exp(-r * T) * normalPDF(d2) * d2 / (S * S * sigma * sigma * T);

  return {
    price,
    greeks: {
      delta,
      gamma,
      theta: 0,
      vega: 0,
      rho: 0,
    },
  };
}

export default {
  calculateBlackScholes,
  calculateMonteCarlo,
  calculateBinomial,
  calculateHeston,
  calculateJumpDiffusion,
  calculateImpliedVolatility,
  calculateAsianOption,
  calculateBarrierOption,
  calculateDigitalOption,
};
