import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PositionSizingCalculator() {
  const [accountSize, setAccountSize] = useState(100000);
  const [riskPerTrade, setRiskPerTrade] = useState(2);
  const [entryPrice, setEntryPrice] = useState(100);
  const [stopLoss, setStopLoss] = useState(95);
  const [targetPrice, setTargetPrice] = useState(110);

  const riskAmount = (accountSize * riskPerTrade) / 100;
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const positionValue = positionSize * entryPrice;
  const potentialProfit = positionSize * (targetPrice - entryPrice);
  const riskRewardRatio = riskPerShare > 0 ? (targetPrice - entryPrice) / riskPerShare : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Position Sizing Calculator</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Account Size ($)</Label>
            <Input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Risk Per Trade (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Entry Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={entryPrice}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Stop Loss ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label>Target Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Position Size</p>
            <p className="text-3xl font-bold">{positionSize.toLocaleString()} shares</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Position Value</p>
              <p className="text-lg font-semibold">${positionValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk Amount</p>
              <p className="text-lg font-semibold text-red-600">${riskAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Potential Profit</p>
              <p className="text-lg font-semibold text-green-600">${potentialProfit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk:Reward</p>
              <Badge variant={riskRewardRatio >= 2 ? 'default' : 'destructive'}>
                1:{riskRewardRatio.toFixed(2)}
              </Badge>
            </div>
          </div>

          {riskRewardRatio < 2 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded mt-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Risk:Reward ratio below 2:1. Consider adjusting your target or stop loss.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
