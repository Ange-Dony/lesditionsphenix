import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { BookOpen, ShieldCheck, MapPin, Mail, Download } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-anthracite text-gray-300 pt-16 pb-12 mt-auto border-t-2 border-jaune/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <Logo variant="white" className="mb-2" />
            <p className="max-w-sm text-gray-300 text-sm leading-relaxed">
              Maison d'édition et de diffusion pédagogique de référence. « La Maison du Succès » accompagne les générations d'apprenants et d'enseignants vers l'excellence scolaire et académique.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wider">
              <span className="text-jaune-vif">Rigueur</span>
              <span className="text-white/30">•</span>
              <span className="text-blue-300">Conformité</span>
              <span className="text-white/30">•</span>
              <span className="text-jaune-vif">Succès Garanti</span>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="font-serif font-bold text-white text-base tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-jaune"></span>
              Explorer
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-gray-400 hover:text-jaune-vif transition-colors">Accueil</Link></li>
              <li><Link to="/catalogue" className="text-gray-400 hover:text-jaune-vif transition-colors">Catalogue complet</Link></li>
              <li><Link to="/collections" className="text-gray-400 hover:text-jaune-vif transition-colors">Nos Collections</Link></li>
              <li><Link to="/ressources" className="text-gray-400 hover:text-jaune-vif transition-colors">Ressources pédagogiques</Link></li>
              <li><Link to="/partenaires" className="text-gray-400 hover:text-jaune-vif transition-colors">Nos Établissements Partenaires</Link></li>
              <li><Link to="/a-propos" className="text-gray-400 hover:text-jaune-vif transition-colors">À Propos des Éditions Phénix</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-4">
            <h3 className="font-serif font-bold text-white text-base tracking-wide mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Informations & Légal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="text-gray-400 hover:text-jaune-vif transition-colors">Contactez nos conseillers</Link></li>
              <li><Link to="/mentions-legales" className="text-gray-400 hover:text-jaune-vif transition-colors">Mentions légales</Link></li>
              <li><Link to="/cgv" className="text-gray-400 hover:text-jaune-vif transition-colors">Conditions Générales de Vente</Link></li>
              <li><Link to="/confidentialite" className="text-gray-400 hover:text-jaune-vif transition-colors">Protection des données</Link></li>
              <li className="pt-2 flex flex-col gap-1.5">
                <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs text-jaune hover:text-jaune-vif transition-colors font-mono">
                  <ShieldCheck size={14} /> Espace Administration
                </Link>
                <a 
                  href="/editions-phenix-source.zip"
                  download="editions-phenix-source.zip"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors font-mono"
                  title="Télécharger l'archive ZIP du code source"
                >
                  <Download size={13} className="text-jaune-vif" /> Télécharger le projet (ZIP)
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-14 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>&copy; {currentYear} Les Éditions Phénix. Tous droits réservés. Reproduction interdite sans autorisation.</p>
          <div className="flex items-center gap-6">
            <span>Conçu avec rigueur typographique</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
