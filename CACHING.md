# Server-Side Caching Implementation

This document describes the server-side caching architecture implemented in ChainGlass.

## Overview

ChainGlass now implements a comprehensive server-side caching system that:
- **Reduces API calls** to external services (CoinGecko, RPC providers)
- **Improves performance** by serving cached data when available
- **Implements smart refresh strategies** based on data patterns
- **Runs background refresh** to keep data fresh automatically

## Architecture

### Cache Manager (`app/lib/server/cache-manager.server.ts`)

The foundation of the caching system is a generic cache manager that provides:

- **TTL (Time To Live)**: Automatic expiration of cached data
- **Per-key caching**: Store any type of data with unique keys
- **Per-user caching**: Separate caches for different users/addresses
- **Automatic cleanup**: Removes expired entries periodically
- **Statistics tracking**: Monitor cache hits, misses, and performance

#### CacheManager Class

```typescript
const cache = new CacheManager<T>(defaultTTL);
cache.set(key, data, ttl?);           // Store data
cache.get(key);                        // Retrieve data (null if expired)
cache.getOrSet(key, factory, ttl?);   // Get or fetch pattern
cache.getStats();                      // Get cache statistics
```

#### UserCacheManager Class

```typescript
const userCache = new UserCacheManager<T>(defaultTTL);
userCache.set(userId, key, data, ttl?);   // Store per-user
userCache.get(userId, key);                // Retrieve per-user
userCache.clearUser(userId);               // Clear specific user
```

---

## Price Caching

**File**: `app/lib/server/prices.server.ts`

### Configuration

- **TTL**: 10 minutes (600,000ms)
- **Scope**: Global (shared across all users)
- **Source**: CoinGecko API

### Features

1. **Automatic Price Handling**
   - Stablecoins (USDC, USDT, DAI): Always $1.00 (no API call)
   - Wrapped tokens (WETH, WMATIC, etc.): Use native token price
   - Regular tokens: Fetch from CoinGecko

2. **Batch Optimization**
   - Multiple tokens fetched in single API request
   - Reduces API calls from N to 1 for batch requests

3. **Smart Caching**
   - Checks cache before making API calls
   - Only fetches uncached prices
   - Returns cached + fetched results

### API

```typescript
// Fetch single price
const price = await getTokenPrice(coingeckoId, symbol);

// Fetch multiple prices (optimized)
const result = await getTokenPrices([
  { symbol: 'ETH', coingeckoId: 'ethereum' },
  { symbol: 'USDC', coingeckoId: 'usd-coin' }
]);

// result.prices: Map<string, number>
// result.cached: string[] - IDs served from cache
// result.fetched: string[] - IDs fetched from API
```

---

## Balance Caching

**File**: `app/lib/server/balances.server.ts`

### Configuration

- **TTL (Non-zero balances)**: 10 minutes (600,000ms)
- **TTL (Zero balances)**: 1 hour (3,600,000ms)
- **Scope**: Per-user (per address)
- **Source**: RPC providers via Viem

### Smart Refresh Strategy

The balance cache implements an intelligent refresh strategy:

1. **First Request (No Cache)**
   - Fetches balances from ALL chains
   - Caches results with appropriate TTL
   - Tracks which chains had non-zero balances

2. **Subsequent Requests (With Cache)**
   - **Non-zero balance chains**: Refresh every 10 minutes
   - **Zero balance chains**: Refresh every 1 hour
   - Serves cached data when still valid

3. **Force Refresh**
   - Manual rescan bypasses cache
   - Fetches fresh data from all chains
   - Updates cache with new data

### Refresh Logic

```
Chain has non-zero balance → TTL = 10 minutes
Chain has zero balance → TTL = 1 hour
Cache expired → Fetch fresh data
Cache valid → Serve from cache
```

### API

```typescript
// Scan address (uses cache automatically)
const result = await scanAddress(address, {
  forceRefresh: false,        // Force bypass cache
  networksToScan: ['ethereum', 'polygon'] // Specific networks
});

// result.balances: NetworkBalance[]
// result.cached: string[] - Networks served from cache
// result.fetched: string[] - Networks fetched fresh
// result.refreshStrategy: Details on TTL for each network
```

---

## Background Refresh

**File**: `app/lib/server/background-refresh.server.ts`

### How It Works

1. **Automatic Start**: Initialized on server startup
2. **Active Addresses**: Tracks addresses that have been queried
3. **Periodic Refresh**: Runs every 5 minutes
4. **Smart Refresh**: Only refreshes data about to expire (within 2 minutes)

### Configuration

```typescript
// Refresh interval
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Started automatically in entry.server.tsx
startBackgroundRefresh();
```

### API

```typescript
// Register address for background refresh (automatic in API route)
registerActiveAddress(address);

// Manual operations
getActiveAddresses();           // List active addresses
triggerManualRefresh();         // Force refresh now
getRefreshStatus();            // Get status and stats
```

---

## API Routes

### GET `/api/prices`

Fetch token prices with caching.

**Query Parameters**:
- `tokens` (required): Comma-separated "symbol:coingeckoId" pairs
- `includeStats` (optional): Include cache statistics

**Example**:
```
GET /api/prices?tokens=ETH:ethereum,USDC:usd-coin&includeStats=true
```

**Response**:
```json
{
  "prices": {
    "ethereum": 2500.50,
    "usd-coin": 1.00
  },
  "cached": ["usd-coin"],
  "fetched": ["ethereum"],
  "errors": []
}
```

