import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { calculateBlackScholes } from "@/lib/advanced-options-pricing";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface StrategyLeg {
  id: string;
  type: "call" | "put";
  position: "long" | "short";
  strike: number;
  quantity: number;
  premium: number;
}

const PRESET_STRATEGIES = {
  "bull-call-spread": {
    name: "Bull Call Spread",
    legs: [
      { type: "call" as const, position: "long" as const, strike: 95, quantity: 1 },
      { type: "call" as const, position: "short" as const, strike: 105, quantity: 1 },
    ],
  },
  "iron-condor": {
    name: "Iron Condor",
    legs: [
      { type: "put" as const, position: "long" as const, strike: 85, quantity: 1 },
      { type: "put" as const, position: "short" as const, strike: 90, quantity: 1 },
      { type: "call" as const, position: "short" as const, strike: 110, quantity: 1 },
      { type: "call" as const, position: "long" as const, strike: 115, quantity: 1 },
    ],
  },
  "butterfly": {
    name: "Long Butterfly",
    legs: [
      { type: "call" as const, position: "long" as const, strike: 90, quantity: 1 },
      { type: "call" as const, position: "short" as const, strike: 100, quantity: 2 },
      { type: "call" as const, position: "long" as const, strike: 110, quantity: 1 },
    ],
  },
  "straddle": {
    name: "Long Straddle",
    legs: [
      { type: "call" as const, position: "long" as const, strike: 100, quantity: 1 },
      { type: "put" as const, position: "long" as const, strike: 100, quantity: 1 },
    ],
  },
};

