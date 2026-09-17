import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from '../components/Carousel';
import { BrandBanner } from '../components/BrandBanner';
import { CollectionBookCarousel } from '../components/CollectionBookCarousel';
import { ArrowRight, BookOpen, Download, Users, Sparkles, CheckCircle2, GraduationCap, Award, ShieldCheck, ShoppingBag, PhoneCall, Layers, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Collection, Ouvrage } from '../types';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useCart } from '../context/CartContext';
import { FALLBACK_COLLECTIONS, FALLBACK_OUVRAGES } from '../fallbackData';
import { sortCollectionsCanonical } from '../lib/collectionOrder';

export function Home() {
  const [collections, setCollections] = useState<Collection[]>(FALLBACK_COLLECTIONS);
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>(FALLBACK_OUVRAGES);
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+33600000000');
  const [texteAccueil, setTexteAccueil] = useState("Bienvenue aux Éditions Phénix. Découvrez nos collections d'ouvrages pédagogiques et littéraires, conçus pour inspirer, éduquer et accompagner chaque esprit curieux.");
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [colRes, ouvRes, paramRes] = await Promise.all([
          supabase.from('collections').select('*').eq('publie', true).order('ordre'),
          supabase.from('ouvrages').select('*, collections(nom)').eq('disponibilite', true).order('created_at', { ascending: false }),
          supabase.from('parametres_site').select('telephone_whatsapp, texte_accueil').limit(1)
        ]);

        if (colRes.data) setCollections(sortCollectionsCanonical(colRes.data));
        if (ouvRes.data) setOuvrages(ouvRes.data);
        if (paramRes.data && paramRes.data[0]) {
          setWhatsappNumber(paramRes.data[0].telephone_whatsapp);
          if (paramRes.data[0].texte_accueil) {
            setTexteAccueil(paramRes.data[0].texte_accueil);
          }
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* Official Brand Banner: Logo, Name & Slogan "La Maison du Succès" */}
      <BrandBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ivoire-warm/80 via-ivoire to-white pt-10 pb-16 border-b border-gray-200/60">
        {/* Subtle background ambient blur with blue and gold/yellow hints */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-r from-bleu/10 via-jaune/10 to-bordeaux/10 blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Prestige Eyebrow Badge with Blue & Yellow Accents */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-bleu/20 shadow-2xs mb-6 text-bleu-dark">
              <span className="w-2 h-2 rounded-full bg-jaune-vif animate-ping"></span>
              <span className="font-display-title text-xs font-semibold tracking-widest text-anthracite">
                Les Éditions Phénix • <span className="text-bleu font-bold">La Maison du Succès</span>
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-anthracite mb-6 tracking-tight leading-[1.15]">
              Renaître par le{' '}
              <span className="italic text-bordeaux relative inline-block">
                Savoir
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-jaune via-dore-light to-transparent rounded-full"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-anthracite-light leading-relaxed mb-8 max-w-2xl mx-auto whitespace-pre-line font-normal">
              {texteAccueil}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link 
                to="/catalogue" 
                className="w-full sm:w-auto px-6 py-3.5 bg-bordeaux text-white rounded-xl font-semibold hover:bg-bordeaux-light transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Découvrir le catalogue</span>
                <ArrowRight size={18} />
              </Link>
              <Link 
                to="/collections" 
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-anthracite rounded-xl font-semibold hover:bg-ivoire-warm border border-gray-300 hover:border-gray-400 transition-all flex items-center justify-center gap-2 shadow-2xs group"
              >
                <Layers size={18} className="text-bleu group-hover:text-bleu-light transition-colors" />
                <span>Nos Collections</span>
              </Link>
              <Link 
                to="/ressources" 
                className="w-full sm:w-auto px-6 py-3.5 bg-ivoire-warm text-anthracite rounded-xl font-semibold hover:bg-white border border-gray-300/80 hover:border-gray-400 transition-all flex items-center justify-center gap-2 shadow-2xs group"
              >
                <BookOpen size={18} className="text-jaune-dark group-hover:text-jaune transition-colors" />
                <span>Ressources Pédagogiques</span>
              </Link>
            </div>
          </div>

          {/* Carousel Showcase */}
          <div className="mt-8">
            {loading ? (
              <div className="w-full h-[440px] md:h-[540px] bg-gray-200 animate-pulse rounded-2xl"></div>
            ) : (
              <Carousel collections={collections} />
            )}
          </div>

          {/* Trust Highlights Strip with Yellow & Blue touches */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-gray-200/80">
            <div className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-100 shadow-2xs hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-bleu-subtle text-bleu-royal flex items-center justify-center shrink-0 border border-bleu/20">
                <Award size={20} />
              </div>
              <div>
                <p className="font-bold text-anthracite text-sm">Qualité Certifiée</p>
                <p className="text-xs text-anthracite-muted">Ouvrages rigoureusement relus</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-amber-100 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-jaune-subtle text-jaune-dark flex items-center justify-center shrink-0 border border-jaune/30">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="font-bold text-anthracite text-sm">Programmes Scolaires</p>
                <p className="text-xs text-anthracite-muted">Conformes aux référentiels</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-100 shadow-2xs hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-bleu-subtle text-bleu flex items-center justify-center shrink-0 border border-bleu/20">
                <Download size={20} />
              </div>
              <div>
                <p className="font-bold text-anthracite text-sm">Fiches & Corrigés</p>
                <p className="text-xs text-anthracite-muted">Supports téléchargeables</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-amber-100 shadow-2xs hover:border-amber-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-jaune-subtle text-jaune-dark flex items-center justify-center shrink-0 border border-jaune/30">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-anthracite text-sm">La Maison du Succès</p>
                <p className="text-xs text-anthracite-muted">Accompagnement & Suivi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Editorial Section */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-display-title text-xs font-semibold text-dore uppercase tracking-widest block mb-2">
              Notre Vocation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-anthracite mb-4">
              L'Excellence au Service de l'Apprentissage
            </h2>
            <p className="text-anthracite-muted text-sm sm:text-base">
              Une démarche éditoriale pensée pour les élèves, les professeurs et les passionnés de lecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-ivoire border border-gray-200/80 hover:border-bordeaux/30 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-bordeaux text-white rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <BookOpen size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-anthracite mb-3">Catalogue Riche & Diversifié</h3>
              <p className="text-anthracite-light text-sm leading-relaxed mb-4">
                Des manuels scolaires rigoureux, des œuvres littéraires incontournables et des recueils pour cultiver la passion des mots dès le plus jeune âge.
              </p>
              <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-xs font-bold text-bordeaux hover:text-dore uppercase tracking-wider transition-colors">
                Explorer le catalogue <ArrowRight size={14} />
              </Link>
            </div>

            <div className="group p-8 rounded-2xl bg-ivoire border border-gray-200/80 hover:border-dore/50 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-dore text-anthracite rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <Download size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-anthracite mb-3">Ressources Numériques Offertes</h3>
              <p className="text-anthracite-light text-sm leading-relaxed mb-4">
                Prolongez l'apprentissage avec des fiches de synthèse, exercices guidés et corrigés détaillés accessibles en ligne gratuitement.
              </p>
              <Link to="/ressources" className="inline-flex items-center gap-1.5 text-xs font-bold text-bordeaux hover:text-dore uppercase tracking-wider transition-colors">
                Télécharger les supports <ArrowRight size={14} />
              </Link>
            </div>

            <div className="group p-8 rounded-2xl bg-ivoire border border-gray-200/80 hover:border-bordeaux/30 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-anthracite text-dore rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <Users size={26} />
              </div>
              <h3 className="font-serif text-xl font-bold text-anthracite mb-3">Partenariats Établissements</h3>
              <p className="text-anthracite-light text-sm leading-relaxed mb-4">
                Un accompagnement direct pour les directions d'écoles, collèges, lycées et librairies partenaires pour des commandes groupées au meilleur tarif.
              </p>
              <Link to="/partenaires" className="inline-flex items-center gap-1.5 text-xs font-bold text-bordeaux hover:text-dore uppercase tracking-wider transition-colors">
                Voir nos partenaires <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nouveautés & Ouvrages Phares : 7 Carrousels par Collection */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bleu-subtle border border-bleu/20 text-bleu text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-jaune-vif animate-pulse"></span>
              <span>Nos 7 Collections Éditoriales</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-anthracite mb-2">
              Nouveautés & Ouvrages Phares
            </h2>
            <p className="text-anthracite-muted text-sm max-w-2xl">
              Parcourez les nouveautés et les manuels de référence classés par collection, de l'histoire-géographie aux langues vivantes et à la préparation aux examens.
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-bordeaux via-jaune-vif to-bleu rounded-full mt-3"></div>
          </div>
          <Link 
            to="/catalogue" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-bordeaux hover:text-bleu transition-colors group self-start sm:self-auto"
          >
            <span>Voir l'intégralité du catalogue</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {collections.map((col, idx) => {
              const colOuvrages = ouvrages.filter(o => o.collection_id === col.id);
              return (
                <CollectionBookCarousel
                  key={col.id}
                  collection={col}
                  ouvrages={colOuvrages}
                  index={idx}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Institutional / School Partner Callout Banner with Blue & Yellow Palette */}
      <section className="bg-gradient-to-br from-bleu-dark via-[#0d223d] to-bordeaux-dark text-white py-16 px-4 border-t-2 border-jaune/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bleu-royal/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bleu-royal/40 text-jaune-vif text-xs font-semibold uppercase tracking-wider mb-4 border border-jaune/30 shadow-xs">
                <GraduationCap size={15} className="text-jaune-vif" />
                <span>Espace Établissements & Enseignants • La Maison du Succès</span>
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-white">
                Vous préparez vos listes de rentrée ou recherchez des spécimens ?
              </h2>
              <p className="text-gray-200 text-base max-w-2xl leading-relaxed">
                Les Éditions Phénix accompagnent les collèges, lycées et universités. Obtenez vos devis sur mesure, découvrez nos spécimens pédagogiques et profitez de notre service de livraison directe.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <WhatsAppButton 
                phoneNumber={whatsappNumber} 
                variant="solid" 
                label="Demander un devis WhatsApp" 
                className="w-full justify-center bg-jaune hover:bg-jaune-light text-anthracite font-bold shadow-lg"
              />
              <Link 
                to="/partenaires" 
                className="w-full text-center px-6 py-3 rounded-lg border border-jaune/40 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
              >
                Découvrir nos établissements partenaires
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Quick Action */}
      <WhatsAppButton 
        phoneNumber={whatsappNumber} 
        variant="floating" 
      />
    </div>
  );
}

