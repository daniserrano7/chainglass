import type { WatchedAddress } from "../types";

/**
 * LocalStorage keys
 */
const STORAGE_KEYS = {
  WATCHED_ADDRESSES: "chainglass:watchedAddresses",
  ENABLED_NETWORKS: "chainglass:enabledNetworks",
  CUSTOM_TOKENS: "chainglass:customTokens",
} as const;

/**
 * Storage service for persisting user data
 */

/**
 * Get all watched addresses from localStorage
 */
export function getWatchedAddresses(): WatchedAddress[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WATCHED_ADDRESSES);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load watched addresses:", error);
    return [];
  }
}

/**
 * Save watched addresses to localStorage
 */
export function saveWatchedAddresses(addresses: WatchedAddress[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.WATCHED_ADDRESSES,
      JSON.stringify(addresses)
    );
  } catch (error) {
    console.error("Failed to save watched addresses:", error);
  }
}

/**
 * Add a new watched address
 */
export function addWatchedAddress(address: WatchedAddress): void {
  const addresses = getWatchedAddresses();

  // Check for duplicates
  const exists = addresses.some(
    (a) =>
      a.address.toLowerCase() === address.address.toLowerCase() &&
      a.chainFamily === address.chainFamily
  );

  if (exists) {
    throw new Error(
      `Address ${address.address} is already being tracked for ${address.chainFamily}`
    );
  }

  addresses.push(address);
  saveWatchedAddresses(addresses);
}

/**
 * Remove a watched address by ID
 */
export function removeWatchedAddress(id: string): void {
  const addresses = getWatchedAddresses();
  const filtered = addresses.filter((a) => a.id !== id);
  saveWatchedAddresses(filtered);
}

/**
 * Update a watched address
 */
export function updateWatchedAddress(
  id: string,
  updates: Partial<WatchedAddress>
): void {
  const addresses = getWatchedAddresses();
  const index = addresses.findIndex((a) => a.id === id);

  if (index === -1) {
    throw new Error(`Address with ID ${id} not found`);
  }

  addresses[index] = { ...addresses[index], ...updates };
  saveWatchedAddresses(addresses);
}

/**
 * Update last scanned timestamp for an address
 */
export function updateLastScanned(id: string, networksScanned: string[]): void {
  updateWatchedAddress(id, {
    lastScanned: Date.now(),
    networksScanned,
  });
}

/**
 * Get a single watched address by ID
 */
export function getWatchedAddressById(id: string): WatchedAddress | undefined {
  const addresses = getWatchedAddresses();
  return addresses.find((a) => a.id === id);
}

/**
 * Clear all watched addresses (for testing)
 */
export function clearWatchedAddresses(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.WATCHED_ADDRESSES);
}

/**
 * Generate a unique ID for a new address
 */
export function generateAddressId(): string {
  return `addr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get enabled networks for a chain family
 */
export function getEnabledNetworksForFamily(
  chainFamily: string
): string[] | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED_NETWORKS);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed[chainFamily] || null;
  } catch (error) {
    console.error("Failed to load enabled networks:", error);
    return null;
  }
}

/**
 * Save enabled networks for a chain family
 */
export function saveEnabledNetworks(
  chainFamily: string,
  networks: string[]
): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED_NETWORKS);
    const parsed = stored ? JSON.parse(stored) : {};

    parsed[chainFamily] = networks;

    localStorage.setItem(STORAGE_KEYS.ENABLED_NETWORKS, JSON.stringify(parsed));
  } catch (error) {
    console.error("Failed to save enabled networks:", error);
  }
}
