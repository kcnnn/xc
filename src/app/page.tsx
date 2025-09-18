'use client';

import { useState } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, Bug } from 'lucide-react';
import PDFUploader from '@/components/PDFUploader';
import ComparisonResults from '@/components/ComparisonResults';
import { PDFData } from '@/types/pdf';

export default function Home() {
  const [pdfData, setPdfData] = useState<{ first: PDFData | null; second: PDFData | null }>({
    first: null,
    second: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handlePDFUpload = async (file: File, position: 'first' | 'second') => {
    setError(null);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process PDF');
      }
      
      const processedData = await response.json();
      setPdfData(prev => ({
        ...prev,
        [position]: processedData
      }));
    } catch (err) {
      setError(`Error processing ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDebugPDF = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/debug-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to debug PDF');
      }
      
      const debugData = await response.json();
      setDebugInfo(debugData);
    } catch (err) {
      setError(`Debug error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
      const response = await fetch('/api/compare-pdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first: pdfData.first,
          second: pdfData.second
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compare PDFs');
      }
      
      const results = await response.json();
      setComparisonResults(results);
    } catch (err) {
      setError('Error comparing PDFs. Please try again.');
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

        {/* Debug Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-800">Debug Mode</span>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDebugPDF(file);
              }}
              className="text-sm text-yellow-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
            />
          </div>
          {debugInfo && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-semibold mb-2">PDF Debug Info:</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Filename:</strong> {debugInfo.filename} | 
                <strong>Pages:</strong> {debugInfo.pages} | 
                <strong>Text Length:</strong> {debugInfo.textLength}
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600">View First 500 Characters</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{debugInfo.first500Chars}</pre>
              </details>
            </div>
          )}
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
              position="first"
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
              position="second"
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
