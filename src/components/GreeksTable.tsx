import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface HigherOrderGreeks {
  vanna: number;
  volga: number;
  charm: number;
  veta: number;
  speed: number;
  zomma: number;
  color: number;
}

interface GreeksTableProps {
  greeks: Greeks | null;
  higherOrderGreeks?: HigherOrderGreeks | null;
}

const greeksInfo = [
  {
    symbol: "Δ",
    name: "Delta",
    key: "delta" as keyof Greeks,
    description: "Rate of change of option price with respect to the underlying asset price",
    interpretation: (value: number) =>
      `For every $1 change in spot price, option value changes by $${Math.abs(value).toFixed(4)}`,
    riskLevel: (value: number) => Math.abs(value) > 0.7 ? "high" : Math.abs(value) > 0.3 ? "medium" : "low",
  },
  {
    symbol: "Γ",
    name: "Gamma",
    key: "gamma" as keyof Greeks,
    description: "Rate of change of delta with respect to the underlying asset price",
    interpretation: (value: number) =>
      `Delta changes by ${value.toFixed(6)} for every $1 move in the underlying`,
    riskLevel: (value: number) => Math.abs(value) > 0.05 ? "high" : Math.abs(value) > 0.01 ? "medium" : "low",
  },
  {
    symbol: "Θ",
    name: "Theta",
    key: "theta" as keyof Greeks,
    description: "Rate of change of option price with respect to time (time decay)",
    interpretation: (value: number) =>
      `Option ${value < 0 ? 'loses' : 'gains'} $${Math.abs(value).toFixed(4)} in value per day`,
    riskLevel: (value: number) => Math.abs(value) > 0.1 ? "high" : Math.abs(value) > 0.03 ? "medium" : "low",
  },
  {
    symbol: "ν",
    name: "Vega",
    key: "vega" as keyof Greeks,
    description: "Rate of change of option price with respect to volatility",
    interpretation: (value: number) =>
      `Option value changes by $${value.toFixed(4)} for 1% change in volatility`,
    riskLevel: (value: number) => Math.abs(value) > 0.5 ? "high" : Math.abs(value) > 0.2 ? "medium" : "low",
  },
  {
    symbol: "ρ",
    name: "Rho",
    key: "rho" as keyof Greeks,
    description: "Rate of change of option price with respect to interest rate",
    interpretation: (value: number) =>
      `Option value changes by $${value.toFixed(4)} for 1% change in interest rate`,
    riskLevel: (value: number) => Math.abs(value) > 0.5 ? "high" : Math.abs(value) > 0.2 ? "medium" : "low",
  },
];

const higherOrderGreeksInfo = [
  {
    symbol: "Vanna",
    name: "Vanna",
    key: "vanna" as keyof HigherOrderGreeks,
    description: "Rate of change of delta with respect to volatility (or vega w.r.t. spot)",
    interpretation: (value: number) =>
      `Delta changes by ${value.toFixed(6)} for every 1% change in volatility`,
  },
  {
    symbol: "Volga",
    name: "Volga/Vomma",
    key: "volga" as keyof HigherOrderGreeks,
    description: "Rate of change of vega with respect to volatility",
    interpretation: (value: number) =>
      `Vega changes by ${value.toFixed(6)} for every 1% change in volatility`,
  },
  {
    symbol: "Charm",
    name: "Charm",
    key: "charm" as keyof HigherOrderGreeks,
    description: "Rate of change of delta with respect to time",
    interpretation: (value: number) =>
      `Delta changes by ${value.toFixed(6)} per day`,
  },
  {
    symbol: "Veta",
    name: "Veta",
    key: "veta" as keyof HigherOrderGreeks,
    description: "Rate of change of vega with respect to time",
    interpretation: (value: number) =>
      `Vega changes by ${value.toFixed(6)} per day`,
  },
  {
    symbol: "Speed",
    name: "Speed",
    key: "speed" as keyof HigherOrderGreeks,
    description: "Rate of change of gamma with respect to spot price",
    interpretation: (value: number) =>
      `Gamma changes by ${value.toFixed(6)} for every $1 change in spot`,
  },
  {
    symbol: "Zomma",
    name: "Zomma",
    key: "zomma" as keyof HigherOrderGreeks,
    description: "Rate of change of gamma with respect to volatility",
    interpretation: (value: number) =>
      `Gamma changes by ${value.toFixed(6)} for every 1% change in volatility`,
  },
  {
    symbol: "Color",
    name: "Color",
    key: "color" as keyof HigherOrderGreeks,
    description: "Rate of change of gamma with respect to time",
    interpretation: (value: number) =>
      `Gamma changes by ${value.toFixed(6)} per day`,
  },
];

