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
