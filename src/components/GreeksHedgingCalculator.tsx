import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, AlertCircle } from "lucide-react";
import { calculateBlackScholes } from "@/lib/advanced-options-pricing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Position {
  id: string;
  type: "option" | "stock";
  optionType?: "call" | "put";
  strike?: number;
  quantity: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
}

export default function GreeksHedgingCalculator() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [spotPrice, setSpotPrice] = useState(100);
  const [volatility, setVolatility] = useState(0.25);
  
  const [newPosition, setNewPosition] = useState({
    type: "option" as const,
    optionType: "call" as const,
    strike: 100,
    quantity: 10,
  });

  // Calculate portfolio Greeks
  const portfolioGreeks = positions.reduce(
    (acc, pos) => ({
      delta: acc.delta + pos.delta * pos.quantity,
      gamma: acc.gamma + pos.gamma * pos.quantity,
      vega: acc.vega + pos.vega * pos.quantity,
      theta: acc.theta + pos.theta * pos.quantity,
    }),
    { delta: 0, gamma: 0, vega: 0, theta: 0 }
  );

  // Calculate hedge recommendations
  const hedgeRecommendations = {
    deltaHedge: {
      shares: -Math.round(portfolioGreeks.delta),
      cost: -portfolioGreeks.delta * spotPrice,
    },
    gammaNeutral: {
      contracts: portfolioGreeks.gamma !== 0 ? -Math.round(portfolioGreeks.gamma * 100) / 100 : 0,
      description: "Additional options needed for gamma neutrality",
    },
    vegaNeutral: {
      contracts: portfolioGreeks.vega !== 0 ? -Math.round(portfolioGreeks.vega * 10) / 10 : 0,
      description: "Additional vega exposure needed",
    },
  };

  const addPosition = () => {
    if (newPosition.type === "option") {
      const result = calculateBlackScholes({
        spotPrice,
        strikePrice: newPosition.strike,
        volatility,
        timeToMaturity: 0.25,
        riskFreeRate: 0.05,
        dividendYield: 0,
        optionType: newPosition.optionType,
      });

      const position: Position = {
        id: Math.random().toString(36),
        type: "option",
        optionType: newPosition.optionType,
        strike: newPosition.strike,
        quantity: newPosition.quantity,
        delta: result.greeks.delta,
        gamma: result.greeks.gamma,
        vega: result.greeks.vega,
        theta: result.greeks.theta,
      };

      setPositions([...positions, position]);
    } else {
      // Stock position
      const position: Position = {
        id: Math.random().toString(36),
        type: "stock",
        quantity: newPosition.quantity,
        delta: 1, // Stock delta is always 1
        gamma: 0,
        vega: 0,
        theta: 0,
      };

      setPositions([...positions, position]);
    }
  };

  const applyDeltaHedge = () => {
    const hedgePosition: Position = {
      id: Math.random().toString(36),
      type: "stock",
      quantity: hedgeRecommendations.deltaHedge.shares,
      delta: 1,
      gamma: 0,
      vega: 0,
      theta: 0,
    };
    setPositions([...positions, hedgePosition]);
  };

  const getRiskLevel = (value: number, greek: string) => {
    const thresholds = {
      delta: { low: 50, high: 100 },
      gamma: { low: 5, high: 10 },
      vega: { low: 50, high: 100 },
      theta: { low: 10, high: 20 },
    };

    const threshold = thresholds[greek as keyof typeof thresholds];
    const abs = Math.abs(value);

    if (abs < threshold.low) return { level: "LOW", color: "text-green-500" };
    if (abs < threshold.high) return { level: "MEDIUM", color: "text-yellow-500" };
    return { level: "HIGH", color: "text-red-500" };
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Greeks Hedging Calculator
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage portfolio Greeks and get hedge recommendations
            </p>
          </div>
        </div>

        {/* Market Parameters */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label>Spot Price ($)</Label>
            <Input
              type="number"
              value={spotPrice}
              onChange={(e) => setSpotPrice(parseFloat(e.target.value) || 100)}
            />
          </div>
          <div>
            <Label>Implied Volatility (%)</Label>
            <Input
              type="number"
              value={(volatility * 100).toFixed(0)}
              onChange={(e) => setVolatility((parseFloat(e.target.value) || 25) / 100)}
            />
          </div>
        </div>

        {/* Add Position */}
        <div className="grid grid-cols-5 gap-3 mb-6 p-4 border rounded-lg">
          <div>
            <Label className="text-xs">Type</Label>
            <select
              value={newPosition.type}
              onChange={(e) => setNewPosition({ ...newPosition, type: e.target.value as any })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="option">Option</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          {newPosition.type === "option" && (
            <>
              <div>
                <Label className="text-xs">Option</Label>
                <select
                  value={newPosition.optionType}
                  onChange={(e) => setNewPosition({ ...newPosition, optionType: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Strike</Label>
                <Input
                  type="number"
                  value={newPosition.strike}
                  onChange={(e) => setNewPosition({ ...newPosition, strike: parseFloat(e.target.value) })}
                />
              </div>
            </>
          )}

          <div className={newPosition.type === "stock" ? "col-span-3" : ""}>
            <Label className="text-xs">Quantity</Label>
            <Input
              type="number"
              value={newPosition.quantity}
              onChange={(e) => setNewPosition({ ...newPosition, quantity: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={addPosition} className="w-full">
              Add Position
            </Button>
          </div>
        </div>

        {/* Portfolio Greeks Summary */}
        {positions.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                Portfolio Delta
                <Badge variant="outline" className={getRiskLevel(portfolioGreeks.delta, "delta").color}>
                  {getRiskLevel(portfolioGreeks.delta, "delta").level}
                </Badge>
              </p>
              <p className="text-3xl font-mono font-bold">{portfolioGreeks.delta.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Directional exposure</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                Portfolio Gamma
                <Badge variant="outline" className={getRiskLevel(portfolioGreeks.gamma, "gamma").color}>
                  {getRiskLevel(portfolioGreeks.gamma, "gamma").level}
                </Badge>
              </p>
              <p className="text-3xl font-mono font-bold">{portfolioGreeks.gamma.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Convexity risk</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                Portfolio Vega
                <Badge variant="outline" className={getRiskLevel(portfolioGreeks.vega, "vega").color}>
                  {getRiskLevel(portfolioGreeks.vega, "vega").level}
                </Badge>
              </p>
              <p className="text-3xl font-mono font-bold">{portfolioGreeks.vega.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Vol exposure</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Portfolio Theta</p>
              <p className="text-3xl font-mono font-bold text-red-500">{portfolioGreeks.theta.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Time decay per day</p>
            </div>
          </div>
        )}

        {/* Hedge Recommendations */}
        {positions.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hedge Recommendations
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Delta Hedge */}
              <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">Delta Hedge</p>
                  <Button size="sm" onClick={applyDeltaHedge} variant="outline">
                    Apply
                  </Button>
                </div>
                <p className="text-2xl font-mono font-bold mb-1">
                  {hedgeRecommendations.deltaHedge.shares} shares
                </p>
                <p className="text-xs text-muted-foreground">
                  Cost: ${Math.abs(hedgeRecommendations.deltaHedge.cost).toLocaleString()}
                </p>
                <p className="text-xs mt-2">
                  {hedgeRecommendations.deltaHedge.shares > 0 ? "Buy" : "Sell"} stock to neutralize delta
                </p>
              </Card>

              {/* Gamma Hedge */}
              <Card className="p-4 bg-green-500/5 border-green-500/20">
                <p className="font-semibold text-sm mb-2">Gamma Hedge</p>
                <p className="text-2xl font-mono font-bold mb-1">
                  {Math.abs(hedgeRecommendations.gammaNeutral.contracts)} contracts
                </p>
                <p className="text-xs mt-2">{hedgeRecommendations.gammaNeutral.description}</p>
              </Card>

              {/* Vega Hedge */}
              <Card className="p-4 bg-purple-500/5 border-purple-500/20">
                <p className="font-semibold text-sm mb-2">Vega Hedge</p>
                <p className="text-2xl font-mono font-bold mb-1">
                  {Math.abs(hedgeRecommendations.vegaNeutral.contracts)} contracts
                </p>
                <p className="text-xs mt-2">{hedgeRecommendations.vegaNeutral.description}</p>
              </Card>
            </div>
          </div>
        )}

        {/* Positions Table */}
        {positions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Delta</TableHead>
                <TableHead className="text-right">Gamma</TableHead>
                <TableHead className="text-right">Vega</TableHead>
                <TableHead className="text-right">Theta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell>
                    <Badge variant={pos.type === "option" ? "default" : "secondary"}>
                      {pos.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {pos.type === "option"
                      ? `${pos.optionType?.toUpperCase()} $${pos.strike}`
                      : "Stock"}
                  </TableCell>
                  <TableCell className="text-right font-mono">{pos.quantity}</TableCell>
                  <TableCell className="text-right font-mono">
                    {(pos.delta * pos.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(pos.gamma * pos.quantity).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(pos.vega * pos.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-500">
                    {(pos.theta * pos.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No positions added yet</p>
            <p className="text-sm mt-2">Add positions to see hedge recommendations</p>
          </div>
        )}
      </Card>
    </div>
  );
}
