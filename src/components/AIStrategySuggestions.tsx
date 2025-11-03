import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props {
  parameters: any;
  greeks?: any;
  result?: any;
}

export default function AIStrategySuggestions({ parameters, greeks, result }: Props) {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    generateSuggestions();
  }, [parameters, greeks, result]);

  const generateSuggestions = () => {
    const newSuggestions = [];

    if (!parameters || !greeks) return;

    const { spotPrice, strikePrice, volatility, timeToMaturity, optionType } = parameters;
    const moneyness = spotPrice / strikePrice;
    const isITM = (optionType === 'call' && moneyness > 1) || (optionType === 'put' && moneyness < 1);
    const isOTM = !isITM && Math.abs(moneyness - 1) > 0.05;
    const isNearExpiry = timeToMaturity < 0.1; // < 36 days
    const isHighVol = volatility > 0.3;
    const isLowVol = volatility < 0.15;

    // High IV suggestions
    if (isHighVol) {
      newSuggestions.push({
        type: 'opportunity',
        icon: <TrendingDown className="h-4 w-4" />,
        title: 'High Implied Volatility Detected',
        description: `IV at ${(volatility * 100).toFixed(0)}% is elevated. Consider selling premium (credit spreads, iron condors) to collect inflated option prices.`,
        confidence: 'high',
        action: 'Sell volatility',
      });
    }

    // Low IV suggestions
    if (isLowVol) {
      newSuggestions.push({
        type: 'opportunity',
        icon: <TrendingUp className="h-4 w-4" />,
        title: 'Low Implied Volatility',
        description: `IV at ${(volatility * 100).toFixed(0)}% is low. Consider buying options (straddles, strangles) to benefit from potential volatility expansion.`,
        confidence: 'medium',
        action: 'Buy volatility',
      });
    }

    // Near expiry warnings
    if (isNearExpiry) {
      newSuggestions.push({
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'Expiration Approaching',
        description: `Only ${(timeToMaturity * 365).toFixed(0)} days until expiry. Theta decay is accelerating rapidly. Consider rolling position or taking profits/losses.`,
        confidence: 'high',
        action: 'Review position',
      });
    }

    // High gamma
    if (greeks.gamma && Math.abs(greeks.gamma) > 0.05) {
      newSuggestions.push({
        type: 'insight',
        icon: <Lightbulb className="h-4 w-4" />,
        title: 'High Gamma Exposure',
        description: `Gamma at ${greeks.gamma.toFixed(3)} means delta will change rapidly with price movement. Consider hedging or adjusting position size.`,
        confidence: 'medium',
        action: 'Consider hedge',
      });
    }

    // Delta hedging
    if (greeks.delta && Math.abs(greeks.delta) > 0.7) {
      newSuggestions.push({
        type: 'insight',
        icon: <DollarSign className="h-4 w-4" />,
        title: 'Deep ITM Position',
        description: `Delta at ${greeks.delta.toFixed(2)} means this behaves like ${(Math.abs(greeks.delta) * 100).toFixed(0)}% stock position. Consider delta hedging with ${Math.abs(greeks.delta * 100).toFixed(0)} shares of underlying.`,
        confidence: 'high',
        action: 'Delta hedge',
      });
    }

    // Theta decay opportunity
    if (greeks.theta && greeks.theta < -0.1 && timeToMaturity > 0.2) {
      newSuggestions.push({
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'High Time Decay',
        description: `Losing $${Math.abs(greeks.theta).toFixed(2)} per day in time value. If you're long this option, consider shorter-dated alternatives or rolling out.`,
        confidence: 'medium',
        action: 'Review theta',
      });
    }

    // OTM option warning
    if (isOTM && timeToMaturity < 0.25) {
      newSuggestions.push({
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4" />,
        title: 'OTM Option Risk',
        description: `This option is ${((Math.abs(moneyness - 1)) * 100).toFixed(1)}% OTM with limited time. Probability of profit is low. Consider cutting losses or rolling.`,
        confidence: 'high',
        action: 'Review position',
      });
    }

    // Income generation
    if (!isNearExpiry && !isOTM && optionType === 'call') {
      newSuggestions.push({
        type: 'opportunity',
        icon: <DollarSign className="h-4 w-4" />,
        title: 'Covered Call Opportunity',
        description: `If you own the underlying, selling this call generates $${result?.price?.toFixed(2) || '0'} in premium income while keeping upside to $${strikePrice.toFixed(2)}.`,
        confidence: 'medium',
        action: 'Generate income',
      });
    }

    setSuggestions(newSuggestions.slice(0, 4)); // Show top 4
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400';
      case 'insight': return 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">AI Strategy Suggestions</h3>
        <Badge variant="outline" className="ml-auto">Powered by AI</Badge>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Calculate an option price to get AI-powered suggestions!
        </p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getTypeColor(suggestion.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getConfidenceColor(suggestion.confidence)} text-white`}
                    >
                      {suggestion.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{suggestion.description}</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-muted-foreground">
        💡 These AI suggestions analyze your parameters, Greeks, and market conditions to identify opportunities and risks.
        Always do your own research before trading.
      </div>
    </Card>
  );
}
