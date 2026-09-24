export type Role = 'admin' | 'user';

export interface Profile {
  id: string;
  role: Role;
  created_at: string;
}

export interface Matiere {
  id: string;
  nom: string;
  created_at: string;
}

export interface Collection {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  ordre: number;
  publie: boolean;
  created_at: string;
}

export interface Ouvrage {
  id: string;
  titre: string;
  auteur: string;
  collection_id: string | null;
  niveau: string | null;
  matiere: string | null;
  prix: number;
  afficher_prix: boolean;
  description: string | null;
  disponibilite: boolean;
  couverture_url: string | null;
  extrait_url: string | null;
  isbn?: string | null;
  nombre_pages?: number | null;
  created_at: string;
  collections?: Collection; // joined relation
  ressources?: Ressource[];
}

export interface Ressource {
  id: string;
  titre: string;
  type: string;
  niveau: string | null;
  matiere: string | null;
  ouvrage_id: string | null;
  collection_id: string | null;
  format: string | null;
  google_drive_url: string;
  publie: boolean;
  mot_de_passe?: string | null;
  created_at: string;
  ouvrages?: Ouvrage;
  collections?: Collection;
}

export function getResourcePassword(ressource?: Partial<Ressource> | null): string | null {
  if (!ressource) return null;
  if (ressource.mot_de_passe && ressource.mot_de_passe.trim() !== '') {
    return ressource.mot_de_passe.trim();
  }
  if (ressource.format && ressource.format.includes('|pwd:')) {
    const parts = ressource.format.split('|pwd:');
    if (parts[1] && parts[1].trim() !== '') {
      return parts[1].trim();
    }
  }
  return null;
}

export function cleanResourceFormat(format?: string | null): string {
  if (!format) return 'PDF';
  return format.split('|pwd:')[0] || 'PDF';
}

export interface ParametresSite {
  id: string;
  telephone_whatsapp: string;
  coordonnees: string | null;
  infos_generales: string | null;
  texte_accueil: string | null;
  texte_apropos: string | null;
  texte_ressources: string | null;
  logo_url: string | null;
  updated_at: string;
}

export interface Partenaire {
  id: string;
  nom: string;
  adresse: string | null;
  contact: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      collections: { Row: Collection; Insert: Partial<Collection>; Update: Partial<Collection> };
      ouvrages: { Row: Ouvrage; Insert: Partial<Ouvrage>; Update: Partial<Ouvrage> };
      ressources: { Row: Ressource; Insert: Partial<Ressource>; Update: Partial<Ressource> };
      parametres_site: { Row: ParametresSite; Insert: Partial<ParametresSite>; Update: Partial<ParametresSite> };
      partenaires: { Row: Partenaire; Insert: Partial<Partenaire>; Update: Partial<Partenaire> };
    };
  };
}
