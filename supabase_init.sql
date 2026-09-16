-- Supabase Database Initialization Script for "Les Éditions Phénix"

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES CREATION

-- Table: profiles (Links to auth.users for role management)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: collections
CREATE TABLE public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  ordre INTEGER DEFAULT 0,
  publie BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: ouvrages
CREATE TABLE public.ouvrages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre TEXT NOT NULL,
  auteur TEXT NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  niveau TEXT,
  matiere TEXT,
  prix NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  disponibilite BOOLEAN DEFAULT true,
  couverture_url TEXT,
  extrait_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: ressources
CREATE TABLE public.ressources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  titre TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Fiche de cours', 'Corrigé', 'Extrait', 'Document complémentaire'
  niveau TEXT,
  matiere TEXT,
  ouvrage_id UUID REFERENCES public.ouvrages(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  format TEXT,
  google_drive_url TEXT NOT NULL,
  publie BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: parametres_site
CREATE TABLE public.parametres_site (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  telephone_whatsapp TEXT NOT NULL DEFAULT '+33600000000',
  coordonnees TEXT,
  infos_generales TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX idx_ouvrages_collection ON public.ouvrages(collection_id);
CREATE INDEX idx_ouvrages_publie ON public.ouvrages(disponibilite);
CREATE INDEX idx_ressources_publie ON public.ressources(publie);
CREATE INDEX idx_ressources_filtres ON public.ressources(niveau, matiere, type);

-- 4. TRIGGERS FOR PROFILES
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'admin'); -- Defaulting to admin for this specific use case to simplify first user creation, IN PRODUCTION set to 'user'
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ouvrages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ressources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametres_site ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Collections RLS
CREATE POLICY "Collections visibles par tous" ON public.collections FOR SELECT USING (publie = true);
CREATE POLICY "Admins full access collections" ON public.collections FOR ALL USING (public.is_admin());

-- Ouvrages RLS
CREATE POLICY "Ouvrages visibles par tous" ON public.ouvrages FOR SELECT USING (disponibilite = true);
CREATE POLICY "Admins full access ouvrages" ON public.ouvrages FOR ALL USING (public.is_admin());

-- Ressources RLS
CREATE POLICY "Ressources visibles par tous" ON public.ressources FOR SELECT USING (publie = true);
CREATE POLICY "Admins full access ressources" ON public.ressources FOR ALL USING (public.is_admin());

-- Parametres RLS
CREATE POLICY "Parametres visibles par tous" ON public.parametres_site FOR SELECT USING (true);
CREATE POLICY "Admins full access parametres" ON public.parametres_site FOR ALL USING (public.is_admin());

-- 6. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('medias', 'medias', true) ON CONFLICT DO NOTHING;

-- Storage RLS
CREATE POLICY "Medias public read" ON storage.objects FOR SELECT USING (bucket_id = 'medias');
CREATE POLICY "Medias admin write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medias' AND public.is_admin());
CREATE POLICY "Medias admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'medias' AND public.is_admin());
CREATE POLICY "Medias admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'medias' AND public.is_admin());

-- 7. DEMO DATA
INSERT INTO public.parametres_site (telephone_whatsapp, coordonnees, infos_generales) 
VALUES ('+33612345678', '10 Rue de la Plume, 75001 Paris', 'Les Éditions Phénix : Renaître par le savoir.');

INSERT INTO public.collections (id, nom, description, ordre, publie) VALUES 
  ('c1000000-0000-0000-0000-000000000001', 'Jeunesse Envol', 'Des histoires inspirantes pour les plus jeunes.', 1, true),
  ('c2000000-0000-0000-0000-000000000002', 'Savoirs Académiques', 'Manuels et ouvrages de référence.', 2, true),
  ('c3000000-0000-0000-0000-000000000003', 'Romans Contemporains', 'La littérature d''aujourd''hui.', 3, true);

INSERT INTO public.ouvrages (id, titre, auteur, collection_id, niveau, matiere, prix, description, disponibilite) VALUES 
  ('o1000000-0000-0000-0000-000000000001', 'L''Odyssée du Petit Prince', 'A. Dubois', 'c1000000-0000-0000-0000-000000000001', 'Primaire', 'Français', 12.50, 'Une aventure merveilleuse pour apprendre à lire.', true),
  ('o2000000-0000-0000-0000-000000000002', 'Mathématiques Avancées 1ère', 'Prof. Martin', 'c2000000-0000-0000-0000-000000000002', 'Lycée', 'Mathématiques', 24.90, 'Manuel complet avec exercices corrigés.', true),
  ('o3000000-0000-0000-0000-000000000003', 'Les Cendres du Temps', 'M. Lemoine', 'c3000000-0000-0000-0000-000000000003', 'Tous publics', 'Littérature', 18.00, 'Un roman poignant sur la mémoire et le temps.', true);

INSERT INTO public.ressources (titre, type, niveau, matiere, ouvrage_id, collection_id, format, google_drive_url, publie) VALUES 
  ('Corrigés Chapitre 1-3', 'Corrigé', 'Lycée', 'Mathématiques', 'o2000000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002', 'PDF', 'https://drive.google.com/example-corriges', true),
  ('Fiche de lecture - Cendres du Temps', 'Fiche de cours', 'Lycée', 'Littérature', 'o3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', 'PDF', 'https://drive.google.com/example-fiche', true);
