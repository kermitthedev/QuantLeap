import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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

export default function TimeDecayAnimation({
  spotPrice,
  strikePrice,
  volatility,
  timeToMaturity,
  riskFreeRate,
  optionType,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const totalDays = Math.floor(timeToMaturity * 365);

  // Generate time decay data
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
        price: result.price,
        theta: result.greeks.theta,
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

  const currentPrice = data[currentDay]?.price || 0;
  const initialPrice = data[0]?.price || 0;
  const decayAmount = initialPrice - currentPrice;
  const decayPercent = (decayAmount / initialPrice) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Time Decay Animation (Theta Burn)</h3>
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

      <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Day</p>
            <p className="text-2xl font-bold">{currentDay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Days Remaining</p>
            <p className="text-2xl font-bold">{totalDays - currentDay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Decay</p>
            <p className="text-2xl font-bold text-red-600">
              -${decayAmount.toFixed(2)} ({decayPercent.toFixed(1)}%)
            </p>
          </div>
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

      <LineChart width={800} height={300} data={currentData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="day" 
          label={{ value: 'Days Passed', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          label={{ value: 'Option Price ($)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value: any, name: string) => {
            if (name === 'price') return [`$${value.toFixed(2)}`, 'Option Price'];
            return [value, name];
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#ef4444"
          strokeWidth={3}
          dot={false}
          name="Option Price"
        />
        <ReferenceLine
          x={currentDay}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{ value: 'Now', position: 'top' }}
        />
      </LineChart>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          ⏰ This animation shows how option value decays as time passes (Theta effect). 
          Notice the decay accelerates as expiration approaches!
        </p>
      </div>
    </Card>
  );
}
