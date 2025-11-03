import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area, ComposedChart } from 'recharts';

const STRATEGIES = {
  'bull-call-spread': {
    name: 'Bull Call Spread',
    legs: [
      { type: 'call', action: 'buy', strike: 100 },
      { type: 'call', action: 'sell', strike: 110 },
    ],
    description: 'Limited profit, limited risk bullish strategy'
  },
  'iron-condor': {
    name: 'Iron Condor',
    legs: [
      { type: 'put', action: 'buy', strike: 90 },
      { type: 'put', action: 'sell', strike: 95 },
      { type: 'call', action: 'sell', strike: 105 },
      { type: 'call', action: 'buy', strike: 110 },
    ],
    description: 'Profit from low volatility, range-bound market'
  },
  'butterfly': {
    name: 'Long Call Butterfly',
    legs: [
      { type: 'call', action: 'buy', strike: 95 },
      { type: 'call', action: 'sell', strike: 100, quantity: 2 },
      { type: 'call', action: 'buy', strike: 105 },
    ],
    description: 'Profit if price stays near middle strike'
  },
  'straddle': {
    name: 'Long Straddle',
    legs: [
      { type: 'call', action: 'buy', strike: 100 },
      { type: 'put', action: 'buy', strike: 100 },
    ],
    description: 'Profit from large move in either direction'
  },
  'strangle': {
    name: 'Long Strangle',
    legs: [
      { type: 'call', action: 'buy', strike: 105 },
      { type: 'put', action: 'buy', strike: 95 },
    ],
    description: 'Cheaper than straddle, needs larger move'
  },
};

export default function StrategyPayoffVisualizer() {
  const [selectedStrategy, setSelectedStrategy] = useState<keyof typeof STRATEGIES>('bull-call-spread');

  const calculatePayoff = (spotPrice: number, strategy: typeof STRATEGIES[keyof typeof STRATEGIES]) => {
    let totalPayoff = 0;
    const premium = 5; // Simplified premium per option

    strategy.legs.forEach(leg => {
      const quantity = leg.quantity || 1;
      const intrinsic = leg.type === 'call' 
        ? Math.max(0, spotPrice - leg.strike)
        : Math.max(0, leg.strike - spotPrice);
      
      const legPayoff = leg.action === 'buy' 
        ? (intrinsic - premium) * quantity
        : (premium - intrinsic) * quantity;
      
      totalPayoff += legPayoff;
    });

    return totalPayoff;
  };

  const strategy = STRATEGIES[selectedStrategy];
  const spotPrices = Array.from({ length: 50 }, (_, i) => 80 + i * 1);
  const chartData = spotPrices.map(spot => ({
    spot,
    payoff: calculatePayoff(spot, strategy),
  }));

  const maxProfit = Math.max(...chartData.map(d => d.payoff));
  const maxLoss = Math.min(...chartData.map(d => d.payoff));
  const breakevens = chartData.filter((d, i) => 
    i > 0 && ((d.payoff >= 0 && chartData[i-1].payoff < 0) || (d.payoff < 0 && chartData[i-1].payoff >= 0))
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Strategy Payoff Analyzer</h2>
        <div className="flex gap-2">
          <Badge variant="outline">Max Profit: ${maxProfit.toFixed(2)}</Badge>
          <Badge variant="outline">Max Loss: ${maxLoss.toFixed(2)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {Object.entries(STRATEGIES).map(([key, strat]) => (
          <Button
            key={key}
            onClick={() => setSelectedStrategy(key as keyof typeof STRATEGIES)}
            variant={selectedStrategy === key ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
          >
            {strat.name}
          </Button>
        ))}
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded">
        <p className="text-sm">{strategy.description}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          {strategy.legs.map((leg, i) => (
            <div key={i}>
              {leg.action === 'buy' ? '🟢 Long' : '🔴 Short'} {leg.quantity || 1}x {leg.type === 'call' ? 'Call' : 'Put'} @ ${leg.strike}
            </div>
          ))}
        </div>
      </div>

      <ComposedChart width={800} height={400} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="spot" label={{ value: 'Underlying Price ($)', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Profit/Loss ($)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
        <Area type="monotone" dataKey="payoff" fill="#3b82f6" fillOpacity={0.3} />
        <Line type="monotone" dataKey="payoff" stroke="#3b82f6" strokeWidth={3} dot={false} />
      </ComposedChart>

      {breakevens.length > 0 && (
        <div className="mt-4 flex gap-4 text-sm">
          <span className="font-semibold">Breakeven Points:</span>
          {breakevens.map((be, i) => (
            <Badge key={i} variant="secondary">${be.spot.toFixed(2)}</Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
