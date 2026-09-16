import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  const handleCheckout = async () => {
    try {
      const { data: params } = await supabase.from('parametres_site').select('telephone_whatsapp').single();
      const phone = params?.telephone_whatsapp || '+33612345678';
      
      let message = "Bonjour, je souhaite passer une commande :\n\n";
      items.forEach(item => {
        const itemPrice = item.ouvrage.afficher_prix !== false 
          ? `(${(item.ouvrage.prix * item.quantity).toFixed(2)} FCFA)`
          : "(Prix sur demande)";
        message += `- ${item.quantity}x ${item.ouvrage.titre} ${itemPrice}\n`;
      });
      message += `\n*Total (hors articles sur demande) : ${totalPrice.toFixed(2)} FCFA*\n\nMerci de m'indiquer la disponibilité et les modalités de paiement.`;
      
      const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la préparation de la commande.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-bordeaux" size={24} />
            <h2 className="text-xl font-bold text-anthracite">Mon Panier</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
              <p>Votre panier est vide.</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-bordeaux text-white rounded-full font-medium"
              >
                Découvrir nos ouvrages
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.ouvrage.id} className="flex gap-4 bg-white p-3 border border-gray-100 rounded-xl shadow-sm">
                <div className="w-20 h-28 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.ouvrage.couverture_url ? (
                    <img src={item.ouvrage.couverture_url} alt={item.ouvrage.titre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-anthracite line-clamp-2">{item.ouvrage.titre}</h3>
                    <p className="text-xs text-gray-500">{item.ouvrage.auteur}</p>
                    {item.ouvrage.afficher_prix !== false ? (
                      <p className="font-bold text-bordeaux mt-1">{item.ouvrage.prix.toFixed(2)} FCFA</p>
                    ) : (
                      <p className="font-bold text-gray-400 mt-1">Sur demande</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-gray-100 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.ouvrage.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-gray-200 rounded-l-lg"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.ouvrage.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-gray-200 rounded-r-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.ouvrage.id)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-2xl font-bold text-anthracite">{totalPrice.toFixed(2)} FCFA</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle size={20} />
              Commander via WhatsApp
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Vous serez redirigé vers WhatsApp pour finaliser votre commande.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
