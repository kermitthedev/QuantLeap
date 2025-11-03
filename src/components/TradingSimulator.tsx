import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Trophy,
  Target,
  Zap,
  Award,
  ShoppingCart,
  Flame,
  Star
} from 'lucide-react';
import { calculateBlackScholes } from '@/lib/advanced-options-pricing';
import toast from 'react-hot-toast';

interface Position {
  id: string;
  symbol: string;
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: Date;
}

interface HighScore {
  name: string;
  balance: number;
  return: number;
  difficulty: string;
  date: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function TradingSimulator() {
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [balance, setBalance] = useState(100000);
  const [startingBalance] = useState(100000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [marketPrice, setMarketPrice] = useState(100);
  const [volatility, setVolatility] = useState(0.25);
  const [daysPassed, setDaysPassed] = useState(0);
  const [tradesExecuted, setTradesExecuted] = useState(0);
  const [winningTrades, setWinningTrades] = useState(0);
  
  // Trading form
  const [symbol] = useState('SPY');
  const [strikePrice, setStrikePrice] = useState(100);
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');

  // Achievements system
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', name: 'First Trade', description: 'Execute your first trade', icon: '🎯', unlocked: false },
    { id: '2', name: 'Profitable', description: 'Close a trade with profit', icon: '💰', unlocked: false },
    { id: '3', name: 'Big Winner', description: 'Profit $1,000+ on a single trade', icon: '🏆', unlocked: false },
    { id: '4', name: 'Active Trader', description: 'Execute 10 trades', icon: '📈', unlocked: false },
    { id: '5', name: 'Portfolio Builder', description: 'Have 5 open positions', icon: '📊', unlocked: false },
    { id: '6', name: 'Risk Manager', description: 'Maintain 80% win rate over 10 trades', icon: '🛡️', unlocked: false },
    { id: '7', name: 'Millionaire', description: 'Reach $1,000,000 balance', icon: '💎', unlocked: false },
    { id: '8', name: 'Week Survivor', description: 'Survive 7 trading days', icon: '⏰', unlocked: false },
    { id: '9', name: 'Diversified', description: 'Hold calls and puts simultaneously', icon: '⚖️', unlocked: false },
    { id: '10', name: 'Options Master', description: 'Achieve 100% return', icon: '👑', unlocked: false },
  ]);

  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState('');

