import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";
import { createMarketDataStream, generateOptionChain, type MarketQuote, type OptionChain } from "@/lib/marketData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MarketDataPanel() {
  const [symbol, setSymbol] = useState("AAPL");
  const [isStreaming, setIsStreaming] = useState(false);
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [optionChain, setOptionChain] = useState<OptionChain | null>(null);
  const [daysToExpiry, setDaysToExpiry] = useState(30);

  useEffect(() => {
    if (isStreaming) {
      const cleanup = createMarketDataStream(symbol, setQuote);
      return cleanup;
    }
  }, [isStreaming, symbol]);

  const loadOptionChain = () => {
    if (quote) {
      const chain = generateOptionChain(symbol, quote.price, daysToExpiry);
      setOptionChain(chain);
    }
  };

  const priceChange = quote ? (Math.random() - 0.5) * 5 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Market Data
          </h2>
          <Badge variant={isStreaming ? "default" : "secondary"}>
            {isStreaming ? "LIVE" : "PAUSED"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Symbol</Label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Days to Expiry</Label>
            <Input
              type="number"
              value={daysToExpiry}
              onChange={(e) => setDaysToExpiry(parseInt(e.target.value) || 30)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsStreaming(!isStreaming)}
            variant={isStreaming ? "destructive" : "default"}
            className="flex-1"
          >
            {isStreaming ? "Stop Stream" : "Start Stream"}
          </Button>
          <Button onClick={loadOptionChain} variant="outline" disabled={!quote}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Options
          </Button>
        </div>

        {quote && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-mono ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({((priceChange / quote.price) * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="text-4xl font-mono font-bold mb-4">${quote.price.toFixed(2)}</div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Bid:</span>
                <span className="font-mono ml-2">${quote.bid.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ask:</span>
                <span className="font-mono ml-2">${quote.ask.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Volume:</span>
                <span className="font-mono ml-2">{quote.volume.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Last updated: {quote.timestamp.toLocaleTimeString()}
            </div>
          </div>
        )}
      </Card>

      {optionChain && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Option Chain - {optionChain.symbol} (Expires: {optionChain.expiry.toLocaleDateString()})
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Strike</TableHead>
                  <TableHead className="text-right">Call Bid</TableHead>
                  <TableHead className="text-right">Call Ask</TableHead>
                  <TableHead className="text-right">Call IV</TableHead>
                  <TableHead className="text-right">Put Bid</TableHead>
                  <TableHead className="text-right">Put Ask</TableHead>
                  <TableHead className="text-right">Put IV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {optionChain.strikes.map((strike) => (
                  <TableRow key={strike.strike}>
                    <TableCell className="font-mono font-semibold">${strike.strike}</TableCell>
                    <TableCell className="text-right font-mono">${strike.call.bid.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">${strike.call.ask.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{(strike.call.impliedVol * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono">${strike.put.bid.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">${strike.put.ask.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{(strike.put.impliedVol * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
