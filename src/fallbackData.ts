import { Collection, Ouvrage } from './types';

export const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: '71c185e9-405f-459a-8631-522c49984a0c',
    nom: 'Collection Archives',
    description: 'Histoire et Géographie (de la 6e à la Terminale). Conforme aux programmes officiels.',
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.7435784632367499.webp',
    ordre: 1,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  },
  {
    id: 'd2d39434-5d5a-4215-bf0b-6f3546d6975c',
    nom: 'Collection École et Métiers',
    description: 'Connaissance du Monde Contemporain (CMC), découverte des filières professionnelles.',
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.5272591565981646.webp',
    ordre: 2,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  },
  {
    id: 'ed10fefa-4a50-48e8-b206-012ea00b9048',
    nom: 'Collection Jeunes Citoyens',
    description: "Éducation aux Droits de l'Homme et à la Citoyenneté (EDHC). Formation civique et morale.",
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.5305317676772953.webp',
    ordre: 3,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  },
  {
    id: 'ef018503-0122-415b-a58c-e68d667ea227',
    nom: 'Collection Succès',
    description: 'Annales, méthodologie, résumés, citations et préparation intensive aux examens (BEPC, BAC).',
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.3834159316860618.webp',
    ordre: 4,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  },
  {
    id: '813b8958-9678-4ba0-9c36-aa7afc7b6324',
    nom: 'Collection Polyglotte',
    description: "Initiation à l'Anglais, perfectionnement de l'expression orale et préparation au Baccalauréat.",
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.12370363270776785.webp',
    ordre: 5,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  },
  {
    id: '19d19ec6-b2ec-4d46-89af-840fbb49c2e9',
    nom: 'Collection Racines',
    description: 'Maîtrise de la langue française, grammaire, dictées et méthodes de rédaction.',
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.16166504852148222.webp',
    ordre: 6,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  },
  {
    id: 'f228f276-4714-437e-bbf5-057869987c43',
    nom: 'Collection Papyrus',
    description: 'Théâtre, Poésie et grandes œuvres du patrimoine littéraire et africain.',
    image_url: 'https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/collections/0.6860794753790214.webp',
    ordre: 7,
    publie: true,
    created_at: '2026-09-16T15:20:11.866086+00:00'
  }
];

export const FALLBACK_OUVRAGES: Ouvrage[] = [
  {
    id: 'ouv-001',
    titre: 'Histoire & Géographie 3e - Réussir le BEPC',
    auteur: 'Comité Pédagogique Phénix',
    collection_id: '71c185e9-405f-459a-8631-522c49984a0c',
    niveau: '3e (Collège)',
    matiere: 'Histoire-Géographie',
    prix: 4500,
    description: 'Manuel conforme au programme national comprenant des cours synthétisés, des cartes commentées et des sujets types d’examens corrigés.',
    disponibilite: true,
    couverture_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    extrait_url: '',
    afficher_prix: true,
    created_at: '2026-09-16T15:00:00.000000+00:00',
    collections: FALLBACK_COLLECTIONS[0]
  },
  {
    id: 'ouv-002',
    titre: 'Les Clés du Succès - Annales Corrigées BAC',
    auteur: 'Collectif d’Inspecteurs Pédagogiques',
    collection_id: 'ef018503-0122-415b-a58c-e68d667ea227',
    niveau: 'Terminale',
    matiere: 'Méthodologie & Examens',
    prix: 5000,
    description: 'Recueil complet d’annales des sessions précédentes avec conseils méthodologiques précis, barèmes et corrigés pas à pas.',
    disponibilite: true,
    couverture_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    extrait_url: '',
    afficher_prix: true,
    created_at: '2026-09-16T15:00:00.000000+00:00',
    collections: FALLBACK_COLLECTIONS[6]
  },
  {
    id: 'ouv-003',
    titre: 'Maîtrise du Français & Dictées Préparées 6e/5e',
    auteur: 'M. S. Kouamé & Équipe Lettres',
    collection_id: '19d19ec6-b2ec-4d46-89af-840fbb49c2e9',
    niveau: '6e / 5e',
    matiere: 'Français',
    prix: 3800,
    description: 'Ouvrage de référence pour consolider l’orthographe, la syntaxe et la grammaire dès l’entrée au collège.',
    disponibilite: true,
    couverture_url: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=800',
    extrait_url: '',
    afficher_prix: true,
    created_at: '2026-09-16T15:00:00.000000+00:00',
    collections: FALLBACK_COLLECTIONS[5]
  },
  {
    id: 'ouv-004',
    titre: 'English Oral & Written Practice for Exams',
    auteur: 'Dept. of Modern Languages',
    collection_id: '813b8958-9678-4ba0-9c36-aa7afc7b6324',
    niveau: 'Secondaire',
    matiere: 'Anglais',
    prix: 4200,
    description: 'Guides d’expression et d’écoute pour aborder sereinement les épreuves orales et écrites des examens nationaux.',
    disponibilite: true,
    couverture_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    extrait_url: '',
    afficher_prix: true,
    created_at: '2026-09-16T15:00:00.000000+00:00',
    collections: FALLBACK_COLLECTIONS[4]
  }
];
