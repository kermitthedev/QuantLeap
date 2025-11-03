import { useState, useEffect, useCallback } from "react";
import ParameterInputPanel, { type OptionParameters } from "@/components/ParameterInputPanel";
import PricingResults, { type PricingResult } from "@/components/PricingResults";
import GreeksTable, { type Greeks } from "@/components/GreeksTable";
import ModelSelector, { type PricingModel } from "@/components/ModelSelector";
import PayoffDiagram from "@/components/PayoffDiagram";
import ComparisonTable, { type ModelComparison } from "@/components/ComparisonTable";
import VolatilitySurface from "@/components/VolatilitySurface";
import GreeksSensitivity from "@/components/GreeksSensitivity";
import ImpliedVolatilityCalculator from "@/components/ImpliedVolatilityCalculator";
import MarketDataPanel from "@/components/MarketDataPanel";
import StrategyBuilder from "@/components/StrategyBuilder";
import PortfolioGreeks from "@/components/PortfolioGreeks";
import HistoricalVolatility from "@/components/HistoricalVolatility";
import RiskScenarioAnalysis from "@/components/RiskScenarioAnalysis";
import MonteCarloAnimation from "@/components/MonteCarloAnimation";
import GreeksHedgingCalculator from "@/components/GreeksHedgingCalculator";
import PDFReportGenerator from "@/components/PDFReportGenerator";
import GreeksHeatmap from "@/components/GreeksHeatmap";
import StrategyPayoffVisualizer from "@/components/StrategyPayoffVisualizer";
import VolatilitySmile from "@/components/VolatilitySmile";
import PositionSizingCalculator from "@/components/PositionSizingCalculator";
import ProbabilityDistribution from "@/components/ProbabilityDistribution";
import TimeDecayAnimation from "@/components/TimeDecayAnimation";
import GreeksThroughTime from "@/components/GreeksThroughTime";
import AIStrategySuggestions from "@/components/AIStrategySuggestions";
import WorkspaceManagerComponent from "@/components/WorkspaceManager";
import ExportButton from "@/components/ExportButton";
import SocialShare from "@/components/SocialShare";
import TradingSimulator from "@/components/RealisticTradingSimulator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import useShareableURL from "@/hooks/useShareableURL";
import toast from "react-hot-toast";
import { 
  Moon, 
  Sun, 
  TrendingUp, 
  Activity,
  BarChart3,
  Calculator,
  Zap,
  RefreshCw,
  Briefcase,
  LineChart,
  AlertTriangle,
  Database,
  Share2,
  Keyboard,
  Shield,
  Play,
  Layers,
  Target,
  Clock,
  Sparkles,
  Gamepad2
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
import { WorkspaceManager } from "@/lib/workspaceManager";

export default function EnhancedDashboard() {
  const [isDark, setIsDark] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");
  const [pricingSubTab, setPricingSubTab] = useState("standard");
  const [exoticSubTab, setExoticSubTab] = useState("asian");
  
  const [parameters, setParameters] = useState<OptionParameters>({
    spotPrice: 100,
    strikePrice: 100,
    volatility: 0.2,
    timeToMaturity: 1,
    riskFreeRate: 0.05,
    dividendYield: 0,
    optionType: "call",
  });

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

  const { copyShareURL } = useShareableURL(parameters);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const performCalculation = useCallback(() => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        let calculation;
        let modelName = "";
        
        switch (pricingSubTab) {
          case "standard":
            switch (selectedModel) {
              case "black-scholes":
                calculation = calculateBlackScholes(parameters);
                modelName = "Black-Scholes-Merton";
                setHigherOrderGreeks(calculation.higherOrderGreeks);
                break;
              case "monte-carlo":
                calculation = calculateMonteCarlo(parameters, 50000, true, true);
                modelName = "Monte Carlo (50,000 paths)";
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
            
          case "exotic":
            switch (exoticSubTab) {
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
            break;
            
          default:
            calculation = calculateBlackScholes(parameters);
            modelName = "Black-Scholes-Merton";
        }
        
        setResult({
          price: calculation.price,
          model: modelName,
          timestamp: new Date(),
          previousPrice: result?.price,
        });
        
        setGreeks(calculation.greeks);
        
        if (!realTimeMode) {
          toast.success("Calculation complete!");
        }
        
      } catch (error) {
        console.error("Calculation error:", error);
        toast.error("Calculation failed");
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  }, [parameters, selectedModel, pricingSubTab, exoticSubTab, hestonParams, jumpParams, barrierParams, result?.price, realTimeMode]);

  useEffect(() => {
    if (realTimeMode) {
      performCalculation();
      
      const interval = setInterval(() => {
        setParameters(prev => ({
          ...prev,
          spotPrice: prev.spotPrice + (Math.random() - 0.5) * 0.5,
          volatility: Math.max(0.05, Math.min(0.5, prev.volatility + (Math.random() - 0.5) * 0.01)),
        }));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [realTimeMode, performCalculation]);

  useEffect(() => {
    if (realTimeMode) {
      performCalculation();
    }
  }, [parameters, realTimeMode, performCalculation]);

  const handleCalculate = () => {
    performCalculation();
  };

  const handleCompareAllModels = () => {
    setIsCalculating(true);
    toast.loading("Comparing all models...");
    
    setTimeout(() => {
      const models = [
        { calculate: () => calculateBlackScholes(parameters), name: "Black-Scholes" },
        { calculate: () => calculateMonteCarlo(parameters, 50000, true, true), name: "Monte Carlo" },
        { calculate: () => calculateBinomial(parameters, 200, false), name: "Binomial Tree" },
      ];
      
      const comparisonsData = models.map(({ calculate, name }) => {
        const startTime = performance.now();
        const calculation = calculate();
        const computationTime = performance.now() - startTime;
        
        return { model: name, price: calculation.price, computationTime };
      });
      
      setComparisons(comparisonsData);
      setShowComparison(true);
      setIsCalculating(false);
      toast.success("Model comparison complete!");
    }, 100);
  };

  const handleRealTimeModeToggle = (checked: boolean) => {
    setRealTimeMode(checked);
    if (checked) {
      toast.success("Real-time mode activated! Auto-updating every 2 seconds", { 
        duration: 3000,
        icon: "⚡"
      });
    } else {
      toast("Real-time mode deactivated", { icon: "⏸️" });
    }
  };

  const handleLoadWorkspace = (workspace: any) => {
    if (workspace.parameters) {
      setParameters(workspace.parameters);
      toast.success(`Loaded workspace: ${workspace.name}`);
    }
  };

  useKeyboardShortcuts({
    onCalculate: handleCalculate,
    onToggleCallPut: () => {
      setParameters(prev => ({
        ...prev,
        optionType: prev.optionType === "call" ? "put" : "call"
      }));
    },
    onIncreaseSpot: () => {
      setParameters(prev => ({ ...prev, spotPrice: prev.spotPrice + 1 }));
    },
    onDecreaseSpot: () => {
      setParameters(prev => ({ ...prev, spotPrice: prev.spotPrice - 1 }));
    },
    onReset: () => {
      setParameters({
        spotPrice: 100,
        strikePrice: 100,
        volatility: 0.2,
        timeToMaturity: 1,
        riskFreeRate: 0.05,
        dividendYield: 0,
        optionType: "call",
      });
    },
  });

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
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <WorkspaceManagerComponent 
            currentParameters={parameters} 
            onLoadWorkspace={handleLoadWorkspace}
          />
          
          <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50">
            <Zap className={`h-4 w-4 ${realTimeMode ? 'text-yellow-500 animate-pulse' : 'text-muted-foreground'}`} />
            <Label htmlFor="realtime-mode" className="text-sm cursor-pointer">
              Real-time
            </Label>
            <Switch
              id="realtime-mode"
              checked={realTimeMode}
              onCheckedChange={handleRealTimeModeToggle}
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
            Compare
          </Button>

          <ExportButton 
            data={{ parameters, result, greeks }}
            greeks={greeks}
            higherOrderGreeks={higherOrderGreeks}
          />
          
          {result && (
            <>
              <SocialShare parameters={parameters} result={result} greeks={greeks} />
              <PDFReportGenerator 
                data={{ 
                  parameters, 
                  result, 
                  greeks: greeks || { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 }, 
                  timestamp: new Date() 
                }} 
              />
            </>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast("Press ? for keyboard shortcuts", { icon: <Keyboard className="h-4 w-4" /> })}
          >
            <Keyboard className="h-5 w-5" />
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

      {/* Main Navigation - SCROLLABLE! */}
      <div className="border-b bg-muted/30 overflow-x-auto">
        <div className="px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-12 inline-flex w-auto">
              <TabsTrigger value="game" className="gap-2 whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 text-white data-[state=active]:text-white">
                <Gamepad2 className="h-4 w-4" />
                Trading Game
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2 whitespace-nowrap">
                <Calculator className="h-4 w-4" />
                Options Pricing
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2 whitespace-nowrap">
                <Layers className="h-4 w-4" />
                Advanced Analytics
              </TabsTrigger>
              <TabsTrigger value="animations" className="gap-2 whitespace-nowrap">
                <Clock className="h-4 w-4" />
                Time Analysis
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="gap-2 whitespace-nowrap">
                <Sparkles className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger value="market-data" className="gap-2 whitespace-nowrap">
                <Database className="h-4 w-4" />
                Market Data
              </TabsTrigger>
              <TabsTrigger value="strategies" className="gap-2 whitespace-nowrap">
                <TrendingUp className="h-4 w-4" />
                Strategies
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="gap-2 whitespace-nowrap">
                <Briefcase className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="hedging" className="gap-2 whitespace-nowrap">
                <Shield className="h-4 w-4" />
                Hedging
              </TabsTrigger>
              <TabsTrigger value="position-sizing" className="gap-2 whitespace-nowrap">
                <Target className="h-4 w-4" />
                Position Sizing
              </TabsTrigger>
              <TabsTrigger value="historical" className="gap-2 whitespace-nowrap">
                <LineChart className="h-4 w-4" />
                Historical
              </TabsTrigger>
              <TabsTrigger value="risk" className="gap-2 whitespace-nowrap">
                <AlertTriangle className="h-4 w-4" />
                Risk Scenarios
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="p-8">
        {/* TRADING GAME TAB */}
        {activeTab === "game" && <TradingSimulator />}

        {/* OPTIONS PRICING TAB - COMPLETE VERSION */}
        {activeTab === "pricing" && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <ParameterInputPanel
                parameters={parameters}
                onParametersChange={setParameters}
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />
            </div>

            <div className="col-span-6 space-y-6">
              <Tabs value={pricingSubTab} onValueChange={setPricingSubTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="standard">Standard</TabsTrigger>
                  <TabsTrigger value="stochastic-vol">Stochastic Vol</TabsTrigger>
                  <TabsTrigger value="jump-diffusion">Jumps</TabsTrigger>
                  <TabsTrigger value="exotic">Exotic</TabsTrigger>
                </TabsList>

                <TabsContent value="standard" className="space-y-6">
                  <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel}>
                    {selectedModel === "monte-carlo" && (
                      <MonteCarloAnimation
                        spotPrice={parameters.spotPrice}
                        volatility={parameters.volatility}
                        timeToMaturity={parameters.timeToMaturity}
                        riskFreeRate={parameters.riskFreeRate}
                      />
                    )}
                    
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Heston Model Parameters</h3>
                      <Button onClick={handleCalculate} disabled={isCalculating} className="gap-2">
                        <Play className="h-4 w-4" />
                        Calculate Heston
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Mean Reversion (κ)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={hestonParams.kappa}
                          onChange={(e) => setHestonParams({...hestonParams, kappa: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Long-term Variance (θ)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={hestonParams.theta}
                          onChange={(e) => setHestonParams({...hestonParams, theta: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Vol of Vol (ξ)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={hestonParams.xi}
                          onChange={(e) => setHestonParams({...hestonParams, xi: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Correlation (ρ)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={hestonParams.rho}
                          onChange={(e) => setHestonParams({...hestonParams, rho: parseFloat(e.target.value)})}
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Jump-Diffusion Parameters</h3>
                      <Button onClick={handleCalculate} disabled={isCalculating} className="gap-2">
                        <Play className="h-4 w-4" />
                        Calculate Jumps
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Jump Intensity (λ)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={jumpParams.lambda}
                          onChange={(e) => setJumpParams({...jumpParams, lambda: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Mean Jump (μⱼ)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={jumpParams.muJ}
                          onChange={(e) => setJumpParams({...jumpParams, muJ: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Jump Vol (σⱼ)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={jumpParams.sigmaJ}
                          onChange={(e) => setJumpParams({...jumpParams, sigmaJ: parseFloat(e.target.value)})}
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
                  <Tabs value={exoticSubTab} onValueChange={setExoticSubTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="asian">Asian</TabsTrigger>
                      <TabsTrigger value="barrier">Barrier</TabsTrigger>
                      <TabsTrigger value="digital">Digital</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="asian">
                      <div className="bg-card p-6 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Asian Option</h3>
                          <Button onClick={handleCalculate} disabled={isCalculating} className="gap-2">
                            <Play className="h-4 w-4" />
                            Calculate Asian
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Payoff based on arithmetic average price over the life of the option
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="barrier">
                      <div className="bg-card p-6 rounded-lg border space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Barrier Option</h3>
                          <Button onClick={handleCalculate} disabled={isCalculating} className="gap-2">
                            <Play className="h-4 w-4" />
                            Calculate Barrier
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Barrier Level</Label>
                            <Input
                              type="number"
                              value={barrierParams.barrier}
                              onChange={(e) => setBarrierParams({...barrierParams, barrier: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Barrier Type</Label>
                            <select
                              value={barrierParams.barrierType}
                              onChange={(e) => setBarrierParams({...barrierParams, barrierType: e.target.value as any})}
                              className="w-full mt-1 px-3 py-2 border rounded bg-background"
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
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Digital/Binary Option</h3>
                          <Button onClick={handleCalculate} disabled={isCalculating} className="gap-2">
                            <Play className="h-4 w-4" />
                            Calculate Digital
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Fixed payout ($100) if option expires in-the-money, zero otherwise
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

            <div className="col-span-3 space-y-6">
              <PricingResults result={result} optionType={parameters.optionType} />
              <GreeksTable greeks={greeks} higherOrderGreeks={higherOrderGreeks} />
              
              {realTimeMode && (
                <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20 animate-pulse">
                  <div className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Real-time Mode Active
                    <Badge variant="outline" className="ml-auto">
                      Auto-updating
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Prices update every 2 seconds with simulated market movements
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-6">
            <ProbabilityDistribution
              spotPrice={parameters.spotPrice}
              strikePrice={parameters.strikePrice}
              volatility={parameters.volatility}
              timeToMaturity={parameters.timeToMaturity}
              optionType={parameters.optionType}
            />
            
            <GreeksHeatmap
              strikePrice={parameters.strikePrice}
              volatility={parameters.volatility}
              riskFreeRate={parameters.riskFreeRate}
              optionType={parameters.optionType}
            />
            
            <StrategyPayoffVisualizer />
            
            <VolatilitySmile
              spotPrice={parameters.spotPrice}
              atmVolatility={parameters.volatility}
            />
          </div>
        )}

        {activeTab === "animations" && (
          <div className="space-y-6">
            <TimeDecayAnimation
              spotPrice={parameters.spotPrice}
              strikePrice={parameters.strikePrice}
              volatility={parameters.volatility}
              timeToMaturity={parameters.timeToMaturity}
              riskFreeRate={parameters.riskFreeRate}
              optionType={parameters.optionType}
            />
            
            <GreeksThroughTime
              spotPrice={parameters.spotPrice}
              strikePrice={parameters.strikePrice}
              volatility={parameters.volatility}
              timeToMaturity={parameters.timeToMaturity}
              riskFreeRate={parameters.riskFreeRate}
              optionType={parameters.optionType}
            />
          </div>
        )}

        {activeTab === "ai-insights" && (
          <AIStrategySuggestions
            parameters={parameters}
            greeks={greeks}
            result={result}
          />
        )}

        {activeTab === "market-data" && <MarketDataPanel />}
        {activeTab === "strategies" && <StrategyBuilder />}
        {activeTab === "portfolio" && <PortfolioGreeks />}
        {activeTab === "hedging" && <GreeksHedgingCalculator />}
        {activeTab === "position-sizing" && <PositionSizingCalculator />}
        {activeTab === "historical" && <HistoricalVolatility />}
        {activeTab === "risk" && <RiskScenarioAnalysis />}

        {activeTab === "pricing" && showComparison && comparisons.length > 0 && (
          <div className="mt-6">
            <ComparisonTable comparisons={comparisons} />
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="mt-6">
            <ImpliedVolatilityCalculator />
          </div>
        )}
      </main>
    </div>
  );
}
