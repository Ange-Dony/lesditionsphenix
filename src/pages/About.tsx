import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ParametresSite } from '../types';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { MapPin, Phone, Mail, BookOpen, Award, CheckCircle2, HeartHandshake, Sparkles } from 'lucide-react';

export function About() {
  const [params, setParams] = useState<ParametresSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('parametres_site').select('*').limit(1);
      if (data && data[0]) {
        setParams(data[0]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full pb-20">
      {/* Hero with Blue & Yellow Accents */}
      <div className="relative bg-gradient-to-r from-bleu-dark via-bordeaux to-bleu-dark border-b-2 border-jaune/40 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 paper-texture pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-jaune/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-bleu-royal/20 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 border border-jaune/40 backdrop-blur flex items-center justify-center text-jaune-vif shadow-md">
            <BookOpen size={32} />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-bleu-dark/70 border border-jaune/40 text-jaune-vif text-xs font-semibold uppercase tracking-widest mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-jaune-vif animate-pulse"></span>
            <span>Les Éditions Phénix • « La Maison du Succès »</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            À Propos des Éditions Phénix
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto text-ivoire/90 leading-relaxed font-light">
            Renaître par le savoir. « La Maison du Succès » conçoit et diffuse des manuels scolaires et œuvres littéraires d'excellence qui accompagnent la réussite de chaque apprenant.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Notre Histoire & Valeurs */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="font-display-title text-xs font-semibold text-dore uppercase tracking-widest block mb-2">
                Origines & Engagement
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-anthracite mb-6">
                Notre Histoire & Notre Vision
              </h2>
              
              <div className="text-anthracite-light leading-relaxed text-base space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line leading-relaxed text-justify">
                    {params?.texte_apropos || 
                      "Les Éditions Phénix sont nées d'une conviction profonde : l'éducation et la transmission du livre constituent le levier le plus puissant d'émancipation et de développement.\n\nNous sélectionnons rigoureusement nos auteurs, enseignants chevronnés, inspecteurs pédagogiques et écrivains, pour garantir l'exactitude des programmes officiels et la haute tenue littéraire de nos collections. De l'école primaire au secondaire supérieur, nos publications sont pensées pour allier clarté didactique et rigueur intellectuelle."
                    }
                  </div>
                )}
              </div>
            </div>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200/80">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 shadow-2xs hover:border-blue-300 transition-colors">
                <Award className="text-bleu-royal mb-2" size={24} />
                <h3 className="font-serif font-bold text-sm text-anthracite mb-1">Rigueur & Qualité</h3>
                <p className="text-xs text-anthracite-muted leading-relaxed">Conformité stricte aux programmes éducatifs nationaux.</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 shadow-2xs hover:border-amber-300 transition-colors">
                <Sparkles className="text-jaune-dark mb-2" size={24} />
                <h3 className="font-serif font-bold text-sm text-anthracite mb-1">Pédagogie du Succès</h3>
                <p className="text-xs text-anthracite-muted leading-relaxed">Fiches de révision, exercices guidés et ressources numériques.</p>
              </div>

              <div className="p-4 rounded-xl bg-bordeaux-subtle/50 border border-bordeaux/20 shadow-2xs hover:border-bordeaux/40 transition-colors">
                <HeartHandshake className="text-bordeaux mb-2" size={24} />
                <h3 className="font-serif font-bold text-sm text-anthracite mb-1">Partenariat & Écoute</h3>
                <p className="text-xs text-anthracite-muted leading-relaxed">À l'écoute constante des enseignants et des établissements.</p>
              </div>
            </div>
          </div>

          {/* Contact Panel */}
          <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-2xl shadow-xs border border-gray-200/80">
            <span className="font-display-title text-xs font-semibold text-dore uppercase tracking-widest block mb-1">
              Coordonnées
            </span>
            <h2 className="font-serif text-2xl font-bold text-anthracite mb-6">Nous Contacter</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-ivoire-warm/40 border border-gray-100">
                <div className="p-2.5 bg-bordeaux/10 text-bordeaux rounded-xl shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-anthracite mb-1">Téléphone & WhatsApp</h3>
                  <p className="text-sm font-medium text-anthracite-light mb-3">{params?.telephone_whatsapp || "Contact direct disponible"}</p>
                  {params?.telephone_whatsapp && (
                    <WhatsAppButton 
                      phoneNumber={params.telephone_whatsapp} 
                      variant="outline" 
                      label="Échanger sur WhatsApp"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-ivoire-warm/40 border border-gray-100">
                <div className="p-2.5 bg-dore/10 text-dore-dark rounded-xl shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-anthracite mb-1">Siège & Bureaux</h3>
                  <p className="text-sm text-anthracite-light whitespace-pre-line leading-relaxed">
                    {params?.coordonnees || "Siège social des Éditions Phénix"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-ivoire-warm/40 border border-gray-100">
                <div className="p-2.5 bg-gray-100 text-anthracite rounded-xl shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-anthracite mb-1">Courriel Institutionnel</h3>
                  <a href="mailto:contact@editions-phenix.com" className="text-sm text-bordeaux hover:underline font-medium">
                    contact@editions-phenix.com
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
