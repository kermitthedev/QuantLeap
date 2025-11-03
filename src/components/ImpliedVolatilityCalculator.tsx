import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { calculateImpliedVolatility } from "@/lib/advanced-options-pricing";
import type { OptionParameters } from "@/components/ParameterInputPanel";

interface ImpliedVolResult {
  impliedVol: number;
  iterations: number;
  converged: boolean;
  computationTime: number;
}

export default function ImpliedVolatilityCalculator() {
  const [marketPrice, setMarketPrice] = useState<number>(10);
  const [spotPrice, setSpotPrice] = useState<number>(100);
  const [strikePrice, setStrikePrice] = useState<number>(100);
  const [timeToMaturity, setTimeToMaturity] = useState<number>(1);
  const [riskFreeRate, setRiskFreeRate] = useState<number>(0.05);
  const [dividendYield, setDividendYield] = useState<number>(0);
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [result, setResult] = useState<ImpliedVolResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    
    const startTime = performance.now();
    
    const params: Omit<OptionParameters, 'volatility'> = {
      spotPrice,
      strikePrice,
      timeToMaturity,
      riskFreeRate,
      dividendYield,
      optionType,
    };

    try {
      const ivResult = calculateImpliedVolatility(marketPrice, params, 0.3, 1e-6, 100);
      const computationTime = performance.now() - startTime;
      
      setResult({
        ...ivResult,
        computationTime,
      });
    } catch (error) {
      console.error("Implied Vol calculation error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getVolLevel = (vol: number): { level: string; color: string } => {
    if (vol < 0.15) return { level: "Very Low", color: "text-green-600" };
    if (vol < 0.25) return { level: "Low", color: "text-blue-600" };
    if (vol < 0.35) return { level: "Normal", color: "text-yellow-600" };
    if (vol < 0.50) return { level: "Elevated", color: "text-orange-600" };
    return { level: "High", color: "text-red-600" };
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Implied Volatility Calculator
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reverse-engineer volatility from market option prices
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Input Parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="market-price">Market Option Price ($)</Label>
            <Input
              id="market-price"
              type="number"
              step="0.01"
              value={marketPrice}
              onChange={(e) => setMarketPrice(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="option-type">Option Type</Label>
            <select
              id="option-type"
              value={optionType}
              onChange={(e) => setOptionType(e.target.value as "call" | "put")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv-spot">Spot Price ($)</Label>
            <Input
              id="iv-spot"
              type="number"
              step="0.01"
              value={spotPrice}
              onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv-strike">Strike Price ($)</Label>
            <Input
              id="iv-strike"
              type="number"
              step="0.01"
              value={strikePrice}
              onChange={(e) => setStrikePrice(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv-time">Time to Maturity (years)</Label>
            <Input
              id="iv-time"
              type="number"
              step="0.01"
              value={timeToMaturity}
              onChange={(e) => setTimeToMaturity(parseFloat(e.target.value) || 0)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iv-rate">Risk-Free Rate (%)</Label>
            <Input
              id="iv-rate"
              type="number"
              step="0.01"
              value={riskFreeRate * 100}
              onChange={(e) => setRiskFreeRate((parseFloat(e.target.value) || 0) / 100)}
              className="font-mono"
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? "Calculating..." : "Calculate Implied Volatility"}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-2 ${result.converged ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Implied Volatility</h3>
                {result.converged ? (
                  <Badge variant="outline" className="bg-green-500/20 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Converged
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/20 text-red-700 dark:text-red-300">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed to Converge
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-5xl font-mono font-bold ${result.converged ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {(result.impliedVol * 100).toFixed(2)}%
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <TrendingUp className="h-4 w-4" />
                      <span className={getVolLevel(result.impliedVol).color + " font-semibold"}>
                        {getVolLevel(result.impliedVol).level}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Annualized Implied Volatility: {result.impliedVol.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Iterations</p>
                    <p className="text-lg font-mono font-semibold">
                      {result.iterations}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Computation Time</p>
                    <p className="text-lg font-mono font-semibold">
                      {result.computationTime.toFixed(2)}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {result.converged && (
              <Alert>
                <AlertDescription>
                  <strong>Interpretation:</strong> The market is pricing this option with an 
                  implied volatility of {(result.impliedVol * 100).toFixed(2)}%. This suggests 
                  that the market expects the underlying asset to move approximately{' '}
                  {(result.impliedVol * 100 / Math.sqrt(252)).toFixed(2)}% per day, or{' '}
                  {(result.impliedVol * 100).toFixed(2)}% annually (annualized).
                </AlertDescription>
              </Alert>
            )}

            {!result.converged && (
              <Alert variant="destructive">
                <AlertDescription>
                  The Newton-Raphson iteration failed to converge within 100 iterations. 
                  This could indicate that the market price is inconsistent with the Black-Scholes 
                  model, or the option is deeply in/out of the money with extreme parameters.
                </AlertDescription>
              </Alert>
            )}

            {/* Volatility Context */}
            {result.converged && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Volatility Context</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Expected Move:</span>
                    <span className="font-mono font-medium">
                      ±{(spotPrice * result.impliedVol / Math.sqrt(252)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1-Std Dev Range (Annual):</span>
                    <span className="font-mono font-medium">
                      ${(spotPrice * (1 - result.impliedVol)).toFixed(2)} - ${(spotPrice * (1 + result.impliedVol)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2-Std Dev Range (Annual):</span>
                    <span className="font-mono font-medium">
                      ${(spotPrice * (1 - 2 * result.impliedVol)).toFixed(2)} - ${(spotPrice * (1 + 2 * result.impliedVol)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Moneyness:</span>
                    <Badge variant="outline" className="text-xs">
                      {spotPrice > strikePrice * 1.05 ? "ITM" : spotPrice < strikePrice * 0.95 ? "OTM" : "ATM"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