  // Load high scores on mount
  useEffect(() => {
    const saved = localStorage.getItem('options-game-highscores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Difficulty settings
  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case 'easy': return { volatility: 0.5, speed: 3000 };
      case 'medium': return { volatility: 1, speed: 2000 };
      case 'hard': return { volatility: 1.5, speed: 1000 };
    }
  };

  // Market simulation
  useEffect(() => {
    if (isGameActive) {
      const { volatility: volMultiplier, speed } = getDifficultyMultiplier();
      
      const interval = setInterval(() => {
        // Simulate market movements with difficulty
        const change = (Math.random() - 0.5) * 2 * volMultiplier;
        setMarketPrice(prev => Math.max(50, Math.min(150, prev + change)));
        setVolatility(prev => Math.max(0.1, Math.min(0.5, prev + (Math.random() - 0.5) * 0.02 * volMultiplier)));
        setDaysPassed(prev => prev + 1);

        // Update positions
        setPositions(prev => prev.map(pos => {
          const daysRemaining = Math.max(0, 30 - (daysPassed / 10));
          const result = calculateBlackScholes({
            spotPrice: marketPrice,
            strikePrice: pos.strike,
            volatility,
            timeToMaturity: daysRemaining / 365,
            riskFreeRate: 0.05,
            dividendYield: 0,
            optionType: pos.type,
          });

          const currentPrice = result.price;
          const pnl = pos.action === 'buy' 
            ? (currentPrice - pos.entryPrice) * pos.quantity * 100
            : (pos.entryPrice - currentPrice) * pos.quantity * 100;

          return { ...pos, currentPrice, pnl };
        }));
      }, speed);

      return () => clearInterval(interval);
    }
  }, [isGameActive, marketPrice, volatility, daysPassed, difficulty]);

  // Check achievements
  useEffect(() => {
    checkAchievements();
  }, [positions, tradesExecuted, balance, daysPassed, winningTrades]);

  const checkAchievements = () => {
    setAchievements(prev => prev.map(ach => {
      if (ach.unlocked) return ach;

      switch (ach.id) {
        case '1': // First Trade
          if (tradesExecuted >= 1) {
            toast('🏆 Achievement Unlocked: First Trade!', { icon: '🎯' });
            return { ...ach, unlocked: true };
          }
          break;
        case '2': // Profitable
          if (winningTrades >= 1) {
            toast('🏆 Achievement Unlocked: Profitable!', { icon: '💰' });
            return { ...ach, unlocked: true };
          }
          break;
        case '4': // Active Trader
          if (tradesExecuted >= 10) {
            toast('🏆 Achievement Unlocked: Active Trader!', { icon: '📈' });
            return { ...ach, unlocked: true };
          }
          break;
        case '5': // Portfolio Builder
          if (positions.length >= 5) {
            toast('🏆 Achievement Unlocked: Portfolio Builder!', { icon: '📊' });
            return { ...ach, unlocked: true };
          }
          break;
        case '6': // Risk Manager
          if (tradesExecuted >= 10 && (winningTrades / tradesExecuted) >= 0.8) {
            toast('🏆 Achievement Unlocked: Risk Manager!', { icon: '🛡️' });
            return { ...ach, unlocked: true };
          }
          break;
        case '7': // Millionaire
          if (balance >= 1000000) {
            toast('🏆 Achievement Unlocked: Millionaire!', { icon: '💎' });
            return { ...ach, unlocked: true };
          }
          break;
        case '8': // Week Survivor
          if (Math.floor(daysPassed / 10) >= 7) {
            toast('🏆 Achievement Unlocked: Week Survivor!', { icon: '⏰' });
            return { ...ach, unlocked: true };
          }
          break;
        case '9': // Diversified
          const hasCalls = positions.some(p => p.type === 'call');
          const hasPuts = positions.some(p => p.type === 'put');
          if (hasCalls && hasPuts) {
            toast('🏆 Achievement Unlocked: Diversified!', { icon: '⚖️' });
            return { ...ach, unlocked: true };
          }
          break;
        case '10': // Options Master
          const returnPercent = ((balance - startingBalance) / startingBalance) * 100;
          if (returnPercent >= 100) {
            toast('🏆 Achievement Unlocked: Options Master!', { icon: '👑' });
            return { ...ach, unlocked: true };
          }
          break;
      }
      return ach;
    }));
  };

  // Calculate total P&L
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const currentBalance = balance + totalPnL;
  const returnPercent = ((currentBalance - startingBalance) / startingBalance) * 100;

  const startGame = () => {
    setIsGameActive(true);
    setBalance(100000);
    setPositions([]);
    setMarketPrice(100);
    setDaysPassed(0);
    setTradesExecuted(0);
    setWinningTrades(0);
    toast.success(`🎮 Trading game started on ${difficulty.toUpperCase()} mode! Good luck!`);
  };

  const pauseGame = () => {
    setIsGameActive(false);
    toast('⏸️ Game paused');
  };

  const endGame = () => {
    setIsGameActive(false);
    
    // Save high score
    if (playerName.trim()) {
      const newScore: HighScore = {
        name: playerName,
        balance: currentBalance,
        return: returnPercent,
        difficulty,
        date: new Date(),
      };
      
      const updatedScores = [...highScores, newScore]
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
      
      setHighScores(updatedScores);
      localStorage.setItem('options-game-highscores', JSON.stringify(updatedScores));
      
      toast.success('🏆 Score saved to leaderboard!');
    }
  };

  const resetGame = () => {
    setIsGameActive(false);
    setBalance(100000);
    setPositions([]);
    setMarketPrice(100);
    setDaysPassed(0);
    setTradesExecuted(0);
    setWinningTrades(0);
    setAchievements(prev => prev.map(ach => ({ ...ach, unlocked: false })));
    toast('🔄 Game reset');
  };

  const executeTrade = () => {
    if (!isGameActive) {
      toast.error('Start the game first!');
      return;
    }

    const result = calculateBlackScholes({
      spotPrice: marketPrice,
      strikePrice,
      volatility,
      timeToMaturity: 30 / 365,
      riskFreeRate: 0.05,
      dividendYield: 0,
      optionType,
    });

    const optionPrice = result.price;
    const totalCost = optionPrice * quantity * 100;

    if (action === 'buy' && totalCost > balance) {
      toast.error('💸 Insufficient funds!');
      return;
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      symbol,
      type: optionType,
      action,
      strike: strikePrice,
      quantity,
      entryPrice: optionPrice,
      currentPrice: optionPrice,
      pnl: 0,
      timestamp: new Date(),
    };

    setPositions(prev => [...prev, newPosition]);
    setBalance(prev => action === 'buy' ? prev - totalCost : prev + totalCost);
    setTradesExecuted(prev => prev + 1);
    
    toast.success(`${action === 'buy' ? '📈 Bought' : '📉 Sold'} ${quantity} ${optionType} contract(s) @ $${optionPrice.toFixed(2)}`);
  };

  const closePosition = (id: string) => {
    const position = positions.find(p => p.id === id);
    if (!position) return;

    const closingValue = position.currentPrice * position.quantity * 100;
    setBalance(prev => position.action === 'buy' ? prev + closingValue : prev - closingValue);
    
    if (position.pnl > 0) {
      setWinningTrades(prev => prev + 1);
    }

    // Check for Big Winner achievement
    if (position.pnl > 1000) {
      setAchievements(prev => prev.map(ach => 
        ach.id === '3' && !ach.unlocked 
          ? { ...ach, unlocked: true }
          : ach
      ));
      toast('🏆 Achievement Unlocked: Big Winner!', { icon: '💎' });
    }
    
    setPositions(prev => prev.filter(p => p.id !== id));
    
    toast.success(`Position closed! P&L: ${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}`);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const winRate = tradesExecuted > 0 ? (winningTrades / tradesExecuted * 100).toFixed(0) : 0;

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="h-8 w-8" />
              Options Trading Game
            </h2>
            <p className="text-sm opacity-90">Live simulation • Practice trading risk-free!</p>
          </div>
          <div className="flex gap-2">
            {!isGameActive ? (
              <>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="px-4 py-2 rounded bg-white/20 text-white border border-white/30"
                >
                  <option value="easy" className="text-black">Easy</option>
                  <option value="medium" className="text-black">Medium</option>
                  <option value="hard" className="text-black">Hard</option>
                </select>
                <Button onClick={startGame} size="lg" variant="secondary" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start Game
                </Button>
              </>
            ) : (
              <>
                <Button onClick={pauseGame} size="lg" variant="secondary" className="gap-2">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
                <Button onClick={endGame} size="lg" variant="secondary" className="gap-2">
                  End & Save
                </Button>
              </>
            )}
            <Button onClick={resetGame} size="lg" variant="outline" className="gap-2 text-white border-white/30">
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Portfolio Value</p>
            <p className="text-2xl font-bold">${currentBalance.toLocaleString()}</p>
            <p className={`text-sm font-semibold ${returnPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {returnPercent >= 0 ? '↑' : '↓'} {Math.abs(returnPercent).toFixed(2)}%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Win Rate</p>
            <p className="text-2xl font-bold">{winRate}%</p>
            <p className="text-xs opacity-75">{winningTrades}/{tradesExecuted} wins</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Open Positions</p>
            <p className="text-2xl font-bold">{positions.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
            <p className="text-xs opacity-75">Day {Math.floor(daysPassed / 10)}</p>
            <p className="text-2xl font-bold">{unlockedCount}/{achievements.length}</p>
            <p className="text-xs opacity-75">Achievements</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Market Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Live Market
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">SPY Price</p>
              <p className="text-4xl font-bold">${marketPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Implied Volatility</p>
              <p className="text-3xl font-bold">{(volatility * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <Badge variant="secondary" className="text-lg">
                {difficulty.toUpperCase()}
              </Badge>
            </div>
            {isGameActive && (
              <Badge variant="default" className="animate-pulse w-full justify-center py-2">
                <Zap className="h-4 w-4 mr-1" />
                Market is LIVE
              </Badge>
            )}
          </div>
        </Card>

        {/* Trade Panel */}
        <Card className="p-6 col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Place Trade
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Action</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={action === 'buy' ? 'default' : 'outline'}
                  onClick={() => setAction('buy')}
                  className="flex-1"
                >
                  Buy
                </Button>
                <Button
                  variant={action === 'sell' ? 'default' : 'outline'}
                  onClick={() => setAction('sell')}
                  className="flex-1"
                >
                  Sell
                </Button>
              </div>
            </div>
            <div>
              <Label>Option Type</Label>
              <div className="flex gap-2 mt-1">
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
            <div>
              <Label>Strike Price ($)</Label>
              <Input
                type="number"
                value={strikePrice}
                onChange={(e) => setStrikePrice(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Quantity (contracts)</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground">Estimated Cost</p>
            <p className="text-2xl font-bold">
              ${(() => {
                const result = calculateBlackScholes({
                  spotPrice: marketPrice,
                  strikePrice,
                  volatility,
                  timeToMaturity: 30 / 365,
                  riskFreeRate: 0.05,
                  dividendYield: 0,
                  optionType,
                });
                return (result.price * quantity * 100).toFixed(2);
              })()}
            </p>
          </div>
          <Button
            onClick={executeTrade}
            disabled={!isGameActive}
            className="w-full mt-4 gap-2"
            size="lg"
          >
            <Target className="h-5 w-5" />
            Execute Trade
          </Button>
        </Card>
      </div>

      {/* Positions Table */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Open Positions ({positions.length})</h3>
        {positions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No open positions. Start trading to build your portfolio!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Strike</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>P&L</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-semibold">{pos.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={pos.type === 'call' ? 'default' : 'secondary'}>
                      {pos.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pos.action === 'buy' ? (
                      <span className="text-green-600 font-semibold">LONG</span>
                    ) : (
                      <span className="text-red-600 font-semibold">SHORT</span>
                    )}
                  </TableCell>
                  <TableCell>${pos.strike}</TableCell>
                  <TableCell>{pos.quantity}</TableCell>
                  <TableCell>${pos.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>${pos.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className={`font-bold ${pos.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                    <div className="text-xs text-muted-foreground">
                      {((pos.pnl / (pos.entryPrice * pos.quantity * 100)) * 100).toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closePosition(pos.id)}
                    >
                      Close
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Achievements */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements ({unlockedCount}/{achievements.length})
          </h3>
          <div className="space-y-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border flex items-center gap-3 ${
                  achievement.unlocked 
                    ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' 
                    : 'bg-muted/50 opacity-50'
                }`}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <Badge variant="secondary" className="bg-yellow-600 text-white">
                    <Star className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Leaderboard (Top 10)
          </h3>
          
          {!isGameActive && (
            <div className="mb-4">
              <Label>Your Name</Label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
              />
            </div>
          )}

          {highScores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No high scores yet. Be the first!
            </p>
          ) : (
            <div className="space-y-2">
              {highScores.map((score, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border flex items-center gap-3 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : 'bg-muted/30'
                  }`}
                >
                  <div className="text-2xl font-bold w-8">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{score.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {score.difficulty.toUpperCase()} • {new Date(score.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${score.balance.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{score.return.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
