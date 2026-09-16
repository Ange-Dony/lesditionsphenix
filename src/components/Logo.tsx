import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light' | 'white';
}

export function Logo({ className, showSlogan = true, size = 'md', variant = 'default' }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Error fetching logo:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogo();
  }, []);

  const isWhite = variant === 'white';

  const iconSizes = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-14 h-14"
  };

  const bookSizes = {
    sm: 18,
    md: 22,
    lg: 28
  };

  return (
    <Link to="/" className={cn("flex items-center gap-3 group", className)}>
      {!loading && logoUrl ? (
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl} 
            alt="Les Éditions Phénix - La Maison du Succès" 
            className={cn(
              "w-auto object-contain transition-transform duration-300 group-hover:scale-105",
              size === 'sm' ? 'h-9' : size === 'lg' ? 'h-16' : 'h-12'
            )} 
          />
          {showSlogan && (
            <div className="hidden sm:flex flex-col">
              <span className={cn(
                "font-display-title font-bold leading-tight tracking-wider",
                isWhite ? "text-white" : "text-bordeaux",
                size === 'sm' ? "text-xs" : size === 'lg' ? "text-base" : "text-[14px]"
              )}>
                Les Éditions Phénix
              </span>
              <span className={cn(
                "text-[10px] tracking-wider font-semibold italic flex items-center gap-1",
                isWhite ? "text-jaune-vif" : "text-bleu"
              )}>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-jaune"></span>
                La Maison du Succès
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className={cn(
            "relative rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 overflow-hidden",
            iconSizes[size],
            isWhite 
              ? "bg-gradient-to-br from-bleu-dark via-bleu to-bordeaux-dark text-white border border-jaune/40 shadow-bleu-dark/40" 
              : "bg-gradient-to-br from-bordeaux via-bordeaux-dark to-bleu text-ivoire border border-dore/40 shadow-bordeaux/20"
          )}>
            {/* Subtle phoenix sun ray background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-jaune/25 via-transparent to-transparent"></div>
            <BookOpen size={bookSizes[size]} className="text-jaune-vif relative z-10 filter drop-shadow-xs" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-jaune-vif border-2 border-bleu-dark shadow-xs z-20"></div>
          </div>

          <div className="flex flex-col">
            <span className={cn(
              "font-display-title font-bold leading-tight tracking-wider transition-colors",
              isWhite ? "text-white" : "text-bordeaux group-hover:text-bleu",
              size === 'sm' ? "text-xs" : size === 'lg' ? "text-lg" : "text-[15px]"
            )}>
              Les Éditions
            </span>
            <span className={cn(
              "font-display-title font-extrabold leading-none tracking-widest",
              isWhite ? "text-jaune-vif" : "text-dore",
              size === 'sm' ? "text-sm" : size === 'lg' ? "text-xl" : "text-[17px]"
            )}>
              Phénix
            </span>
            {showSlogan && (
              <span className={cn(
                "text-[9.5px] uppercase tracking-[0.16em] font-bold mt-0.5 flex items-center gap-1",
                isWhite ? "text-amber-200" : "text-bleu"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-jaune inline-block"></span>
                La Maison du Succès
              </span>
            )}
          </div>
        </>
      )}
    </Link>
  );
}
