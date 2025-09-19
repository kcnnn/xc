'use client';

import { Download, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Hash, Calculator } from 'lucide-react';

interface ComparisonItem {
  lineItemNumber_Estimate1?: string;
  lineItemNumber_Estimate2?: string;
  description: string;
  quantity_Estimate1?: number;
  quantity_Estimate2?: number;
  unit_Estimate1?: string;
  unit_Estimate2?: string;
  tax_Estimate1?: number;
  tax_Estimate2?: number;
  rcv_Estimate1?: number;
  rcv_Estimate2?: number;
  ageLife_Estimate1?: string;
  ageLife_Estimate2?: string;
  condition_Estimate1?: string;
  condition_Estimate2?: string;
  depPercent_Estimate1?: string;
  depPercent_Estimate2?: string;
  depreciation_Estimate1?: number;
  depreciation_Estimate2?: number;
  acv_Estimate1?: number;
  acv_Estimate2?: number;
  category_Estimate1?: string;
  category_Estimate2?: string;
  rcv_Diff?: number;
  depreciation_Diff?: number;
  acv_Diff?: number;
  quantity_Diff?: number;
}

interface Page5Comparison {
  laborSubtotal_Diff: number;
  materialsSubtotal_Diff: number;
  equipmentSubtotal_Diff: number;
  otherSubtotal_Diff: number;
  subtotalBeforeOandP_Diff: number;
  overheadAndProfit_Diff: number;
  subtotalAfterOandP_Diff: number;
  salesTax_Diff: number;
  totalRCV_Diff: number;
  totalDepreciation_Diff: number;
  totalACV_Diff: number;
  grandTotal_Diff: number;
}

interface ComparisonResultsProps {
  results: {
    matchingItems: number;
    differences: number;
    totalItems: number;
    csvData: string;
    detailedComparison: ComparisonItem[];
    page5Comparison: Page5Comparison;
  };
}

export default function ComparisonResults({ results }: ComparisonResultsProps) {
  const handleDownloadCSV = () => {
    // Create a blob with the CSV data
    const blob = new Blob([results.csvData], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xactimate-comparison.tsv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Calculate financial totals from line items
  const totalRCV1 = results.detailedComparison.reduce((sum, item) => sum + (item.rcv_Estimate1 || 0), 0);
  const totalRCV2 = results.detailedComparison.reduce((sum, item) => sum + (item.rcv_Estimate2 || 0), 0);
  const totalACV1 = results.detailedComparison.reduce((sum, item) => sum + (item.acv_Estimate1 || 0), 0);
  const totalACV2 = results.detailedComparison.reduce((sum, item) => sum + (item.acv_Estimate2 || 0), 0);
  const totalDepreciation1 = results.detailedComparison.reduce((sum, item) => sum + (item.depreciation_Estimate1 || 0), 0);
  const totalDepreciation2 = results.detailedComparison.reduce((sum, item) => sum + (item.depreciation_Estimate2 || 0), 0);

  const rcvDiff = totalRCV2 - totalRCV1;
  const acvDiff = totalACV2 - totalACV1;
  const depreciationDiff = totalDepreciation2 - totalDepreciation1;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
        Xactimate Comparison Results
      </h2>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-800">{results.matchingItems}</p>
              <p className="text-sm text-green-600">Matching Items</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-800">{results.differences}</p>
              <p className="text-sm text-yellow-600">Differences Found</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center">
            <Hash className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-800">{results.totalItems}</p>
              <p className="text-sm text-blue-600">Total Line Items</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-lg font-bold text-purple-800">${Math.abs(rcvDiff).toFixed(2)}</p>
              <p className="text-sm text-purple-600">{rcvDiff >= 0 ? 'RCV Increase' : 'RCV Decrease'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Page 5 Summary Comparison */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 mb-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
          <Calculator className="w-6 h-6 mr-2" />
          Page 5 Summary Comparison
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Category Subtotals */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Category Subtotals</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Labor:</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.laborSubtotal_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.laborSubtotal_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.laborSubtotal_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Materials:</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.materialsSubtotal_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.materialsSubtotal_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.materialsSubtotal_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Equipment:</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.equipmentSubtotal_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.equipmentSubtotal_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.equipmentSubtotal_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Other:</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.otherSubtotal_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.otherSubtotal_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.otherSubtotal_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Totals */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Final Totals</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal (before O&P):</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.subtotalBeforeOandP_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.subtotalBeforeOandP_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.subtotalBeforeOandP_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overhead & Profit:</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.overheadAndProfit_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.overheadAndProfit_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.overheadAndProfit_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sales Tax:</span>
                <div className="text-right">
                  <span className="font-medium">${Math.abs(results.page5Comparison.salesTax_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.salesTax_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.salesTax_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-semibold text-gray-800">Grand Total:</span>
                <div className="text-right">
                  <span className="font-bold text-lg">${Math.abs(results.page5Comparison.grandTotal_Diff).toFixed(2)}</span>
                  <span className={`ml-2 text-sm ${results.page5Comparison.grandTotal_Diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {results.page5Comparison.grandTotal_Diff >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">RCV Comparison</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimate 1:</span>
              <span className="font-medium">${totalRCV1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimate 2:</span>
              <span className="font-medium">${totalRCV2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Difference:</span>
              <span className={`font-bold ${rcvDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {rcvDiff >= 0 ? '+' : ''}${rcvDiff.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">ACV Comparison</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimate 1:</span>
              <span className="font-medium">${totalACV1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimate 2:</span>
              <span className="font-medium">${totalACV2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Difference:</span>
              <span className={`font-bold ${acvDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {acvDiff >= 0 ? '+' : ''}${acvDiff.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Depreciation Comparison</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimate 1:</span>
              <span className="font-medium">${totalDepreciation1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimate 2:</span>
              <span className="font-medium">${totalDepreciation2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Difference:</span>
              <span className={`font-bold ${depreciationDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {depreciationDiff >= 0 ? '+' : ''}${depreciationDiff.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Analysis Summary</h3>
        <p className="text-gray-600 text-sm">
          {results.matchingItems} out of {results.totalItems} line items match between the two estimates. 
          {results.differences > 0 ? ` ${results.differences} items have differences in quantity, pricing, depreciation, or other values.` : ' All items are identical.'}
          {rcvDiff !== 0 && ` The total RCV difference is ${rcvDiff >= 0 ? '+' : ''}$${Math.abs(rcvDiff).toFixed(2)}.`}
          {results.page5Comparison.grandTotal_Diff !== 0 && ` The grand total difference is ${results.page5Comparison.grandTotal_Diff >= 0 ? '+' : ''}$${Math.abs(results.page5Comparison.grandTotal_Diff).toFixed(2)}.`}
        </p>
      </div>

      {/* Download Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Download Xactimate Comparison Report</h3>
            <p className="text-sm text-blue-600">
              Get a comprehensive TSV file with all line items in Xactimate format
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download TSV
          </button>
        </div>
      </div>

      {/* CSV Preview */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-800 mb-3">Report Preview (First 3 lines)</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <pre>{results.csvData.split('\n').slice(0, 4).join('\n')}</pre>
        </div>
      </div>
    </div>
  );
} 