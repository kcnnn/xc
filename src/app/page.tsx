'use client';

import { useState } from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import PDFUploader from '@/components/PDFUploader';
import ComparisonResults from '@/components/ComparisonResults';
import { PDFData } from '@/types/pdf';
import { processPDF, comparePDFs } from '@/utils/pdfProcessor';

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

interface ComparisonResults {
  matchingItems: number;
  differences: number;
  totalItems: number;
  csvData: string;
  detailedComparison: ComparisonItem[];
  page5Comparison: Page5Comparison;
}


export default function Home() {
  const [pdfData, setPdfData] = useState<{ first: PDFData | null; second: PDFData | null }>({
    first: null,
    second: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePDFUpload = async (file: File, position: 'first' | 'second') => {
    setError(null);
    setIsProcessing(true);
    
    try {
      const pdfData = await processPDF(file);
      
      setPdfData(prev => ({
        ...prev,
        [position]: pdfData
      }));
      
      // Clear comparison results when new PDF is uploaded
      setComparisonResults(null);
    } catch (err) {
      setError(`Error processing ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };


  const handleCompare = async () => {
    if (!pdfData.first || !pdfData.second) {
      setError('Please upload both PDF files to compare');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const results = comparePDFs(pdfData.first, pdfData.second);
      setComparisonResults(results);
    } catch (err) {
      setError(`Error comparing PDFs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const canCompare = pdfData.first && pdfData.second;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Xactimate PDF Comparator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload two Xactimate PDF estimates and compare line items to identify differences. 
            Export results as a comprehensive CSV file for detailed analysis.
          </p>
        </div>


        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              First Estimate
            </h2>
            <PDFUploader
              onUpload={(file) => handlePDFUpload(file, 'first')}
              uploadedFile={pdfData.first}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-green-600" />
              Second Estimate
            </h2>
            <PDFUploader
              onUpload={(file) => handlePDFUpload(file, 'second')}
              uploadedFile={pdfData.second}
            />
          </div>
        </div>

        {/* Compare Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleCompare}
            disabled={!canCompare || isProcessing}
            className={`px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 ${
              canCompare && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Compare Estimates
              </div>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Results Section */}
        {comparisonResults && (
          <ComparisonResults results={comparisonResults} />
        )}
      </div>
    </div>
  );
}
