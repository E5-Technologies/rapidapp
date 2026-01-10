import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findCatalogUrl } from '@/data/equipmentCatalog';

interface CachedImage {
  url: string;
  timestamp: number;
}

// Cache images in memory for the session
const imageCache: Map<string, CachedImage> = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Queue for scraping requests to avoid rate limiting
const scrapeQueue: Map<string, Promise<string | null>> = new Map();

export const useProductImage = (
  manufacturerName: string,
  productName: string,
  existingImage: string | null,
  category: string
) => {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProductImage = async () => {
      // If we already have a valid image, use it
      if (existingImage && !existingImage.includes('unsplash.com/photo-1581092918056') && existingImage.startsWith('http')) {
        setImageUrl(existingImage);
        return;
      }

      const cacheKey = `${manufacturerName}-${productName}`.toLowerCase();
      
      // Check cache first
      const cached = imageCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setImageUrl(cached.url);
        return;
      }

      // Get catalog URL for this manufacturer
      const catalogUrl = findCatalogUrl(manufacturerName);
      if (!catalogUrl) {
        return;
      }

      // Check if already fetching
      if (scrapeQueue.has(cacheKey)) {
        const result = await scrapeQueue.get(cacheKey);
        if (result) {
          setImageUrl(result);
        }
        return;
      }

      setIsLoading(true);

      // Create the fetch promise
      const fetchPromise = (async (): Promise<string | null> => {
        try {
          const { data, error } = await supabase.functions.invoke('scrape-product-image', {
            body: {
              manufacturerName,
              productName,
              catalogUrl
            }
          });

          if (error) {
            console.error('Error fetching product image:', error);
            return null;
          }

          if (data?.success) {
            // Prefer product-specific images, then any images, then screenshot
            const imageUrl = data.imageUrls?.[0] || data.screenshot || null;
            
            if (imageUrl) {
              imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() });
              return imageUrl;
            }
          }

          return null;
        } catch (err) {
          console.error('Failed to scrape product image:', err);
          return null;
        }
      })();

      scrapeQueue.set(cacheKey, fetchPromise);
      
      try {
        const result = await fetchPromise;
        if (result) {
          setImageUrl(result);
        }
      } finally {
        setIsLoading(false);
        // Remove from queue after a delay to prevent duplicate requests
        setTimeout(() => scrapeQueue.delete(cacheKey), 5000);
      }
    };

    fetchProductImage();
  }, [manufacturerName, productName, existingImage, category]);

  return { imageUrl, isLoading };
};

// Prefetch images for a list of products
export const prefetchProductImages = async (products: Array<{ company: string; product: string; catalogUrl?: string }>) => {
  const promises = products.slice(0, 5).map(async (product) => {
    const catalogUrl = product.catalogUrl || findCatalogUrl(product.company);
    if (!catalogUrl) return null;

    const cacheKey = `${product.company}-${product.product}`.toLowerCase();
    if (imageCache.has(cacheKey)) return null;

    try {
      const { data } = await supabase.functions.invoke('scrape-product-image', {
        body: {
          manufacturerName: product.company,
          productName: product.product,
          catalogUrl
        }
      });

      if (data?.success && data.imageUrls?.[0]) {
        imageCache.set(cacheKey, { url: data.imageUrls[0], timestamp: Date.now() });
        return data.imageUrls[0];
      }
    } catch (err) {
      console.error('Prefetch failed for:', product.company, err);
    }
    return null;
  });

  await Promise.allSettled(promises);
};
