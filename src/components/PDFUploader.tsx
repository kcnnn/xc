'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, DollarSign, Calculator } from 'lucide-react';
import { PDFData } from '@/types/pdf';

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  uploadedFile: PDFData | null;
  position: 'first' | 'second';
}

export default function PDFUploader({ onUpload, uploadedFile, position }: PDFUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxFiles: 1
  });

  const handleRemove = () => {
    // This would need to be implemented to handle file removal
    // For now, we'll just call onUpload with null or handle it in the parent
  };

  if (uploadedFile) {
    const totalRCV = uploadedFile.lineItems.reduce((sum, item) => sum + item.rcv, 0);
    const totalACV = uploadedFile.lineItems.reduce((sum, item) => sum + item.acv, 0);
    const totalDepreciation = uploadedFile.lineItems.reduce((sum, item) => sum + item.depreciation, 0);

    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-800">{uploadedFile.filename}</p>
              <p className="text-sm text-green-600">
                {uploadedFile.lineItems.length} line items • {uploadedFile.metadata.pages} pages
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Line Item Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
              <span className="font-semibold text-green-800">RCV</span>
            </div>
            <p className="text-green-700">${totalRCV.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
              <span className="font-semibold text-blue-800">ACV</span>
            </div>
            <p className="text-blue-700">${totalACV.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-purple-600 mr-1" />
              <span className="font-semibold text-purple-800">Dep</span>
            </div>
            <p className="text-purple-700">${totalDepreciation.toFixed(2)}</p>
          </div>
        </div>

        {/* Page 5 Summary */}
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="flex items-center mb-2">
            <Calculator className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-semibold text-green-800">Page 5 Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Labor:</span>
                <span className="font-medium">${uploadedFile.page5Summary.laborSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Materials:</span>
                <span className="font-medium">${uploadedFile.page5Summary.materialsSubtotal.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">O&P (20%):</span>
                <span className="font-medium">${uploadedFile.page5Summary.overheadAndProfitAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grand Total:</span>
                <span className="font-bold text-green-800">${uploadedFile.page5Summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-blue-400 bg-blue-50'
          : isDragReject
          ? 'border-red-400 bg-red-50'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center">
        <Upload className={`w-12 h-12 mb-4 ${
          isDragActive ? 'text-blue-600' : 'text-gray-400'
        }`} />
        
        {isDragActive ? (
          <p className="text-lg font-medium text-blue-600">
            Drop your Xactimate PDF here
          </p>
        ) : isDragReject ? (
          <p className="text-lg font-medium text-red-600">
            Only PDF files are allowed
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your Xactimate PDF here
            </p>
            <p className="text-gray-500 mb-4">
              or click to browse files
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <FileText className="w-4 h-4 mr-1" />
              Xactimate PDF files only
            </div>
          </>
        )}
      </div>
    </div>
  );
} 