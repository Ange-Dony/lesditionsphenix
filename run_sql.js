import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdkvmqvdmmypoclfivvo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka3ZtcXZkbW15cG9jbGZpdnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU2MTUyMiwiZXhwIjoyMTA1MTM3NTIyfQ.Kcx5S5dWzDQJC4dzdrkmmq6byK7Ac7aIybF5oIEQIVY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // We can't execute raw SQL easily via the JS client without a custom RPC function.
  // The simplest way to seed data via the service key is to just insert the data directly.
  
  console.log("Seeding parameters...");
  await supabase.from('parametres_site').upsert([
    {
      telephone_whatsapp: '+33612345678',
      coordonnees: '10 Rue de la Plume, 75001 Paris',
      infos_generales: 'Les Éditions Phénix : Renaître par le savoir.'
    }
  ]);

  console.log("Seeding collections...");
  const { data: collections, error: colError } = await supabase.from('collections').upsert([
    { id: 'c1000000-0000-0000-0000-000000000001', nom: 'Jeunesse Envol', description: 'Des histoires inspirantes pour les plus jeunes.', ordre: 1, publie: true },
    { id: 'c2000000-0000-0000-0000-000000000002', nom: 'Savoirs Académiques', description: 'Manuels et ouvrages de référence.', ordre: 2, publie: true },
    { id: 'c3000000-0000-0000-0000-000000000003', nom: 'Romans Contemporains', description: 'La littérature d\'aujourd\'hui.', ordre: 3, publie: true }
  ]).select();

  if (colError) console.error("Error collections:", colError);

  console.log("Seeding ouvrages...");
  const { error: ouvError } = await supabase.from('ouvrages').upsert([
    { id: 'o1000000-0000-0000-0000-000000000001', titre: 'L\'Odyssée du Petit Prince', auteur: 'A. Dubois', collection_id: 'c1000000-0000-0000-0000-000000000001', niveau: 'Primaire', matiere: 'Français', prix: 12.50, description: 'Une aventure merveilleuse pour apprendre à lire.', disponibilite: true },
    { id: 'o2000000-0000-0000-0000-000000000002', titre: 'Mathématiques Avancées 1ère', auteur: 'Prof. Martin', collection_id: 'c2000000-0000-0000-0000-000000000002', niveau: 'Lycée', matiere: 'Mathématiques', prix: 24.90, description: 'Manuel complet avec exercices corrigés.', disponibilite: true },
    { id: 'o3000000-0000-0000-0000-000000000003', titre: 'Les Cendres du Temps', auteur: 'M. Lemoine', collection_id: 'c3000000-0000-0000-0000-000000000003', niveau: 'Tous publics', matiere: 'Littérature', prix: 18.00, description: 'Un roman poignant sur la mémoire et le temps.', disponibilite: true }
  ]);
  
  if (ouvError) console.error("Error ouvrages:", ouvError);

  console.log("Seeding ressources...");
  const { error: resError } = await supabase.from('ressources').upsert([
    { titre: 'Corrigés Chapitre 1-3', type: 'Corrigé', niveau: 'Lycée', matiere: 'Mathématiques', ouvrage_id: 'o2000000-0000-0000-0000-000000000002', collection_id: 'c2000000-0000-0000-0000-000000000002', format: 'PDF', google_drive_url: 'https://drive.google.com/example-corriges', publie: true },
    { titre: 'Fiche de lecture - Cendres du Temps', type: 'Fiche de cours', niveau: 'Lycée', matiere: 'Littérature', ouvrage_id: 'o3000000-0000-0000-0000-000000000003', collection_id: 'c3000000-0000-0000-0000-000000000003', format: 'PDF', google_drive_url: 'https://drive.google.com/example-fiche', publie: true }
  ]);
  
  if (resError) console.error("Error ressources:", resError);

  console.log("Done seeding.");
}

run();
