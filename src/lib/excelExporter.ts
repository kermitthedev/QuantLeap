import * as XLSX from 'xlsx';

export class ExcelExporter {
  static exportGreeksTable(greeks: any, higherOrderGreeks: any, filename: string = 'greeks.xlsx') {
    try {
      const data = [
        ['Greek', 'Value', 'Description'],
        ['Delta (Δ)', greeks?.delta?.toFixed(4) || 'N/A', 'Rate of change of option price with respect to underlying'],
        ['Gamma (Γ)', greeks?.gamma?.toFixed(4) || 'N/A', 'Rate of change of delta with respect to underlying'],
        ['Theta (Θ)', greeks?.theta?.toFixed(4) || 'N/A', 'Rate of change of option price with respect to time'],
        ['Vega (ν)', greeks?.vega?.toFixed(4) || 'N/A', 'Rate of change of option price with respect to volatility'],
        ['Rho (ρ)', greeks?.rho?.toFixed(4) || 'N/A', 'Rate of change of option price with respect to interest rate'],
      ];

      if (higherOrderGreeks) {
        data.push(['', '', '']);
        data.push(['Higher Order Greeks', '', '']);
        data.push(['Vanna', higherOrderGreeks.vanna?.toFixed(4) || 'N/A', 'Rate of change of delta with respect to volatility']);
        data.push(['Charm', higherOrderGreeks.charm?.toFixed(4) || 'N/A', 'Rate of change of delta with respect to time']);
        data.push(['Vomma', higherOrderGreeks.vomma?.toFixed(4) || 'N/A', 'Rate of change of vega with respect to volatility']);
      }

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Greeks');
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  static exportComprehensiveReport(data: any, filename: string = 'options-report.xlsx') {
    try {
      const wb = XLSX.utils.book_new();

      // Parameters sheet
      const paramsData = [
        ['Parameter', 'Value'],
        ['Spot Price', data.parameters?.spotPrice || 'N/A'],
        ['Strike Price', data.parameters?.strikePrice || 'N/A'],
        ['Volatility', data.parameters?.volatility || 'N/A'],
        ['Time to Maturity', data.parameters?.timeToMaturity || 'N/A'],
        ['Risk-Free Rate', data.parameters?.riskFreeRate || 'N/A'],
        ['Dividend Yield', data.parameters?.dividendYield || 'N/A'],
        ['Option Type', data.parameters?.optionType || 'N/A'],
      ];
      const wsParams = XLSX.utils.aoa_to_sheet(paramsData);
      XLSX.utils.book_append_sheet(wb, wsParams, 'Parameters');

      // Results sheet
      const resultsData = [
        ['Metric', 'Value'],
        ['Option Price', data.result?.price?.toFixed(4) || 'N/A'],
        ['Model', data.result?.model || 'N/A'],
        ['Timestamp', data.result?.timestamp?.toLocaleString() || 'N/A'],
      ];
      const wsResults = XLSX.utils.aoa_to_sheet(resultsData);
      XLSX.utils.book_append_sheet(wb, wsResults, 'Results');

      // Greeks sheet
      if (data.greeks) {
        const greeksData = [
          ['Greek', 'Value'],
          ['Delta', data.greeks.delta?.toFixed(4) || 'N/A'],
          ['Gamma', data.greeks.gamma?.toFixed(4) || 'N/A'],
          ['Theta', data.greeks.theta?.toFixed(4) || 'N/A'],
          ['Vega', data.greeks.vega?.toFixed(4) || 'N/A'],
          ['Rho', data.greeks.rho?.toFixed(4) || 'N/A'],
        ];
        const wsGreeks = XLSX.utils.aoa_to_sheet(greeksData);
        XLSX.utils.book_append_sheet(wb, wsGreeks, 'Greeks');
      }

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export to Excel');
    }
  }
}
