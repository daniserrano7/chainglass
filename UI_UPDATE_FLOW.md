# UI Update Flow with Server-Side Caching

This document explains how the UI updates when data is fetched or refreshed from the server cache.

## Overview

The application now ensures seamless UI updates throughout the data lifecycle, from initial load to manual refreshes. Users always see current data with appropriate loading indicators.

---

## Data Flow Architecture

```
User Action → Frontend Request → Server API → Cache Check → Data Response → UI Update
```

### Detailed Flow:

1. **User Action**: Page load, add address, or rescan button click
2. **Frontend Request**: `scanAddressFromServer()` calls `/api/balances/:address`
3. **Server API**: Checks cache, fetches fresh data if needed
4. **Cache Check**:
   - Cache hit → Return cached data instantly
   - Cache miss → Fetch from blockchain, cache result
5. **Data Response**: Server returns balance data with metadata
6. **UI Update**: React state updates trigger re-render

---

## Loading States

### 1. Initial Page Load

**When**: User first opens the app or refreshes the page

**Behavior**:
```typescript
isInitialLoading = true
portfolios.length = 0
```

**UI Display**:
- Shows animated spinner
- Message: "Loading your portfolio..."
- Subtitle: "Fetching balances from server cache"

**Update Flow**:
```
Start → isInitialLoading: true → Fetch addresses → Load each portfolio
  ↓
Portfolio 1 loaded → setPortfolios([portfolio1]) → UI shows 1 address
  ↓
Portfolio 2 loaded → setPortfolios([portfolio1, portfolio2]) → UI shows 2 addresses
  ↓
All done → isInitialLoading: false → Full portfolio displayed
```

**Code Location**: `app/routes/_index.tsx:51-75`

---

### 2. Adding New Address

**When**: User submits new address via form

**Behavior**:
```typescript
isLoading = true
scanState = { addressId, networks: [...] }
```

**UI Display**:
- Form disabled (shows loading state)
- ScanProgress component shows network-by-network progress
- Real-time updates as each network completes

**Update Flow**:
```
Add button clicked → isLoading: true → Create WatchedAddress
  ↓
scanAddressFromServer() → Progress callback for each network
  ↓
Ethereum: scanning → Progress update → UI shows "Ethereum: scanning"
  ↓
Ethereum: completed → Progress update → UI shows "Ethereum: ✓"
  ↓
Polygon: scanning → ... (repeat for all networks)
  ↓
Portfolio complete → setPortfolios([...prev, newPortfolio]) → UI shows new address card
  ↓
isLoading: false → Form re-enabled
```

**Code Location**: `app/routes/_index.tsx:145-177`

---

### 3. Manual Rescan

**When**: User clicks "Rescan" button on an address card

**Behavior**:
```typescript
isLoading = true
scanState = { addressId, networks: [...] }
forceRefresh = true  // Bypasses cache
```

**UI Display**:
- Rescan button disabled
- ScanProgress shows network updates
- Address card shows "scanning" state
- Data updates in real-time

**Update Flow**:
```
Rescan clicked → isLoading: true → Find address in storage
  ↓
scanAddressFromServer(forceRefresh: true) → Bypass cache, fetch fresh data
  ↓
Each network scanned → Progress callbacks → UI updates per network
  ↓
New data received → setPortfolios(updated) → UI shows updated balances
  ↓
isLoading: false → Rescan button re-enabled
```

**Code Location**: `app/routes/_index.tsx:179-202`

---

### 4. Background Cache Updates

**When**: Server background refresh runs (every 5 minutes)

**Behavior**:
- Silent updates in server cache
- No UI loading indicators
- Next user request gets fresh data instantly

**Update Flow**:
```
Background timer (5 min) → Check active addresses → Find expiring cache entries
  ↓
Refresh prices (within 2 min of 10 min TTL)
  ↓
Refresh balances (within 2 min of their TTL)
  ↓
Cache updated → Next user request → Instant response with fresh data
```

**Code Location**: `app/lib/server/background-refresh.server.ts:51-68`

---

## State Management

### React State Variables

| State | Type | Purpose |
|-------|------|---------|
| `portfolios` | `AddressPortfolio[]` | Current portfolio data |
| `isLoading` | `boolean` | Manual actions (add/rescan) |
| `isInitialLoading` | `boolean` | First page load |
| `scanState` | `ScanState \| null` | Network-by-network progress |
| `error` | `string \| null` | Error messages |

### Update Triggers

**portfolios State Updates**:
```typescript
// Add new portfolio
setPortfolios(prev => [...prev, newPortfolio]);

// Update existing portfolio
setPortfolios(prev => {
  const updated = [...prev];
  updated[index] = newPortfolio;
  return updated;
});

// Remove portfolio
setPortfolios(prev => prev.filter(p => p.addressId !== id));
```

**Automatic Re-renders**:
- `portfolios` change → AddressCard components re-render
- `portfolios` change → PortfolioSummary recalculates totals
- `isLoading` change → Form/buttons enable/disable
- `scanState` change → ScanProgress updates

