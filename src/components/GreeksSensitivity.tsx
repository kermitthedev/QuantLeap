import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface GreeksSensitivityProps {
  spotPrice: number;
  strikePrice: number;
}

export default function GreeksSensitivity({ spotPrice, strikePrice }: GreeksSensitivityProps) {
  const generateSensitivityData = () => {
    const data = [];
    const range = strikePrice * 0.4;
    const start = strikePrice - range;
    const end = strikePrice + range;
    const step = (end - start) / 50;

    for (let price = start; price <= end; price += step) {
      const moneyness = price / strikePrice;
      
      const delta = 1 / (1 + Math.exp(-5 * (moneyness - 1)));
      const gamma = 0.05 * Math.exp(-Math.pow(moneyness - 1, 2) * 10);
      const vega = 0.4 * Math.exp(-Math.pow(moneyness - 1, 2) * 5);

      data.push({
        spotPrice: price,
        delta: delta,
        gamma: gamma * 10,
        vega: vega,
      });
    }
    return data;
  };

  const data = generateSensitivityData();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Greeks Sensitivity Analysis</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="spotPrice"
              label={{ value: "Spot Price ($)", position: "insideBottom", offset: -5 }}
              stroke="#9CA3AF"
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
              }}
              formatter={(value: number) => value.toFixed(4)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="delta"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Delta"
            />
            <Line
              type="monotone"
              dataKey="gamma"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="Gamma (×10)"
            />
            <Line
              type="monotone"
              dataKey="vega"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name="Vega"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Sensitivity of Delta, Gamma, and Vega across different spot prices. Gamma is scaled by 10× for visibility.
      </p>
    </Card>
  );
}
