import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Collection, Ouvrage } from '../types';
import { 
  BookOpen, 
  Library, 
  Search, 
  ArrowRight, 
  BookText, 
  ShoppingBag, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { FALLBACK_COLLECTIONS, FALLBACK_OUVRAGES } from '../fallbackData';

export function Collections() {
  const [collections, setCollections] = useState<Collection[]>(FALLBACK_COLLECTIONS);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>(FALLBACK_OUVRAGES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected collection for modal quick view
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [colRes, ouvRes] = await Promise.all([
          supabase.from('collections').select('*').eq('publie', true).order('ordre'),
          supabase.from('ouvrages').select('*, collections(*)').eq('disponibilite', true).order('created_at', { ascending: false })
        ]);

        if (colRes.data) setCollections(colRes.data);
        if (ouvRes.data) setOuvrages(ouvRes.data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredCollections = collections.filter(col => {
    const query = searchQuery.toLowerCase();
    const matchesNom = col.nom.toLowerCase().includes(query);
    const matchesDesc = col.description ? col.description.toLowerCase().includes(query) : false;
    return matchesNom || matchesDesc;
  });

  const getOuvragesForCollection = (collectionId: string) => {
    return ouvrages.filter(o => o.collection_id === collectionId);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section with Blue, Bordeaux & Yellow Accents */}
      <section className="relative bg-gradient-to-r from-bleu-dark via-bordeaux to-bleu-dark text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-2 border-jaune/30">
        <div className="absolute inset-0 opacity-10 paper-texture pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-jaune/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-bleu-royal/25 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bleu-dark/60 border border-jaune/40 text-jaune-vif text-xs font-semibold uppercase tracking-widest mb-4 shadow-xs">
            <Layers size={14} className="text-jaune-vif" />
            <span>Lignes Éditoriales • La Maison du Succès</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Nos Collections
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto text-ivoire/90 leading-relaxed font-light">
            Découvrez nos séries d'ouvrages et manuels scolaires regroupés par univers pédagogiques et littéraires, pensés pour guider chaque élève vers la réussite.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Counter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200/80 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une collection..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivoire-warm/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux text-sm"
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

          <div className="flex items-center gap-3 text-xs text-anthracite-muted font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-dore"></span>
            <span>
              <strong className="text-anthracite">{filteredCollections.length}</strong> collection{filteredCollections.length > 1 ? 's' : ''} • <strong className="text-anthracite">{ouvrages.length}</strong> ouvrages au total
            </span>
          </div>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
            <Library size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="font-serif text-xl font-bold text-anthracite mb-2">Aucune collection trouvée</h2>
            <p className="text-anthracite-muted text-sm max-w-md mx-auto mb-6">
              {searchQuery ? `Aucune collection ne correspond à "${searchQuery}".` : "Les collections sont en cours de mise à jour."}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 bg-bordeaux text-white rounded-xl text-sm font-semibold hover:bg-bordeaux-light transition-colors"
              >
                Afficher toutes les collections
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((collection) => {
              const collectionOuvrages = getOuvragesForCollection(collection.id);
              const previewBooks = collectionOuvrages.slice(0, 3);

              return (
                <div 
                  key={collection.id} 
                  className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-bordeaux/30 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Card Header / Image */}
                  <div className="relative h-44 bg-gradient-to-br from-anthracite via-bordeaux-dark to-bordeaux p-6 flex flex-col justify-between overflow-hidden">
                    {collection.image_url ? (
                      <img 
                        src={collection.image_url} 
                        alt={collection.nom}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 opacity-10 paper-texture"></div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-dore/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex justify-between items-start">
                      <span className="px-3 py-1 bg-white/15 backdrop-blur-xs text-ivoire border border-white/20 rounded-full text-[11px] font-semibold uppercase tracking-wider">
                        Collection Phénix
                      </span>
                      <span className="px-2.5 py-1 bg-dore text-anthracite font-bold text-xs rounded-full shadow-sm">
                        {collectionOuvrages.length} titre{collectionOuvrages.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h3 className="font-serif text-2xl font-bold text-white group-hover:text-dore-light transition-colors leading-tight">
                        {collection.nom}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-anthracite-light text-sm leading-relaxed mb-6 line-clamp-3">
                      {collection.description || "Collection dédiée à l'excellence académique et à la diffusion du savoir littéraire et scientifique."}
                    </p>

                    {/* Book thumbnails preview */}
                    <div className="mb-6 pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-anthracite-muted block mb-3">
                        Aperçu des ouvrages :
                      </span>

                      {previewBooks.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {previewBooks.map(ouv => (
                            <div 
                              key={ouv.id} 
                              className="group/book relative bg-ivoire-warm rounded-lg p-1.5 border border-gray-200/80 flex flex-col items-center cursor-pointer hover:border-bordeaux/40 transition-colors"
                              onClick={() => setActiveCollection(collection)}
                              title={ouv.titre}
                            >
                              <div className="w-full aspect-[3/4] bg-white rounded overflow-hidden mb-1 flex items-center justify-center">
                                {ouv.couverture_url ? (
                                  <img 
                                    src={ouv.couverture_url} 
                                    alt={ouv.titre}
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <BookOpen size={16} className="text-gray-300" />
                                )}
                              </div>
                              <span className="text-[10px] text-anthracite font-medium line-clamp-1 text-center w-full">
                                {ouv.titre}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic py-2">
                          Aucun ouvrage rattaché pour l'instant.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setActiveCollection(collection)}
                        className="py-2.5 px-3 bg-ivoire-warm hover:bg-bordeaux hover:text-white text-anthracite rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 border border-gray-200"
                      >
                        <BookOpen size={14} />
                        <span>Détails</span>
                      </button>

                      <Link
                        to={`/catalogue?collection=${collection.id}`}
                        className="py-2.5 px-3 bg-bordeaux text-white hover:bg-bordeaux-light rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <span>Catalogue</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: All books in the selected collection */}
        {activeCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8 relative">
              <button 
                onClick={() => setActiveCollection(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-anthracite hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fermer la fenêtre"
              >
                <X size={22} />
              </button>

              <div className="mb-6 pb-4 border-b border-gray-200/80">
                <span className="font-display-title text-xs font-semibold text-dore uppercase tracking-widest block mb-1">
                  Collection Éditoriale
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-anthracite mb-2">
                  {activeCollection.nom}
                </h2>
                <p className="text-anthracite-muted text-sm leading-relaxed">
                  {activeCollection.description || "Découvrez tous les ouvrages disponibles dans cette collection."}
                </p>
              </div>

              {/* Books list in modal */}
              {(() => {
                const books = getOuvragesForCollection(activeCollection.id);
                if (books.length === 0) {
                  return (
                    <div className="text-center py-12 bg-ivoire-warm/50 rounded-xl">
                      <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-anthracite-muted">Aucun ouvrage n'est encore enregistré dans cette collection.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {books.map(book => (
                      <div 
                        key={book.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-ivoire-warm/40 hover:bg-ivoire-warm rounded-xl border border-gray-200/80 gap-4 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-16 bg-white rounded shadow-2xs shrink-0 overflow-hidden flex items-center justify-center border border-gray-200">
                            {book.couverture_url ? (
                              <img src={book.couverture_url} alt={book.titre} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-base text-anthracite leading-snug">
                              {book.titre}
                            </h4>
                            <p className="text-xs text-anthracite-muted italic mb-1">{book.auteur}</p>
                            <div className="flex items-center gap-2 text-[11px] text-anthracite-muted">
                              {book.matiere && <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{book.matiere}</span>}
                              {book.niveau && <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{book.niveau}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <div>
                            {book.afficher_prix !== false ? (
                              <span className="font-serif font-bold text-bordeaux text-sm">
                                {book.prix.toLocaleString('fr-FR')} FCFA
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 font-medium">Sur devis</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addToCart(book)}
                              className="p-2 bg-bordeaux text-white rounded-lg hover:bg-bordeaux-light transition-colors shadow-2xs"
                              title="Ajouter au panier"
                            >
                              <ShoppingBag size={16} />
                            </button>

                            <Link
                              to={`/catalogue?ouvrage=${book.id}`}
                              className="px-3 py-1.5 bg-white border border-gray-200 text-anthracite hover:text-bordeaux text-xs font-semibold rounded-lg transition-colors"
                            >
                              Détails
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
                <Link
                  to={`/catalogue?collection=${activeCollection.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-bordeaux text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-bordeaux-light transition-colors shadow-xs"
                >
                  <span>Ouvrir dans le catalogue complet</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Institutional Callout */}
        <div className="mt-16 bg-gradient-to-r from-anthracite to-anthracite-light text-white rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-dore font-bold block mb-2">
              Commandes Groupées & Séries Scolaires
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              Besoin d'équiper une promotion ou une bibliothèque ?
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              Nos équipes pédagogiques élaborent des sélections complètes de manuels par niveau et par discipline avec des conditions préférentielles pour les établissements.
            </p>
            <Link 
              to="/catalogue" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-dore text-anthracite font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-dore-light transition-colors shadow-md"
            >
              <span>Accéder à tout le catalogue</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
