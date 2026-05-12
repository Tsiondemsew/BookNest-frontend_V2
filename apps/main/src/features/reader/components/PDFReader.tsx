'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { getOfflineBookData } from '@/lib/offline/downloadService';
import { Loader2, ArrowLeft, Download } from 'lucide-react';

// Dynamically import pdfjs-dist only on client side
const loadPDFJS = async () => {
  const pdfjs = await import('pdfjs-dist');
  // Set worker source after import
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjs;
};

interface PDFReaderProps {
  bookFormatId: string;
  bookTitle: string;
  fileUrl: string;
  totalPages: number;
}

export function PDFReader({ bookFormatId, bookTitle, fileUrl, totalPages }: PDFReaderProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRendering, setIsRendering] = useState(false);
  const renderTaskRef = useRef<any>(null);
  const [maxPageReached, setMaxPageReached] = useState(1);
  
  const { progressPercent, lastPosition, updateProgress } = useReadingProgress({
    bookFormatId,
    total: totalPages,
    onComplete: () => {
      console.log('Book completed!');
    },
  });

  const cancelRender = useCallback(() => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
  }, []);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      cancelRender();
      
      try {
        // Dynamically load PDF.js
        const pdfjs = await loadPDFJS();
        
        let data: ArrayBuffer | null = null;
        
        const offlineData = await getOfflineBookData(bookFormatId);
        if (offlineData) {
          data = offlineData;
          setIsOffline(true);
        } else if (fileUrl && !isOffline) {
          const response = await fetch(fileUrl, { credentials: 'include' });
          data = await response.arrayBuffer();
        } else {
          throw new Error('No offline data and no network connection');
        }
        
        const loadingTask = pdfjs.getDocument({ data });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        
        const savedPage = lastPosition || 1;
        setCurrentPage(savedPage);
        setMaxPageReached(savedPage);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        setIsLoading(false);
        alert('Failed to load PDF. Please check your connection and try again.');
      }
    };
    
    loadPDF();
    
    return () => {
      cancelRender();
    };
  }, [bookFormatId, fileUrl, isOffline, lastPosition, cancelRender]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || isRendering) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    setIsRendering(true);
    cancelRender();
    
    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        background: 'white',
      };
      
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      renderTaskRef.current = null;
      
      if (currentPage > maxPageReached) {
        setMaxPageReached(currentPage);
        await updateProgress(currentPage);
      }
      
    } catch (error: any) {
      if (error?.name !== 'RenderingCancelledException') {
        console.error('Failed to render page:', error);
      }
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, currentPage, isRendering, cancelRender, maxPageReached, updateProgress]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const goToNextPage = () => {
    if (pdfDoc && currentPage < pdfDoc.numPages && !isRendering) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1 && !isRendering) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#B85C38] mx-auto mb-4" />
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-[#1A2A3A]">{bookTitle}</h1>
            <p className="text-xs text-gray-500">Page {currentPage} of {pdfDoc?.numPages || totalPages}</p>
          </div>
        </div>
        {isOffline && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
            <Download size={12} /> Offline
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Reading Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#B85C38] h-2 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">* Progress only advances when you move forward</p>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <canvas
          ref={canvasRef}
          className="shadow-lg rounded-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1 || isRendering}
          className="px-6 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {pdfDoc?.numPages || totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage >= (pdfDoc?.numPages || totalPages) || isRendering}
          className="px-6 py-2 bg-[#B85C38] text-white rounded-lg disabled:opacity-50 hover:bg-[#8E735B]"
        >
          Next
        </button>
      </div>
    </div>
  );
}