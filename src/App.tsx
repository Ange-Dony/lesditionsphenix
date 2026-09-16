import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Catalogue } from './pages/Catalogue';
import { Collections } from './pages/Collections';
import { Ressources } from './pages/Ressources';
import { About } from './pages/About';
import { Partenaires } from './pages/Partenaires';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { CartProvider } from './context/CartContext';
import { supabase } from './lib/supabase';

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
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="catalogue" element={<Catalogue />} />
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
      </Router>
    </CartProvider>
  );
}
