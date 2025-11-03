import { useState, useEffect, useCallback } from "react";
import ParameterInputPanel, { type OptionParameters } from "@/components/ParameterInputPanel";
import PricingResults, { type PricingResult } from "@/components/PricingResults";
import GreeksTable, { type Greeks } from "@/components/GreeksTable";
import ModelSelector, { type PricingModel } from "@/components/ModelSelector";
import PayoffDiagram from "@/components/PayoffDiagram";
import ComparisonTable, { type ModelComparison } from "@/components/ComparisonTable";
import VolatilitySurface from "@/components/VolatilitySurface";
import GreeksSensitivity from "@/components/GreeksSensitivity";
import RiskMetricsDashboard from "@/components/RiskMetricsDashboard";
import ImpliedVolatilityCalculator from "@/components/ImpliedVolatilityCalculator";
import StrategyBuilder from "@/components/StrategyBuilder";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Moon, 
  Sun, 
  Download, 
  TrendingUp, 
  Activity,
  BarChart3,
  Calculator,
  Zap,
  RefreshCw
} from "lucide-react";
import {
  calculateBlackScholes,
  calculateMonteCarlo,
  calculateBinomial,
  calculateHeston,
  calculateJumpDiffusion,
  calculateAsianOption,
  calculateBarrierOption,
  calculateDigitalOption,
  type HestonParameters,
  type JumpDiffusionParameters,
  type BarrierParameters,
} from "@/lib/advanced-options-pricing";

