const yahooFinance = require('yahoo-finance2').default;

console.log('Available methods:', Object.keys(yahooFinance));
console.log('\nTrying to fetch AAPL...\n');

yahooFinance.quote('AAPL')
  .then(result => {
    console.log('✅ Success!');
    console.log('Price:', result.regularMarketPrice);
  })
  .catch(error => {
    console.log('❌ quote failed:', error.message);
    console.log('\nTrying quoteSummary instead...\n');
    
    return yahooFinance.quoteSummary('AAPL', { modules: ['price'] });
  })
  .then(result => {
    if (result) {
      console.log('✅ quoteSummary worked!');
      console.log('Price:', result.price?.regularMarketPrice);
    }
  })
  .catch(error => {
    console.log('❌ quoteSummary also failed:', error.message);
  });
