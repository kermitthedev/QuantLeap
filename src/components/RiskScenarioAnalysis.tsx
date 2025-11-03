import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { calculateBlackScholes } from "@/lib/advanced-options-pricing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ScenarioResult {
  name: string;
  spotChange: number;
  volChange: number;
  newSpot: number;
  newVol: number;
  newPrice: number;
  pnl: number;
  pnlPercent: number;
}

export default function RiskScenarioAnalysis() {
  const [baseParams, setBaseParams] = useState({
    spotPrice: 100,
    strikePrice: 100,
    volatility: 0.25,
    timeToMaturity: 0.25,
    riskFreeRate: 0.05,
    dividendYield: 0,
    optionType: "call" as const,
    position: "long" as const,
    quantity: 10,
  });

  const [customScenario, setCustomScenario] = useState({
    spotChange: 0,
    volChange: 0,
  });

  // Calculate base case
  const baseResult = calculateBlackScholes(baseParams);
  const basePrice = baseResult.price;

  // Predefined stress scenarios
  const scenarios: ScenarioResult[] = [
    // Market crash scenarios
    {
      name: "📉 Market Crash (-20%)",
      spotChange: -20,
      volChange: 80,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    {
      name: "📉 Sharp Drop (-10%)",
      spotChange: -10,
      volChange: 40,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    {
      name: "📉 Moderate Drop (-5%)",
      spotChange: -5,
      volChange: 15,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    // Neutral scenarios
    {
      name: "⚖️ Vol Spike (spot flat)",
      spotChange: 0,
      volChange: 50,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    {
      name: "⚖️ Vol Crush (spot flat)",
      spotChange: 0,
      volChange: -50,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    // Rally scenarios
    {
      name: "📈 Moderate Rally (+5%)",
      spotChange: 5,
      volChange: -10,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    {
      name: "📈 Strong Rally (+10%)",
      spotChange: 10,
      volChange: -20,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    {
      name: "📈 Explosive Rally (+20%)",
      spotChange: 20,
      volChange: -30,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    // Extreme scenarios
    {
      name: "🔥 Black Swan Event",
      spotChange: -35,
      volChange: 150,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
    {
      name: "🚀 Euphoric Surge",
      spotChange: 30,
      volChange: -40,
      newSpot: 0,
      newVol: 0,
      newPrice: 0,
      pnl: 0,
      pnlPercent: 0,
    },
  ];

  // Calculate scenario results
  const scenarioResults = scenarios.map((scenario) => {
    const newSpot = baseParams.spotPrice * (1 + scenario.spotChange / 100);
    const newVol = Math.max(0.01, baseParams.volatility * (1 + scenario.volChange / 100));

    const newResult = calculateBlackScholes({
      ...baseParams,
      spotPrice: newSpot,
      volatility: newVol,
    });

    const positionMultiplier = baseParams.position === "long" ? 1 : -1;
    const pnl = (newResult.price - basePrice) * baseParams.quantity * 100 * positionMultiplier;
    const pnlPercent = ((newResult.price - basePrice) / basePrice) * 100 * positionMultiplier;

    return {
      ...scenario,
      newSpot,
      newVol,
      newPrice: newResult.price,
      pnl,
      pnlPercent,
    };
  });

  // Custom scenario
  const customResult = (() => {
    const newSpot = baseParams.spotPrice * (1 + customScenario.spotChange / 100);
    const newVol = Math.max(0.01, baseParams.volatility * (1 + customScenario.volChange / 100));

    const result = calculateBlackScholes({
      ...baseParams,
      spotPrice: newSpot,
      volatility: newVol,
    });

    const positionMultiplier = baseParams.position === "long" ? 1 : -1;
    const pnl = (result.price - basePrice) * baseParams.quantity * 100 * positionMultiplier;

    return {
      newPrice: result.price,
      pnl,
      pnlPercent: ((result.price - basePrice) / basePrice) * 100 * positionMultiplier,
    };
  })();

  // Risk metrics
  const worstCase = scenarioResults.reduce((worst, curr) =>
    curr.pnl < worst.pnl ? curr : worst
  );
  const bestCase = scenarioResults.reduce((best, curr) =>
    curr.pnl > best.pnl ? curr : best
  );
  const avgPnL = scenarioResults.reduce((sum, s) => sum + s.pnl, 0) / scenarioResults.length;

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return "text-green-500";
    if (pnl < 0) return "text-red-500";
    return "text-muted-foreground";
  };

  const getRiskBadge = (pnl: number) => {
    if (pnl < -5000) return <Badge variant="destructive">CRITICAL</Badge>;
    if (pnl < -2000) return <Badge variant="destructive">HIGH RISK</Badge>;
    if (pnl < -500) return <Badge className="bg-orange-500">MEDIUM RISK</Badge>;
    return <Badge variant="secondary">LOW RISK</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Risk Scenario Analysis
          </h2>
        </div>

        {/* Position Setup */}
        <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label>Spot Price ($)</Label>
            <Input
              type="number"
              value={baseParams.spotPrice}
              onChange={(e) => setBaseParams({ ...baseParams, spotPrice: parseFloat(e.target.value) || 100 })}
            />
          </div>
          <div>
            <Label>Strike ($)</Label>
            <Input
              type="number"
              value={baseParams.strikePrice}
              onChange={(e) => setBaseParams({ ...baseParams, strikePrice: parseFloat(e.target.value) || 100 })}
            />
          </div>
          <div>
            <Label>Volatility (%)</Label>
            <Input
              type="number"
              value={(baseParams.volatility * 100).toFixed(0)}
              onChange={(e) => setBaseParams({ ...baseParams, volatility: (parseFloat(e.target.value) || 25) / 100 })}
            />
          </div>
          <div>
            <Label>Position</Label>
            <select
              value={baseParams.position}
              onChange={(e) => setBaseParams({ ...baseParams, position: e.target.value as any })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div>
            <Label>Quantity (Contracts)</Label>
            <Input
              type="number"
              value={baseParams.quantity}
              onChange={(e) => setBaseParams({ ...baseParams, quantity: parseInt(e.target.value) || 10 })}
            />
          </div>
        </div>

        {/* Base Case */}
        <div className="mb-6 p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
          <h3 className="font-semibold mb-3">Base Case</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Option Price</p>
              <p className="text-2xl font-mono font-bold">${basePrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Position Value</p>
              <p className="text-2xl font-mono font-bold">
                ${(basePrice * baseParams.quantity * 100).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delta</p>
              <p className="text-2xl font-mono font-bold">{baseResult.greeks.delta.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vega</p>
              <p className="text-2xl font-mono font-bold">{baseResult.greeks.vega.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <p className="text-sm font-semibold">Worst Case</p>
            </div>
            <p className="text-3xl font-mono font-bold text-red-500">
              ${worstCase.pnl.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{worstCase.name}</p>
          </Card>

          <Card className="p-4 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <p className="text-sm font-semibold">Average</p>
            </div>
            <p className={`text-3xl font-mono font-bold ${getPnLColor(avgPnL)}`}>
              ${avgPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across all scenarios</p>
          </Card>

          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <p className="text-sm font-semibold">Best Case</p>
            </div>
            <p className="text-3xl font-mono font-bold text-green-500">
              ${bestCase.pnl.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{bestCase.name}</p>
          </Card>
        </div>

        {/* Custom Scenario Builder */}
        <Card className="p-4 mb-6 bg-purple-500/5 border-purple-500/20">
          <h3 className="font-semibold mb-4">🎯 Custom Scenario Builder</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Spot Price Change (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[customScenario.spotChange]}
                  onValueChange={([value]) => setCustomScenario({ ...customScenario, spotChange: value })}
                  min={-50}
                  max={50}
                  step={1}
                />
                <Input
                  type="number"
                  value={customScenario.spotChange}
                  onChange={(e) => setCustomScenario({ ...customScenario, spotChange: parseFloat(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            </div>
            <div>
              <Label>Volatility Change (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[customScenario.volChange]}
                  onValueChange={([value]) => setCustomScenario({ ...customScenario, volChange: value })}
                  min={-80}
                  max={200}
                  step={5}
                />
                <Input
                  type="number"
                  value={customScenario.volChange}
                  onChange={(e) => setCustomScenario({ ...customScenario, volChange: parseFloat(e.target.value) || 0 })}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-background rounded border">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">New Price:</p>
                <p className="font-mono font-bold">${customResult.newPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">P&L:</p>
                <p className={`font-mono font-bold text-lg ${getPnLColor(customResult.pnl)}`}>
                  ${customResult.pnl.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">P&L %:</p>
                <p className={`font-mono font-bold ${getPnLColor(customResult.pnl)}`}>
                  {customResult.pnlPercent >= 0 ? "+" : ""}{customResult.pnlPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Scenario Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Stress Test Scenarios</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead className="text-right">Spot Δ</TableHead>
                <TableHead className="text-right">Vol Δ</TableHead>
                <TableHead className="text-right">New Price</TableHead>
                <TableHead className="text-right">P&L ($)</TableHead>
                <TableHead className="text-right">P&L %</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarioResults.map((scenario, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{scenario.name}</TableCell>
                  <TableCell className={`text-right font-mono ${scenario.spotChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {scenario.spotChange >= 0 ? "+" : ""}{scenario.spotChange}%
                  </TableCell>
                  <TableCell className={`text-right font-mono ${scenario.volChange >= 0 ? "text-orange-500" : "text-blue-500"}`}>
                    {scenario.volChange >= 0 ? "+" : ""}{scenario.volChange}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${scenario.newPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-bold ${getPnLColor(scenario.pnl)}`}>
                    {scenario.pnl >= 0 ? "+" : ""}${scenario.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className={`text-right font-mono ${getPnLColor(scenario.pnl)}`}>
                    {scenario.pnlPercent >= 0 ? "+" : ""}{scenario.pnlPercent.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(scenario.pnl)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Risk Warnings */}
        {worstCase.pnl < -10000 && (
          <div className="mt-6 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400 mb-1">⚠️ HIGH RISK WARNING</p>
                <p className="text-sm">
                  Your position has significant downside risk. In the worst-case scenario ({worstCase.name}), 
                  you could lose <strong>${Math.abs(worstCase.pnl).toLocaleString()}</strong>. 
                  Consider hedging strategies or reducing position size.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