export default function EnhancedDashboard() {
  const [isDark, setIsDark] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [activeTab, setActiveTab] = useState("standard");
  
  const [parameters, setParameters] = useState<OptionParameters>({
    spotPrice: 100,
    strikePrice: 100,
    volatility: 0.2,
    timeToMaturity: 1,
    riskFreeRate: 0.05,
    dividendYield: 0,
    optionType: "call",
  });

  // Advanced model parameters
  const [hestonParams, setHestonParams] = useState({
    kappa: 2.0,
    theta: 0.04,
    xi: 0.3,
    rho: -0.7,
    v0: 0.04,
  });

  const [jumpParams, setJumpParams] = useState({
    lambda: 0.5,
    muJ: -0.05,
    sigmaJ: 0.15,
  });

  const [barrierParams, setBarrierParams] = useState({
    barrier: 110,
    barrierType: 'up-and-out' as const,
    rebate: 0,
  });
  
  const [selectedModel, setSelectedModel] = useState<PricingModel>("black-scholes");
  const [result, setResult] = useState<PricingResult | null>(null);
  const [greeks, setGreeks] = useState<Greeks | null>(null);
  const [higherOrderGreeks, setHigherOrderGreeks] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparisons, setComparisons] = useState<ModelComparison[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [computationStats, setComputationStats] = useState({
    lastComputationTime: 0,
    averageComputationTime: 0,
    totalCalculations: 0,
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  // Real-time calculation with debouncing
  const performCalculation = useCallback(() => {
    setIsCalculating(true);
    
    // Use requestAnimationFrame for smooth UI updates
    requestAnimationFrame(() => {
      const startTime = performance.now();
      let calculation;
      let modelName = "";
      
      try {
        switch (activeTab) {
          case "standard":
            switch (selectedModel) {
              case "black-scholes":
                calculation = calculateBlackScholes(parameters);
                modelName = "Black-Scholes-Merton";
                setHigherOrderGreeks(calculation.higherOrderGreeks);
                break;
              case "monte-carlo":
                calculation = calculateMonteCarlo(parameters, 50000, true, true);
                modelName = "Monte Carlo (50,000 paths, Variance Reduction)";
                break;
              case "binomial":
                calculation = calculateBinomial(parameters, 200, false);
                modelName = "Binomial Tree (200 steps)";
                break;
              default:
                calculation = calculateBlackScholes(parameters);
                modelName = "Black-Scholes-Merton";
            }
            break;
            
          case "stochastic-vol":
            calculation = calculateHeston(
              { ...parameters, ...hestonParams } as HestonParameters,
              50000,
              100
            );
            modelName = "Heston Stochastic Volatility";
            break;
            
          case "jump-diffusion":
            calculation = calculateJumpDiffusion(
              { ...parameters, ...jumpParams } as JumpDiffusionParameters,
              50000,
              100
            );
            modelName = "Merton Jump-Diffusion";
            break;
            
          case "asian":
            calculation = calculateAsianOption(parameters, 50000, 252);
            modelName = "Asian Option (Arithmetic Average)";
            break;
            
          case "barrier":
            calculation = calculateBarrierOption(
              { ...parameters, ...barrierParams } as BarrierParameters,
              50000,
              252
            );
            modelName = `Barrier Option (${barrierParams.barrierType})`;
            break;
            
          case "digital":
            calculation = calculateDigitalOption(parameters, 100);
            modelName = "Digital/Binary Option";
            break;
            
          default:
            calculation = calculateBlackScholes(parameters);
            modelName = "Black-Scholes-Merton";
        }
        
        const computationTime = performance.now() - startTime;
        
        setResult({
          price: calculation.price,
          model: modelName,
          timestamp: new Date(),
          previousPrice: result?.price,
        });
        
        setGreeks(calculation.greeks);
        
        // Update computation statistics
        setComputationStats(prev => ({
          lastComputationTime: computationTime,
          totalCalculations: prev.totalCalculations + 1,
          averageComputationTime: 
            (prev.averageComputationTime * prev.totalCalculations + computationTime) / 
            (prev.totalCalculations + 1),
        }));
        
      } catch (error) {
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
      }
    });
  }, [parameters, selectedModel, activeTab, hestonParams, jumpParams, barrierParams, result?.price]);

  // Real-time mode: automatically recalculate when parameters change
  useEffect(() => {
    if (realTimeMode) {
      const timeoutId = setTimeout(() => {
        performCalculation();
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [realTimeMode, parameters, performCalculation]);

  const handleCalculate = () => {
    performCalculation();
  };

  const handleCompareAllModels = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const models: Array<{ 
        calculate: () => any; 
        name: string;
      }> = [
        {
          calculate: () => calculateBlackScholes(parameters),
          name: "Black-Scholes-Merton"
        },
        {
          calculate: () => calculateMonteCarlo(parameters, 50000, true, true),
          name: "Monte Carlo (50K paths + VRT)"
        },
        {
          calculate: () => calculateBinomial(parameters, 200, false),
          name: "Binomial Tree (200 steps)"
        },
        {
          calculate: () => calculateBinomial(parameters, 200, true),
          name: "Binomial (American)"
        },
        {
          calculate: () => calculateHeston(
            { ...parameters, ...hestonParams } as HestonParameters,
            30000,
            50
          ),
          name: "Heston Stochastic Vol"
        },
        {
          calculate: () => calculateJumpDiffusion(
            { ...parameters, ...jumpParams } as JumpDiffusionParameters,
            30000,
            50
          ),
          name: "Jump-Diffusion"
        },
      ];
      
      const comparisonsData: ModelComparison[] = models.map(({ calculate, name }) => {
        const startTime = performance.now();
        const calculation = calculate();
        const computationTime = performance.now() - startTime;
        
        return {
          model: name,
          price: calculation.price,
          computationTime,
        };
      });
      
      setComparisons(comparisonsData);
      setShowComparison(true);
      setIsCalculating(false);
    }, 100);
  };

  const handleExport = () => {
    const exportData = {
      parameters,
      advancedParameters: {
        heston: hestonParams,
        jumpDiffusion: jumpParams,
        barrier: barrierParams,
      },
      result,
      greeks,
      higherOrderGreeks,
      comparisons: showComparison ? comparisons : [],
      computationStats,
      timestamp: new Date().toISOString(),
      model: activeTab,
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `options-pricing-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-20 border-b flex items-center justify-between px-8 sticky top-0 bg-background/95 backdrop-blur z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">Ω</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Options Pricing Engine
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="h-3 w-3" />
              Institutional-Grade Quantitative Analytics
              {computationStats.totalCalculations > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {computationStats.totalCalculations} calculations
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
            <Zap className={`h-4 w-4 ${realTimeMode ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            <Label htmlFor="realtime-mode" className="text-sm cursor-pointer">
              Real-time Mode
            </Label>
            <Switch
              id="realtime-mode"
              checked={realTimeMode}
              onCheckedChange={setRealTimeMode}
            />
          </div>
          
          <Button
            variant="outline"
            size="default"
            onClick={handleCompareAllModels}
            disabled={isCalculating}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Compare All Models
          </Button>
          
          <Button
            variant="outline"
            size="default"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel: Parameters */}
          <div className="col-span-3">
            <ParameterInputPanel
              parameters={parameters}
              onParametersChange={setParameters}
              onCalculate={handleCalculate}
              isCalculating={isCalculating}
            />
            
            {/* Computation Stats */}
            {computationStats.totalCalculations > 0 && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance Metrics
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Computation:</span>
                    <span className="font-mono font-medium">
                      {computationStats.lastComputationTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Time:</span>
                    <span className="font-mono font-medium">
                      {computationStats.averageComputationTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Calculations:</span>
                    <span className="font-mono font-medium">
                      {computationStats.totalCalculations}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel: Model Selection and Visualizations */}
          <div className="col-span-6 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="standard" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Standard
                </TabsTrigger>
                <TabsTrigger value="stochastic-vol" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Stochastic Vol
                </TabsTrigger>
                <TabsTrigger value="jump-diffusion" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Jumps
                </TabsTrigger>
                <TabsTrigger value="exotic" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Exotic
                </TabsTrigger>
              </TabsList>

              <TabsContent value="standard" className="space-y-6">
                <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel}>
                  <PayoffDiagram
                    spotPrice={parameters.spotPrice}
                    strikePrice={parameters.strikePrice}
                    optionPrice={result?.price || 0}
                    optionType={parameters.optionType}
                  />
                  <VolatilitySurface currentVolatility={parameters.volatility} />
                  <GreeksSensitivity
                    spotPrice={parameters.spotPrice}
                    strikePrice={parameters.strikePrice}
                  />
                </ModelSelector>
              </TabsContent>

              <TabsContent value="stochastic-vol" className="space-y-6">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Heston Model Parameters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Mean Reversion (κ)</Label>
                      <input
                        type="number"
                        step="0.1"
                        value={hestonParams.kappa}
                        onChange={(e) => setHestonParams({...hestonParams, kappa: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Long-term Variance (θ)</Label>
                      <input
                        type="number"
                        step="0.01"
                        value={hestonParams.theta}
                        onChange={(e) => setHestonParams({...hestonParams, theta: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Vol of Vol (ξ)</Label>
                      <input
                        type="number"
                        step="0.1"
                        value={hestonParams.xi}
                        onChange={(e) => setHestonParams({...hestonParams, xi: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Correlation (ρ)</Label>
                      <input
                        type="number"
                        step="0.1"
                        min="-1"
                        max="1"
                        value={hestonParams.rho}
                        onChange={(e) => setHestonParams({...hestonParams, rho: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <PayoffDiagram
                  spotPrice={parameters.spotPrice}
                  strikePrice={parameters.strikePrice}
                  optionPrice={result?.price || 0}
                  optionType={parameters.optionType}
                />
              </TabsContent>

              <TabsContent value="jump-diffusion" className="space-y-6">
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Jump-Diffusion Parameters</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Jump Intensity (λ)</Label>
                      <input
                        type="number"
                        step="0.1"
                        value={jumpParams.lambda}
                        onChange={(e) => setJumpParams({...jumpParams, lambda: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Mean Jump (μⱼ)</Label>
                      <input
                        type="number"
                        step="0.01"
                        value={jumpParams.muJ}
                        onChange={(e) => setJumpParams({...jumpParams, muJ: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Jump Vol (σⱼ)</Label>
                      <input
                        type="number"
                        step="0.01"
                        value={jumpParams.sigmaJ}
                        onChange={(e) => setJumpParams({...jumpParams, sigmaJ: parseFloat(e.target.value)})}
                        className="w-full mt-1 px-3 py-2 border rounded"
                      />
                    </div>
                  </div>
                </div>
                <PayoffDiagram
                  spotPrice={parameters.spotPrice}
                  strikePrice={parameters.strikePrice}
                  optionPrice={result?.price || 0}
                  optionType={parameters.optionType}
                />
              </TabsContent>

              <TabsContent value="exotic" className="space-y-6">
                <Tabs defaultValue="asian">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="asian">Asian</TabsTrigger>
                    <TabsTrigger value="barrier">Barrier</TabsTrigger>
                    <TabsTrigger value="digital">Digital</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="asian">
                    <div className="bg-card p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-2">Asian Option</h3>
                      <p className="text-sm text-muted-foreground">
                        Payoff based on arithmetic average price over the option's life
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="barrier">
                    <div className="bg-card p-6 rounded-lg border space-y-4">
                      <h3 className="text-lg font-semibold">Barrier Option</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Barrier Level</Label>
                          <input
                            type="number"
                            value={barrierParams.barrier}
                            onChange={(e) => setBarrierParams({...barrierParams, barrier: parseFloat(e.target.value)})}
                            className="w-full mt-1 px-3 py-2 border rounded"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Barrier Type</Label>
                          <select
                            value={barrierParams.barrierType}
                            onChange={(e) => setBarrierParams({...barrierParams, barrierType: e.target.value as any})}
                            className="w-full mt-1 px-3 py-2 border rounded"
                          >
                            <option value="up-and-out">Up-and-Out</option>
                            <option value="up-and-in">Up-and-In</option>
                            <option value="down-and-out">Down-and-Out</option>
                            <option value="down-and-in">Down-and-In</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="digital">
                    <div className="bg-card p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-2">Digital/Binary Option</h3>
                      <p className="text-sm text-muted-foreground">
                        Fixed payout if option ends in-the-money, zero otherwise
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <PayoffDiagram
                  spotPrice={parameters.spotPrice}
                  strikePrice={parameters.strikePrice}
                  optionPrice={result?.price || 0}
                  optionType={parameters.optionType}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel: Results and Greeks */}
          <div className="col-span-3 space-y-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <PricingResults result={result} optionType={parameters.optionType} />
            <GreeksTable greeks={greeks} higherOrderGreeks={higherOrderGreeks} />
            
            {realTimeMode && (
              <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Real-time Mode Active
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Prices update automatically as you adjust parameters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model Comparison Table */}
        {showComparison && comparisons.length > 0 && (
          <div className="mt-6">
            <ComparisonTable comparisons={comparisons} />
          </div>
        )}
      </main>
    </div>
  );
}
