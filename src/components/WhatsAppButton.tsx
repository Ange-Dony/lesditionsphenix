import React from 'react';
import { cn, generateWhatsAppLink } from '../lib/utils';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  label?: string;
  className?: string;
  variant?: 'solid' | 'outline' | 'floating';
}

export function WhatsAppButton({ 
  phoneNumber, 
  message = "Bonjour, je vous contacte depuis votre site web.", 
  label = "Nous contacter sur WhatsApp",
  className,
  variant = 'solid'
}: WhatsAppButtonProps) {
  
  const href = generateWhatsAppLink(phoneNumber, message);
  
  if (variant === 'floating') {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          "fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center",
          className
        )}
        aria-label={label}
      >
        <MessageCircle size={28} />
      </a>
    );
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors",
        variant === 'solid' 
          ? "bg-[#25D366] text-white hover:bg-[#20bd5a]" 
          : "border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white",
        className
      )}
    >
      <MessageCircle size={20} />
      <span>{label}</span>
    </a>
  );
}
