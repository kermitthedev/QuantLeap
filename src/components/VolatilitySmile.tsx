import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

interface Props {
  spotPrice: number;
  atmVolatility: number;
}

export default function VolatilitySmile({ spotPrice, atmVolatility }: Props) {
  // Generate realistic volatility smile
  const strikes = Array.from({ length: 21 }, (_, i) => spotPrice * (0.8 + i * 0.02));
  
  const data = strikes.map(strike => {
    const moneyness = strike / spotPrice;
    
    // Volatility smile formula (simplified)
    // OTM puts have higher vol, ATM is lowest, OTM calls have higher vol
    const skew = 0.1 * Math.abs(moneyness - 1);
    const smile = 0.05 * Math.pow(moneyness - 1, 2);
    const impliedVol = atmVolatility + skew + smile;
    
    return {
      strike,
      moneyness: ((moneyness - 1) * 100).toFixed(1),
      impliedVol: impliedVol * 100,
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Implied Volatility Smile</h3>
      <LineChart width={700} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="moneyness" 
          label={{ value: 'Moneyness (%)', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Implied Volatility (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Legend />
        <ReferenceLine x="0.0" stroke="#666" strokeDasharray="3 3" label="ATM" />
        <Line 
          type="monotone" 
          dataKey="impliedVol" 
          stroke="#8b5cf6" 
          strokeWidth={3}
          dot={{ r: 3 }}
          name="Implied Vol"
        />
      </LineChart>
    </Card>
  );
}
