import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';

// Code-split pages for instant initial load
const Catalogue = lazy(() => import('./pages/Catalogue').then(m => ({ default: m.Catalogue })));
const Collections = lazy(() => import('./pages/Collections').then(m => ({ default: m.Collections })));
const Ressources = lazy(() => import('./pages/Ressources').then(m => ({ default: m.Ressources })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Partenaires = lazy(() => import('./pages/Partenaires').then(m => ({ default: m.Partenaires })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-bleu border-t-jaune-vif rounded-full animate-spin"></div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    async function syncFavicon() {
      try {
        const { data } = await supabase
          .from('parametres_site')
          .select('logo_url')
          .limit(1)
          .single();

        if (data?.logo_url) {
          const links = document.querySelectorAll("link[rel*='icon']");
          links.forEach((link: any) => {
            link.href = data.logo_url;
          });
          
          let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
          if (appleIcon) {
            appleIcon.href = data.logo_url;
          }
        }
      } catch (e) {
        // Fallback to static /favicon.png already declared in index.html
      }
    }
    syncFavicon();
  }, []);

  return (
    <CartProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalogue" element={<Catalogue />} />
              <Route path="catalogue/ouvrage/:id" element={<Catalogue />} />
              <Route path="livre/:id" element={<Catalogue />} />
              <Route path="collections" element={<Collections />} />
              <Route path="ressources" element={<Ressources />} />
              <Route path="a-propos" element={<About />} />
              <Route path="partenaires" element={<Partenaires />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Admin Routes without main Layout */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </CartProvider>
  );
}
