import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, TrendingDown, RefreshCw, Activity, Search, Loader2, AlertCircle } from "lucide-react";
import { getRealTimeQuote, getRealOptionsChain, checkAPIHealth, type RealMarketQuote } from "@/lib/realMarketData";
import { createMarketDataStream, generateOptionChain, type MarketQuote } from "@/lib/marketData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast from "react-hot-toast";

export default function MarketDataPanel() {
  const [symbol, setSymbol] = useState("AAPL");
  const [useRealData, setUseRealData] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  
  // Real data
  const [realQuote, setRealQuote] = useState<RealMarketQuote | null>(null);
  const [realOptionsChain, setRealOptionsChain] = useState<any>(null);
  
  // Simulated data
  const [simulatedQuote, setSimulatedQuote] = useState<MarketQuote | null>(null);
  const [simulatedChain, setSimulatedChain] = useState<any>(null);

  const currentQuote = useRealData ? realQuote : simulatedQuote;

  // Check if backend API is running
  useEffect(() => {
    const checkAPI = async () => {
      const connected = await checkAPIHealth();
      setApiConnected(connected);
      if (!connected && useRealData) {
        toast.error('Backend API not running. Start the server first!');
      }
    };
    checkAPI();
  }, [useRealData]);

  // Real-time streaming for simulated data
  useEffect(() => {
    if (isStreaming && !useRealData) {
      const cleanup = createMarketDataStream(symbol, setSimulatedQuote);
      return cleanup;
    }
  }, [isStreaming, symbol, useRealData]);

  const fetchRealData = async () => {
    if (!apiConnected) {
      toast.error('Backend API not connected. Please start the server!');
      return;
    }

    setIsLoading(true);
    toast.loading(`Fetching real data for ${symbol}...`, { id: 'fetch-real' });
    
    try {
      const quote = await getRealTimeQuote(symbol);
      
      if (quote) {
        setRealQuote(quote);
        toast.success(`Real data loaded for ${symbol}`, { id: 'fetch-real' });
      } else {
        toast.error(`Could not find symbol ${symbol}`, { id: 'fetch-real' });
      }
    } catch (error) {
      toast.error('Failed to fetch real market data', { id: 'fetch-real' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealOptionsChain = async () => {
    if (!realQuote) {
      toast.error('Load stock quote first');
      return;
    }

    if (!apiConnected) {
      toast.error('Backend API not connected');
      return;
    }

    setIsLoading(true);
    toast.loading('Loading real options chain...', { id: 'options-chain' });

    try {
      const chain = await getRealOptionsChain(symbol);
      
      if (chain) {
        setRealOptionsChain(chain);
        toast.success(`Loaded ${chain.calls.length} calls, ${chain.puts.length} puts`, { id: 'options-chain' });
      } else {
        toast.error('No options available for this symbol', { id: 'options-chain' });
      }
    } catch (error) {
      toast.error('Failed to load options chain', { id: 'options-chain' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSimulatedChain = () => {
    if (simulatedQuote) {
      const chain = generateOptionChain(symbol, simulatedQuote.price, 30);
      setSimulatedChain(chain);
    }
  };

  const handleToggleDataSource = (checked: boolean) => {
    if (checked && !apiConnected) {
      toast.error('Backend API not running! Start server with: cd server && npm start');
      return;
    }
    setUseRealData(checked);
    if (checked) {
      toast.success('Switched to REAL market data');
    } else {
      toast('Switched to SIMULATED data', { icon: '🎭' });
    }
  };

  const isPositive = currentQuote ? (currentQuote.change || 0) >= 0 : false;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Data Feed
          </h2>
          <div className="flex items-center gap-4">
            {!apiConnected && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                API Offline
              </Badge>
            )}
            {apiConnected && (
              <Badge variant="default" className="bg-green-600">
                API Connected
              </Badge>
            )}
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
              <Label className="text-sm">Real Data</Label>
              <Switch
                checked={useRealData}
                onCheckedChange={handleToggleDataSource}
              />
            </div>
            <Badge variant={useRealData ? "default" : "secondary"}>
              {useRealData ? "LIVE YAHOO FINANCE" : "SIMULATED"}
            </Badge>
          </div>
        </div>

        {!apiConnected && useRealData && (
          <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-600 dark:text-red-400 mb-2">Backend API Not Running</p>
                <p className="text-sm mb-3">To use real market data, start the backend server:</p>
                <code className="block p-3 bg-black/10 dark:bg-white/10 rounded text-sm font-mono">
                  cd server && npm start
                </code>
                <p className="text-xs mt-2 text-muted-foreground">The server will run on http://localhost:3001</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Symbol</Label>
            <div className="flex gap-2">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="font-mono"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (useRealData) {
                      fetchRealData();
                    }
                  }
                }}
              />
              {useRealData && (
                <Button onClick={fetchRealData} disabled={isLoading || !apiConnected}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-end gap-2">
            {useRealData ? (
              <Button onClick={loadRealOptionsChain} disabled={!realQuote || isLoading || !apiConnected} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Options Chain
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsStreaming(!isStreaming)}
                  variant={isStreaming ? "destructive" : "default"}
                  className="flex-1"
                >
                  {isStreaming ? "Stop Stream" : "Start Stream"}
                </Button>
                <Button onClick={loadSimulatedChain} variant="outline" disabled={!simulatedQuote}>
                  Load Options
                </Button>
              </>
            )}
          </div>
        </div>

        {!useRealData && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ You are viewing SIMULATED market data. Toggle "Real Data" to use Yahoo Finance.
            </p>
          </div>
        )}

        {currentQuote && (
          <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">
                  {useRealData ? 'Real-Time Quote' : 'Simulated Quote'}
                </h3>
                <p className="text-3xl font-mono font-bold">{currentQuote.symbol}</p>
              </div>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
                <div className="text-right">
                  <span className={`text-xl font-mono font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {(currentQuote.change || 0) >= 0 ? "+" : ""}${(currentQuote.change || 0).toFixed(2)}
                  </span>
                  <p className={`text-sm font-mono ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    ({(currentQuote.changePercent || 0) >= 0 ? "+" : ""}{(currentQuote.changePercent || 0).toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>

            <div className="text-5xl font-mono font-bold mb-6">
              ${currentQuote.price.toFixed(2)}
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Bid:</span>
                <span className="font-mono font-semibold text-lg">${(currentQuote.bid || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Ask:</span>
                <span className="font-mono font-semibold text-lg">${(currentQuote.ask || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Volume:</span>
                <span className="font-mono font-semibold text-lg">{(currentQuote.volume || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Prev Close:</span>
                <span className="font-mono font-semibold text-lg">${(currentQuote.previousClose || 0).toFixed(2)}</span>
              </div>
            </div>

            {realQuote && useRealData && (
              <div className="grid grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t">
                <div>
                  <span className="text-muted-foreground block mb-1">Open:</span>
                  <span className="font-mono font-semibold">${realQuote.open.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">High:</span>
                  <span className="font-mono font-semibold text-green-600">${realQuote.high.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Low:</span>
                  <span className="font-mono font-semibold text-red-600">${realQuote.low.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Mkt Cap:</span>
                  <span className="font-mono font-semibold">
                    ${(realQuote.marketCap / 1e9).toFixed(1)}B
                  </span>
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground">
              Last updated: {currentQuote.timestamp.toLocaleTimeString()}
            </div>
          </div>
        )}
      </Card>

      {(realOptionsChain || simulatedChain) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {useRealData ? 'Real' : 'Simulated'} Options Chain - {(realOptionsChain || simulatedChain).symbol}
            </h3>
            <Badge variant="secondary">
              Expires: {new Date((realOptionsChain || simulatedChain).expirationDate || (simulatedChain?.expiry)).toLocaleDateString()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Calls */}
            <div>
              <h4 className="font-semibold mb-3 text-green-600">CALLS</h4>
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strike</TableHead>
                      <TableHead className="text-right">Last</TableHead>
                      <TableHead className="text-right">Bid</TableHead>
                      <TableHead className="text-right">Ask</TableHead>
                      <TableHead className="text-right">Vol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(useRealData ? realOptionsChain?.calls : simulatedChain?.strikes)?.slice(0, 10).map((item: any, idx: number) => {
                      const call = useRealData ? item : item.call;
                      const strike = useRealData ? item.strike : item.strike;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-mono font-semibold">${strike}</TableCell>
                          <TableCell className="text-right font-mono">${(call.lastPrice || call.last || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">${(call.bid || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">${(call.ask || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{call.volume || 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Puts */}
            <div>
              <h4 className="font-semibold mb-3 text-red-600">PUTS</h4>
              <div className="overflow-x-auto max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strike</TableHead>
                      <TableHead className="text-right">Last</TableHead>
                      <TableHead className="text-right">Bid</TableHead>
                      <TableHead className="text-right">Ask</TableHead>
                      <TableHead className="text-right">Vol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(useRealData ? realOptionsChain?.puts : simulatedChain?.strikes)?.slice(0, 10).map((item: any, idx: number) => {
                      const put = useRealData ? item : item.put;
                      const strike = useRealData ? item.strike : item.strike;
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-mono font-semibold">${strike}</TableCell>
                          <TableCell className="text-right font-mono">${(put.lastPrice || put.last || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">${(put.bid || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono">${(put.ask || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{put.volume || 0}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
