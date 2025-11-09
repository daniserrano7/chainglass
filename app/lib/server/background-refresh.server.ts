/**
 * Background refresh service
 * Automatically refreshes caches for active addresses
 */

import {
  backgroundPriceRefresh,
  getPriceCacheStats,
} from "./prices.server";
import {
  backgroundBalanceRefresh,
  getAllCacheStats,
} from "./balances.server";

// Track active addresses for background refresh
const activeAddresses = new Set<string>();
let refreshInterval: NodeJS.Timeout | null = null;
let isRunning = false;

// Refresh every 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000;

/**
 * Register an address as active for background refresh
 */
export function registerActiveAddress(address: string): void {
  activeAddresses.add(address.toLowerCase());
}

/**
 * Unregister an address from background refresh
 */
export function unregisterActiveAddress(address: string): void {
  activeAddresses.delete(address.toLowerCase());
}

/**
 * Get list of active addresses
 */
export function getActiveAddresses(): string[] {
  return Array.from(activeAddresses);
}

/**
 * Clear all active addresses
 */
export function clearActiveAddresses(): void {
  activeAddresses.clear();
}

/**
 * Perform background refresh for prices and balances
 */
async function performRefresh(): Promise<void> {
  if (activeAddresses.size === 0) {
    console.log("Background refresh: No active addresses, skipping");
    return;
  }

  console.log(
    `Background refresh: Starting refresh for ${activeAddresses.size} addresses...`
  );

  try {
    // Refresh prices (global)
    await backgroundPriceRefresh();

    // Refresh balances for active addresses
    await backgroundBalanceRefresh(Array.from(activeAddresses));

    console.log("Background refresh: Complete");
  } catch (error) {
    console.error("Background refresh: Error during refresh:", error);
  }
}

/**
 * Start background refresh service
 */
export function startBackgroundRefresh(): void {
  if (isRunning) {
    console.log("Background refresh: Already running");
    return;
  }

  console.log(
    `Background refresh: Starting (interval: ${REFRESH_INTERVAL / 1000}s)`
  );
  isRunning = true;

  // Perform initial refresh after 1 minute
  setTimeout(() => {
    performRefresh();
  }, 60 * 1000);

  // Set up periodic refresh
  refreshInterval = setInterval(() => {
    performRefresh();
  }, REFRESH_INTERVAL);
}

/**
 * Stop background refresh service
 */
export function stopBackgroundRefresh(): void {
  if (!isRunning) {
    console.log("Background refresh: Not running");
    return;
  }

  console.log("Background refresh: Stopping");
  isRunning = false;

  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

/**
 * Get background refresh status
 */
export function getRefreshStatus() {
  const priceStats = getPriceCacheStats();
  const balanceStats = getAllCacheStats();

  return {
    isRunning,
    activeAddressCount: activeAddresses.size,
    activeAddresses: Array.from(activeAddresses),
    refreshInterval: REFRESH_INTERVAL,
    cacheStats: {
      prices: priceStats,
      balances: balanceStats,
    },
  };
}

/**
 * Manually trigger a refresh
 */
export async function triggerManualRefresh(): Promise<void> {
  console.log("Manual refresh triggered");
  await performRefresh();
}
