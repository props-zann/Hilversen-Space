// Centralized Image Resolver for Vite Dev & Production Bundles

// Automatically bundle all assets in /src/assets/images so Vite generates production URLs
const bundledImages = import.meta.glob('/src/assets/images/*', { eager: true, import: 'default' }) as Record<string, string>;

export const FALLBACK_PRODUCT_IMAGE = bundledImages['/src/assets/images/f1_keychain_hero_1791067184655.jpg'] || 
  bundledImages['/src/assets/images/f1_keychain_helmet_1791067184655.jpg'] || 
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231E293B"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="%2394A3B8" text-anchor="middle" dominant-baseline="middle">Hilversen Merchandise</text></svg>';

/**
 * Resolves any image URL string (relative /src/assets/images path, base64 data URL, or external HTTP URL)
 * into a valid, production-ready asset URL that works in both Vite dev and published builds.
 */
export function resolveProductImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return FALLBACK_PRODUCT_IMAGE;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return FALLBACK_PRODUCT_IMAGE;
  }

  // Base64 Data URL, Blob URL, or external HTTP/HTTPS URL
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Normalize relative /src/assets/images/ path
  let lookupKey = trimmed;
  if (!lookupKey.startsWith('/')) {
    lookupKey = '/' + lookupKey;
  }

  // Check if Vite bundled asset exists in import.meta.glob
  if (bundledImages[lookupKey]) {
    return bundledImages[lookupKey];
  }

  // Try matching by filename in case path prefix varies
  const fileName = lookupKey.split('/').pop();
  if (fileName) {
    const matchedKey = Object.keys(bundledImages).find(k => k.endsWith(fileName));
    if (matchedKey && bundledImages[matchedKey]) {
      return bundledImages[matchedKey];
    }
  }

  // Fallback if asset is missing or not matched
  return FALLBACK_PRODUCT_IMAGE;
}

/**
 * Helper error handler for <img> elements to gracefully handle broken or blocked image URLs.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_PRODUCT_IMAGE) {
    target.src = FALLBACK_PRODUCT_IMAGE;
  }
}
