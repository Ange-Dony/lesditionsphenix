import { supabase } from './supabase';

let cachedLogoUrl: string | null = null;
let logoPromise: Promise<string | null> | null = null;

export async function getCachedLogoUrl(): Promise<string | null> {
  if (cachedLogoUrl) return cachedLogoUrl;
  
  if (!logoPromise) {
    logoPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from('parametres_site')
          .select('logo_url')
          .limit(1)
          .single();

        if (!error && data?.logo_url) {
          cachedLogoUrl = data.logo_url;
          return data.logo_url;
        }
      } catch (err) {
        console.error('Error loading logo:', err);
      }
      return null;
    })();
  }

  return logoPromise;
}