function getRiskBadge(level: string) {
  switch (level) {
    case "high":
      return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-xs">Medium Risk</Badge>;
    case "low":
      return <Badge variant="outline" className="text-xs">Low Risk</Badge>;
    default:
      return null;
  }
}

function getTrendIcon(value: number) {
  if (value > 0.01) return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (value < -0.01) return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-gray-500" />;
}

function getValueColor(value: number, greek: string): string {
  if (greek === "theta") {
    return value < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
  }
  if (greek === "delta") {
    if (Math.abs(value) > 0.7) return "text-orange-600 dark:text-orange-400";
    if (Math.abs(value) > 0.3) return "text-yellow-600 dark:text-yellow-400";
  }
  if (greek === "gamma" && Math.abs(value) > 0.05) {
    return "text-purple-600 dark:text-purple-400";
  }
  return "";
}

export default function GreeksTable({ greeks, higherOrderGreeks }: GreeksTableProps) {
  if (!greeks) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Greeks</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No Greeks data available</p>
          <p className="text-sm mt-2">Calculate an option price to see Greeks</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Risk Greeks</h2>
        <Badge variant="outline" className="font-mono text-xs">
          Live Updates
        </Badge>
      </div>
      
      <Tabs defaultValue="first-order" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="first-order">First-Order</TabsTrigger>
          <TabsTrigger value="higher-order" disabled={!higherOrderGreeks}>
            Higher-Order
          </TabsTrigger>
        </TabsList>

        <TabsContent value="first-order">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs uppercase">Greek</TableHead>
                <TableHead className="text-xs uppercase text-right">Value</TableHead>
                <TableHead className="text-xs uppercase text-right">Risk</TableHead>
                <TableHead className="text-xs uppercase w-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {greeksInfo.map((greek) => {
                const value = greeks[greek.key];
                const riskLevel = greek.riskLevel(value);
                const valueColor = getValueColor(value, greek.key);
                
                return (
                  <TableRow key={greek.key} data-testid={`row-greek-${greek.key}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold">{greek.symbol}</span>
                        <div>
                          <div className="font-medium">{greek.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {getTrendIcon(value)}
                            <span>{value > 0 ? 'Positive' : value < 0 ? 'Negative' : 'Neutral'}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <span 
                          className={`font-mono text-lg font-bold block ${valueColor}`}
                          data-testid={`text-${greek.key}-value`}
                        >
                          {value.toFixed(6)}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {Math.abs(value * 100).toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getRiskBadge(riskLevel)}
                    </TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs" side="left">
                          <p className="font-medium mb-2">{greek.description}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            {greek.interpretation(value)}
                          </p>
                          <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                            <strong>Trading Implication:</strong> {' '}
                            {greek.key === "delta" && "Hedge ratio for the underlying asset"}
                            {greek.key === "gamma" && "Rate of delta change - higher gamma means more frequent hedging"}
                            {greek.key === "theta" && "Time decay - option loses value as expiration approaches"}
                            {greek.key === "vega" && "Sensitivity to volatility - important for vol trading"}
                            {greek.key === "rho" && "Interest rate sensitivity - less relevant for short-dated options"}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Quick Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="text-sm font-semibold mb-3">Quick Risk Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Directional Risk:</span>
                <span className="font-mono font-semibold ml-2">
                  {Math.abs(greeks.delta) > 0.5 ? 'High' : 'Low'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Convexity Risk:</span>
                <span className="font-mono font-semibold ml-2">
                  {Math.abs(greeks.gamma) > 0.03 ? 'High' : 'Low'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Time Decay:</span>
                <span className="font-mono font-semibold ml-2">
                  ${Math.abs(greeks.theta).toFixed(4)}/day
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Vol Sensitivity:</span>
                <span className="font-mono font-semibold ml-2">
                  {Math.abs(greeks.vega) > 0.3 ? 'High' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {higherOrderGreeks && (
          <TabsContent value="higher-order">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase">Greek</TableHead>
                  <TableHead className="text-xs uppercase text-right">Value</TableHead>
                  <TableHead className="text-xs uppercase w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {higherOrderGreeksInfo.map((greek) => {
                  const value = higherOrderGreeks[greek.key];
                  
                  return (
                    <TableRow key={greek.key} data-testid={`row-higher-greek-${greek.key}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{greek.symbol}</span>
                          <div className="font-medium text-sm">{greek.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span 
                          className="font-mono text-base font-semibold"
                          data-testid={`text-${greek.key}-value`}
                        >
                          {value.toFixed(8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs" side="left">
                            <p className="font-medium mb-1">{greek.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {greek.interpretation(value)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Higher-Order Greeks</strong> measure how first-order Greeks change with respect to 
                market variables. They're crucial for sophisticated hedging strategies and managing 
                convexity risk in large portfolios.
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
}
