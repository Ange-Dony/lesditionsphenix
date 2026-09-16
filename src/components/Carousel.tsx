import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Collection } from '../types';

interface CarouselProps {
  collections: Collection[];
}

export function Carousel({ collections }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === collections.length - 1 ? 0 : prevIndex + 1
    );
  }, [collections.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? collections.length - 1 : prevIndex - 1
    );
  }, [collections.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isHovered || collections.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isHovered, collections.length, nextSlide]);

  if (!collections || collections.length === 0) {
    return (
      <div className="w-full h-64 bg-ivoire-warm border border-gray-200/80 flex items-center justify-center text-gray-500 rounded-2xl">
        Aucune collection disponible
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[440px] md:h-[540px] rounded-2xl overflow-hidden group shadow-xl border border-gray-200/70"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Nos Collections"
    >
      {/* Slides */}
      <div 
        className="w-full h-full flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {collections.map((collection, index) => (
          <div 
            key={collection.id}
            className="w-full h-full flex-shrink-0 relative overflow-hidden bg-anthracite"
            aria-hidden={currentIndex !== index}
          >
            {collection.image_url ? (
              <img 
                src={collection.image_url} 
                alt={collection.nom}
                className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                // @ts-ignore
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-bordeaux-dark via-bordeaux to-anthracite flex items-center justify-center">
                <div className="text-center p-8">
                  <span className="font-display-title text-3xl md:text-5xl text-dore/40 font-bold block mb-2">
                    Collection
                  </span>
                  <span className="font-serif text-2xl md:text-4xl text-white font-medium">
                    {collection.nom}
                  </span>
                </div>
              </div>
            )}
            
            {/* Rich Vignette & Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-14">
              <div className="max-w-2xl transform translate-y-0 transition-transform duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bordeaux/80 backdrop-blur-md text-dore-light text-xs font-semibold uppercase tracking-wider mb-4 border border-dore/30">
                  <Sparkles size={13} className="text-dore" />
                  <span>Collection Phare</span>
                </div>
                
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-sm">
                  {collection.nom}
                </h2>
                
                {collection.description && (
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 line-clamp-2 leading-relaxed text-balance opacity-95">
                    {collection.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/catalogue?collection=${collection.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dore hover:bg-dore-light text-anthracite font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span>Explorer la collection</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link
                    to="/collections"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs font-semibold text-xs uppercase tracking-wider transition-all duration-200 border border-white/20"
                  >
                    <span>Toutes les collections</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {collections.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-bordeaux text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 border border-white/20 shadow-lg hover:scale-105"
            aria-label="Collection précédente"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 hover:bg-bordeaux text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 border border-white/20 shadow-lg hover:scale-105"
            aria-label="Collection suivante"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Navigation */}
          <div className="absolute bottom-6 right-6 sm:right-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            {collections.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentIndex === index 
                    ? "w-7 bg-dore" 
                    : "w-2 bg-white/50 hover:bg-white"
                )}
                aria-label={`Aller à la collection ${index + 1}`}
                aria-current={currentIndex === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
