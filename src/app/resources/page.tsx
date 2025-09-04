"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PDFViewer from '../../components/PDFViewer';

// Resource type
interface Resource {
  id: number;
  title: string;
  fileSize?: number;
  isUploadedFile?: boolean;
  description: string | null;
  type: string;
  url: string | null;
  createdAt: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

  // Fetch resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/resources');
        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }
        const data = await response.json();
        setResources(data);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-2 glitch-text">
          CEH Study Resources
        </h1>
        <p className="text-xl mb-8 terminal-text">
          Download study materials for your Certified Ethical Hacker journey
        </p>

        {loading && (
          <div className="terminal-loading my-8 text-center">
            <p className="text-xl">LOADING RESOURCES...</p>
          </div>
        )}

        {error && (
          <div className="error-box border border-red-500 bg-black p-4 my-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && resources.length === 0 && (
          <div className="terminal-box border border-green-400 bg-black p-6 my-8">
            <p className="text-center">No resources available yet. Check back soon!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className="border border-green-400 bg-black p-6 rounded hover:shadow-[0_0_10px_rgba(0,255,0,0.5)] transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {resource.type === 'uploaded-pdf' ? (
                  <span className="text-red-500 mr-2 text-2xl">📄</span>
                ) : resource.type === 'pdf' ? (
                  <span className="text-red-500 mr-2 text-2xl">📄</span>
                ) : (
                  <span className="text-blue-400 mr-2 text-2xl">🔗</span>
                )}
                <h3 className="text-xl font-bold text-green-400">{resource.title}</h3>
              </div>
              
              {resource.description && (
                <p className="text-green-300 mb-4">{resource.description}</p>
              )}
              
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.type === 'uploaded-pdf' ? (
                  <>
                    <button
                      onClick={() => setSelectedPdf({ url: resource.url || '', title: resource.title })}
                      className="inline-flex items-center border border-green-400 px-4 py-2 text-sm hover:bg-green-400 hover:text-black transition-colors duration-200"
                    >
                      <span className="mr-2">👁️</span>
                      View in App
                    </button>
                    <a
                      href={resource.url || '#'}
                      download={resource.title ? `${resource.title}.pdf` : 'download.pdf'}
                      className="inline-flex items-center border border-green-400 px-4 py-2 text-sm hover:bg-green-400 hover:text-black transition-colors duration-200"
                    >
                      <span className="mr-2">⬇️</span>
                      Download
                    </a>
                  </>
                ) : resource.type === 'pdf' ? (
                  <a
                    href={resource.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center border border-green-400 px-4 py-2 text-sm hover:bg-green-400 hover:text-black transition-colors duration-200"
                  >
                    <span className="mr-2">📄</span>
                    View PDF
                  </a>
                ) : (
                  <a
                    href={resource.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center border border-green-400 px-4 py-2 text-sm hover:bg-green-400 hover:text-black transition-colors duration-200"
                  >
                    <span className="mr-2">🔗</span>
                    Visit Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 mb-8 text-center">
          <Link href="/" className="inline-block border border-green-400 px-6 py-3 hover:bg-green-400 hover:text-black transition-colors duration-200">
            Return to Dashboard
          </Link>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PDFViewer
          pdfUrl={selectedPdf.url}
          title={selectedPdf.title}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
}
