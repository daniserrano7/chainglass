/**
 * Client-side cookie synchronization utilities
 * Handles migration from localStorage to cookies
 */

import type { WatchedAddress } from "../types/address";

const COOKIE_NAME = "chainglass_addresses";
const COOKIE_NAME_OVERFLOW = "chainglass_addresses_overflow";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Sync watched addresses to cookies (client-side)
 */
export function syncAddressesToCookies(addresses: WatchedAddress[]): void {
  try {
    const serialized = JSON.stringify(addresses);
    const encoded = encodeURIComponent(serialized);

    // Calculate cookie attributes
    const secure = window.location.protocol === "https:" ? "Secure; " : "";
    const cookieString = `${COOKIE_NAME}=${encoded}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; ${secure}`;

    // Set the cookie
    document.cookie = cookieString;

    console.log(
      `Synced ${addresses.length} addresses to cookies (${encoded.length} bytes)`
    );
  } catch (error) {
    console.error("Failed to sync addresses to cookies:", error);
  }
}

/**
 * Sync enabled networks to cookies (client-side)
 */
export function syncEnabledNetworksToCookies(
  networks: Record<string, string[]>
): void {
  try {
    const serialized = JSON.stringify(networks);
    const encoded = encodeURIComponent(serialized);

    const secure = window.location.protocol === "https:" ? "Secure; " : "";
    const cookieString = `chainglass_networks=${encoded}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax; ${secure}`;

    document.cookie = cookieString;
  } catch (error) {
    console.error("Failed to sync enabled networks to cookies:", error);
  }
}

/**
 * Get a cookie value by name (client-side)
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [cookieName, ...valueParts] = cookie.split("=");
    if (cookieName === name) {
      return valueParts.join("=");
    }
  }
  return null;
}

/**
 * Check if addresses are already in cookies
 */
export function hasAddressesInCookies(): boolean {
  return getCookie(COOKIE_NAME) !== null;
}

/**
 * Delete address cookies (for testing/cleanup)
 */
export function clearAddressCookies(): void {
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/;`;
  document.cookie = `${COOKIE_NAME_OVERFLOW}=; Max-Age=0; Path=/;`;
  document.cookie = `chainglass_networks=; Max-Age=0; Path=/;`;
}
