import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Clock,
  Star,
  CheckCircle2,
  PlayCircle,
  Target,
  Info,
  ShoppingCart
} from 'lucide-react';
import { STOCK_DATABASE, searchStocks, getStock } from '@/lib/stockDatabase';
import toast from 'react-hot-toast';

type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit';
type OrderAction = 'buy' | 'sell';

interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
}

interface Order {
  id: string;
  symbol: string;
  action: OrderAction;
  orderType: OrderType;
  quantity: number;
  price: number;
  status: 'pending' | 'filled';
  timestamp: Date;
}

export default function RealisticTradingSimulator() {
  const [balance, setBalance] = useState(100000);
  const [isGameActive, setIsGameActive] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [watchlist] = useState(['AAPL', 'TSLA', 'NVDA', 'SPY', 'MSFT']);
  
  const [orderAction, setOrderAction] = useState<OrderAction>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(0);
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockPrices, setStockPrices] = useState<Map<string, number>>(new Map());

  // Initialize prices
  useEffect(() => {
    const initialPrices = new Map<string, number>();
    STOCK_DATABASE.forEach(stock => {
      initialPrices.set(stock.symbol, stock.price);
    });
    setStockPrices(initialPrices);
  }, []);

  // Market simulation
  useEffect(() => {
    if (isGameActive) {
      const interval = setInterval(() => {
        setStockPrices(prevPrices => {
          const newPrices = new Map(prevPrices);
          STOCK_DATABASE.forEach(stock => {
            const currentPrice = newPrices.get(stock.symbol) || stock.price;
            const change = (Math.random() - 0.5) * currentPrice * 0.02;
            newPrices.set(stock.symbol, Math.max(1, currentPrice + change));
          });
          return newPrices;
        });
        
        // Update positions
        setPositions(prev => prev.map(pos => {
          const currentPrice = stockPrices.get(pos.symbol) || pos.currentPrice;
          const totalValue = currentPrice * pos.quantity;
          const pnl = totalValue - pos.totalCost;
          const pnlPercent = (pnl / pos.totalCost) * 100;
          
          return { ...pos, currentPrice, totalValue, pnl, pnlPercent };
        }));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isGameActive, stockPrices]);

  const selectedStock = getStock(selectedSymbol);
  const currentPrice = stockPrices.get(selectedSymbol) || (selectedStock?.price || 0);

  useEffect(() => {
    setLimitPrice(currentPrice);
  }, [selectedSymbol, currentPrice]);
  
  const startGame = () => {
    setIsGameActive(true);
    toast.success('🎮 Market is LIVE! Start trading!');
  };
  
  const placeOrder = () => {
    if (!isGameActive) {
      toast.error('❌ Start the market first!');
      return;
    }

    if (!selectedStock) {
      toast.error('❌ No stock selected!');
      return;
    }
    
    const orderPrice = orderType === 'market' ? currentPrice : limitPrice;
    const cost = orderPrice * quantity;
    
    if (orderAction === 'buy') {
      if (cost > balance) {
        toast.error('❌ Insufficient funds!');
        return;
      }
      
      setBalance(prev => prev - cost);
      
      // Add or update position
      setPositions(prev => {
        const existing = prev.find(p => p.symbol === selectedSymbol);
        if (existing) {
          const newQuantity = existing.quantity + quantity;
          const newTotalCost = existing.totalCost + cost;
          const newAvgCost = newTotalCost / newQuantity;
          
          return prev.map(p => 
            p.symbol === selectedSymbol
              ? { 
                  ...p, 
                  quantity: newQuantity, 
                  avgCost: newAvgCost,
                  totalCost: newTotalCost,
                  totalValue: currentPrice * newQuantity,
                  pnl: (currentPrice * newQuantity) - newTotalCost,
                  pnlPercent: (((currentPrice * newQuantity) - newTotalCost) / newTotalCost) * 100
                }
              : p
          );
        } else {
          return [...prev, {
            id: Date.now().toString(),
            symbol: selectedSymbol,
            name: selectedStock.name,
            quantity,
            avgCost: orderPrice,
            currentPrice,
            totalValue: cost,
            totalCost: cost,
            pnl: 0,
            pnlPercent: 0,
          }];
        }
      });

      toast.success(`✅ Bought ${quantity} ${selectedSymbol} @ $${orderPrice.toFixed(2)}`);
    } else {
      // Sell
      const position = positions.find(p => p.symbol === selectedSymbol);
      if (!position || position.quantity < quantity) {
        toast.error('❌ Insufficient shares!');
        return;
      }
      
      setBalance(prev => prev + cost);
      
      setPositions(prev => {
        return prev.map(p => {
          if (p.symbol === selectedSymbol) {
            const newQuantity = p.quantity - quantity;
            if (newQuantity === 0) return null;
            
            const newTotalCost = p.avgCost * newQuantity;
            return {
              ...p,
              quantity: newQuantity,
              totalCost: newTotalCost,
              totalValue: currentPrice * newQuantity,
              pnl: (currentPrice * newQuantity) - newTotalCost,
              pnlPercent: (((currentPrice * newQuantity) - newTotalCost) / newTotalCost) * 100,
            };
          }
          return p;
        }).filter(Boolean) as Position[];
      });

      toast.success(`✅ Sold ${quantity} ${selectedSymbol} @ $${orderPrice.toFixed(2)}`);
    }

    // Add to order history
    setOrders(prev => [{
      id: Date.now().toString(),
      symbol: selectedSymbol,
      action: orderAction,
      orderType,
      quantity,
      price: orderPrice,
      status: 'filled',
      timestamp: new Date(),
    }, ...prev]);
  };
  
  const portfolioValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const searchResults = searchQuery ? searchStocks(searchQuery) : [];
  
  return (
    <div className="space-y-6">
      {/* Account Header */}
      <Card className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">Stock Trading Simulator</h2>
            <p className="text-sm opacity-90">Practice trading with live market simulation</p>
          </div>
          <div className="flex gap-3">
            {!isGameActive ? (
              <Button onClick={startGame} size="lg" variant="secondary" className="gap-2">
                <PlayCircle className="h-5 w-5" />
                Start Market
              </Button>
            ) : (
              <Badge variant="secondary" className="px-4 py-2 text-lg animate-pulse">
                <Activity className="h-4 w-4 mr-2" />
                MARKET LIVE
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Total Value</p>
            <p className="text-2xl font-bold">${(balance + portfolioValue).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Cash</p>
            <p className="text-2xl font-bold">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </p>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Watchlist */}
        <div className="col-span-3">
          <Card className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              {searchQuery ? 'Search Results' : 'Watchlist'}
            </h3>
            
            <div className="space-y-2">
              {(searchQuery ? searchResults : watchlist.map(s => getStock(s)!).filter(Boolean)).map(stock => {
                const price = stockPrices.get(stock.symbol) || stock.price;
                const change = ((price - stock.price) / stock.price) * 100;
                const isSelected = selectedSymbol === stock.symbol;
                
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    className={`p-3 border rounded cursor-pointer transition-all ${
                      isSelected ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{stock.symbol}</p>
                      {isGameActive && (
                        change >= 0 ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-xs opacity-75 mb-2">{stock.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold">${price.toFixed(2)}</p>
                      <p className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        
        {/* Center: Trading Panel */}
        <div className="col-span-6">
          <Card className="p-6">
            {selectedStock ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold">{selectedStock.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">${currentPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Buy/Sell Buttons */}
                  <div>
                    <Label className="mb-2 block">Action</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        size="lg"
                        variant={orderAction === 'buy' ? 'default' : 'outline'}
                        onClick={() => setOrderAction('buy')}
                        className={`h-16 text-lg ${orderAction === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        <TrendingUp className="h-6 w-6 mr-2" />
                        BUY
                      </Button>
                      <Button
                        size="lg"
                        variant={orderAction === 'sell' ? 'default' : 'outline'}
                        onClick={() => setOrderAction('sell')}
                        className={`h-16 text-lg ${orderAction === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      >
                        <TrendingDown className="h-6 w-6 mr-2" />
                        SELL
                      </Button>
                    </div>
                  </div>

                  {/* Order Type */}
                  <div>
                    <Label className="mb-2 block">Order Type</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['market', 'limit', 'stop', 'stop-limit'] as OrderType[]).map(type => (
                        <Button
                          key={type}
                          size="sm"
                          variant={orderType === type ? 'default' : 'outline'}
                          onClick={() => setOrderType(type)}
                          className="capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label className="mb-2 block">Number of Shares</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="text-xl h-14"
                    />
                  </div>

                  {/* Limit Price (if needed) */}
                  {(orderType === 'limit' || orderType === 'stop-limit') && (
                    <div>
                      <Label className="mb-2 block">Limit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(parseFloat(e.target.value))}
                        className="text-xl h-14"
                      />
                    </div>
                  )}

                  {/* Order Summary */}
                  <Card className="p-4 bg-muted">
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg">
                        <span>Estimated Cost:</span>
                        <span className="font-bold">${(currentPrice * quantity).toFixed(2)}</span>
                      </div>
                      {orderType !== 'market' && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {orderType} orders execute when price conditions are met
                        </p>
                      )}
                    </div>
                  </Card>

                  {/* Place Order Button */}
                  <Button
                    onClick={placeOrder}
                    disabled={!isGameActive}
                    size="lg"
                    className="w-full h-16 text-xl gap-3"
                  >
                    <Target className="h-6 w-6" />
                    {isGameActive ? `Place ${orderAction.toUpperCase()} Order` : 'Start Market to Trade'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Select a Stock</h3>
                <p className="text-muted-foreground">Choose from watchlist to start trading</p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Right: Portfolio */}
        <div className="col-span-3 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Positions
            </h3>
            {positions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No positions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map(pos => (
                  <div key={pos.id} className="p-3 border rounded">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{pos.symbol}</p>
                        <p className="text-xs text-muted-foreground">{pos.quantity} shares</p>
                      </div>
                      <Badge variant={pos.pnl >= 0 ? 'default' : 'destructive'}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg:</span>
                        <span>${pos.avgCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Now:</span>
                        <span>${pos.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>P&L:</span>
                        <span className={pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Orders
            </h3>
            {orders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-2 border rounded text-xs">
                    <div>
                      <p className="font-semibold">{order.symbol}</p>
                      <p className="text-muted-foreground">
                        {order.action.toUpperCase()} {order.quantity} @ ${order.price.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      FILLED
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
