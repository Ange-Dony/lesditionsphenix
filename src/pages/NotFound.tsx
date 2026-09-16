import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <BookOpen size={64} className="text-gray-300 mb-6" />
      <h1 className="text-6xl font-bold text-bordeaux mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-anthracite mb-6">Page introuvable</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Le livre que vous cherchez semble avoir été déplacé ou n'existe plus. 
        Revenons à notre bibliothèque principale.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-bordeaux text-ivoire rounded-md font-medium hover:bg-bordeaux-light transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
