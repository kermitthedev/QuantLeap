import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart, ReferenceLine } from 'recharts';

interface Props {
  spotPrice: number;
  strikePrice: number;
  volatility: number;
  timeToMaturity: number;
  optionType: 'call' | 'put';
}

export default function ProbabilityDistribution({ 
  spotPrice, 
  strikePrice, 
  volatility, 
  timeToMaturity,
  optionType 
}: Props) {
  // Generate probability distribution
  const mean = spotPrice * Math.exp(0.05 * timeToMaturity);
  const stdDev = spotPrice * volatility * Math.sqrt(timeToMaturity);
  
  const prices = [];
  const step = stdDev / 20;
  
  for (let i = -4; i <= 4; i += 0.1) {
    const price = mean + i * stdDev;
    const z = (price - mean) / stdDev;
    const probability = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                       Math.exp(-0.5 * z * z);
    
    const isITM = optionType === 'call' ? price > strikePrice : price < strikePrice;
    
    prices.push({
      price: price,
      probability: probability * 100,
      cumulative: normalCDF(z) * 100,
      zone: isITM ? 'ITM' : 'OTM',
    });
  }

  function normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  }

  const probITM = optionType === 'call' 
    ? (1 - normalCDF((strikePrice - mean) / stdDev)) * 100
    : normalCDF((strikePrice - mean) / stdDev) * 100;

  const expectedPrice = mean;
  const priceRange95 = [mean - 1.96 * stdDev, mean + 1.96 * stdDev];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Probability Distribution at Expiration</h3>
        <div className="flex gap-2">
          <Badge variant="default">
            Prob ITM: {probITM.toFixed(1)}%
          </Badge>
          <Badge variant="secondary">
            Prob OTM: {(100 - probITM).toFixed(1)}%
          </Badge>
        </div>
      </div>

      <ComposedChart width={800} height={300} data={prices}>
        <defs>
          <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="price" 
          label={{ value: 'Price at Expiration ($)', position: 'insideBottom', offset: -5 }}
          tickFormatter={(val) => `$${val.toFixed(0)}`}
        />
        <YAxis 
          yAxisId="left"
          label={{ value: 'Probability Density', angle: -90, position: 'insideLeft' }}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          label={{ value: 'Cumulative Probability (%)', angle: 90, position: 'insideRight' }}
        />
        <Tooltip 
          formatter={(value: any, name: string) => {
            if (name === 'probability') return [`${value.toFixed(2)}%`, 'Probability'];
            if (name === 'cumulative') return [`${value.toFixed(1)}%`, 'Cumulative'];
            return [value, name];
          }}
          labelFormatter={(label) => `Price: $${label.toFixed(2)}`}
        />
        <Legend />
        <ReferenceLine x={strikePrice} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label="Strike" />
        <ReferenceLine x={spotPrice} stroke="#22c55e" strokeWidth={2} label="Current" />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="probability"
          stroke="#8884d8"
          fillOpacity={1}
          fill="url(#colorProb)"
          name="Probability Density"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulative"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          name="Cumulative Probability"
        />
      </ComposedChart>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Expected Price</p>
          <p className="text-lg font-semibold">${expectedPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">95% Confidence Range</p>
          <p className="text-lg font-semibold">
            ${priceRange95[0].toFixed(2)} - ${priceRange95[1].toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Standard Deviation</p>
          <p className="text-lg font-semibold">${stdDev.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
}
