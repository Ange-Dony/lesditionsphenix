import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sdkvmqvdmmypoclfivvo.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka3ZtcXZkbW15cG9jbGZpdnZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTU2MTUyMiwiZXhwIjoyMTA1MTM3NTIyfQ.Kcx5S5dWzDQJC4dzdrkmmq6byK7Ac7aIybF5oIEQIVY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
    try {
        console.log("Creating/Updating Collections...");
        const { error: err1 } = await supabase.from('collections').upsert([
            { id: 'c1000000-0000-0000-0000-000000000001', nom: 'Jeunesse Envol', description: 'Des histoires inspirantes pour les plus jeunes.', ordre: 1, publie: true },
            { id: 'c2000000-0000-0000-0000-000000000002', nom: 'Savoirs Académiques', description: 'Manuels et ouvrages de référence.', ordre: 2, publie: true },
            { id: 'c3000000-0000-0000-0000-000000000003', nom: 'Romans Contemporains', description: 'La littérature d\'aujourd\'hui.', ordre: 3, publie: true }
        ]);
        if (err1) throw new Error("Collections error: " + err1.message);

        console.log("Creating/Updating Ouvrages...");
        const { error: err2 } = await supabase.from('ouvrages').upsert([
            { id: 'o1000000-0000-0000-0000-000000000001', titre: 'L\'Odyssée du Petit Prince', auteur: 'A. Dubois', collection_id: 'c1000000-0000-0000-0000-000000000001', niveau: 'Primaire', matiere: 'Français', prix: 12.50, description: 'Une aventure merveilleuse pour apprendre à lire.', disponibilite: true },
            { id: 'o2000000-0000-0000-0000-000000000002', titre: 'Mathématiques Avancées 1ère', auteur: 'Prof. Martin', collection_id: 'c2000000-0000-0000-0000-000000000002', niveau: 'Lycée', matiere: 'Mathématiques', prix: 24.90, description: 'Manuel complet avec exercices corrigés.', disponibilite: true },
            { id: 'o3000000-0000-0000-0000-000000000003', titre: 'Les Cendres du Temps', auteur: 'M. Lemoine', collection_id: 'c3000000-0000-0000-0000-000000000003', niveau: 'Tous publics', matiere: 'Littérature', prix: 18.00, description: 'Un roman poignant sur la mémoire et le temps.', disponibilite: true }
        ]);
        if (err2) throw new Error("Ouvrages error: " + err2.message);

        console.log("Creating/Updating Ressources...");
        const { error: err3 } = await supabase.from('ressources').upsert([
            { id: 'r1000000-0000-0000-0000-000000000001', titre: 'Corrigés Chapitre 1-3', type: 'Corrigé', niveau: 'Lycée', matiere: 'Mathématiques', ouvrage_id: 'o2000000-0000-0000-0000-000000000002', collection_id: 'c2000000-0000-0000-0000-000000000002', format: 'PDF', google_drive_url: 'https://drive.google.com/example-corriges', publie: true },
            { id: 'r2000000-0000-0000-0000-000000000002', titre: 'Fiche de lecture - Cendres du Temps', type: 'Fiche de cours', niveau: 'Lycée', matiere: 'Littérature', ouvrage_id: 'o3000000-0000-0000-0000-000000000003', collection_id: 'c3000000-0000-0000-0000-000000000003', format: 'PDF', google_drive_url: 'https://drive.google.com/example-fiche', publie: true }
        ]);
        if (err3) throw new Error("Ressources error: " + err3.message);

        console.log("Creating/Updating Parametres Site...");
        const { error: err4 } = await supabase.from('parametres_site').upsert([
            { id: 'p1000000-0000-0000-0000-000000000001', telephone_whatsapp: '+33612345678', coordonnees: '10 Rue de la Plume, 75001 Paris', infos_generales: 'Les Éditions Phénix : Renaître par le savoir.' }
        ]);
        if (err4) throw new Error("Parametres error: " + err4.message);

        console.log("Seeding successful!");
    } catch (e) {
        console.error(e.message);
        console.log("\nIf you are seeing 'Could not find the table ... in the schema cache', this means you MUST run the SQL script via the Supabase Dashboard first to create the tables.");
    }
}

run();
