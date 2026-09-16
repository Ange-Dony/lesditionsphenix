import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Collection, Ouvrage } from '../types';
import { BookOpen, Search, Filter, BookText, Eye, X, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { PDFViewer } from '../components/PDFViewer';
import { useCart } from '../context/CartContext';

export function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOuvrageId = searchParams.get('ouvrage');
  const initialCollectionId = searchParams.get('collection');
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollectionId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedOuvrage, setSelectedOuvrage] = useState<Ouvrage | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [colRes, ouvRes] = await Promise.all([
          supabase.from('collections').select('*').eq('publie', true).order('ordre'),
          supabase.from('ouvrages').select('*, collections(*)').eq('disponibilite', true).order('created_at', { ascending: false })
        ]);

        if (colRes.data) setCollections(colRes.data);
        if (ouvRes.data) {
          setOuvrages(ouvRes.data);
          
          // Open detail modal if ouvrage ID is in URL
          if (initialOuvrageId) {
            const ouv = ouvRes.data.find(o => o.id === initialOuvrageId);
            if (ouv) setSelectedOuvrage(ouv);
          }
        }
      } catch (error) {
        console.error("Error fetching catalogue data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [initialOuvrageId]);

  useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollection(initialCollectionId);
    }
  }, [initialCollectionId]);

  const filteredOuvrages = ouvrages.filter(ouv => {
    const matchesCollection = selectedCollection === 'all' || ouv.collection_id === selectedCollection;
    const matchesSearch = ouv.titre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ouv.auteur.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCollection && matchesSearch;
  });

  const handleOrder = (ouvrage: Ouvrage) => {
    addToCart(ouvrage);
    setSelectedOuvrage(null); // Optional: close modal on add to cart
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header & Filters with Blue & Yellow Accents */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-gray-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bleu-subtle border border-bleu/20 text-bleu text-xs font-semibold uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-jaune-vif animate-pulse"></span>
            <span>Fonds Éditorial • La Maison du Succès</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-anthracite mb-2">
            Catalogue des Ouvrages
          </h1>
          <p className="text-anthracite-muted text-sm max-w-xl">
            Explorez nos manuels pédagogiques, œuvres littéraires et annales d'examen conformes aux programmes officiels.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Titre, auteur, matière..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux transition-all text-sm shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux appearance-none text-sm text-anthracite shadow-2xs font-medium cursor-pointer"
            >
              <option value="all">Toutes les collections</option>
              {collections.map(col => (
                <option key={col.id} value={col.id}>{col.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Collection Quick Pills */}
      {collections.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-6 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedCollection('all')}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shadow-2xs",
              selectedCollection === 'all'
                ? "bg-bordeaux text-white shadow-xs"
                : "bg-white text-anthracite-muted hover:text-bordeaux border border-gray-200 hover:border-bordeaux/40"
            )}
          >
            Tous les titres ({ouvrages.length})
          </button>
          {collections.map(col => {
            const count = ouvrages.filter(o => o.collection_id === col.id).length;
            const isSelected = selectedCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shadow-2xs",
                  isSelected
                    ? "bg-bordeaux text-white shadow-xs"
                    : "bg-white text-anthracite-muted hover:text-bordeaux border border-gray-200 hover:border-bordeaux/40"
                )}
              >
                {col.nom} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredOuvrages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/70 p-8 shadow-xs">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-serif text-xl font-bold text-anthracite mb-2">Aucun ouvrage trouvé</h3>
          <p className="text-anthracite-muted text-sm max-w-md mx-auto mb-6">
            Aucun titre ne correspond à votre recherche "{searchQuery}". Essayez d'autres termes ou réinitialisez les filtres.
          </p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCollection('all');}}
            className="px-5 py-2.5 bg-bordeaux text-white rounded-xl text-sm font-semibold hover:bg-bordeaux-light transition-colors shadow-xs"
          >
            Afficher tous les ouvrages
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {filteredOuvrages.map((ouvrage) => (
            <div 
              key={ouvrage.id} 
              className="group flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/80 hover:border-bordeaux/30 cursor-pointer"
              onClick={() => setSelectedOuvrage(ouvrage)}
            >
              <div className="aspect-[3/4] w-full bg-ivoire-warm relative overflow-hidden flex items-center justify-center p-4">
                {/* Book spine shadow */}
                <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-10 pointer-events-none"></div>

                {ouvrage.couverture_url ? (
                  <img 
                    src={ouvrage.couverture_url} 
                    alt={`Couverture de ${ouvrage.titre}`}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain book-shadow book-shadow-hover rounded-sm transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-white rounded-lg border border-dashed border-gray-300">
                    <BookOpen size={40} className="text-gray-300 mb-3" />
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Couverture en cours</span>
                  </div>
                )}

                {/* Collection Tag */}
                {ouvrage.collections?.nom && (
                  <span className="absolute top-3 left-3 bg-bordeaux text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm z-20">
                    {ouvrage.collections.nom}
                  </span>
                )}

                {/* Overlay for interaction */}
                <div className="absolute inset-0 bg-anthracite/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 text-bordeaux font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Eye size={15} /> Découvrir l'ouvrage
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <span className="text-[11px] font-semibold text-dore-dark uppercase tracking-wider mb-1">
                  {ouvrage.matiere || ouvrage.niveau || "Éditions Phénix"}
                </span>

                <h3 className="font-serif font-bold text-base text-anthracite leading-snug mb-1 group-hover:text-bordeaux transition-colors line-clamp-2">
                  {ouvrage.titre}
                </h3>
                <p className="text-anthracite-muted text-xs italic mb-4">{ouvrage.auteur}</p>
                
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    {ouvrage.afficher_prix !== false ? (
                      <span className="font-bold text-base text-bordeaux font-serif">
                        {ouvrage.prix.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        Sur devis
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOrder(ouvrage); }}
                    className="p-2 rounded-lg bg-ivoire-warm hover:bg-bordeaux hover:text-white text-anthracite transition-colors border border-gray-200/80 shadow-2xs"
                    title="Ajouter au panier"
                    aria-label={`Ajouter ${ouvrage.titre} au panier`}
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Détail Ouvrage */}
      {selectedOuvrage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col md:flex-row">
              {/* Image Col */}
              <div className="w-full md:w-5/12 bg-ivoire-warm p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200/80 relative">
                {selectedOuvrage.couverture_url ? (
                  <img 
                    src={selectedOuvrage.couverture_url} 
                    alt={selectedOuvrage.titre}
                    className="w-auto max-h-[55vh] object-contain book-shadow rounded-sm"
                  />
                ) : (
                  <div className="w-48 h-64 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-300 text-center p-4">
                    <BookOpen size={48} className="text-gray-300 mb-2" />
                    <span className="text-xs text-gray-400">Couverture en cours</span>
                  </div>
                )}
              </div>
              
              {/* Content Col */}
              <div className="w-full md:w-7/12 p-6 sm:p-8 relative flex flex-col">
                <button 
                  onClick={() => setSelectedOuvrage(null)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-anthracite hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X size={22} />
                </button>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-bordeaux/10 text-bordeaux text-xs font-bold rounded-full uppercase tracking-wider">
                    {selectedOuvrage.collections?.nom || 'Collection Phénix'}
                  </span>
                  {selectedOuvrage.disponibilite ? (
                    <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                      En stock
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200">
                      Rupture temporaire
                    </span>
                  )}
                </div>
                
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-anthracite mb-1 leading-tight">
                  {selectedOuvrage.titre}
                </h2>
                <p className="text-sm sm:text-base text-anthracite-muted italic mb-6">
                  {selectedOuvrage.auteur}
                </p>
                
                <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
                  {selectedOuvrage.afficher_prix !== false ? (
                    <span className="font-serif text-3xl font-bold text-bordeaux">
                      {selectedOuvrage.prix.toLocaleString('fr-FR')} FCFA
                    </span>
                  ) : (
                    <span className="text-xl font-bold text-anthracite-muted">Prix sur devis</span>
                  )}
                </div>
                
                <div className="mb-6 flex-grow">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-anthracite mb-2">Présentation de l'ouvrage</h4>
                  <p className="text-anthracite-light text-sm leading-relaxed whitespace-pre-line">
                    {selectedOuvrage.description || "Aucune description détaillée disponible pour le moment."}
                  </p>
                </div>
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-ivoire-warm/60 border border-gray-200/60 text-xs">
                  {selectedOuvrage.matiere && (
                    <div>
                      <span className="text-anthracite-muted block">Matière / Discipline</span>
                      <span className="font-semibold text-anthracite">{selectedOuvrage.matiere}</span>
                    </div>
                  )}
                  {selectedOuvrage.niveau && (
                    <div>
                      <span className="text-anthracite-muted block">Classe / Niveau</span>
                      <span className="font-semibold text-anthracite">{selectedOuvrage.niveau}</span>
                    </div>
                  )}
                  {selectedOuvrage.isbn && (
                    <div>
                      <span className="text-anthracite-muted block">ISBN</span>
                      <span className="font-mono text-anthracite">{selectedOuvrage.isbn}</span>
                    </div>
                  )}
                  {selectedOuvrage.nombre_pages && (
                    <div>
                      <span className="text-anthracite-muted block">Pagination</span>
                      <span className="font-semibold text-anthracite">{selectedOuvrage.nombre_pages} pages</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 mt-auto">
                  <button 
                    onClick={() => handleOrder(selectedOuvrage)}
                    disabled={!selectedOuvrage.disponibilite}
                    className="flex-1 py-3 px-6 bg-bordeaux text-white rounded-xl font-semibold hover:bg-bordeaux-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingBag size={18} />
                    <span>Ajouter au panier</span>
                  </button>
                  
                  {selectedOuvrage.extrait_url && (
                    <button 
                      onClick={() => setIsPdfOpen(true)}
                      className="py-3 px-5 bg-white text-anthracite rounded-xl font-semibold hover:bg-ivoire-warm border border-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookText size={18} className="text-bordeaux" />
                      <span>Lire un extrait</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {isPdfOpen && selectedOuvrage?.extrait_url && (
        <PDFViewer 
          url={selectedOuvrage.extrait_url} 
          title={selectedOuvrage.titre}
          onClose={() => setIsPdfOpen(false)}
        />
      )}
    </div>
  );
}
