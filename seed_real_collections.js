import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sdkvmqvdmmypoclfivvo.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka3ZtcXZkbW15cG9jbGZpdnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU2MTUyMiwiZXhwIjoyMTA1MTM3NTIyfQ.Kcx5S5dWzDQJC4dzdrkmmq6byK7Ac7aIybF5oIEQIVY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  try {
    console.log("Nettoyage des anciennes données de démonstration...");
    await supabase.from('ressources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ouvrages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log("Insertion des vraies collections...");
    const collections = [
      { nom: 'Collection Archives', description: 'Histoire et Géographie (de la 6e à la Terminale).', ordre: 1, publie: true },
      { nom: 'Collection École et Métiers', description: 'Connaissance du Monde Contemporain (CMC).', ordre: 2, publie: true },
      { nom: 'Collection Jeunes Citoyens', description: 'Éducation aux Droits de l\'Homme et à la Citoyenneté (EDHC).', ordre: 3, publie: true },
      { nom: 'Collection Papyrus', description: 'Théâtre, Poésie et œuvres littéraires.', ordre: 4, publie: true },
      { nom: 'Collection Polyglotte', description: 'Initiation à l\'Anglais, préparation à l\'Oral et au Baccalauréat.', ordre: 5, publie: true },
      { nom: 'Collection Racines', description: 'Maîtrise de la langue, dictée et méthodes.', ordre: 6, publie: true },
      { nom: 'Collection Succès', description: 'Annales, méthodologie, citations et préparation aux examens (BEPC, BAC).', ordre: 7, publie: true }
    ];

    const { error } = await supabase.from('collections').insert(collections);
    if (error) throw error;
    
    console.log("Succès ! Les vraies collections ont été créées.");
  } catch (e) {
    console.error("Erreur:", e.message);
  }
}

run();
