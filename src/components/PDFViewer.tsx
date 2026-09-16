import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  // If the URL is an image instead of a PDF, we'll just show it in an img tag
  const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-anthracite/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-ivoire w-full max-w-5xl h-full max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-lg text-bordeaux line-clamp-1 flex-1 mr-4">
            Extrait : {title}
          </h3>
          <div className="flex items-center gap-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-bordeaux hover:bg-bordeaux/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink size={20} />
              <span className="hidden sm:inline">Ouvrir</span>
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 w-full bg-gray-100 overflow-auto relative">
          {isImage ? (
            <div className="min-h-full flex items-center justify-center p-4">
              <img 
                src={url} 
                alt={`Extrait de ${title}`} 
                className="max-w-full max-h-full object-contain shadow-sm"
              />
            </div>
          ) : (
            <iframe
              src={`${url}#view=FitH`}
              title={`Extrait de ${title}`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
