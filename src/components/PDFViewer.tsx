import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  canDownload?: boolean;
  onDownload?: () => void;
}

export function getEmbedUrl(url: string): string {
  if (!url) return '';
  
  // Google Drive file link: convert /view to /preview for iframe embedding
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // Google Drive id parameter
  const driveIdMatch = url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  // Standard PDF with view parameters
  if (url.toLowerCase().endsWith('.pdf') || url.includes('/storage/v1/object/public/')) {
    return `${url}#view=FitH`;
  }

  return url;
}

export function PDFViewer({ url, title, subtitle, onClose, canDownload = true, onDownload }: PDFViewerProps) {
  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
  const embedUrl = getEmbedUrl(url);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-full max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 mr-4">
            <div className="w-9 h-9 rounded-xl bg-bordeaux/10 text-bordeaux flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-base sm:text-lg text-anthracite truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-anthracite-muted truncate font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {canDownload && (
              <button 
                onClick={handleDownload}
                className="px-3 sm:px-4 py-2 bg-bleu hover:bg-bleu-royal text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Télécharger le document"
              >
                <Download size={15} className="text-jaune-vif" />
                <span className="hidden sm:inline">Télécharger</span>
              </button>
            )}

            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-bordeaux hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink size={18} />
              <span className="hidden md:inline">Ouvrir</span>
            </a>

            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 w-full bg-gray-100 overflow-hidden relative">
          {isImage ? (
            <div className="h-full flex items-center justify-center p-4 overflow-auto">
              <img 
                src={url} 
                alt={`Document ${title}`} 
                className="max-w-full max-h-full object-contain shadow-md rounded"
              />
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={`Document ${title}`}
              className="w-full h-full border-0 bg-white"
              allow="autoplay"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