export default function StrategyBuilder() {
  const [legs, setLegs] = useState<StrategyLeg[]>([]);
  const [spotPrice, setSpotPrice] = useState(100);
  const [volatility, setVolatility] = useState(0.25);
  const [timeToMaturity, setTimeToMaturity] = useState(0.25); // 3 months

  const addLeg = () => {
    const newLeg: StrategyLeg = {
      id: Math.random().toString(36),
      type: "call",
      position: "long",
      strike: spotPrice,
      quantity: 1,
      premium: 0,
    };
    setLegs([...legs, newLeg]);
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter((leg) => leg.id !== id));
  };

  const updateLeg = (id: string, field: keyof StrategyLeg, value: any) => {
    setLegs(legs.map((leg) => (leg.id === id ? { ...leg, [field]: value } : leg)));
  };

  const loadPreset = (presetKey: string) => {
    const preset = PRESET_STRATEGIES[presetKey as keyof typeof PRESET_STRATEGIES];
    if (preset) {
      const newLegs: StrategyLeg[] = preset.legs.map((leg) => ({
        id: Math.random().toString(36),
        ...leg,
        premium: 0,
      }));
      setLegs(newLegs);
      
      // Calculate premiums
      newLegs.forEach((leg) => {
        const result = calculateBlackScholes({
          spotPrice,
          strikePrice: leg.strike,
          volatility,
          timeToMaturity,
          riskFreeRate: 0.05,
          dividendYield: 0,
          optionType: leg.type,
        });
        leg.premium = result.price;
      });
      setLegs([...newLegs]);
    }
  };

  const calculateStrategyPayoff = () => {
    const data = [];
    const range = spotPrice * 0.5;
    const start = spotPrice - range;
    const end = spotPrice + range;
    const step = (end - start) / 100;

    for (let price = start; price <= end; price += step) {
      let totalPayoff = 0;
      let totalPremium = 0;

      legs.forEach((leg) => {
        const intrinsic =
          leg.type === "call"
            ? Math.max(0, price - leg.strike)
            : Math.max(0, leg.strike - price);

        const positionMultiplier = leg.position === "long" ? 1 : -1;
        totalPayoff += intrinsic * leg.quantity * positionMultiplier;
        totalPremium += leg.premium * leg.quantity * positionMultiplier;
      });

      data.push({
        price,
        payoff: totalPayoff - totalPremium,
        breakeven: 0,
      });
    }

    return data;
  };

  const strategyData = calculateStrategyPayoff();
  const maxProfit = Math.max(...strategyData.map((d) => d.payoff));
  const maxLoss = Math.min(...strategyData.map((d) => d.payoff));
  const totalPremium = legs.reduce((sum, leg) => {
    const multiplier = leg.position === "long" ? -1 : 1;
    return sum + leg.premium * leg.quantity * multiplier;
  }, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Multi-Leg Strategy Builder
          </h2>
        </div>

        {/* Global Parameters */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label>Spot Price ($)</Label>
            <Input
              type="number"
              value={spotPrice}
              onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 100)}
            />
          </div>
          <div>
            <Label>Volatility (%)</Label>
            <Input
              type="number"
              value={(volatility * 100).toFixed(0)}
              onChange={(e) => setVolatility((parseFloat(e.target.value) || 25) / 100)}
            />
          </div>
          <div>
            <Label>Time to Expiry (months)</Label>
            <Input
              type="number"
              value={(timeToMaturity * 12).toFixed(0)}
              onChange={(e) => setTimeToMaturity((parseFloat(e.target.value) || 3) / 12)}
            />
          </div>
        </div>

        {/* Preset Strategies */}
        <div className="mb-6">
          <Label className="mb-2 block">Load Preset Strategy</Label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(PRESET_STRATEGIES).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => loadPreset(key)}
                className="text-sm"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Strategy Legs */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Strategy Legs</Label>
            <Button onClick={addLeg} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Leg
            </Button>
          </div>

          {legs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No legs added yet</p>
              <p className="text-sm mt-2">Add a leg or load a preset strategy</p>
            </div>
          )}

          {legs.map((leg, index) => (
            <div key={leg.id} className="flex gap-3 items-end p-4 border rounded-lg bg-card">
              <div className="flex-shrink-0 w-8">
                <Badge variant="outline">#{index + 1}</Badge>
              </div>
              
              <div className="flex-1 grid grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={leg.type} onValueChange={(value) => updateLeg(leg.id, "type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="put">Put</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Position</Label>
                  <Select value={leg.position} onValueChange={(value) => updateLeg(leg.id, "position", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long</SelectItem>
                      <SelectItem value="short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Strike ($)</Label>
                  <Input
                    type="number"
                    value={leg.strike}
                    onChange={(e) => updateLeg(leg.id, "strike", parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={leg.quantity}
                    onChange={(e) => updateLeg(leg.id, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label className="text-xs">Premium ($)</Label>
                  <Input
                    type="number"
                    value={leg.premium.toFixed(2)}
                    onChange={(e) => updateLeg(leg.id, "premium", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLeg(leg.id)}
                className="flex-shrink-0"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        {/* Strategy Metrics */}
        {legs.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Net Premium</p>
              <p className={`text-2xl font-mono font-bold ${totalPremium >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${Math.abs(totalPremium).toFixed(2)} {totalPremium >= 0 ? "Credit" : "Debit"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Max Profit</p>
              <p className="text-2xl font-mono font-bold text-green-500">
                ${maxProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Max Loss</p>
              <p className="text-2xl font-mono font-bold text-red-500">
                ${Math.abs(maxLoss).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Strategy Payoff Chart */}
      {legs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Strategy Payoff at Expiration</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strategyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="price"
                  label={{ value: "Spot Price at Expiration ($)", position: "insideBottom", offset: -5 }}
                  stroke="#9CA3AF"
                />
                <YAxis
                  label={{ value: "Profit/Loss ($)", angle: -90, position: "insideLeft" }}
                  stroke="#9CA3AF"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
                <ReferenceLine x={spotPrice} stroke="#3B82F6" strokeDasharray="3 3" label="Current" />
                <Line
                  type="monotone"
                  dataKey="payoff"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={false}
                  name="Net P&L"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
