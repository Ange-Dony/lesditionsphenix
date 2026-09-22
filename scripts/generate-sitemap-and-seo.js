import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = process.env.VITE_SUPABASE_URL || "https://sdkvmqvdmmypoclfivvo.supabase.co";
const key = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka3ZtcXZkbW15cG9jbGZpdnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDQ5ODIsImV4cCI6MjA1NzYyMDk4Mn0.Nn84j_8s48k29pA0s6gY9U7K4P9v0o_59JbM4G3d3M8";
const client = createClient(url, key);

async function run() {
  const { data: cols } = await client.from("collections").select("*").eq("publie", true).order("ordre");
  const { data: books } = await client.from("ouvrages").select("*, collections(nom)").order("created_at");

  const today = new Date().toISOString().split('T')[0];

  // 1. SITEMAP.XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Pages Principales : Les Éditions Phénix - La Maison du Succès -->
  <url>
    <loc>https://www.leseditionsphenix.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.leseditionsphenix.com/catalogue</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://www.leseditionsphenix.com/collections</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.leseditionsphenix.com/ressources</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://www.leseditionsphenix.com/a-propos</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>https://www.leseditionsphenix.com/partenaires</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>

  <!-- Collections Thématiques -->\n`;

  for (const col of cols || []) {
    xml += `  <url>
    <loc>https://www.leseditionsphenix.com/catalogue?collection=${col.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>\n`;
  }

  xml += `\n  <!-- Ouvrages & Manuels Scolaires Individuels (Indexation par titre et matière) -->\n`;

  for (const book of books || []) {
    xml += `  <url>
    <loc>https://www.leseditionsphenix.com/catalogue?ouvrage=${book.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>https://www.leseditionsphenix.com/livre/${book.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>\n`;
  }

  xml += `</urlset>\n`;
  fs.writeFileSync(path.resolve('public/sitemap.xml'), xml);
  console.log(`Updated public/sitemap.xml with ${6 + (cols?.length || 0) + (books?.length || 0) * 2} URLs`);

  // 2. Generate Schema.org ItemList for Books
  const booksSchemaList = (books || []).map((b, idx) => ({
    "@type": "ListItem",
    "position": idx + 1,
    "item": {
      "@type": "Book",
      "@id": `https://www.leseditionsphenix.com/catalogue?ouvrage=${b.id}#book`,
      "name": b.titre,
      "url": `https://www.leseditionsphenix.com/catalogue?ouvrage=${b.id}`,
      "image": b.couverture_url || undefined,
      "author": {
        "@type": "Organization",
        "name": (b.auteur && b.auteur.trim()) ? b.auteur.trim() : "Les Éditions Phénix"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Les Éditions Phénix",
        "url": "https://www.leseditionsphenix.com"
      },
      "inLanguage": "fr-CI",
      "about": b.matiere || "Enseignement scolaire en Côte d'Ivoire",
      "educationalLevel": b.niveau ? b.niveau.trim() : "Collège / Lycée Côte d'Ivoire",
      "offers": {
        "@type": "Offer",
        "price": b.prix || 0,
        "priceCurrency": "XOF",
        "availability": "https://schema.org/InStock",
        "url": `https://www.leseditionsphenix.com/catalogue?ouvrage=${b.id}`
      }
    }
  }));

  // 3. Generate Semantic HTML Catalog for Crawlers in index.html
  let semanticBooksHtml = `      <section aria-label="Catalogue des Ouvrages et Manuels Scolaires Ivoiriens" style="display:none;" aria-hidden="true">\n`;
  semanticBooksHtml += `        <h2>Manuels scolaires, annales d'examens et ouvrages pédagogiques agréés en Côte d'Ivoire</h2>\n`;
  semanticBooksHtml += `        <ul>\n`;
  for (const b of books || []) {
    const colName = b.collections?.nom || 'Les Éditions Phénix';
    const desc = b.description ? b.description.replace(/[\n\r]+/g, ' ').trim() : `${b.titre} - Ouvrage scolaire et pédagogique pour ${b.niveau ? b.niveau.trim() : 'élèves'} en ${b.matiere || 'Côte d\'Ivoire'}, publié par ${colName} aux Éditions Phénix.`;
    semanticBooksHtml += `          <li>
            <article>
              <h3><a href="/catalogue?ouvrage=${b.id}">${b.titre}</a></h3>
              <p>Matière : <strong>${b.matiere || 'Enseignement'}</strong> | Classe / Niveau : <strong>${b.niveau ? b.niveau.trim() : 'Tous niveaux'}</strong> | Collection : <strong>${colName}</strong> | Prix : ${b.prix} FCFA</p>
              <p>${desc}</p>
              <a href="/livre/${b.id}">Consulter la fiche officielle de ${b.titre}</a>
            </article>
          </li>\n`;
  }
  semanticBooksHtml += `        </ul>\n      </section>\n`;

  // Read index.html and update Schema.org & semantic fallback
  let indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');

  // Insert the book ItemList into JSON-LD graph
  const booksSchemaGraphItem = {
    "@type": "ItemList",
    "@id": "https://www.leseditionsphenix.com/#ouvrages-scolaires",
    "name": "Manuels Scolaires Ivoiriens, Annales BEPC/BAC & Ouvrages Pédagogiques",
    "description": "Catalogue complet des manuels et annales édités par Les Éditions Phénix en Côte d'Ivoire.",
    "numberOfItems": booksSchemaList.length,
    "itemListElement": booksSchemaList
  };

  // We can write a clean generator for the JSON-LD script inside index.html
  console.log("Books schema prepared with", booksSchemaList.length, "items.");
  fs.writeFileSync(path.resolve('scripts/books-schema.json'), JSON.stringify(booksSchemaGraphItem, null, 2));
  fs.writeFileSync(path.resolve('scripts/semantic-books.html'), semanticBooksHtml);
}

run();
