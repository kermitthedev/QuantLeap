import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { calculateBlackScholes } from '@/lib/advanced-options-pricing';

interface Props {
  spotPrice: number;
  strikePrice: number;
  volatility: number;
  timeToMaturity: number;
  riskFreeRate: number;
  optionType: 'call' | 'put';
}

export default function GreeksThroughTime({
  spotPrice,
  strikePrice,
  volatility,
  timeToMaturity,
  riskFreeRate,
  optionType,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedGreeks, setSelectedGreeks] = useState<Set<string>>(
    new Set(['delta', 'gamma', 'theta', 'vega'])
  );
  
  const totalDays = Math.floor(timeToMaturity * 365);

  const generateData = () => {
    const data = [];
    for (let day = 0; day <= totalDays; day++) {
      const t = (totalDays - day) / 365;
      const result = calculateBlackScholes({
        spotPrice,
        strikePrice,
        volatility,
        timeToMaturity: Math.max(0.001, t),
        riskFreeRate,
        dividendYield: 0,
        optionType,
      });
      
      data.push({
        day,
        daysRemaining: totalDays - day,
        delta: result.greeks.delta,
        gamma: result.greeks.gamma * 10, // Scale for visibility
        theta: Math.abs(result.greeks.theta) * 100, // Scale and absolute
        vega: result.greeks.vega,
        rho: result.greeks.rho * 10, // Scale for visibility
      });
    }
    return data;
  };

  const data = generateData();
  const currentData = data.slice(0, currentDay + 1);

  useEffect(() => {
    if (isPlaying && currentDay < totalDays) {
      const timer = setTimeout(() => {
        setCurrentDay(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else if (currentDay >= totalDays) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentDay, totalDays]);

  const handlePlayPause = () => {
    if (currentDay >= totalDays) {
      setCurrentDay(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDay(0);
  };

  const toggleGreek = (greek: string) => {
    setSelectedGreeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(greek)) {
        newSet.delete(greek);
      } else {
        newSet.add(greek);
      }
      return newSet;
    });
  };

  const greekColors = {
    delta: '#3b82f6',
    gamma: '#10b981',
    theta: '#ef4444',
    vega: '#f59e0b',
    rho: '#8b5cf6',
  };

  const currentGreeks = data[currentDay] || {};

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Greeks Evolution Through Time</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayPause}
            className="gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {Object.keys(greekColors).map((greek) => (
          <Badge
            key={greek}
            variant={selectedGreeks.has(greek) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleGreek(greek)}
            style={{
              backgroundColor: selectedGreeks.has(greek) ? greekColors[greek as keyof typeof greekColors] : undefined,
            }}
          >
            {greek.charAt(0).toUpperCase() + greek.slice(1)}
          </Badge>
        ))}
      </div>

      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Delta</p>
            <p className="text-lg font-bold">{currentGreeks.delta?.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gamma (×10)</p>
            <p className="text-lg font-bold">{currentGreeks.gamma?.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Theta (×100)</p>
            <p className="text-lg font-bold text-red-600">{currentGreeks.theta?.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vega</p>
            <p className="text-lg font-bold">{currentGreeks.vega?.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rho (×10)</p>
            <p className="text-lg font-bold">{currentGreeks.rho?.toFixed(3)}</p>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm text-muted-foreground">
            Day {currentDay} of {totalDays} • {totalDays - currentDay} days remaining
          </p>
        </div>
      </div>

      <Slider
        value={[currentDay]}
        onValueChange={(value) => {
          setIsPlaying(false);
          setCurrentDay(value[0]);
        }}
        max={totalDays}
        step={1}
        className="mb-4"
      />

      <LineChart width={800} height={350} data={currentData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="day" 
          label={{ value: 'Days Passed', position: 'insideBottom', offset: -5 }}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {selectedGreeks.has('delta') && (
          <Line
            type="monotone"
            dataKey="delta"
            stroke={greekColors.delta}
            strokeWidth={2}
            dot={false}
            name="Delta"
          />
        )}
        {selectedGreeks.has('gamma') && (
          <Line
            type="monotone"
            dataKey="gamma"
            stroke={greekColors.gamma}
            strokeWidth={2}
            dot={false}
            name="Gamma (×10)"
          />
        )}
        {selectedGreeks.has('theta') && (
          <Line
            type="monotone"
            dataKey="theta"
            stroke={greekColors.theta}
            strokeWidth={2}
            dot={false}
            name="Theta (×100)"
          />
        )}
        {selectedGreeks.has('vega') && (
          <Line
            type="monotone"
            dataKey="vega"
            stroke={greekColors.vega}
            strokeWidth={2}
            dot={false}
            name="Vega"
          />
        )}
        {selectedGreeks.has('rho') && (
          <Line
            type="monotone"
            dataKey="rho"
            stroke={greekColors.rho}
            strokeWidth={2}
            dot={false}
            name="Rho (×10)"
          />
        )}
        <ReferenceLine
          x={currentDay}
          stroke="#000"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
      </LineChart>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          📊 Click on Greek badges to show/hide. Notice how Gamma peaks near ATM as expiration approaches, 
          while Theta accelerates (time decay speeds up)!
        </p>
      </div>
    </Card>
  );
}
