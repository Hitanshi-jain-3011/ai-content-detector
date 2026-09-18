import React, { useState, useRef, useEffect } from 'react';
import EmptyResult from '../components/EmptyResult';
import ResultCard from '../components/ResultCard';
import { analyzeImage } from '../services/api';
import {
  ImageIcon,
  UploadCloudIcon,
  TrashIcon,
  SparklesIcon,
  AlertCircleIcon,
  LoaderIcon
} from '../components/Icons';

export default function ImageDetectorPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Allowed extensions
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Cleanup object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate and set image
  const handleImageSelection = (file) => {
    setErrorMessage('');
    if (!file) return;

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMessage(`Unsupported format: ${file.name}. Please upload JPG, JPEG, PNG, or WEBP.`);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Drag and drop handlers
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
      handleImageSelection(e.dataTransfer.files[0]);
    }
  };

  // File input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelection(e.target.files[0]);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Analyze button handler (calls FastAPI backend POST /api/analyze/image)
  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMessage('Please upload an image to analyze.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await analyzeImage(selectedImage);
      setResult(data);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during image analysis.');
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
          <ImageIcon className="w-4 h-4" />
          <span>Image Forensics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          AI Image Detector
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload synthetic or digital artwork to check for diffusion noise patterns, high-frequency anomalies, and generative signatures.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Hidden native input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {/* Drag and Drop Zone (When no image is uploaded) */}
        {!selectedImage ? (
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
              Drag and drop your image here
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              or click to browse from your device
            </p>

            {/* Upload Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-medium text-xs sm:text-sm transition-colors shadow-sm"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Choose Image</span>
            </button>

            {/* Supported formats */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600 font-mono">
              <span>Accepted:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">JPG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">JPEG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">PNG</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-semibold text-slate-700">WEBP</span>
            </div>
          </div>
        ) : (
          /* Selected Image Card & Preview */
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Image Preview */}
              <div className="relative w-full md:w-64 h-56 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center group">
                <img
                  src={previewUrl}
                  alt={selectedImage.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Image Details */}
              <div className="w-full flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">
                      Uploaded File
                    </span>
                    {/* Filename */}
                    <h4 className="text-base font-bold text-slate-900 truncate" title={selectedImage.name}>
                      {selectedImage.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Size: {formatFileSize(selectedImage.size)}
                    </p>
                  </div>

{/* Remove Image Button */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors shrink-0 disabled:opacity-50"
                      title="Remove image"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Format:</span>
                    <span className="font-mono font-medium text-slate-700 uppercase">{selectedImage.name.split('.').pop()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="font-medium text-emerald-600">Ready for visual inspection</span>
                  </div>
                </div>

<div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer disabled:opacity-50"
                    >
                      Select a different image
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
            <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Analyze Image Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
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
                <span>Analyze Image</span>
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
              Extracting Image Content...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Running OCR to extract text and evaluating linguistic signals in the backend.
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
            title="No image analyzed yet"
            description="Upload a JPG, JPEG, PNG, or WEBP image above and click 'Analyze Image' to scan for synthetic generation indicators."
            hint="Detection examines frequency transforms and generative texture gradients."
          />
        )}
      </div>
    </div>
  );
}
