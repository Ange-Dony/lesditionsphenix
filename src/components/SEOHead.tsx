import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = "Les Éditions Phénix | La Maison du Succès – Manuels Scolaires Ivoiriens, Annales & Citations";
const DEFAULT_DESCRIPTION = "Maison d'édition ivoirienne de référence en Côte d'Ivoire : manuels scolaires ivoiriens agréés, annales BEPC & BAC, construction graphique, citations philosophiques et littérature d'excellence.";
const DEFAULT_KEYWORDS = "les éditions phénix, la maison du succès, manuels ivoiriens, maison d'édition ivoirienne, maisons d'édition ivoiriennes, annales, annales bepc, annales bac, construction graphique, citations philosophiques, manuels scolaires côte d'ivoire, livre scolaire abidjan, éditeur ivoirien, le secret des citations, le secret des graphiques, code d'accès annales, edhc côte d'ivoire, histoire-géographie côte d'ivoire, cmc côte d'ivoire, oral anglais bepc bac, les codes de la dictée-questions, éducation nationale ci";
const DEFAULT_IMAGE = "https://sdkvmqvdmmypoclfivvo.supabase.co/storage/v1/object/public/medias/logos/kaar8xq0bf9_1789583134311.png";
const BASE_URL = "https://www.leseditionsphenix.com";

export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  jsonLd,
}: SEOHeadProps) {
  const location = useLocation();

  useEffect(() => {
    const finalTitle = title 
      ? `${title} | Les Éditions Phénix` 
      : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const finalKeywords = keywords 
      ? `${keywords}, ${DEFAULT_KEYWORDS}` 
      : DEFAULT_KEYWORDS;
    const currentUrl = canonical || `${BASE_URL}${location.pathname}${location.search}`;

    // Update document title
    document.title = finalTitle;

    // Helper to set or create meta tag
    const setMetaTag = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Standard SEO Metas
    setMetaTag('name', 'description', finalDescription);
    setMetaTag('name', 'keywords', finalKeywords);

    // OpenGraph Metas
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'Les Éditions Phénix - La Maison du Succès');

    // Twitter Card Metas
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Dynamic JSON-LD structured data
    const existingScript = document.getElementById('dynamic-page-jsonld');
    if (jsonLd) {
      const script = (existingScript || document.createElement('script')) as HTMLScriptElement;
      script.id = 'dynamic-page-jsonld';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      if (!existingScript) {
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }

    return () => {
      const scriptToRemove = document.getElementById('dynamic-page-jsonld');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [title, description, keywords, canonical, ogType, ogImage, jsonLd, location]);

  return null;
}
