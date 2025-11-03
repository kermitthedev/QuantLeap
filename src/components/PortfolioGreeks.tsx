import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Briefcase, AlertTriangle } from "lucide-react";
import { calculateBlackScholes } from "@/lib/advanced-options-pricing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PortfolioPosition {
  id: string;
  symbol: string;
  type: "call" | "put";
  strike: number;
  quantity: number;
  spotPrice: number;
  volatility: number;
  timeToMaturity: number;
}

export default function PortfolioGreeks() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [newPosition, setNewPosition] = useState<Partial<PortfolioPosition>>({
    symbol: "AAPL",
    type: "call",
    strike: 100,
    quantity: 10,
    spotPrice: 100,
    volatility: 0.25,
    timeToMaturity: 0.25,
  });

  const addPosition = () => {
    const position: PortfolioPosition = {
      id: Math.random().toString(36),
      symbol: newPosition.symbol || "AAPL",
      type: newPosition.type || "call",
      strike: newPosition.strike || 100,
      quantity: newPosition.quantity || 10,
      spotPrice: newPosition.spotPrice || 100,
      volatility: newPosition.volatility || 0.25,
      timeToMaturity: newPosition.timeToMaturity || 0.25,
    };
    setPositions([...positions, position]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const calculatePositionGreeks = (position: PortfolioPosition) => {
    const result = calculateBlackScholes({
      spotPrice: position.spotPrice,
      strikePrice: position.strike,
      volatility: position.volatility,
      timeToMaturity: position.timeToMaturity,
      riskFreeRate: 0.05,
      dividendYield: 0,
      optionType: position.type,
    });

    return {
      price: result.price,
      delta: result.greeks.delta * position.quantity * 100,
      gamma: result.greeks.gamma * position.quantity * 100,
      theta: result.greeks.theta * position.quantity * 100,
      vega: result.greeks.vega * position.quantity * 100,
      rho: result.greeks.rho * position.quantity * 100,
    };
  };

  const portfolioGreeks = positions.reduce(
    (totals, position) => {
      const greeks = calculatePositionGreeks(position);
      return {
        totalValue: totals.totalValue + greeks.price * position.quantity * 100,
        totalDelta: totals.totalDelta + greeks.delta,
        totalGamma: totals.totalGamma + greeks.gamma,
        totalTheta: totals.totalTheta + greeks.theta,
        totalVega: totals.totalVega + greeks.vega,
        totalRho: totals.totalRho + greeks.rho,
      };
    },
    { totalValue: 0, totalDelta: 0, totalGamma: 0, totalTheta: 0, totalVega: 0, totalRho: 0 }
  );

  const getRiskLevel = (greek: string, value: number) => {
    const thresholds = {
      delta: 1000,
      gamma: 100,
      theta: 500,
      vega: 1000,
    };
    const threshold = thresholds[greek as keyof typeof thresholds] || 1000;
    if (Math.abs(value) > threshold * 2) return "high";
    if (Math.abs(value) > threshold) return "medium";
    return "low";
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Portfolio Greeks Aggregation
          </h2>
        </div>

        {/* Add Position Form */}
        <div className="grid grid-cols-7 gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-xs">Symbol</Label>
            <Input
              value={newPosition.symbol}
              onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })}
              placeholder="AAPL"
            />
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <select
              value={newPosition.type}
              onChange={(e) => setNewPosition({ ...newPosition, type: e.target.value as any })}
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
          <div>
            <Label className="text-xs">Quantity</Label>
            <Input
              type="number"
              value={newPosition.quantity}
              onChange={(e) => setNewPosition({ ...newPosition, quantity: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Spot ($)</Label>
            <Input
              type="number"
              value={newPosition.spotPrice}
              onChange={(e) => setNewPosition({ ...newPosition, spotPrice: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Vol (%)</Label>
            <Input
              type="number"
              value={((newPosition.volatility || 0) * 100).toFixed(0)}
              onChange={(e) => setNewPosition({ ...newPosition, volatility: parseFloat(e.target.value) / 100 })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addPosition} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {positions.length > 0 && (
          <div className="grid grid-cols-6 gap-4 mb-6 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Value</p>
              <p className="text-xl font-mono font-bold">${portfolioGreeks.totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                Delta
                {getRiskLevel("delta", portfolioGreeks.totalDelta) === "high" && (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
              </p>
              <p className="text-xl font-mono font-bold">{portfolioGreeks.totalDelta.toFixed(0)}</p>
              <Badge variant={getRiskLevel("delta", portfolioGreeks.totalDelta) === "high" ? "destructive" : "secondary"} className="text-xs mt-1">
                {getRiskLevel("delta", portfolioGreeks.totalDelta)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gamma</p>
              <p className="text-xl font-mono font-bold">{portfolioGreeks.totalGamma.toFixed(0)}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {getRiskLevel("gamma", portfolioGreeks.totalGamma)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Theta</p>
              <p className="text-xl font-mono font-bold text-red-500">{portfolioGreeks.totalTheta.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">/day</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vega</p>
              <p className="text-xl font-mono font-bold">{portfolioGreeks.totalVega.toFixed(0)}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {getRiskLevel("vega", portfolioGreeks.totalVega)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rho</p>
              <p className="text-xl font-mono font-bold">{portfolioGreeks.totalRho.toFixed(0)}</p>
            </div>
          </div>
        )}

        {/* Positions Table */}
        {positions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No positions in portfolio</p>
            <p className="text-sm mt-2">Add positions to see aggregated Greeks</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Delta</TableHead>
                <TableHead className="text-right">Gamma</TableHead>
                <TableHead className="text-right">Theta</TableHead>
                <TableHead className="text-right">Vega</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const greeks = calculatePositionGreeks(position);
                return (
                  <TableRow key={position.id}>
                    <TableCell className="font-mono font-semibold">{position.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={position.type === "call" ? "default" : "secondary"}>
                        {position.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">${position.strike}</TableCell>
                    <TableCell className="text-right font-mono">{position.quantity}</TableCell>
                    <TableCell className="text-right font-mono">${greeks.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{greeks.delta.toFixed(0)}</TableCell>
                    <TableCell className="text-right font-mono">{greeks.gamma.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono text-red-500">{greeks.theta.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">{greeks.vega.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePosition(position.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
