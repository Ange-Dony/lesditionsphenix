import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Ressource, Collection, Ouvrage } from '../types';
import { Search, Filter, FileText, Download, ExternalLink, FileSpreadsheet, File } from 'lucide-react';
import { cn } from '../lib/utils';

export function Ressources() {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [texteRessources, setTexteRessources] = useState("Accédez à nos fiches de cours, corrigés et documents complémentaires. Filtrez par niveau, matière ou type pour trouver rapidement ce dont vous avez besoin.");

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMatiere, setSelectedMatiere] = useState('all');
  const [selectedNiveau, setSelectedNiveau] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [resData, colData, ouvData, paramRes] = await Promise.all([
          supabase.from('ressources').select('*, ouvrages(titre), collections(nom)').eq('publie', true).order('created_at', { ascending: false }),
          supabase.from('collections').select('*').eq('publie', true),
          supabase.from('ouvrages').select('id, titre').eq('disponibilite', true),
          supabase.from('parametres_site').select('texte_ressources').limit(1)
        ]);

        if (resData.data) setRessources(resData.data);
        if (colData.data) setCollections(colData.data);
        if (ouvData.data) setOuvrages(ouvData.data);
        if (paramRes.data && paramRes.data[0] && paramRes.data[0].texte_ressources) {
          setTexteRessources(paramRes.data[0].texte_ressources);
        }
      } catch (error) {
        console.error("Error fetching ressources:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Extract unique values for filters
  const types = Array.from(new Set(ressources.map(r => r.type).filter(Boolean)));
  const matieres = Array.from(new Set(ressources.map(r => r.matiere).filter(Boolean)));
  const niveaux = Array.from(new Set(ressources.map(r => r.niveau).filter(Boolean)));

  const filteredRessources = ressources.filter(res => {
    const matchesSearch = res.titre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || res.type === selectedType;
    const matchesMatiere = selectedMatiere === 'all' || res.matiere === selectedMatiere;
    const matchesNiveau = selectedNiveau === 'all' || res.niveau === selectedNiveau;
    return matchesSearch && matchesType && matchesMatiere && matchesNiveau;
  });

  const getIconForFormat = (format: string | null) => {
    const f = (format || '').toLowerCase();
    if (f.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    if (f.includes('doc') || f.includes('word')) return <FileText size={24} className="text-blue-600" />;
    if (f.includes('xls') || f.includes('excel')) return <FileSpreadsheet size={24} className="text-green-600" />;
    return <File size={24} className="text-gray-500" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header with Blue & Yellow Accents */}
      <div className="mb-10 pb-8 border-b border-gray-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bleu-subtle border border-bleu/20 text-bleu text-xs font-semibold uppercase tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-jaune-vif animate-pulse"></span>
          <span>Espace Pédagogique • La Maison du Succès</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-anthracite mb-3">
          Ressources & Documents Complémentaires
        </h1>
        <p className="text-anthracite-muted max-w-2xl text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {texteRessources}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une ressource..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivoire-warm/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux text-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivoire-warm/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux appearance-none text-sm text-anthracite cursor-pointer"
            >
              <option value="all">Tous les types de document</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivoire-warm/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux appearance-none text-sm text-anthracite cursor-pointer"
            >
              <option value="all">Toutes les classes / niveaux</option>
              {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-ivoire-warm/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bordeaux/30 focus:border-bordeaux appearance-none text-sm text-anthracite cursor-pointer"
            >
              <option value="all">Toutes les matières</option>
              {matieres.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredRessources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-serif text-xl font-bold text-anthracite mb-2">Aucune ressource trouvée</h3>
          <p className="text-anthracite-muted text-sm max-w-md mx-auto mb-6">Modifiez vos critères de recherche pour trouver vos documents pédagogiques.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedType('all'); setSelectedMatiere('all'); setSelectedNiveau('all');}}
            className="px-5 py-2.5 bg-bordeaux text-white rounded-xl text-sm font-semibold hover:bg-bordeaux-light transition-colors shadow-xs"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRessources.map((ressource) => (
            <div 
              key={ressource.id} 
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-bordeaux/30 transition-all duration-200 gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-ivoire-warm rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                  {getIconForFormat(ressource.format)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 bg-bordeaux/10 text-bordeaux text-[11px] font-bold rounded-full uppercase tracking-wider">
                      {ressource.type}
                    </span>
                    {(ressource.niveau || ressource.matiere) && (
                      <span className="text-xs text-anthracite-muted font-medium">
                        {ressource.niveau} {ressource.niveau && ressource.matiere && '•'} {ressource.matiere}
                      </span>
                    )}
                    {ressource.format && (
                      <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {ressource.format}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-anthracite group-hover:text-bordeaux transition-colors mb-1">
                    {ressource.titre}
                  </h3>
                  {ressource.ouvrages?.titre && (
                    <p className="text-xs text-anthracite-muted flex items-center gap-1">
                      <span>Lié à l'ouvrage :</span>
                      <span className="italic font-medium text-anthracite">{ressource.ouvrages.titre}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
                <a 
                  href={ressource.google_drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-bleu hover:bg-bleu-royal text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md group-hover:bg-bleu-royal"
                >
                  <Download size={16} className="text-jaune-vif" />
                  <span>Consulter / Télécharger</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
