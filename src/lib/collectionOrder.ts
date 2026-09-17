/**
 * Canonical ordering for Les Éditions Phénix collections
 * 1. Collection Archives
 * 2. Collection École et Métiers
 * 3. Collection Jeunes Citoyens
 * 4. Collection Succès
 * 5. Collection Polyglotte
 * 6. Collection Racines
 * 7. Collection Papyrus
 */

export const CANONICAL_COLLECTION_NAMES: string[] = [
  'Collection Archives',
  'Collection École et Métiers',
  'Collection Jeunes Citoyens',
  'Collection Succès',
  'Collection Polyglotte',
  'Collection Racines',
  'Collection Papyrus'
];

export function getCollectionOrderIndex(name: string | undefined | null): number {
  if (!name) return 999;
  const clean = name.trim().toLowerCase();
  
  if (clean.includes('archive')) return 1;
  if (clean.includes('école') || clean.includes('ecole') || clean.includes('métier') || clean.includes('metier')) return 2;
  if (clean.includes('jeune') || clean.includes('citoyen')) return 3;
  if (clean.includes('succès') || clean.includes('succes')) return 4;
  if (clean.includes('polyglotte')) return 5;
  if (clean.includes('racine')) return 6;
  if (clean.includes('papyrus')) return 7;

  return 999;
}

export function sortCollectionsCanonical<T extends { nom: string; ordre?: number }>(collections: T[]): T[] {
  return [...collections].sort((a, b) => {
    const idxA = getCollectionOrderIndex(a.nom);
    const idxB = getCollectionOrderIndex(b.nom);
    if (idxA !== idxB) return idxA - idxB;
    return (a.ordre || 0) - (b.ordre || 0);
  });
}
