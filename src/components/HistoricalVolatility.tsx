import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface HistoricalDataPoint {
  date: string;
  price: number;
  return: number;
  volatility: number;
}

export default function HistoricalVolatility() {
  const [symbol, setSymbol] = useState("AAPL");
  const [days, setDays] = useState(252); // 1 year
  const [window, setWindow] = useState(30); // 30-day rolling window
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [stats, setStats] = useState({
    currentVol: 0,
    avgVol: 0,
    minVol: 0,
    maxVol: 0,
    percentile25: 0,
    percentile75: 0,
  });

  const generateHistoricalData = () => {
    const data: HistoricalDataPoint[] = [];
    let price = 100;
    const returns: number[] = [];
    
    // Generate synthetic price data with realistic volatility clustering
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Simulate returns with volatility clustering (GARCH-like behavior)
      const baseVol = 0.02;
      const volCluster = Math.sin(i / 20) * 0.01 + 0.01;
      const dailyReturn = (Math.random() - 0.5) * (baseVol + volCluster);
      
      price = price * (1 + dailyReturn);
      returns.push(dailyReturn);
      
      // Calculate rolling volatility
      let rollingVol = 0;
      if (returns.length >= window) {
        const windowReturns = returns.slice(-window);
        const mean = windowReturns.reduce((a, b) => a + b, 0) / window;
        const variance = windowReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (window - 1);
        rollingVol = Math.sqrt(variance * 252); // Annualized
      }
      
      data.push({
        date: date.toLocaleDateString(),
        price: price,
        return: dailyReturn,
        volatility: rollingVol,
      });
    }
    
    // Calculate statistics
    const volatilities = data.filter(d => d.volatility > 0).map(d => d.volatility);
    const sortedVols = [...volatilities].sort((a, b) => a - b);
    
    setStats({
      currentVol: volatilities[volatilities.length - 1] || 0,
      avgVol: volatilities.reduce((a, b) => a + b, 0) / volatilities.length,
      minVol: Math.min(...volatilities),
      maxVol: Math.max(...volatilities),
      percentile25: sortedVols[Math.floor(sortedVols.length * 0.25)] || 0,
      percentile75: sortedVols[Math.floor(sortedVols.length * 0.75)] || 0,
    });
    
    setHistoricalData(data);
  };

  useEffect(() => {
    generateHistoricalData();
  }, [days, window]);

  const volRegime = stats.currentVol > stats.percentile75 ? "high" : 
                    stats.currentVol < stats.percentile25 ? "low" : "normal";

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Historical Volatility Analysis
          </h2>
          <Badge variant={volRegime === "high" ? "destructive" : volRegime === "low" ? "default" : "secondary"}>
            {volRegime.toUpperCase()} VOL REGIME
          </Badge>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Symbol
            </Label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="font-mono"
            />
          </div>
          <div>
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              History (Days)
            </Label>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 252)}
              min="30"
              max="1260"
            />
          </div>
          <div>
            <Label>Window Size (Days)</Label>
            <Input
              type="number"
              value={window}
              onChange={(e) => setWindow(parseInt(e.target.value) || 30)}
              min="5"
              max="100"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={generateHistoricalData} className="w-full">
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-6 gap-4 mb-6 p-4 border-2 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Vol</p>
            <p className="text-2xl font-mono font-bold text-primary">
              {(stats.currentVol * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Average Vol</p>
            <p className="text-2xl font-mono font-bold">
              {(stats.avgVol * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Min Vol</p>
            <p className="text-2xl font-mono font-bold text-green-500">
              {(stats.minVol * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Max Vol</p>
            <p className="text-2xl font-mono font-bold text-red-500">
              {(stats.maxVol * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">25th Percentile</p>
            <p className="text-2xl font-mono font-bold">
              {(stats.percentile25 * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">75th Percentile</p>
            <p className="text-2xl font-mono font-bold">
              {(stats.percentile75 * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Volatility Regime Indicator */}
        <div className={`p-4 rounded-lg mb-6 ${
          volRegime === "high" ? "bg-red-500/10 border-2 border-red-500/30" :
          volRegime === "low" ? "bg-green-500/10 border-2 border-green-500/30" :
          "bg-blue-500/10 border-2 border-blue-500/30"
        }`}>
          <p className="font-semibold mb-2">Volatility Regime Analysis</p>
          <p className="text-sm">
            {volRegime === "high" && "⚠️ High volatility regime detected. Consider strategies that benefit from high vol (e.g., long straddles, calendars with short near-term)."}
            {volRegime === "low" && "✅ Low volatility regime. Consider selling premium strategies (e.g., iron condors, short strangles) or buying long-dated options."}
            {volRegime === "normal" && "📊 Normal volatility regime. Standard strategies appropriate. Monitor for regime changes."}
          </p>
        </div>

        {/* Price Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Price History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  interval={Math.floor(historicalData.length / 8)}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                  }}
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volatility Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Rolling {window}-Day Historical Volatility (Annualized)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                  interval={Math.floor(historicalData.length / 8)}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.9)",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                  }}
                  formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                />
                <Legend />
                <ReferenceLine
                  y={stats.avgVol}
                  stroke="#6B7280"
                  strokeDasharray="5 5"
                  label="Average"
                />
                <ReferenceLine
                  y={stats.percentile75}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  label="75th %ile"
                />
                <ReferenceLine
                  y={stats.percentile25}
                  stroke="#10B981"
                  strokeDasharray="3 3"
                  label="25th %ile"
                />
                <Line
                  type="monotone"
                  dataKey="volatility"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={false}
                  name="Historical Volatility"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trading Insights */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="font-semibold mb-2">📚 Trading Insights</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Current volatility is {((stats.currentVol / stats.avgVol - 1) * 100).toFixed(1)}% {stats.currentVol > stats.avgVol ? "above" : "below"} historical average</li>
            <li>Volatility range over this period: {(stats.minVol * 100).toFixed(1)}% - {(stats.maxVol * 100).toFixed(1)}%</li>
            <li>Vol is in the {volRegime} regime (based on quartile analysis)</li>
            <li>Use this to compare against implied volatility for vol trading opportunities</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
