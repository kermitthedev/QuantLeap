const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API running' });
});

// Get quote - using the correct method
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`\n📊 Fetching ${symbol}...`);
    
    // Try using quote method directly
    const quote = await yahooFinance.quote(symbol);
    
    console.log('✅ Success!');
    
    const response = {
      symbol: quote.symbol,
      price: quote.regularMarketPrice || 0,
      bid: quote.bid || 0,
      ask: quote.ask || 0,
      volume: quote.regularMarketVolume || 0,
      open: quote.regularMarketOpen || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      marketCap: quote.marketCap || 0,
      timestamp: new Date().toISOString(),
    };

    console.log(`💰 ${response.symbol}: $${response.price}`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get options
app.get('/api/options/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`\n📈 Fetching options for ${symbol}...`);
    
    const result = await yahooFinance.options(symbol);
    
    if (!result || !result.options || result.options.length === 0) {
      return res.status(404).json({ error: 'No options available' });
    }

    const firstExpiry = result.options[0];
    
    const response = {
      symbol,
      expirationDate: firstExpiry.expirationDate,
      calls: firstExpiry.calls,
      puts: firstExpiry.puts,
      availableExpirations: result.options.map(opt => opt.expirationDate),
    };

    console.log(`✅ ${response.calls.length} calls, ${response.puts.length} puts`);
    res.json(response);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log('\n========================================');
  console.log('🚀 Options Pricing API');
  console.log('========================================');
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`💰 http://localhost:${PORT}/api/quote/AAPL`);
  console.log('========================================\n');
  
  // Test
  try {
    const test = await yahooFinance.quote('AAPL');
    console.log(`✅ Yahoo Finance working! AAPL: $${test.regularMarketPrice}\n`);
  } catch (error) {
    console.error('❌ Yahoo Finance error:', error.message, '\n');
  }
});
