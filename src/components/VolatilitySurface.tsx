import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface VolatilitySurfaceProps {
  currentVolatility: number;
}

export default function VolatilitySurface({ currentVolatility }: VolatilitySurfaceProps) {
  const generateVolatilityData = () => {
    const strikes = [80, 90, 100, 110, 120];
    return strikes.map((strike) => {
      const moneyness = strike / 100;
      const skew = moneyness < 1 ? 0.05 * (1 - moneyness) : -0.03 * (moneyness - 1);
      const impliedVol = (currentVolatility + skew) * 100;
      return {
        strike,
        impliedVol: impliedVol,
        atmVol: currentVolatility * 100,
      };
    });
  };

  const data = generateVolatilityData();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Volatility Smile</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="strike"
              label={{ value: "Strike Price ($)", position: "insideBottom", offset: -5 }}
              stroke="#9CA3AF"
            />
            <YAxis
              label={{ value: "Implied Volatility (%)", angle: -90, position: "insideLeft" }}
              stroke="#9CA3AF"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Legend />
            <Bar dataKey="impliedVol" fill="#8B5CF6" name="Implied Volatility" />
            <Bar dataKey="atmVol" fill="#3B82F6" name="ATM Volatility" opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        The volatility smile shows how implied volatility varies across different strike prices,
        capturing market expectations of price movements.
      </p>
    </Card>
  );
}
