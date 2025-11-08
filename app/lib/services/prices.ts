import { isStablecoin, getWrappedTokenCoingeckoId } from "../config";

/**
 * Price cache entry
 */
interface PriceCacheEntry {
  price: number;
  timestamp: number;
}

/**
 * Price cache - 5 minute TTL
 */
const priceCache = new Map<string, PriceCacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * CoinGecko API base URL (free tier, no API key required)
 */
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

/**
 * Check if cached price is still valid
 */
function isCacheValid(entry: PriceCacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Get cached price if available and valid
 */
function getCachedPrice(coingeckoId: string): number | null {
  const cached = priceCache.get(coingeckoId);
  if (cached && isCacheValid(cached)) {
    return cached.price;
  }
  return null;
}

/**
 * Set price in cache
 */
function setCachedPrice(coingeckoId: string, price: number): void {
  priceCache.set(coingeckoId, {
    price,
    timestamp: Date.now(),
  });
}

/**
 * Fetch USD price for a single token from CoinGecko
 */
export async function fetchTokenPrice(
  coingeckoId: string
): Promise<number | null> {
  try {
    // Check cache first
    const cached = getCachedPrice(coingeckoId);
    if (cached !== null) {
      return cached;
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `CoinGecko API error for ${coingeckoId}: ${response.status}`
      );
      return null;
    }

    const data = await response.json();
    const price = data[coingeckoId]?.usd;

    if (typeof price === "number") {
      // Cache the result
      setCachedPrice(coingeckoId, price);
      return price;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch price for ${coingeckoId}:`, error);
    return null;
  }
}

/**
 * Fetch USD prices for multiple tokens from CoinGecko
 * More efficient than individual calls
 */
export async function fetchTokenPrices(
  coingeckoIds: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};

  // Separate cached and uncached IDs
  const uncachedIds: string[] = [];

  for (const id of coingeckoIds) {
    const cached = getCachedPrice(id);
    if (cached !== null) {
      prices[id] = cached;
    } else {
      uncachedIds.push(id);
    }
  }

  // If all prices are cached, return immediately
  if (uncachedIds.length === 0) {
    return prices;
  }

  try {
    // Fetch uncached prices in batch
    const idsParam = uncachedIds.join(",");
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${idsParam}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`CoinGecko API batch error: ${response.status}`);
      return prices;
    }

    const data = await response.json();

    // Process results and cache
    for (const id of uncachedIds) {
      const price = data[id]?.usd;
      if (typeof price === "number") {
        prices[id] = price;
        setCachedPrice(id, price);
      }
    }
  } catch (error) {
    console.error("Failed to fetch batch prices:", error);
  }

  return prices;
}

/**
 * Get price for a token, handling special cases:
 * - Stablecoins: hardcoded $1.00
 * - Wrapped tokens: use native token price
 * - Other tokens: fetch from CoinGecko
 */
export async function getTokenPrice(
  symbol: string,
  coingeckoId?: string
): Promise<number | null> {
  // Check if it's a stablecoin
  if (isStablecoin(symbol)) {
    return 1.0;
  }

  // Check if it's a wrapped token
  const wrappedTokenId = getWrappedTokenCoingeckoId(symbol);
  if (wrappedTokenId) {
    return fetchTokenPrice(wrappedTokenId);
  }

  // Otherwise, fetch from CoinGecko using provided ID
  if (!coingeckoId) {
    console.warn(`No CoinGecko ID provided for ${symbol}`);
    return null;
  }

  return fetchTokenPrice(coingeckoId);
}

/**
 * Calculate USD value for a token balance
 */
export async function calculateUsdValue(
  amount: string,
  symbol: string,
  coingeckoId?: string
): Promise<number | null> {
  const price = await getTokenPrice(symbol, coingeckoId);
  if (price === null) {
    return null;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    return null;
  }

  return numericAmount * price;
}

/**
 * Get prices for native tokens of all networks
 * Useful for bulk fetching at the start of a scan
 */
export async function fetchNativeTokenPrices(
  coingeckoIds: string[]
): Promise<Record<string, number>> {
  return fetchTokenPrices(coingeckoIds);
}

/**
 * Clear the price cache (useful for testing or manual refresh)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getPriceCacheStats(): {
  size: number;
  entries: Array<{ id: string; price: number; age: number }>;
} {
  const now = Date.now();
  const entries = Array.from(priceCache.entries()).map(([id, entry]) => ({
    id,
    price: entry.price,
    age: now - entry.timestamp,
  }));

  return {
    size: priceCache.size,
    entries,
  };
}
