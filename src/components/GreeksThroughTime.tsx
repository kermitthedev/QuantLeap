import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateBlackScholes } from '@/lib/advanced-options-pricing';

interface GreeksThroughTimeProps {
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
}: GreeksThroughTimeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [data, setData] = useState<any[]>([]);
  
  const totalFrames = 50;

  // Generate full dataset
  useEffect(() => {
    const fullData = [];
    for (let i = 0; i <= totalFrames; i++) {
      const daysRemaining = timeToMaturity * 365 * (1 - i / totalFrames);
      const t = Math.max(0.001, daysRemaining / 365); // Prevent division by zero
      
      const result = calculateBlackScholes({
        spotPrice,
        strikePrice,
        volatility,
        timeToMaturity: t,
        riskFreeRate,
        dividendYield: 0,
        optionType,
      });
      
      fullData.push({
        daysRemaining: Math.round(daysRemaining),
        delta: result.greeks.delta,
        gamma: result.greeks.gamma * 100, // Scale for visibility
        theta: result.greeks.theta,
        vega: result.greeks.vega / 100, // Scale for visibility
      });
    }
    setData(fullData);
  }, [spotPrice, strikePrice, volatility, timeToMaturity, riskFreeRate, optionType]);

  // Animation effect
  useEffect(() => {
    if (isPlaying && currentFrame < totalFrames) {
      const timer = setTimeout(() => {
        setCurrentFrame(prev => prev + 1);
      }, 100); // 100ms per frame
      
      return () => clearTimeout(timer);
    } else if (currentFrame >= totalFrames) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentFrame]);

  const handlePlay = () => {
    if (currentFrame >= totalFrames) {
      setCurrentFrame(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  // Get visible data up to current frame
  const visibleData = data.slice(0, currentFrame + 1);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Greeks Evolution Through Time</h3>
          <p className="text-sm text-muted-foreground">
            Watch how Greeks change as expiration approaches
          </p>
        </div>
        <div className="flex gap-2">
          {!isPlaying ? (
            <Button onClick={handlePlay} size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Play
            </Button>
          ) : (
            <Button onClick={handlePause} size="sm" variant="outline" className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          <Button onClick={handleReset} size="sm" variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-semibold">{Math.round((currentFrame / totalFrames) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-100"
            style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={visibleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="daysRemaining" 
            label={{ value: 'Days to Expiration', position: 'insideBottom', offset: -5 }}
            reversed
          />
          <YAxis 
            label={{ value: 'Greek Value', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            labelFormatter={(label) => `${label} days remaining`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="delta" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
            name="Delta"
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="gamma" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={false}
            name="Gamma (×100)"
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="theta" 
            stroke="#ffc658" 
            strokeWidth={2}
            dot={false}
            name="Theta"
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="vega" 
            stroke="#ff7c7c" 
            strokeWidth={2}
            dot={false}
            name="Vega (÷100)"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm">
          <strong>Current State:</strong>{' '}
          {visibleData.length > 0 && (
            <>
              {visibleData[visibleData.length - 1].daysRemaining} days remaining
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <strong>Key Observations:</strong> Delta approaches 1 or 0 as expiration nears for ITM/OTM options. 
          Gamma peaks for ATM options near expiration. Theta accelerates (becomes more negative) as time passes.
        </p>
      </div>
    </Card>
  );
}
