import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Menu, X, ChevronRight, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const links = [
    { name: 'Accueil', path: '/' },
    { name: 'Catalogue', path: '/catalogue' },
    { name: 'Collections', path: '/collections' },
    { name: 'Ressources', path: '/ressources' },
    { name: 'Partenaires', path: '/partenaires' },
    { name: 'À Propos', path: '/a-propos' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Announcement Bar with Blue & Yellow Accents */}
      <div className="bg-bleu-dark text-ivoire text-xs py-2 px-4 border-b border-jaune/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bleu-dark via-[#122849] to-bleu-dark pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex justify-between items-center tracking-wide relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-jaune/20 text-jaune-vif text-[10px] font-bold uppercase tracking-wider border border-jaune/40">
              <span className="w-1.5 h-1.5 rounded-full bg-jaune-vif animate-pulse"></span>
              La Maison du Succès
            </span>
            <span className="hidden sm:inline-block text-white/30">•</span>
            <span className="font-medium text-ivoire/90 text-[11px] sm:text-xs truncate">
              Maison d'Édition Pédagogique & Littéraire • Distribution Scolaire & Manuels Agréés
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-ivoire/85">
            <span className="hover:text-jaune-vif transition-colors cursor-default flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Commandes & Devis express WhatsApp
            </span>
            <Link to="/a-propos" className="hover:text-jaune-vif transition-colors text-jaune/90 font-medium">
              Contact & Établissements
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-7 items-center">
              {links.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "relative py-1 text-xs font-semibold uppercase tracking-wider transition-colors duration-200",
                      active
                        ? "text-bordeaux font-bold"
                        : "text-anthracite-light hover:text-bordeaux"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-bordeaux via-dore to-bordeaux rounded-full"></span>
                    )}
                  </Link>
                );
              })}
              
              <div className="h-5 w-[1px] bg-gray-200 mx-1"></div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-ivoire-warm hover:bg-bordeaux-subtle text-anthracite hover:text-bordeaux transition-all duration-200 group border border-gray-200/60 shadow-2xs"
                aria-label="Voir le panier"
              >
                <ShoppingBag size={20} className="transition-transform group-hover:scale-110" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-bordeaux rounded-full shadow-sm ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </button>

              <Link 
                to="/admin" 
                className="ml-2 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-anthracite-muted hover:text-bordeaux hover:border-bordeaux/40 transition-colors bg-white shadow-2xs"
              >
                Espace Éditeur
              </Link>
            </nav>

            {/* Mobile menu buttons */}
            <div className="md:hidden flex items-center gap-3">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg bg-ivoire-warm text-anthracite border border-gray-200"
                aria-label="Voir le panier"
              >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold text-white bg-bordeaux rounded-full ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button 
                className="p-2 rounded-lg text-anthracite hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu principal"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200/80 bg-white absolute w-full left-0 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 pt-3 pb-6 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors",
                    isActive(link.path) 
                      ? "bg-bordeaux text-white shadow-xs" 
                      : "text-anthracite hover:bg-ivoire-warm"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                  <ChevronRight size={18} className={isActive(link.path) ? "text-dore-light" : "text-gray-400"} />
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100 mt-2">
                <Link 
                  to="/admin" 
                  className="block px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-bordeaux"
                  onClick={() => setIsOpen(false)}
                >
                  Espace Administration Éditeur
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
