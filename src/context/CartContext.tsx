import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ouvrage } from '../types';

export interface CartItem {
  ouvrage: Ouvrage;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (ouvrage: Ouvrage) => void;
  removeFromCart: (ouvrageId: string) => void;
  updateQuantity: (ouvrageId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (ouvrage: Ouvrage) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.ouvrage.id === ouvrage.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.ouvrage.id === ouvrage.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { ouvrage, quantity: 1 }];
    });
  };

  const removeFromCart = (ouvrageId: string) => {
    setItems(currentItems => currentItems.filter(item => item.ouvrage.id !== ouvrageId));
  };

  const updateQuantity = (ouvrageId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(ouvrageId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.ouvrage.id === ouvrageId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    if (item.ouvrage.afficher_prix === false) return sum;
    return sum + (item.ouvrage.prix * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
