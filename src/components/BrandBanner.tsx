import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Award, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface BrandBannerProps {
  className?: string;
  variant?: 'hero' | 'compact';
}

export function BrandBanner({ className, variant = 'hero' }: BrandBannerProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const { data, error } = await supabase
          .from('parametres_site')
          .select('logo_url')
          .limit(1)
          .single();

        if (!error && data?.logo_url) {
          setLogoUrl(data.logo_url);
        }
      } catch (err) {
        console.error("Error loading logo for banner:", err);
      }
    }
    fetchLogo();
  }, []);

  if (variant === 'compact') {
    return (
      <aside 
        id="brand-banner-compact"
        aria-label="Bannière Les Éditions Phénix"
        className={cn(
          "w-full bg-gradient-to-r from-bleu-dark via-bleu to-bordeaux-dark text-white py-3 px-4 shadow-md border-b-2 border-jaune/40 relative overflow-hidden",
          className
        )}
      >
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-jaune/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain drop-shadow" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-bleu-royal/60 border border-jaune/50 flex items-center justify-center text-jaune-vif shadow-xs">
                <BookOpen size={16} />
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="font-display-title font-bold text-sm tracking-wider text-white">
                Les Éditions Phénix
              </span>
              <span className="text-xs text-jaune-vif font-serif italic tracking-wide">
                — « La Maison du Succès »
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-ivoire border border-white/15">
              <Sparkles size={12} className="text-jaune-vif" />
              Excellence & Savoir
            </span>
            <Link 
              to="/catalogue"
              className="inline-flex items-center gap-1 text-jaune-vif hover:text-white font-semibold transition-colors"
            >
              <span>Consulter nos titres</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <section 
      id="brand-banner-main"
      aria-label="Bannière d'honneur Les Éditions Phénix"
      className={cn(
        "relative overflow-hidden w-full bg-gradient-to-br from-bleu-dark via-[#0e2444] to-bordeaux-dark text-white border-y-2 border-jaune/40 shadow-xl",
        className
      )}
    >
      {/* Decorative architectural background and ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,179,8,0.18),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-bleu-royal/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-bordeaux/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* Decorative fine geometric golden fillets */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-jaune-vif to-transparent opacity-75"></div>
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-jaune-vif to-transparent opacity-75"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          
          {/* Logo & Brand Identity */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-5">
            {/* Logo Emblem or Uploaded Image */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-jaune via-bleu-light to-bordeaux opacity-70 blur-xs group-hover:opacity-100 transition duration-500"></div>
              
              {logoUrl ? (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-2.5 shadow-2xl flex items-center justify-center border border-jaune/50">
                  <img 
                    src={logoUrl} 
                    alt="Logo Les Éditions Phénix" 
                    className="w-full h-full object-contain filter drop-shadow-md transform group-hover:scale-105 transition duration-300"
                  />
                </div>
              ) : (
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#0c1a2f] via-bleu-dark to-[#550c19] border-2 border-jaune/70 shadow-2xl flex flex-col items-center justify-center text-center p-2 group-hover:border-jaune transition duration-300">
                  <div className="w-12 h-12 rounded-xl bg-bleu/60 border border-jaune/40 flex items-center justify-center mb-1.5 shadow-inner">
                    <BookOpen size={26} className="text-jaune-vif" />
                  </div>
                  <span className="font-display-title text-[9px] uppercase tracking-widest text-jaune-vif font-bold">
                    Éditions Phénix
                  </span>
                </div>
              )}
            </div>

            {/* Brand Titles & Slogan */}
            <div className="space-y-2 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bleu-dark/80 border border-jaune/35 text-jaune-vif text-xs font-semibold tracking-wider uppercase shadow-xs">
                <Star size={12} className="fill-jaune text-jaune" />
                <span>Maison d'Édition Agréée</span>
                <span className="text-white/40">•</span>
                <span className="text-ivoire font-normal lowercase tracking-normal text-[11px]">excellence pédagogique</span>
              </div>

              {/* Main Brand Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display-title font-extrabold tracking-wide text-white drop-shadow-sm">
                Les Éditions <span className="text-jaune-vif drop-shadow-sm">Phénix</span>
              </h2>

              {/* Official Slogan */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="h-[2px] w-6 bg-gradient-to-r from-jaune to-transparent"></span>
                <p className="font-serif italic text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-jaune-light drop-shadow-xs">
                  « La Maison du Succès »
                </p>
                <span className="h-[2px] w-6 bg-gradient-to-l from-jaune to-transparent"></span>
              </div>

              <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed font-light">
                Partenaire privilégié des établissements scolaires, des enseignants et des élèves pour la réussite aux examens et concours.
              </p>
            </div>
          </div>

          {/* Action Hub / Key Highlights */}
          <div className="flex flex-col sm:flex-row lg:flex-col shrink-0 items-center sm:items-stretch gap-3 w-full sm:w-auto">
            {/* Quick stats / guarantees */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-jaune-vif text-xs font-bold mb-0.5">
                  <ShieldCheck size={14} />
                  <span>100% Conforme</span>
                </div>
                <div className="text-[11px] text-gray-300">Programmes officiels</div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-3.5 py-2 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-jaune-vif text-xs font-bold mb-0.5">
                  <Award size={14} />
                  <span>Réussite</span>
                </div>
                <div className="text-[11px] text-gray-300">Collèges & Lycées</div>
              </div>
            </div>

            {/* CTAs with Yellow & Blue accents */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
              <Link
                to="/catalogue"
                className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-jaune to-jaune-dark hover:from-jaune-light hover:to-jaune text-anthracite font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Catalogue</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/collections"
                className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-bleu-royal hover:bg-bleu-light text-white font-bold text-xs uppercase tracking-wider border border-white/20 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Collections</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
