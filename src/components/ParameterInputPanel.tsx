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
