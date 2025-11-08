import { PriceCache } from '../types';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory price cache
const priceCache: PriceCache = {};

// Hardcoded stablecoin prices
const STABLECOIN_PRICE = 1.0;
const STABLECOINS = ['usd-coin', 'tether', 'dai'];

/**
 * Fetches USD price for a single token from CoinGecko
 */
async function fetchPriceFromCoinGecko(coinGeckoId: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${coinGeckoId}&vs_currencies=usd`
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data[coinGeckoId]?.usd !== undefined) {
      return data[coinGeckoId].usd;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching price for ${coinGeckoId}:`, error);
    return null;
  }
}

/**
 * Fetches USD prices for multiple tokens from CoinGecko
 */
async function fetchPricesFromCoinGecko(coinGeckoIds: string[]): Promise<Record<string, number>> {
  try {
    const idsParam = coinGeckoIds.join(',');
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${idsParam}&vs_currencies=usd`
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const id of coinGeckoIds) {
      if (data[id]?.usd !== undefined) {
        prices[id] = data[id].usd;
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    return {};
  }
}

/**
 * Gets USD price for a token, using cache if available
 */
export async function getTokenPrice(coinGeckoId: string | undefined): Promise<number | null> {
  if (!coinGeckoId) {
    return null;
  }

  // Return hardcoded price for stablecoins
  if (STABLECOINS.includes(coinGeckoId)) {
    return STABLECOIN_PRICE;
  }

  // Check cache
  const cached = priceCache[coinGeckoId];
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.price;
  }

  // Fetch fresh price
  const price = await fetchPriceFromCoinGecko(coinGeckoId);

  if (price !== null) {
    priceCache[coinGeckoId] = {
      price,
      timestamp: now,
    };
  }

  return price;
}

/**
 * Gets USD prices for multiple tokens, using cache if available
 */
export async function getTokenPrices(coinGeckoIds: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const idsToFetch: string[] = [];
  const now = Date.now();

  // Check cache and handle stablecoins
  for (const id of coinGeckoIds) {
    // Hardcoded stablecoin prices
    if (STABLECOINS.includes(id)) {
      prices[id] = STABLECOIN_PRICE;
      continue;
    }

    // Check cache
    const cached = priceCache[id];
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      prices[id] = cached.price;
    } else {
      idsToFetch.push(id);
    }
  }

  // Fetch missing prices
  if (idsToFetch.length > 0) {
    const fetchedPrices = await fetchPricesFromCoinGecko(idsToFetch);

    for (const [id, price] of Object.entries(fetchedPrices)) {
      prices[id] = price;
      priceCache[id] = {
        price,
        timestamp: now,
      };
    }
  }

  return prices;
}

/**
 * Clears the price cache
 */
export function clearPriceCache(): void {
  for (const key in priceCache) {
    delete priceCache[key];
  }
}

/**
 * Gets cache statistics for debugging
 */
export function getCacheStats(): { total: number; expired: number; valid: number } {
  const now = Date.now();
  let total = 0;
  let expired = 0;
  let valid = 0;

  for (const entry of Object.values(priceCache)) {
    total++;
    if ((now - entry.timestamp) >= CACHE_DURATION) {
      expired++;
    } else {
      valid++;
    }
  }

  return { total, expired, valid };
}
