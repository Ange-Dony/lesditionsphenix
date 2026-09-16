import React from 'react';
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

export default function App() {
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
