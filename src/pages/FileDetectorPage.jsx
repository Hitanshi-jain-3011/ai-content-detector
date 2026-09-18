import React, { useState, useRef } from 'react';
import EmptyResult from '../components/EmptyResult';
import ResultCard from '../components/ResultCard';
import { analyzeFile } from '../services/api';
import { 
  FileUpIcon, 
  FileTextIcon, 
  UploadCloudIcon, 
  TrashIcon, 
  SparklesIcon, 
  AlertCircleIcon,
  LoaderIcon
} from '../components/Icons';

export default function FileDetectorPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Allowed extensions
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const maxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

  // Format file size nicely
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate and set file
  const handleFileSelection = (file) => {
    setErrorMessage('');
    setResult(null);
    if (!file) return;

    // Check empty file
    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please choose a valid document.');
      return;
    }

    // Check size limit
    if (file.size > maxFileSizeBytes) {
      setErrorMessage(`File size (${formatFileSize(file.size)}) exceeds the maximum allowed limit of 10 MB.`);
      return;
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMessage(`Unsupported format '${fileExtension}'. Allowed formats: PDF, DOCX, TXT.`);
      return;
    }

    setSelectedFile(file);
  };

  // Drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // File input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analyze button handler (calls FastAPI backend POST /api/analyze/file)
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload a PDF, DOCX, or TXT document before analyzing.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await analyzeFile(selectedFile);
      setResult(data);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during document analysis.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <FileUpIcon className="w-4 h-4" />
          <span>Document Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          AI Document Detector
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload PDF, DOCX, or TXT documents to extract text and analyze for AI generation patterns.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Hidden native input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.docx,.txt"
          className="hidden"
          disabled={loading}
        />

        {/* Drag and Drop Zone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/60 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
              <UploadCloudIcon className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              Drag and drop your document here
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              or click to browse from your device (Max size: 10 MB)
            </p>

            {/* Upload / Browse Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm"
            >
              <FileUpIcon className="w-4 h-4" />
              <span>Browse Files</span>
            </button>

            {/* Supported format pills */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600 font-mono">
              <span>Supported Formats:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">PDF</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">DOCX</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">TXT</span>
            </div>
          </div>
        ) : (
          /* Selected File Card */
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                  <FileTextIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    Size: {formatFileSize(selectedFile.size)} • Format: {selectedFile.name.split('.').pop().toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Remove File Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleRemoveFile}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors disabled:opacity-50"
                title="Remove selected file"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-700 font-medium pt-2 border-t border-indigo-100">
              <span>Document ready for AI detection</span>
              {!loading && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="underline hover:text-indigo-900 cursor-pointer"
                >
                  Choose a different document
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Document Error:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Analyze Document Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <LoaderIcon className="w-4 h-4" />
                <span>Extracting & Analyzing...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                <span>Analyze Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Analysis Output
        </h3>

        {/* Loading Indicator Card */}
        {loading && (
          <div className="bg-white rounded-2xl border border-indigo-100 p-8 text-center shadow-sm animate-pulse">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
              <LoaderIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              Extracting Document Content...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Parsing pages, stripping document markup, and evaluating linguistic signals in the backend.
            </p>
          </div>
        )}

        {/* Populated Result Card */}
        {!loading && result && (
          <ResultCard result={result} />
        )}

        {/* Empty Result Placeholder */}
        {!loading && !result && (
          <EmptyResult
            title="No document analyzed yet"
            description="Upload a PDF, DOCX, or TXT file above and click 'Analyze Document' to inspect contents for generative AI patterns."
            hint="Supports PDF, DOCX, and TXT up to 10 MB."
          />
        )}
      </div>
    </div>
  );
}
