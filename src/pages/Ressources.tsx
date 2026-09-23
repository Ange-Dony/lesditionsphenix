import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Ressource, Collection, Ouvrage, getResourcePassword, cleanResourceFormat } from '../types';
import { Search, Filter, FileText, Download, ExternalLink, FileSpreadsheet, File, Lock, Unlock, Key, Eye, EyeOff, X, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHead } from '../components/SEOHead';
import { PDFViewer } from '../components/PDFViewer';

export function Ressources() {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [texteRessources, setTexteRessources] = useState("Accédez à nos fiches de cours, corrigés et documents complémentaires. Filtrez par niveau, matière ou type pour trouver rapidement ce dont vous avez besoin.");
  const [whatsappNumber, setWhatsappNumber] = useState('+22501020304');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMatiere, setSelectedMatiere] = useState('all');
  const [selectedNiveau, setSelectedNiveau] = useState('all');

  // Password Unlock Modal State
  const [activePasswordRessource, setActivePasswordRessource] = useState<Ressource | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  // Direct On-Site Reader State
  const [viewingRessource, setViewingRessource] = useState<Ressource | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resData, colData, ouvData, paramRes] = await Promise.all([
          supabase.from('ressources').select('*, ouvrages(titre), collections(nom)').eq('publie', true).order('created_at', { ascending: false }),
          supabase.from('collections').select('*').eq('publie', true),
          supabase.from('ouvrages').select('id, titre').eq('disponibilite', true),
          supabase.from('parametres_site').select('texte_ressources, telephone_whatsapp').limit(1)
        ]);

        if (resData.data) setRessources(resData.data);
        if (colData.data) setCollections(colData.data);
        if (ouvData.data) setOuvrages(ouvData.data);
        if (paramRes.data && paramRes.data[0]) {
          if (paramRes.data[0].texte_ressources) setTexteRessources(paramRes.data[0].texte_ressources);
          if (paramRes.data[0].telephone_whatsapp) setWhatsappNumber(paramRes.data[0].telephone_whatsapp);
        }
      } catch (error) {
        console.error("Error fetching ressources:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleOpenRessource = (res: Ressource) => {
    const pwd = getResourcePassword(res);
    const isUnlocked = !pwd || unlockedIds.includes(res.id) || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`res_unlocked_${res.id}`) === 'true');

    if (isUnlocked) {
      setViewingRessource(res);
      return;
    }

    // Le document est verrouillé par mot de passe
    setActivePasswordRessource(res);
    setEnteredPassword('');
    setPasswordError(false);
    setShowPassword(false);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePasswordRessource) return;

    const expectedPwd = getResourcePassword(activePasswordRessource);
    if (expectedPwd && enteredPassword.trim().toLowerCase() === expectedPwd.trim().toLowerCase()) {
      sessionStorage.setItem(`res_unlocked_${activePasswordRessource.id}`, 'true');
      setUnlockedIds(prev => [...prev, activePasswordRessource.id]);
      
      const targetRes = activePasswordRessource;
      setActivePasswordRessource(null);
      setEnteredPassword('');
      setPasswordError(false);
      
      // Ouvrir immédiatement la liseuse intégrée
      setViewingRessource(targetRes);
    } else {
      setPasswordError(true);
    }
  };

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
    const f = (cleanResourceFormat(format) || '').toLowerCase();
    if (f.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    if (f.includes('doc') || f.includes('word')) return <FileText size={24} className="text-blue-600" />;
    if (f.includes('xls') || f.includes('excel')) return <FileSpreadsheet size={24} className="text-green-600" />;
    return <File size={24} className="text-gray-500" />;
  };

  const cleanWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead 
        title="Ressources Pédagogiques & Fiches de Révision – Manuels Ivoiriens"
        description="Téléchargez nos fiches de révision, extraits de manuels scolaires ivoiriens, corrigés d'annales BEPC & BAC, cours de construction graphique et citations philosophiques."
        keywords="ressources pédagogiques, fiches de révision côte d'ivoire, annales corrigées bepc bac, fiches citations philosophiques, construction graphique exercices, spécimens enseignants abidjan"
      />
      
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
          {filteredRessources.map((ressource) => {
            const hasPassword = !!getResourcePassword(ressource);
            const isUnlocked = unlockedIds.includes(ressource.id) || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(`res_unlocked_${ressource.id}`) === 'true');
            const displayFormat = cleanResourceFormat(ressource.format);

            return (
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

                      {/* Badge Sécurisé / Mot de passe */}
                      {hasPassword && !isUnlocked && (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Lock size={11} className="text-amber-700" />
                          Réservé Enseignants
                        </span>
                      )}

                      {hasPassword && isUnlocked && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Unlock size={11} className="text-emerald-600" />
                          Déverrouillé
                        </span>
                      )}

                      {(ressource.niveau || ressource.matiere) && (
                        <span className="text-xs text-anthracite-muted font-medium">
                          {ressource.niveau} {ressource.niveau && ressource.matiere && '•'} {ressource.matiere}
                        </span>
                      )}
                      {displayFormat && (
                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {displayFormat}
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
                
                {/* Action unique : Consulter le document sur le site */}
                <div className="shrink-0 mt-2 sm:mt-0 self-start sm:self-center">
                  <button 
                    onClick={() => handleOpenRessource(ressource)}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer",
                      hasPassword && !isUnlocked
                        ? "bg-amber-700 hover:bg-amber-800 text-white"
                        : "bg-bleu hover:bg-bleu-royal text-white"
                    )}
                    title="Consulter le document sur le site"
                  >
                    {hasPassword && !isUnlocked ? (
                      <>
                        <Lock size={15} className="text-jaune-vif" />
                        <span>Consulter • Code requis</span>
                      </>
                    ) : (
                      <>
                        <Eye size={16} className="text-jaune-vif" />
                        <span>Consulter</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LISEUSE DIRECTE SUR LE SITE (PDF VIEWER) */}
      {viewingRessource && (
        <PDFViewer 
          url={viewingRessource.google_drive_url}
          title={viewingRessource.titre}
          subtitle={`${viewingRessource.type}${viewingRessource.niveau ? ` • ${viewingRessource.niveau}` : ''}${viewingRessource.matiere ? ` • ${viewingRessource.matiere}` : ''}`}
          onClose={() => setViewingRessource(null)}
          canDownload={true}
          onDownload={() => window.open(viewingRessource.google_drive_url, '_blank')}
        />
      )}

      {/* MODAL DE DEVERROUILLAGE PAR MOT DE PASSE */}
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
                    Document Sécurisé
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
            <form onSubmit={handleUnlockSubmit} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Document ciblé :</p>
                <p className="text-sm font-semibold text-anthracite bg-gray-50 p-2.5 rounded-lg border border-gray-200/80">
                  {activePasswordRessource.titre}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Mot de passe d'accès <span className="text-bordeaux">*</span></span>
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
                  className="w-full py-2.5 px-4 bg-bordeaux hover:bg-bordeaux-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Unlock size={16} />
                  <span>Déverrouiller & Ouvrir le document</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setActivePasswordRessource(null); setPasswordError(false); }}
                  className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-xl transition-colors"
                >
                  Annuler
                </button>
              </div>

              {/* Assistance WhatsApp pour obtenir le mot de passe */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-[11px] text-gray-500 mb-2">
                  Vous êtes enseignant ou responsable d'établissement ?
                </p>
                <a 
                  href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
                    `Bonjour Les Éditions Phénix, je suis enseignant(e) et je souhaiterais obtenir le mot de passe d'accès pour la ressource : "${activePasswordRessource.titre}". Merci !`
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
