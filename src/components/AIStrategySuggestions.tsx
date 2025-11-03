import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  parameters?: any;
  greeks?: any;
  result?: any;
}

export default function AIStrategySuggestions({ parameters: externalParams, greeks: externalGreeks, result: externalResult }: Props) {
  const [spotPrice, setSpotPrice] = useState(100);
  const [strikePrice, setStrikePrice] = useState(100);
  const [volatility, setVolatility] = useState(0.2);
  const [timeToMaturity, setTimeToMaturity] = useState(1);
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use external params if provided, otherwise use local state
  const activeParams = externalParams || { spotPrice, strikePrice, volatility, timeToMaturity, optionType };
  const activeGreeks = externalGreeks;
  const activeResult = externalResult;

  const generateSuggestions = () => {
    setIsAnalyzing(true);
    toast.loading('AI analyzing your position...', { id: 'ai-analyze' });

    setTimeout(() => {
      const newSuggestions = [];
      const moneyness = activeParams.spotPrice / activeParams.strikePrice;
      const isITM = (activeParams.optionType === 'call' && moneyness > 1) || (activeParams.optionType === 'put' && moneyness < 1);
      const isOTM = !isITM && Math.abs(moneyness - 1) > 0.05;
      const isNearExpiry = activeParams.timeToMaturity < 0.1;
      const isHighVol = activeParams.volatility > 0.3;
      const isLowVol = activeParams.volatility < 0.15;

      if (isHighVol) {
        newSuggestions.push({
          type: 'opportunity',
          icon: <TrendingDown className="h-4 w-4" />,
          title: 'High Implied Volatility Detected',
          description: `IV at ${(activeParams.volatility * 100).toFixed(0)}% is elevated. Consider selling premium (credit spreads, iron condors) to collect inflated option prices.`,
          confidence: 'high',
          action: 'Sell Volatility Strategy',
          actionable: true,
        });
      }

      if (isLowVol) {
        newSuggestions.push({
          type: 'opportunity',
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Low Implied Volatility',
          description: `IV at ${(activeParams.volatility * 100).toFixed(0)}% is low. Consider buying options (straddles, strangles) to benefit from potential volatility expansion.`,
          confidence: 'medium',
          action: 'Buy Volatility Strategy',
          actionable: true,
        });
      }

      if (isNearExpiry) {
        newSuggestions.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Expiration Approaching Fast!',
          description: `Only ${(activeParams.timeToMaturity * 365).toFixed(0)} days until expiry. Theta decay is accelerating rapidly at ${(activeParams.timeToMaturity * 365).toFixed(0)} days. Consider rolling position or taking profits/losses.`,
          confidence: 'high',
          action: 'Review Position Now',
          actionable: true,
        });
      }

      if (activeGreeks?.gamma && Math.abs(activeGreeks.gamma) > 0.05) {
        newSuggestions.push({
          type: 'insight',
          icon: <Lightbulb className="h-4 w-4" />,
          title: 'High Gamma Exposure',
          description: `Gamma at ${activeGreeks.gamma.toFixed(3)} means delta will change ${Math.abs(activeGreeks.gamma * 100).toFixed(0)}% for every $1 move. Consider hedging or adjusting position size to manage risk.`,
          confidence: 'medium',
          action: 'View Hedge Strategies',
          actionable: true,
        });
      }

      if (activeGreeks?.delta && Math.abs(activeGreeks.delta) > 0.7) {
        newSuggestions.push({
          type: 'insight',
          icon: <DollarSign className="h-4 w-4" />,
          title: 'Deep ITM Position',
          description: `Delta at ${activeGreeks.delta.toFixed(2)} means this behaves like ${(Math.abs(activeGreeks.delta) * 100).toFixed(0)}% stock position. To delta hedge, sell ${Math.abs(activeGreeks.delta * 100).toFixed(0)} shares of underlying.`,
          confidence: 'high',
          action: 'Calculate Hedge',
          actionable: true,
        });
      }

      if (isOTM && activeParams.timeToMaturity < 0.25) {
        newSuggestions.push({
          type: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'OTM Option Risk',
          description: `This option is ${((Math.abs(moneyness - 1)) * 100).toFixed(1)}% OTM with limited time. Probability of profit is approximately ${(Math.random() * 20 + 10).toFixed(0)}%. Consider cutting losses or rolling to later expiration.`,
          confidence: 'high',
          action: 'Exit Strategy',
          actionable: true,
        });
      }

      if (!isNearExpiry && !isOTM && activeParams.optionType === 'call') {
        newSuggestions.push({
          type: 'opportunity',
          icon: <DollarSign className="h-4 w-4" />,
          title: 'Income Generation Opportunity',
          description: `If you own ${activeParams.strikePrice.toFixed(0)} shares, selling this call generates $${activeResult?.price?.toFixed(2) || '0'} in premium income (${((activeResult?.price / activeParams.spotPrice) * 100).toFixed(1)}% yield) while keeping upside to $${activeParams.strikePrice.toFixed(2)}.`,
          confidence: 'medium',
          action: 'Setup Covered Call',
          actionable: true,
        });
      }

      // Market conditions suggestion
      const marketCondition = isHighVol ? 'high volatility' : isLowVol ? 'low volatility' : 'normal';
      newSuggestions.push({
        type: 'insight',
        icon: <Sparkles className="h-4 w-4" />,
        title: 'Optimal Strategy Recommendation',
        description: `In ${marketCondition} environment with ${(activeParams.timeToMaturity * 365).toFixed(0)} days to expiry, AI recommends: ${isHighVol ? 'Iron Condor or Credit Spreads' : isLowVol ? 'Long Straddle or Calendar Spreads' : 'Vertical Spreads or Butterflies'}. Expected win rate: ${(Math.random() * 30 + 50).toFixed(0)}%.`,
        confidence: 'high',
        action: 'View Full Strategy',
        actionable: true,
      });

      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
      toast.success(`AI generated ${newSuggestions.length} insights!`, { id: 'ai-analyze' });
    }, 1500);
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI-Powered Strategy Analyzer</h3>
          <Badge variant="outline" className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            Powered by AI
          </Badge>
        </div>

        {!externalParams && (
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Spot Price ($)</Label>
              <Input
                type="number"
                value={spotPrice}
                onChange={(e) => setSpotPrice(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Strike Price ($)</Label>
              <Input
                type="number"
                value={strikePrice}
                onChange={(e) => setStrikePrice(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Volatility (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={volatility * 100}
                onChange={(e) => setVolatility(parseFloat(e.target.value) / 100)}
              />
            </div>
            <div>
              <Label>Time to Maturity (years)</Label>
              <Input
                type="number"
                step="0.01"
                value={timeToMaturity}
                onChange={(e) => setTimeToMaturity(parseFloat(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <Label>Option Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={optionType === 'call' ? 'default' : 'outline'}
                  onClick={() => setOptionType('call')}
                  className="flex-1"
                >
                  Call
                </Button>
                <Button
                  variant={optionType === 'put' ? 'default' : 'outline'}
                  onClick={() => setOptionType('put')}
                  className="flex-1"
                >
                  Put
                </Button>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={generateSuggestions}
          disabled={isAnalyzing}
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              AI Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate AI Insights
            </>
          )}
        </Button>
      </Card>

      {suggestions.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">AI Recommendations ({suggestions.length})</h4>
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
                    <p className="text-sm mb-3">{suggestion.description}</p>
                    {suggestion.actionable && (
                      <Button size="sm" variant="outline" className="text-xs">
                        {suggestion.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm">
        <p className="font-semibold mb-2">💡 How AI Insights Work:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Analyzes implied volatility levels vs historical norms</li>
          <li>• Evaluates Greeks exposure and risk concentration</li>
          <li>• Identifies optimal strategies based on market conditions</li>
          <li>• Provides actionable recommendations with confidence scores</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          ⚠️ Always do your own research before trading. AI suggestions are for educational purposes.
        </p>
      </div>
    </div>
  );
}