---

## Error Handling

### Individual Address Failure

**Scenario**: One address fails during initial load

**Behavior**:
```typescript
try {
  await scanAddress(address, false);
} catch (err) {
  console.error(`Failed to scan address ${address.address}:`, err);
  // Continue with other addresses
}
```

**Result**:
- Error logged to console
- Other addresses continue loading
- UI shows successfully loaded addresses
- `isInitialLoading` still clears when done

---

### Network Failure

**Scenario**: One blockchain network fails during scan

**Behavior**:
- Server returns error in `networkBalance.error` field
- Progress callback shows error status
- UI displays error icon for that network
- Other networks display normally

---

### Complete Failure

**Scenario**: All networks fail or server error

**Behavior**:
```typescript
catch (err) {
  setError(err.message);
  setIsLoading(false);
}
```

**Result**:
- Error banner shown at top of page
- Loading states cleared
- User can dismiss error or retry

---

## Performance Optimizations

### 1. Incremental Updates

Portfolios display as soon as loaded, not waiting for all addresses:

```typescript
// ✅ Good: Show addresses as they load
for (const address of addresses) {
  await scanAddress(address, false);
  // setPortfolios called inside scanAddress
  // UI updates immediately after each address
}

// ❌ Bad: Wait for all, then update
const allPortfolios = await Promise.all(addresses.map(scan));
setPortfolios(allPortfolios); // UI frozen until all complete
```

### 2. Cache-First Strategy

Server checks cache before making RPC calls:

```typescript
// Server-side (balances.server.ts)
const cached = getCachedBalance(address, networkId);
if (cached && !forceRefresh) {
  return cached; // Instant response
}
// Only fetch if cache miss or forced
```

### 3. Shared Price Cache

USD prices shared across all users:

```typescript
// User A requests ETH price → Cache miss → Fetch → Cache: 10 min
// User B requests ETH price (5 min later) → Cache hit → Instant

// Benefit: 1 CoinGecko API call serves all users
```

---

## Visual Feedback Timeline

### Initial Load (3 addresses)

```
0ms:   Loading spinner appears
       "Loading your portfolio..."

500ms: First address data arrives from cache
       → Spinner disappears
       → Address card #1 shown
       → Portfolio summary: $1,234.56

700ms: Second address data arrives
       → Address card #2 added
       → Portfolio summary: $2,567.89

900ms: Third address data arrives
       → Address card #3 added
       → Portfolio summary: $4,890.12
       → isInitialLoading = false
```

### Manual Rescan

```
0ms:   User clicks "Rescan"
       → Button disabled
       → Scan progress modal opens

100ms: Ethereum network: scanning...
500ms: Ethereum network: ✓ completed
600ms: Polygon network: scanning...
800ms: Polygon network: ✓ completed
       ... (continue for all networks)

2000ms: All networks complete
        → Scan progress modal closes after 2s delay
        → Updated balances shown
        → Button re-enabled
```

---

## Component Hierarchy

```
Index
├── PortfolioSummary (updates when portfolios change)
├── AddAddressForm (disabled when isLoading)
├── Error Banner (shown when error exists)
├── ScanProgress (shown when scanState exists)
└── Addresses Section
    ├── Loading State (shown when isInitialLoading && no portfolios)
    ├── Address Cards (map over portfolios array)
    │   ├── AddressCard #1
    │   ├── AddressCard #2
    │   └── AddressCard #3
    └── Empty State (shown when no portfolios)
```

---

## Key Takeaways

1. **UI Always Updates**: React state changes trigger immediate re-renders
2. **Progressive Display**: Data shows incrementally, not all-or-nothing
3. **Error Resilient**: One failure doesn't break entire UI
4. **Loading Feedback**: Users always know when data is being fetched
5. **Cache Transparent**: Users don't need to know about caching
6. **Background Refresh**: Cache stays fresh without user action

---

## Testing UI Updates

### Manual Testing Checklist

- [ ] Initial load shows spinner, then addresses appear
- [ ] Adding address shows progress for each network
- [ ] Rescan updates balances and shows progress
- [ ] Multiple addresses load incrementally
- [ ] Error on one address doesn't break others
- [ ] Portfolio summary updates with each new address
- [ ] Cached data returns instantly (< 100ms)
- [ ] Force refresh fetches new data
- [ ] Background refresh keeps cache warm

### Browser DevTools

**Monitor State Changes**:
```javascript
// In React DevTools
Watch: portfolios, isLoading, isInitialLoading, scanState

// In Network tab
Filter: /api/balances
Check: Response time, cache hit/miss in response metadata
```

---

## Future Enhancements

Potential improvements to UI updates:

- [ ] WebSocket for real-time balance updates
- [ ] Optimistic UI updates (show expected result before server confirms)
- [ ] Skeleton screens instead of spinner
- [ ] Toast notifications for background updates
- [ ] Diff highlighting when balances change
- [ ] Animation when values update
