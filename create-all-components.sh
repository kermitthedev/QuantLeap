#!/bin/bash

echo "Creating all supporting components..."

# ParameterInputPanel
cat > src/components/ParameterInputPanel.tsx << 'PARAM'
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";

export interface OptionParameters {
  spotPrice: number;
  strikePrice: number;
  volatility: number;
  timeToMaturity: number;
  riskFreeRate: number;
  dividendYield: number;
  optionType: "call" | "put";
}

interface ParameterInputPanelProps {
  parameters: OptionParameters;
  onParametersChange: (params: OptionParameters) => void;
  onCalculate: () => void;
  isCalculating?: boolean;
}

export default function ParameterInputPanel({
  parameters,
  onParametersChange,
  onCalculate,
  isCalculating = false,
}: ParameterInputPanelProps) {
  const updateParameter = (key: keyof OptionParameters, value: number | string) => {
    onParametersChange({ ...parameters, [key]: value });
  };

  const resetToDefaults = () => {
    onParametersChange({
      spotPrice: 100,
      strikePrice: 100,
      volatility: 0.2,
      timeToMaturity: 1,
      riskFreeRate: 0.05,
      dividendYield: 0,
      optionType: "call",
    });
  };

  return (
    <Card className="p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Parameters</h2>
          <Button variant="ghost" size="icon" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 p-4 border rounded-md">
            <Label className="text-xs uppercase tracking-wider font-medium">Option Type</Label>
            <Select value={parameters.optionType} onValueChange={(value) => updateParameter("optionType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call Option</SelectItem>
                <SelectItem value="put">Put Option</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <Label htmlFor="spot-price" className="text-xs uppercase tracking-wider font-medium">
              Spot Price <span className="text-muted-foreground">($)</span>
            </Label>
            <Input
              id="spot-price"
              type="number"
              value={parameters.spotPrice}
              onChange={(e) => updateParameter("spotPrice", parseFloat(e.target.value) || 0)}
              className="h-12 text-lg font-mono"
            />
            <Slider
              value={[parameters.spotPrice]}
              onValueChange={([value]) => updateParameter("spotPrice", value)}
              min={50}
              max={150}
              step={1}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <Label htmlFor="strike-price" className="text-xs uppercase tracking-wider font-medium">
              Strike Price <span className="text-muted-foreground">($)</span>
            </Label>
            <Input
              id="strike-price"
              type="number"
              value={parameters.strikePrice}
              onChange={(e) => updateParameter("strikePrice", parseFloat(e.target.value) || 0)}
              className="h-12 text-lg font-mono"
            />
            <Slider
              value={[parameters.strikePrice]}
              onValueChange={([value]) => updateParameter("strikePrice", value)}
              min={50}
              max={150}
              step={1}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <Label htmlFor="volatility" className="text-xs uppercase tracking-wider font-medium">
              Volatility <span className="text-muted-foreground">(%)</span>
            </Label>
            <Input
              id="volatility"
              type="number"
              value={(parameters.volatility * 100).toFixed(1)}
              onChange={(e) => updateParameter("volatility", (parseFloat(e.target.value) || 0) / 100)}
              className="h-12 text-lg font-mono"
            />
            <Slider
              value={[parameters.volatility * 100]}
              onValueChange={([value]) => updateParameter("volatility", value / 100)}
              min={5}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <Label htmlFor="time-to-maturity" className="text-xs uppercase tracking-wider font-medium">
              Time to Maturity <span className="text-muted-foreground">(years)</span>
            </Label>
            <Input
              id="time-to-maturity"
              type="number"
              value={parameters.timeToMaturity.toFixed(2)}
              onChange={(e) => updateParameter("timeToMaturity", parseFloat(e.target.value) || 0)}
              className="h-12 text-lg font-mono"
            />
            <Slider
              value={[parameters.timeToMaturity * 100]}
              onValueChange={([value]) => updateParameter("timeToMaturity", value / 100)}
              min={1}
              max={500}
              step={1}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <Label htmlFor="risk-free-rate" className="text-xs uppercase tracking-wider font-medium">
              Risk-Free Rate <span className="text-muted-foreground">(%)</span>
            </Label>
            <Input
              id="risk-free-rate"
              type="number"
              value={(parameters.riskFreeRate * 100).toFixed(2)}
              onChange={(e) => updateParameter("riskFreeRate", (parseFloat(e.target.value) || 0) / 100)}
              className="h-12 text-lg font-mono"
            />
            <Slider
              value={[parameters.riskFreeRate * 100]}
              onValueChange={([value]) => updateParameter("riskFreeRate", value / 100)}
              min={0}
              max={20}
              step={0.1}
            />
          </div>

          <div className="space-y-3 p-4 border rounded-md">
            <Label htmlFor="dividend-yield" className="text-xs uppercase tracking-wider font-medium">
              Dividend Yield <span className="text-muted-foreground">(%)</span>
            </Label>
            <Input
              id="dividend-yield"
              type="number"
              value={(parameters.dividendYield * 100).toFixed(2)}
              onChange={(e) => updateParameter("dividendYield", (parseFloat(e.target.value) || 0) / 100)}
              className="h-12 text-lg font-mono"
            />
            <Slider
              value={[parameters.dividendYield * 100]}
              onValueChange={([value]) => updateParameter("dividendYield", value / 100)}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
        </div>

        <Button
          onClick={onCalculate}
          disabled={isCalculating}
          className="w-full h-12 text-base"
        >
          {isCalculating ? "Calculating..." : "Calculate Options Price"}
        </Button>
      </div>
    </Card>
  );
}
PARAM

# PricingResults
cat > src/components/PricingResults.tsx << 'PRICING'
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface PricingResult {
  price: number;
  model: string;
  timestamp: Date;
  previousPrice?: number;
}

interface PricingResultsProps {
  result: PricingResult | null;
  optionType: "call" | "put";
}

export default function PricingResults({ result, optionType }: PricingResultsProps) {
  if (!result) {
    return (
      <Card className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>No pricing data available</p>
          <p className="text-sm mt-2">Adjust parameters and click Calculate</p>
        </div>
      </Card>
    );
  }

  const changePercent = result.previousPrice
    ? ((result.price - result.previousPrice) / result.previousPrice) * 100
    : 0;
  const isPositive = changePercent > 0;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Pricing Result</h2>
          <Badge variant="secondary">
            {optionType.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-mono font-bold">
              ${result.price.toFixed(4)}
            </span>
            {result.previousPrice && (
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-mono ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Model: {result.model}</p>
            <p>Calculated: {result.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Intrinsic Value
            </p>
            <p className="text-lg font-mono font-semibold">
              $0.0000
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Time Value
            </p>
            <p className="text-lg font-mono font-semibold">
              ${result.price.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
PRICING

# GreeksTable (simple version - will be replaced by Enhanced version)
cat > src/components/GreeksTable.tsx << 'GREEKS'
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface GreeksTableProps {
  greeks: Greeks | null;
  higherOrderGreeks?: any;
}

export default function GreeksTable({ greeks }: GreeksTableProps) {
  if (!greeks) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Greeks</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>Greeks will be displayed after calculation</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Greeks</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Greek</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Delta (Δ)</TableCell>
            <TableCell className="text-right font-mono">{greeks.delta.toFixed(6)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Gamma (Γ)</TableCell>
            <TableCell className="text-right font-mono">{greeks.gamma.toFixed(6)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Theta (Θ)</TableCell>
            <TableCell className="text-right font-mono">{greeks.theta.toFixed(6)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Vega (ν)</TableCell>
            <TableCell className="text-right font-mono">{greeks.vega.toFixed(6)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Rho (ρ)</TableCell>
            <TableCell className="text-right font-mono">{greeks.rho.toFixed(6)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
GREEKS

# ModelSelector
cat > src/components/ModelSelector.tsx << 'MODEL'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export type PricingModel = "black-scholes" | "monte-carlo" | "binomial";

interface ModelSelectorProps {
  selectedModel: PricingModel;
  onModelChange: (model: PricingModel) => void;
  children?: React.ReactNode;
}

const modelDescriptions = {
  "black-scholes": {
    name: "Black-Scholes-Merton",
    description: "Analytical solution for European options using closed-form equations. Fastest calculation with exact mathematical precision.",
  },
  "monte-carlo": {
    name: "Monte Carlo Simulation",
    description: "Stochastic simulation using random price paths. Highly flexible for complex payoffs and path-dependent options.",
  },
  "binomial": {
    name: "Binomial Tree",
    description: "Discrete-time model building a lattice of possible prices. Can handle American options with early exercise.",
  },
};

export default function ModelSelector({ selectedModel, onModelChange, children }: ModelSelectorProps) {
  return (
    <Tabs value={selectedModel} onValueChange={(value) => onModelChange(value as PricingModel)}>
      <Card className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="black-scholes">Black-Scholes</TabsTrigger>
          <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
          <TabsTrigger value="binomial">Binomial Tree</TabsTrigger>
        </TabsList>
      </Card>

      <div className="mt-4">
        {Object.entries(modelDescriptions).map(([model, info]) => (
          <TabsContent key={model} value={model} className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-1">{info.name}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </Card>
            {children}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
MODEL

# PayoffDiagram
cat > src/components/PayoffDiagram.tsx << 'PAYOFF'
import { Card } from "@/components/ui/card";

interface PayoffDiagramProps {
  spotPrice: number;
  strikePrice: number;
  optionPrice: number;
  optionType: "call" | "put";
}

export default function PayoffDiagram({ spotPrice, strikePrice, optionPrice, optionType }: PayoffDiagramProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payoff Diagram</h2>
      <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border">
        <p className="text-muted-foreground">Payoff visualization</p>
      </div>
    </Card>
  );
}
PAYOFF

# VolatilitySurface
cat > src/components/VolatilitySurface.tsx << 'VOL'
import { Card } from "@/components/ui/card";

interface VolatilitySurfaceProps {
  currentVolatility: number;
}

export default function VolatilitySurface({ currentVolatility }: VolatilitySurfaceProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Volatility Smile</h2>
      <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border">
        <p className="text-muted-foreground">Volatility surface visualization</p>
      </div>
    </Card>
  );
}
VOL

# GreeksSensitivity
cat > src/components/GreeksSensitivity.tsx << 'GREEKS_SENS'
import { Card } from "@/components/ui/card";

interface GreeksSensitivityProps {
  spotPrice: number;
  strikePrice: number;
}

export default function GreeksSensitivity({ spotPrice, strikePrice }: GreeksSensitivityProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Greeks Sensitivity Analysis</h2>
      <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border">
        <p className="text-muted-foreground">Greeks sensitivity chart</p>
      </div>
    </Card>
  );
}
GREEKS_SENS

# ComparisonTable
cat > src/components/ComparisonTable.tsx << 'COMP'
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface ModelComparison {
  model: string;
  price: number;
  computationTime: number;
}

interface ComparisonTableProps {
  comparisons: ModelComparison[];
}

export default function ComparisonTable({ comparisons }: ComparisonTableProps) {
  if (comparisons.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Model Comparison</h2>
        <Badge variant="secondary">{comparisons.length} models</Badge>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">Price ($)</TableHead>
            <TableHead className="text-right">Time (ms)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisons.map((comp) => (
            <TableRow key={comp.model}>
              <TableCell className="font-medium">{comp.model}</TableCell>
              <TableCell className="text-right font-mono">${comp.price.toFixed(4)}</TableCell>
              <TableCell className="text-right font-mono">{comp.computationTime.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
COMP

# RiskMetricsDashboard & StrategyBuilder (placeholders)
cat > src/components/RiskMetricsDashboard.tsx << 'RISK'
import { Card } from "@/components/ui/card";

export default function RiskMetricsDashboard() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Risk Metrics</h3>
      <p className="text-sm text-muted-foreground">Advanced risk metrics</p>
    </Card>
  );
}
RISK

cat > src/components/StrategyBuilder.tsx << 'STRATEGY'
import { Card } from "@/components/ui/card";

export default function StrategyBuilder() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">Strategy Builder</h3>
      <p className="text-sm text-muted-foreground">Multi-leg strategy construction</p>
    </Card>
  );
}
STRATEGY

echo "✅ All supporting components created!"
