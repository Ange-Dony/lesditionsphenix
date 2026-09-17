import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Collection, Ouvrage } from '../types';
import { ChevronLeft, ChevronRight, BookOpen, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CollectionBookCarouselProps {
  key?: React.Key;
  collection: Collection;
  ouvrages: Ouvrage[];
  index: number;
}

export function CollectionBookCarousel({ collection, ouvrages, index }: CollectionBookCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      id={`carousel-collection-${collection.id}`}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow"
    >
      {/* Collection Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Collection Number Badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bleu-dark to-bordeaux text-white flex items-center justify-center font-serif font-bold text-sm shrink-0 shadow-xs border border-jaune/30">
            0{index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-anthracite">
                {collection.nom}
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-bleu-subtle text-bleu border border-bleu/20">
                {ouvrages.length} {ouvrages.length > 1 ? 'ouvrages' : 'ouvrage'}
              </span>
            </div>
            {collection.description && (
              <p className="text-anthracite-muted text-xs sm:text-sm mt-0.5 line-clamp-1">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Carousel Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            to={`/catalogue?collection=${collection.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-bordeaux hover:text-bleu transition-colors mr-2 px-3 py-1.5 rounded-lg hover:bg-ivoire"
          >
            <span>Voir la collection</span>
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-ivoire-warm hover:bg-bleu-subtle text-anthracite hover:text-bleu transition-colors border border-gray-200/80 shadow-2xs"
            aria-label={`Défiler vers la gauche pour ${collection.nom}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-ivoire-warm hover:bg-bleu-subtle text-anthracite hover:text-bleu transition-colors border border-gray-200/80 shadow-2xs"
            aria-label={`Défiler vers la droite pour ${collection.nom}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Book Track */}
      {ouvrages.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400 italic">
          Nouveaux ouvrages en cours d'édition pour cette collection.
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pt-6 pb-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          {ouvrages.map((ouvrage) => (
            <div
              key={ouvrage.id}
              className="w-60 sm:w-64 shrink-0 snap-start group flex flex-col bg-ivoire-warm/60 rounded-2xl p-3.5 border border-gray-200/70 hover:border-bordeaux/40 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              {/* Book Cover */}
              <div className="aspect-[3/4] w-full bg-white rounded-xl relative overflow-hidden flex items-center justify-center p-3 mb-3 border border-gray-100 shadow-2xs">
                {/* Book Spine Shadow */}
                <div className="absolute top-0 left-0 bottom-0 w-3 bg-gradient-to-r from-black/15 via-black/5 to-transparent z-10 pointer-events-none"></div>

                {ouvrage.couverture_url ? (
                  <img
                    src={ouvrage.couverture_url}
                    alt={`Couverture de ${ouvrage.titre}`}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain book-shadow group-hover:scale-105 transition-transform duration-300 rounded-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <BookOpen size={32} className="text-gray-300 mb-1" />
                    <span className="text-[10px] text-gray-400 font-medium">Couverture en cours</span>
                  </div>
                )}

                {ouvrage.niveau && (
                  <span className="absolute top-2 right-2 bg-bleu-dark/90 backdrop-blur-xs text-jaune-vif text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs z-20">
                    {ouvrage.niveau}
                  </span>
                )}
              </div>

              {/* Book Details */}
              <div className="flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-dore-dark uppercase tracking-wider line-clamp-1 mb-0.5">
                  {ouvrage.matiere || collection.nom}
                </span>

                <Link to={`/catalogue?ouvrage=${ouvrage.id}`}>
                  <h4 className="font-serif font-bold text-sm text-anthracite leading-snug line-clamp-2 group-hover:text-bordeaux transition-colors mb-1">
                    {ouvrage.titre}
                  </h4>
                </Link>

                <p className="text-anthracite-muted text-xs italic line-clamp-1 mb-3">
                  {ouvrage.auteur || 'Éditions Phénix'}
                </p>

                {/* Price & Action */}
                <div className="mt-auto pt-2.5 border-t border-gray-200/60 flex items-center justify-between">
                  <div>
                    {ouvrage.afficher_prix !== false ? (
                      <span className="font-bold text-sm text-bordeaux font-serif">
                        {ouvrage.prix.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-gray-500">
                        Sur devis
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(ouvrage)}
                    className="p-1.5 rounded-lg bg-white hover:bg-bordeaux hover:text-white text-anthracite transition-colors border border-gray-200 shadow-2xs"
                    title={`Ajouter ${ouvrage.titre} au panier`}
                    aria-label={`Ajouter ${ouvrage.titre} au panier`}
                  >
                    <ShoppingBag size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
