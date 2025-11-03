import { Card } from '@/components/ui/card';
import { calculateBlackScholes } from '@/lib/advanced-options-pricing';

interface Props {
  strikePrice: number;
  volatility: number;
  riskFreeRate: number;
  optionType: 'call' | 'put';
}

export default function GreeksHeatmap({ 
  strikePrice, 
  volatility, 
  riskFreeRate, 
  optionType 
}: Props) {
  // Generate heatmap data
  const spotPrices = Array.from({ length: 15 }, (_, i) => strikePrice * (0.7 + i * 0.04));
  const daysToExpiry = [1, 7, 14, 30, 60, 90, 180, 365];
  
  const deltaData = daysToExpiry.map(days => 
    spotPrices.map(spot => {
      const result = calculateBlackScholes({
        spotPrice: spot,
        strikePrice,
        volatility,
        timeToMaturity: days / 365,
        riskFreeRate,
        dividendYield: 0,
        optionType,
      });
      return result.greeks.delta;
    })
  );

  const getColor = (value: number) => {
    const intensity = Math.abs(value);
    if (value > 0) {
      return `rgba(34, 197, 94, ${intensity})`;
    } else {
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Delta Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-xs">Days</th>
              {spotPrices.map((spot, i) => (
                <th key={i} className="border p-2 text-xs">${spot.toFixed(0)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysToExpiry.map((days, i) => (
              <tr key={i}>
                <td className="border p-2 text-xs font-semibold">{days}d</td>
                {deltaData[i].map((delta, j) => (
                  <td
                    key={j}
                    className="border p-2 text-center text-xs font-mono"
                    style={{ backgroundColor: getColor(delta) }}
                  >
                    {delta.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
