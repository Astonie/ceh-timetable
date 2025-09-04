"use client";
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, title, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try downloading instead.');
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 w-full max-w-4xl h-[90vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white truncate">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-800/50 hover:bg-red-600/20 border border-slate-600 hover:border-red-500/50 rounded-xl text-slate-400 hover:text-red-400 text-xl font-bold transition-all flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-400 mb-4">⚠️</div>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col items-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  </div>
                }
                className="flex justify-center"
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-2xl"
                  width={Math.min(800, window.innerWidth - 100)}
                />
              </Document>

              {/* Navigation Controls */}
              {numPages && numPages > 1 && (
                <div className="flex items-center space-x-4 mt-6 bg-slate-800/50 rounded-xl p-4">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <span className="text-slate-300">
                    Page {pageNumber} of {numPages}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
