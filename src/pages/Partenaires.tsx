import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Partenaire } from '../types';
import { MapPin, Phone, Building2, Search, GraduationCap, Handshake, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export function Partenaires() {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPartenaires() {
      try {
        const { data, error } = await supabase
          .from('partenaires')
          .select('*')
          .order('nom', { ascending: true });

        if (error) throw error;
        setPartenaires(data || []);
      } catch (err) {
        console.error('Error fetching partenaires:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPartenaires();
  }, []);

  const filteredPartenaires = partenaires.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    (p.adresse && p.adresse.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20">
      <SEOHead 
        title="Partenaires & Librairies – Réseau Éducatif Côte d'Ivoire"
        description="Consultez la liste des lycées, collèges et librairies en Côte d'Ivoire qui diffusent les manuels et annales des Éditions Phénix."
        keywords="librairies abidjan, établissements partenaires éditions phénix, distributeurs manuels scolaires côte d'ivoire"
      />

      {/* Editorial Header Section with Blue & Yellow Accents */}
      <section className="relative bg-gradient-to-r from-bleu-dark via-bordeaux to-bleu-dark border-b-2 border-jaune/40 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 paper-texture pointer-events-none"></div>
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-jaune/15 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-bleu-royal/20 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-bleu-dark/70 border border-jaune/40 text-jaune-vif text-xs font-semibold uppercase tracking-widest mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-jaune-vif animate-pulse"></span>
            <span>Réseau Éducatif • La Maison du Succès</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Nos Établissements Partenaires
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto text-ivoire/90 leading-relaxed font-light">
            Découvrez les lycées, collèges, écoles d'excellence et librairies partenaires qui prescrivent et diffusent les ouvrages des Éditions Phénix.
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
              placeholder="Rechercher un établissement ou une ville..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivoire-warm/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux text-sm"
            />
          </div>

          <div className="text-xs text-anthracite-muted font-medium">
            <span className="font-bold text-anthracite">{filteredPartenaires.length}</span> partenaire{filteredPartenaires.length > 1 ? 's' : ''} référencé{filteredPartenaires.length > 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : filteredPartenaires.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="font-serif text-xl font-bold text-anthracite mb-2">Aucun partenaire trouvé</h2>
            <p className="text-anthracite-muted text-sm max-w-md mx-auto mb-6">
              {search ? `Aucun résultat pour "${search}".` : "La liste des établissements partenaires sera prochainement enrichie."}
            </p>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="px-5 py-2.5 bg-bordeaux text-white rounded-xl text-sm font-semibold hover:bg-bordeaux-light transition-colors"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartenaires.map((partenaire) => (
              <div 
                key={partenaire.id} 
                className="group bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs hover:shadow-md hover:border-bordeaux/30 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-ivoire-warm border border-dore/20 text-bordeaux flex items-center justify-center shrink-0 group-hover:bg-bordeaux group-hover:text-white transition-colors">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-anthracite group-hover:text-bordeaux transition-colors leading-snug">
                        {partenaire.nom}
                      </h3>
                      <span className="text-[11px] font-semibold text-dore-dark uppercase tracking-wider">
                        Établissement partenaire
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 my-4 pt-4 border-t border-gray-100 text-sm">
                    {partenaire.adresse && (
                      <div className="flex items-start gap-2.5 text-anthracite-muted">
                        <MapPin size={16} className="text-bordeaux mt-0.5 shrink-0" />
                        <span className="text-xs leading-relaxed">{partenaire.adresse}</span>
                      </div>
                    )}
                    {partenaire.contact && (
                      <div className="flex items-center gap-2.5 text-anthracite-muted">
                        <Phone size={16} className="text-dore-dark shrink-0" />
                        <a 
                          href={`tel:${partenaire.contact.replace(/\s+/g, '')}`} 
                          className="text-xs font-medium hover:text-bordeaux transition-colors"
                        >
                          {partenaire.contact}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-anthracite-muted">
                  <span className="text-[11px] italic">Partenaire agréé</span>
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Institutional CTA card */}
        <div className="mt-16 bg-gradient-to-r from-anthracite to-anthracite-light text-white rounded-2xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-dore font-bold block mb-2">
              Coopération Éducative
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
              Vous êtes un établissement ou une librairie ?
            </h3>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              Rejoignez notre réseau de partenaires pour bénéficier de spécimens enseignants, de remises directes sur les commandes institutionnelles et d'un accompagnement pédagogique personnalisé.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-dore text-anthracite font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-dore-light transition-colors shadow-md"
            >
              <span>Demander un partenariat</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
