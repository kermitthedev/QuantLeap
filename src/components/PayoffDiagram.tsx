import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

interface PayoffDiagramProps {
  spotPrice: number;
  strikePrice: number;
  optionPrice: number;
  optionType: "call" | "put";
}

export default function PayoffDiagram({
  spotPrice,
  strikePrice,
  optionPrice,
  optionType,
}: PayoffDiagramProps) {
  const generatePayoffData = () => {
    const data = [];
    const range = strikePrice * 0.6;
    const start = strikePrice - range;
    const end = strikePrice + range;
    const step = (end - start) / 100;

    for (let price = start; price <= end; price += step) {
      let intrinsicValue = 0;
      if (optionType === "call") {
        intrinsicValue = Math.max(0, price - strikePrice);
      } else {
        intrinsicValue = Math.max(0, strikePrice - price);
      }
      const payoff = intrinsicValue - optionPrice;
      data.push({
        spotPrice: price,
        payoff: payoff,
        intrinsic: intrinsicValue,
        breakeven: 0,
      });
    }
    return data;
  };

  const data = generatePayoffData();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payoff Diagram</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="spotPrice"
              label={{ value: "Spot Price ($)", position: "insideBottom", offset: -5 }}
              stroke="#9CA3AF"
            />
            <YAxis
              label={{ value: "Payoff ($)", angle: -90, position: "insideLeft" }}
              stroke="#9CA3AF"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
              }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
            <ReferenceLine
              x={strikePrice}
              stroke="#3B82F6"
              strokeDasharray="3 3"
              label="Strike"
            />
            <Line
              type="monotone"
              dataKey="payoff"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              name="Net Payoff"
            />
            <Line
              type="monotone"
              dataKey="intrinsic"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Intrinsic Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
