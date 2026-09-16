import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to generate a WhatsApp message link
 */
export function generateWhatsAppLink(phoneNumber: string, message: string) {
  const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