---

### GET `/api/balances/:address`

Fetch address balances with smart caching.

**Query Parameters**:
- `networks` (optional): Comma-separated network IDs
- `forceRefresh` (optional): Bypass cache (true/false)
- `includeStats` (optional): Include cache statistics

**Example**:
```
GET /api/balances/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb?forceRefresh=false
```

**Response**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balances": [...],
  "totalUsdValue": 1250.75,
  "cached": ["ethereum", "polygon"],
  "fetched": ["arbitrum"],
  "refreshStrategy": [
    { "networkId": "ethereum", "hadBalance": true, "ttl": 600000 },
    { "networkId": "polygon", "hadBalance": false, "ttl": 3600000 }
  ]
}
```

---

### GET `/api/cache-stats`

Get comprehensive cache statistics.

**Response**:
```json
{
  "prices": {
    "size": 10,
    "hits": 45,
    "misses": 12,
    "entries": [...]
  },
  "balances": {
    "balances": [...],
    "balanceStates": [...]
  },
  "timestamp": 1234567890
}
```

---

### POST `/api/cache-stats?action=clear`

Clear caches manually.

**Query Parameters**:
- `action=clear` (required)
- `type=prices|balances` (required)
- `address=0x...` (optional, for clearing specific user's balance cache)

**Examples**:
```
POST /api/cache-stats?action=clear&type=prices
POST /api/cache-stats?action=clear&type=balances&address=0x123...
```

---

## Client Integration

### Client-Side API Service

**File**: `app/lib/services/api-client.ts`

Provides client-side functions to interact with the caching API:

```typescript
import {
  fetchBalancesFromServer,
  fetchPricesFromServer,
  fetchCacheStats
} from '~/lib/services/api-client';

// Fetch balances
const result = await fetchBalancesFromServer(address, {
  networks: ['ethereum', 'polygon'],
  forceRefresh: false
});

// Fetch prices
const prices = await fetchPricesFromServer([
  { symbol: 'ETH', coingeckoId: 'ethereum' }
]);
```

### Server-Based Scanner

**File**: `app/lib/services/scanner-server.ts`

Drop-in replacement for client-side scanner that uses server cache:

```typescript
import { scanAddressFromServer } from '~/lib/services/scanner-server';

const portfolio = await scanAddressFromServer(
  addressId,
  address,
  label,
  onProgress,
  forceRefresh
);
```

---

## Performance Benefits

### Before (Client-Side Only)

- 🔴 Every page load: 5+ chains × 7+ tokens = 35+ RPC calls
- 🔴 Every page load: CoinGecko API calls for all tokens
- 🔴 No caching across users
- 🔴 Slow initial load times

### After (Server-Side Cache)

- ✅ First load: Normal API calls, data cached
- ✅ Subsequent loads: Instant from cache
- ✅ Prices shared across all users
- ✅ Smart refresh reduces unnecessary calls
- ✅ Background refresh keeps data fresh
- ✅ Zero-balance chains refreshed 6× less frequently

---

## Monitoring

### Cache Statistics

Access cache stats via:
1. API: `GET /api/cache-stats`
2. Code: `getPriceCacheStats()`, `getAllCacheStats()`

### Key Metrics

- **Cache Size**: Number of entries
- **Hit Rate**: `hits / (hits + misses)`
- **Entry Age**: Time since cached
- **TTL Remaining**: Time until expiration

---

## Configuration

### Adjust TTLs

Edit the constants in respective files:

**Prices** (`prices.server.ts`):
```typescript
const PRICE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
```

**Balances** (`balances.server.ts`):
```typescript
const NON_ZERO_BALANCE_TTL = 10 * 60 * 1000; // 10 minutes
const ZERO_BALANCE_TTL = 60 * 60 * 1000;     // 1 hour
```

**Background Refresh** (`background-refresh.server.ts`):
```typescript
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

---

## File Structure

```
app/
├── lib/
│   ├── server/                          # Server-only code
│   │   ├── cache-manager.server.ts      # Generic cache implementation
│   │   ├── prices.server.ts             # Price caching service
│   │   ├── balances.server.ts           # Balance caching service
│   │   └── background-refresh.server.ts # Auto-refresh service
│   └── services/
│       ├── api-client.ts                # Client-side API wrapper
│       └── scanner-server.ts            # Server-based scanner
├── routes/
│   ├── api.prices.ts                    # Price API endpoint
│   ├── api.balances.$address.ts         # Balance API endpoint
│   └── api.cache-stats.ts               # Cache stats/management
└── entry.server.tsx                     # Server entry (starts bg refresh)
```

---

## Best Practices

1. **Manual Refresh**: Use `forceRefresh=true` only when user explicitly requests it
2. **Network Selection**: Scan specific networks when possible to reduce load
3. **Error Handling**: Cache failures don't prevent fallback to direct API calls
4. **Cache Clearing**: Only clear caches when necessary (testing, debugging)
5. **Monitoring**: Regularly check cache stats to ensure healthy hit rates

---

## Future Improvements

Potential enhancements:

- [ ] Redis/Memcached for distributed caching
- [ ] Cache persistence across server restarts
- [ ] WebSocket updates for real-time balance changes
- [ ] Configurable TTLs per user preferences
- [ ] Cache warming on server startup
- [ ] Advanced cache eviction strategies (LRU)
