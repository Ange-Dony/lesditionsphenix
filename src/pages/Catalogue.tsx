import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Collection, Ouvrage, Ressource, getResourcePassword } from '../types';
import { 
  BookOpen, Search, Filter, BookText, Eye, EyeOff, X, 
  ShoppingBag, Share2, Check, MessageCircle, ArrowLeft, 
  Lock, Unlock, FileCheck 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PDFViewer } from '../components/PDFViewer';
import { useCart } from '../context/CartContext';
import { sortCollectionsCanonical, getCollectionOrderIndex } from '../lib/collectionOrder';
import { SEOHead } from '../components/SEOHead';

export function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: paramBookId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const initialOuvrageId = paramBookId || searchParams.get('ouvrage');
  const initialCollectionId = searchParams.get('collection');
  const initialSearchParam = searchParams.get('search') || searchParams.get('q') || '';
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('+2250700000000');
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>(initialCollectionId || 'all');
  const [searchQuery, setSearchQuery] = useState(initialSearchParam);
  
  const [selectedOuvrage, setSelectedOuvrage] = useState<Ouvrage | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Document Viewer State (pour Extrait ou Corrigé)
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Modal Mot de Passe pour les Corrigés protégés
  const [activePasswordRessource, setActivePasswordRessource] = useState<Ressource | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [colRes, ouvRes, resRes, paramRes] = await Promise.all([
          supabase.from('collections').select('*').eq('publie', true).order('ordre'),
          supabase.from('ouvrages').select('*, collections(*)').eq('disponibilite', true).order('created_at', { ascending: false }),
          supabase.from('ressources').select('*').eq('publie', true),
          supabase.from('parametres_site').select('telephone_whatsapp').limit(1)
        ]);

        if (colRes.data) {
          setCollections(sortCollectionsCanonical(colRes.data));
        }
        if (resRes.data) {
          setRessources(resRes.data);
        }
        if (paramRes.data && paramRes.data[0]?.telephone_whatsapp) {
          setWhatsappNumber(paramRes.data[0].telephone_whatsapp);
        }
        if (ouvRes.data) {
          // Sort default books according to collection canonical order, then creation date
          const sorted = [...ouvRes.data].sort((a, b) => {
            const idxA = getCollectionOrderIndex(a.collections?.nom);
            const idxB = getCollectionOrderIndex(b.collections?.nom);
            if (idxA !== idxB) return idxA - idxB;
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
          });
          setOuvrages(sorted);
          
          // Open detail modal if ouvrage ID is in URL
          if (initialOuvrageId) {
            const ouv = sorted.find(o => o.id === initialOuvrageId);
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

  // Récupérer l'URL de l'extrait d'un ouvrage
  const getExtraitUrl = (ouv: Ouvrage): string | null => {
    if (ouv.extrait_url && ouv.extrait_url.trim() !== '') {
      return ouv.extrait_url.trim();
    }
    const resExtrait = ressources.find(r => 
      r.ouvrage_id === ouv.id && 
      (r.type?.toLowerCase().includes('extrait') || r.titre?.toLowerCase().includes('extrait'))
    );
    return resExtrait ? resExtrait.google_drive_url : null;
  };

  // Récupérer le corrigé associé à un ouvrage s'il existe
  const getCorrigeRessource = (ouv: Ouvrage): Ressource | null => {
    return ressources.find(r => 
      r.ouvrage_id === ouv.id && 
      (r.type?.toLowerCase().includes('corrig') || r.titre?.toLowerCase().includes('corrig'))
    ) || null;
  };

  const handleOpenExtrait = (ouv: Ouvrage) => {
    const url = getExtraitUrl(ouv);
    if (url) {
      setViewingDocument({
        url,
        title: `Extrait • ${ouv.titre}`,
        subtitle: ouv.collections?.nom || 'Extrait officiel'
      });
    }
  };

  const handleOpenCorrige = (corrige: Ressource, ouvTitle: string) => {
    const pwd = getResourcePassword(corrige);
    if (!pwd) {
      setViewingDocument({
        url: corrige.google_drive_url,
        title: corrige.titre || `Corrigé • ${ouvTitle}`,
        subtitle: `${corrige.type}${corrige.niveau ? ` • ${corrige.niveau}` : ''}`
      });
      return;
    }

    // Demander le mot de passe enseignant
    setActivePasswordRessource(corrige);
    setEnteredPassword('');
    setPasswordError(false);
    setShowPassword(false);
  };

  const handleUnlockCorrigeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePasswordRessource) return;

    const expectedPwd = getResourcePassword(activePasswordRessource);
    if (expectedPwd && enteredPassword.trim().toLowerCase() === expectedPwd.trim().toLowerCase()) {
      const target = activePasswordRessource;
      setActivePasswordRessource(null);
      setEnteredPassword('');
      setPasswordError(false);
      setViewingDocument({
        url: target.google_drive_url,
        title: target.titre,
        subtitle: `${target.type}${target.niveau ? ` • ${target.niveau}` : ''}`
      });
    } else {
      setPasswordError(true);
    }
  };

  const openOuvrage = (ouvrage: Ouvrage) => {
    setSelectedOuvrage(ouvrage);
    setCopiedLink(false);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('ouvrage', ouvrage.id);
      return next;
    }, { replace: false });
  };

  const closeOuvrage = () => {
    setSelectedOuvrage(null);
    setCopiedLink(false);
    if (paramBookId) {
      navigate('/catalogue');
    } else {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('ouvrage');
        return next;
      }, { replace: true });
    }
  };

  const handleCopyLink = (ouvrage: Ouvrage) => {
    const url = `https://www.leseditionsphenix.com/catalogue?ouvrage=${ouvrage.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const filteredOuvrages = ouvrages.filter(ouv => {
    const matchesCollection = selectedCollection === 'all' || ouv.collection_id === selectedCollection;
    const matchesSearch = ouv.titre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ouv.auteur.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ouv.matiere && ouv.matiere.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (ouv.niveau && ouv.niveau.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCollection && matchesSearch;
  });

  const handleOrder = (ouvrage: Ouvrage) => {
    addToCart(ouvrage);
  };

  const activeColName = collections.find(c => c.id === selectedCollection)?.nom;

  const seoTitle = selectedOuvrage
    ? `${selectedOuvrage.titre} – Les Éditions Phénix | Manuel Scolaire Ivoirien`
    : activeColName 
    ? `${activeColName} – Manuels Scolaires Ivoiriens | Catalogue`
    : searchQuery 
    ? `Recherche "${searchQuery}" – Catalogue Manuels & Annales`
    : "Catalogue des Manuels Scolaires Ivoiriens, Annales & Citations";

  const seoDescription = selectedOuvrage
    ? (selectedOuvrage.description ? selectedOuvrage.description.replace(/[\n\r]+/g, ' ').slice(0, 160) : `${selectedOuvrage.titre} - Manuel scolaire officiel pour ${selectedOuvrage.niveau ? selectedOuvrage.niveau.trim() : 'élèves'} en ${selectedOuvrage.matiere || 'Côte d\'Ivoire'}, édité par Les Éditions Phénix. Sommaire, fiches et commandes.`)
    : activeColName
    ? `Consultez les ouvrages de la ${activeColName} des Éditions Phénix : manuels ivoiriens, exercices et fiches conformes aux programmes officiels en Côte d'Ivoire.`
    : "Catalogue officiel des Éditions Phénix : manuels scolaires ivoiriens agréés, annales BEPC & BAC, construction graphique, fiches de citations philosophiques et littérature.";

  const seoKeywords = selectedOuvrage
    ? `${selectedOuvrage.titre}, ${selectedOuvrage.matiere || ''}, ${selectedOuvrage.niveau || ''}, ${selectedOuvrage.collections?.nom || ''}, manuels scolaires côte d'ivoire, les éditions phénix`
    : undefined;

  const bookJsonLd = selectedOuvrage ? {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `https://www.leseditionsphenix.com/catalogue?ouvrage=${selectedOuvrage.id}#book`,
    "name": selectedOuvrage.titre,
    "url": `https://www.leseditionsphenix.com/catalogue?ouvrage=${selectedOuvrage.id}`,
    "image": selectedOuvrage.couverture_url || undefined,
    "author": {
      "@type": "Organization",
      "name": (selectedOuvrage.auteur && selectedOuvrage.auteur.trim()) ? selectedOuvrage.auteur.trim() : "Les Éditions Phénix"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Les Éditions Phénix",
      "url": "https://www.leseditionsphenix.com"
    },
    "inLanguage": "fr-CI",
    "about": selectedOuvrage.matiere || "Enseignement scolaire en Côte d'Ivoire",
    "educationalLevel": selectedOuvrage.niveau ? selectedOuvrage.niveau.trim() : "Collège / Lycée Côte d'Ivoire",
    "offers": {
      "@type": "Offer",
      "price": selectedOuvrage.prix || 0,
      "priceCurrency": "XOF",
      "availability": selectedOuvrage.disponibilite !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://www.leseditionsphenix.com/catalogue?ouvrage=${selectedOuvrage.id}`
    }
  } : undefined;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords || "catalogue manuels ivoiriens, annales bepc, annales bac, construction graphique, citations philosophiques, livres scolaires côte d'ivoire, livre abidjan"}
        canonical={selectedOuvrage ? `https://www.leseditionsphenix.com/catalogue?ouvrage=${selectedOuvrage.id}` : undefined}
        ogType={selectedOuvrage ? "book" : "website"}
        ogImage={selectedOuvrage?.couverture_url || undefined}
        jsonLd={bookJsonLd}
      />
      
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
          {filteredOuvrages.map((ouvrage) => {
            const extraitUrl = getExtraitUrl(ouvrage);
            const corrigeRessource = getCorrigeRessource(ouvrage);

            return (
              <div 
                key={ouvrage.id} 
                className="group flex flex-col bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/80 hover:border-bordeaux/30 cursor-pointer"
                onClick={() => openOuvrage(ouvrage)}
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
                  <p className="text-anthracite-muted text-xs italic mb-2.5">{ouvrage.auteur}</p>

                  {/* Badges Extrait & Corrigé sur la carte */}
                  {(extraitUrl || corrigeRessource) && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {extraitUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bleu-subtle text-bleu border border-bleu/20 text-[10px] font-bold uppercase tracking-wider">
                          <BookText size={11} className="text-bleu" />
                          Extrait
                        </span>
                      )}
                      {corrigeRessource && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                          <Lock size={10} className="text-amber-700" />
                          Corrigé dispo
                        </span>
                      )}
                    </div>
                  )}
                  
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
            );
          })}
        </div>
      )}

      {/* Modal Détail Ouvrage */}
      {selectedOuvrage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
          onClick={closeOuvrage}
        >
          <div 
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
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
                  onClick={closeOuvrage}
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

                {/* Share & Direct Link for SEO */}
                <div className="flex items-center justify-between gap-2 p-3 mb-6 rounded-xl bg-gray-50 border border-gray-200/70 text-xs">
                  <span className="text-anthracite-muted font-medium flex items-center gap-1.5">
                    <Share2 size={14} className="text-bordeaux" /> Partager cette fiche :
                  </span>
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Retrouvez le manuel scolaire "${selectedOuvrage.titre}" sur le site officiel des Éditions Phénix : https://www.leseditionsphenix.com/catalogue?ouvrage=${selectedOuvrage.id}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-medium rounded-lg transition-colors flex items-center gap-1"
                      title="Partager sur WhatsApp"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                    <button 
                      onClick={() => handleCopyLink(selectedOuvrage)}
                      className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-anthracite border border-gray-200 font-medium rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      title="Copier le lien direct vers cet ouvrage"
                    >
                      {copiedLink ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          <span className="text-green-600 font-semibold">Copié !</span>
                        </>
                      ) : (
                        <span>Copier le lien</span>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Corrigé officiel associé s'il existe */}
                {(() => {
                  const selectedCorrige = selectedOuvrage ? getCorrigeRessource(selectedOuvrage) : null;
                  if (!selectedCorrige) return null;
                  return (
                    <div className="p-3.5 mb-4 rounded-xl bg-amber-50/90 border border-amber-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                          <FileCheck size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-amber-950 uppercase tracking-wide">Corrigé officiel associé</span>
                            {getResourcePassword(selectedCorrige) && (
                              <span className="px-1.5 py-0.5 bg-amber-200/80 text-amber-950 text-[10px] font-bold rounded flex items-center gap-0.5">
                                <Lock size={9} /> Code requis
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-800 truncate font-medium">{selectedCorrige.titre}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenCorrige(selectedCorrige, selectedOuvrage.titre)}
                        className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Consulter</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Actions principales : Panier + Extrait + Corrigé (s'il existe) */}
                {(() => {
                  const selectedExtraitUrl = selectedOuvrage ? getExtraitUrl(selectedOuvrage) : null;
                  const selectedCorrige = selectedOuvrage ? getCorrigeRessource(selectedOuvrage) : null;

                  return (
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 pt-4 border-t border-gray-100 mt-auto">
                      <button 
                        onClick={() => handleOrder(selectedOuvrage)}
                        disabled={!selectedOuvrage.disponibilite}
                        className="flex-1 min-w-[150px] py-3 px-5 bg-bordeaux text-white rounded-xl font-semibold hover:bg-bordeaux-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm"
                      >
                        <ShoppingBag size={18} />
                        <span>Ajouter au panier</span>
                      </button>
                      
                      {/* Bouton Extrait */}
                      {selectedExtraitUrl ? (
                        <button 
                          onClick={() => handleOpenExtrait(selectedOuvrage)}
                          className="py-3 px-4.5 bg-white text-anthracite hover:bg-ivoire-warm border border-gray-300 hover:border-bordeaux/40 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-2xs hover:shadow-xs cursor-pointer"
                          title="Consulter l'extrait de l'ouvrage"
                        >
                          <BookText size={18} className="text-bordeaux" />
                          <span>Extrait</span>
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="py-3 px-4 bg-gray-50 text-gray-400 border border-gray-200/80 rounded-xl font-medium flex items-center justify-center gap-1.5 text-xs cursor-not-allowed"
                          title="L'extrait numérique sera bientôt disponible"
                        >
                          <BookText size={15} className="text-gray-300" />
                          <span>Extrait bientôt</span>
                        </button>
                      )}

                      {/* Bouton Corrigé s'il existe */}
                      {selectedCorrige && (
                        <button 
                          onClick={() => handleOpenCorrige(selectedCorrige, selectedOuvrage.titre)}
                          className="py-3 px-4.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-xs hover:shadow-md cursor-pointer"
                          title="Consulter le corrigé officiel associé"
                        >
                          {getResourcePassword(selectedCorrige) ? (
                            <>
                              <Lock size={16} className="text-jaune-vif" />
                              <span>Corrigé • Code</span>
                            </>
                          ) : (
                            <>
                              <FileCheck size={17} className="text-jaune-vif" />
                              <span>Corrigé</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Universel pour Extrait et Corrigé */}
      {viewingDocument && (
        <PDFViewer 
          url={viewingDocument.url} 
          title={viewingDocument.title}
          subtitle={viewingDocument.subtitle}
          onClose={() => setViewingDocument(null)}
          canDownload={true}
        />
      )}

      {/* MODAL DE DÉVERROUILLAGE DU CORRIGÉ PAR MOT DE PASSE */}
      {activePasswordRessource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-amber-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-anthracite leading-tight">
                    Corrigé Sécurisé
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                    Accès réservé aux enseignants
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { setActivePasswordRessource(null); setPasswordError(false); }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleUnlockCorrigeSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Corrigé officiel ciblé :</p>
                <p className="text-sm font-semibold text-anthracite bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                  {activePasswordRessource.titre}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Mot de passe d'accès enseignant <span className="text-bordeaux">*</span></span>
                  <span className="text-[11px] text-gray-400">Sensible à la casse</span>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    autoFocus
                    value={enteredPassword} 
                    onChange={e => { setEnteredPassword(e.target.value); setPasswordError(false); }} 
                    placeholder="Entrez le mot de passe enseignant..." 
                    className={cn(
                      "w-full pl-3.5 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all font-mono",
                      passwordError 
                        ? "border-red-500 focus:ring-red-200 bg-red-50/30 text-red-900" 
                        : "border-gray-300 focus:ring-bordeaux/20 focus:border-bordeaux"
                    )}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                    <span>⚠️ Mot de passe incorrect. Veuillez vérifier ou demander le code ci-dessous.</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button 
                  type="submit" 
                  className="w-full py-2.5 px-4 bg-bordeaux hover:bg-bordeaux-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock size={16} />
                  <span>Déverrouiller & Consulter le corrigé</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActivePasswordRessource(null); setPasswordError(false); }}
                  className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>

              {/* Assistance WhatsApp */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-[11px] text-gray-500 mb-2">
                  Vous êtes enseignant ou responsable d'établissement ?
                </p>
                <a 
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Bonjour Les Éditions Phénix, je suis enseignant(e) et je souhaiterais obtenir le mot de passe d'accès pour le corrigé : "${activePasswordRessource.titre}". Merci !`
                  )}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-semibold transition-colors"
                >
                  <MessageCircle size={14} className="text-green-600" />
                  <span>Demander le code d'accès par WhatsApp</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
