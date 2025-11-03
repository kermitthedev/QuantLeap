import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";

interface MonteCarloAnimationProps {
  spotPrice: number;
  volatility: number;
  timeToMaturity: number;
  riskFreeRate: number;
}

export default function MonteCarloAnimation({
  spotPrice,
  volatility,
  timeToMaturity,
  riskFreeRate,
}: MonteCarloAnimationProps) {
  const [paths, setPaths] = useState<number[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pathCount, setPathCount] = useState(0);
  const [convergingPrice, setConvergingPrice] = useState(0);
  const animationRef = useRef<number>();

  const generatePath = () => {
    const steps = 50;
    const dt = timeToMaturity / steps;
    const path: number[] = [spotPrice];
    let price = spotPrice;

    for (let i = 1; i <= steps; i++) {
      const drift = (riskFreeRate - 0.5 * volatility * volatility) * dt;
      const shock = volatility * Math.sqrt(dt) * (Math.random() * 2 - 1) * Math.sqrt(3);
      price = price * Math.exp(drift + shock);
      path.push(price);
    }

    return path;
  };

  const animate = () => {
    if (pathCount < 100) {
      const newPath = generatePath();
      setPaths(prev => [...prev, newPath]);
      
      // Calculate converging average
      const finalPrices = [...paths.map(p => p[p.length - 1]), newPath[newPath.length - 1]];
      const avg = finalPrices.reduce((a, b) => a + b, 0) / finalPrices.length;
      setConvergingPrice(avg);
      
      setPathCount(prev => prev + 1);
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, pathCount]);

  const reset = () => {
    setIsRunning(false);
    setPaths([]);
    setPathCount(0);
    setConvergingPrice(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const chartData = Array.from({ length: 51 }, (_, i) => {
    const dataPoint: any = { step: i };
    paths.forEach((path, idx) => {
      dataPoint[`path${idx}`] = path[i];
    });
    return dataPoint;
  });

  const colors = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#6366f1', '#a855f7', '#f43f5e', '#eab308', '#14b8a6'
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Live Monte Carlo Simulation</h2>
          <p className="text-sm text-muted-foreground">Watch price paths converge in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{pathCount} / 100 paths</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRunning(!isRunning)}
            disabled={pathCount >= 100}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {pathCount > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Starting Price</p>
            <p className="text-2xl font-mono font-bold">${spotPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Converging Average</p>
            <p className="text-2xl font-mono font-bold text-primary">
              ${convergingPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paths Simulated</p>
            <p className="text-2xl font-mono font-bold">{pathCount}</p>
          </div>
        </div>
      )}

      <div className="h-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="step" 
              stroke="#9CA3AF"
              label={{ value: 'Time Steps', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <ReferenceLine y={spotPrice} stroke="#fbbf24" strokeDasharray="5 5" label="Start" />
            {convergingPrice > 0 && (
              <ReferenceLine y={convergingPrice} stroke="#10b981" strokeDasharray="5 5" label="Average" />
            )}
            {paths.map((_, idx) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={`path${idx}`}
                stroke={colors[idx % colors.length]}
                strokeWidth={1.5}
                dot={false}
                opacity={0.6}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm">
          <strong>How it works:</strong> Each line represents a possible future price path. 
          As more paths are simulated, the average converges to the theoretical option value. 
          This is the foundation of Monte Carlo pricing!
        </p>
      </div>
    </Card>
  );
}
