/**
 * Server-side USD price caching service
 * Prices are shared across all users with 10-minute refresh interval
 */

import { CacheManager } from "./cache-manager.server";

// Cache TTL: 10 minutes
const PRICE_CACHE_TTL = 10 * 60 * 1000;

// Global price cache instance
const priceCache = new CacheManager<number>(PRICE_CACHE_TTL);

export interface TokenPriceRequest {
  coingeckoId: string;
  symbol: string;
}

export interface BatchPriceResult {
  prices: Map<string, number>;
  cached: string[];
  fetched: string[];
  errors: string[];
}

/**
 * Fetch a single token price from CoinGecko
 */
async function fetchPriceFromAPI(coingeckoId: string): Promise<number | null> {
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        `CoinGecko API error for ${coingeckoId}: ${response.status}`
      );
      return null;
    }

    const data = await response.json();
    const price = data[coingeckoId]?.usd;

    if (typeof price !== "number") {
      console.error(`Invalid price data for ${coingeckoId}:`, data);
      return null;
    }

    return price;
  } catch (error) {
    console.error(`Error fetching price for ${coingeckoId}:`, error);
    return null;
  }
}

/**
 * Fetch multiple token prices from CoinGecko in a single request
 */
async function fetchPricesFromAPI(
  coingeckoIds: string[]
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();

  if (coingeckoIds.length === 0) {
    return prices;
  }

  try {
    const ids = coingeckoIds.join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`CoinGecko API batch error: ${response.status}`);
      return prices;
    }

    const data = await response.json();

    for (const coingeckoId of coingeckoIds) {
      const price = data[coingeckoId]?.usd;
      if (typeof price === "number") {
        prices.set(coingeckoId, price);
      }
    }
  } catch (error) {
    console.error("Error fetching batch prices:", error);
  }

  return prices;
}

/**
 * Check if a token is a stablecoin (always $1.00)
 */
function isStablecoin(symbol: string): boolean {
  const stablecoins = ["USDC", "USDT", "DAI", "USDC.E", "USDCE"];
  return stablecoins.includes(symbol.toUpperCase());
}

/**
 * Get the native token CoinGecko ID for wrapped tokens
 */
function getNativeTokenId(symbol: string): string | null {
  const wrappedTokens: Record<string, string> = {
    WETH: "ethereum",
    WMATIC: "matic-network",
    WBNB: "binancecoin",
    WAVAX: "avalanche-2",
    WFTM: "fantom",
  };
  return wrappedTokens[symbol.toUpperCase()] || null;
}

/**
 * Get a single token price (with caching)
 * Handles stablecoins and wrapped tokens automatically
 */
export async function getTokenPrice(
  coingeckoId: string,
  symbol: string
): Promise<number | null> {
  // Handle stablecoins
  if (isStablecoin(symbol)) {
    return 1.0;
  }

  // Handle wrapped tokens
  const nativeId = getNativeTokenId(symbol);
  const lookupId = nativeId || coingeckoId;

  // Check cache first
  const cached = priceCache.get(lookupId);
  if (cached !== null) {
    return cached;
  }

  // Fetch from API
  const price = await fetchPriceFromAPI(lookupId);
  if (price !== null) {
    priceCache.set(lookupId, price);
  }

  return price;
}

/**
 * Get multiple token prices (with caching and batch optimization)
 * Returns a map of coingeckoId -> price
 */
export async function getTokenPrices(
  tokens: TokenPriceRequest[]
): Promise<BatchPriceResult> {
  const result: BatchPriceResult = {
    prices: new Map(),
    cached: [],
    fetched: [],
    errors: [],
  };

  const toFetch: string[] = [];
  const fetchMap = new Map<string, TokenPriceRequest[]>(); // Map coingeckoId to original requests

  for (const token of tokens) {
    // Handle stablecoins
    if (isStablecoin(token.symbol)) {
      result.prices.set(token.coingeckoId, 1.0);
      result.cached.push(token.coingeckoId);
      continue;
    }

    // Handle wrapped tokens
    const nativeId = getNativeTokenId(token.symbol);
    const lookupId = nativeId || token.coingeckoId;

    // Check cache
    const cached = priceCache.get(lookupId);
    if (cached !== null) {
      result.prices.set(token.coingeckoId, cached);
      result.cached.push(token.coingeckoId);
    } else {
      // Need to fetch
      if (!toFetch.includes(lookupId)) {
        toFetch.push(lookupId);
      }
      if (!fetchMap.has(lookupId)) {
        fetchMap.set(lookupId, []);
      }
      fetchMap.get(lookupId)!.push(token);
    }
  }

  // Batch fetch uncached prices
  if (toFetch.length > 0) {
    const fetchedPrices = await fetchPricesFromAPI(toFetch);

    for (const [coingeckoId, price] of fetchedPrices.entries()) {
      // Cache the fetched price
      priceCache.set(coingeckoId, price);

      // Map to all original requests
      const originalTokens = fetchMap.get(coingeckoId) || [];
      for (const token of originalTokens) {
        result.prices.set(token.coingeckoId, price);
        result.fetched.push(token.coingeckoId);
      }
    }

    // Track errors for tokens that failed to fetch
    for (const lookupId of toFetch) {
      if (!fetchedPrices.has(lookupId)) {
        const originalTokens = fetchMap.get(lookupId) || [];
        for (const token of originalTokens) {
          result.errors.push(token.coingeckoId);
        }
      }
    }
  }

  return result;
}

/**
 * Calculate USD value from token amount and price
 */
export function calculateUsdValue(
  amount: string,
  decimals: number,
  price: number | null
): number | undefined {
  if (price === null || price === undefined) {
    return undefined;
  }

  try {
    const numericAmount = parseFloat(amount) / Math.pow(10, decimals);
    return numericAmount * price;
  } catch {
    return undefined;
  }
}

/**
 * Get cache statistics
 */
export function getPriceCacheStats() {
  return priceCache.getStats();
}

/**
 * Clear price cache (useful for testing or manual refresh)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Manually refresh prices for specific tokens
 */
export async function refreshTokenPrices(
  tokens: TokenPriceRequest[]
): Promise<Map<string, number>> {
  const coingeckoIds = tokens
    .filter((t) => !isStablecoin(t.symbol))
    .map((t) => {
      const nativeId = getNativeTokenId(t.symbol);
      return nativeId || t.coingeckoId;
    })
    .filter((id, index, self) => self.indexOf(id) === index); // unique

  const fetchedPrices = await fetchPricesFromAPI(coingeckoIds);

  // Update cache
  for (const [coingeckoId, price] of fetchedPrices.entries()) {
    priceCache.set(coingeckoId, price);
  }

  return fetchedPrices;
}

/**
 * Background refresh for active tokens
 * Call this periodically to keep frequently accessed prices fresh
 */
export async function backgroundPriceRefresh(): Promise<void> {
  const stats = priceCache.getStats();
  const now = Date.now();

  // Find entries that are about to expire (within 2 minutes)
  const toRefresh = stats.entries
    .filter((entry) => {
      const timeUntilExpiry = entry.ttl - entry.age;
      return timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0;
    })
    .map((entry) => entry.key);

  if (toRefresh.length > 0) {
    console.log(
      `Background refresh: refreshing ${toRefresh.length} prices...`
    );
    await fetchPricesFromAPI(toRefresh);
  }
}
