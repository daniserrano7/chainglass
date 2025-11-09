/**
 * Server-side cookie utilities for storing user addresses
 * Enables SSR by making addresses available on initial page load
 */

import type { WatchedAddress } from "../types/address";

// Cookie configuration
const COOKIE_NAME = "chainglass_addresses";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
const COOKIE_MAX_SIZE = 3800; // ~4KB limit, leave some buffer

// Additional cookies for overflow if needed
const COOKIE_NAME_OVERFLOW = "chainglass_addresses_overflow";

/**
 * Parse watched addresses from request cookies
 */
export function getWatchedAddressesFromCookies(
  request: Request
): WatchedAddress[] {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return [];
  }

  try {
    // Parse primary cookie
    const addresses: WatchedAddress[] = [];
    const primaryCookie = getCookieValue(cookieHeader, COOKIE_NAME);

    if (primaryCookie) {
      const decoded = decodeURIComponent(primaryCookie);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        addresses.push(...parsed);
      }
    }

    // Parse overflow cookie if exists
    const overflowCookie = getCookieValue(cookieHeader, COOKIE_NAME_OVERFLOW);
    if (overflowCookie) {
      const decoded = decodeURIComponent(overflowCookie);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        addresses.push(...parsed);
      }
    }

    return addresses;
  } catch (error) {
    console.error("Failed to parse addresses from cookies:", error);
    return [];
  }
}

/**
 * Create Set-Cookie headers for watched addresses
 * Handles splitting into multiple cookies if needed
 */
export function createAddressesCookieHeaders(
  addresses: WatchedAddress[]
): string[] {
  const headers: string[] = [];

  try {
    const serialized = JSON.stringify(addresses);
    const encoded = encodeURIComponent(serialized);

    // If fits in single cookie, use one
    if (encoded.length <= COOKIE_MAX_SIZE) {
      headers.push(createCookieHeader(COOKIE_NAME, encoded));
      // Clear overflow cookie if it exists
      headers.push(createCookieHeader(COOKIE_NAME_OVERFLOW, "", 0));
    } else {
      // Split into two cookies (primary + overflow)
      // Strategy: Split array roughly in half
      const midpoint = Math.ceil(addresses.length / 2);
      const primary = addresses.slice(0, midpoint);
      const overflow = addresses.slice(midpoint);

      const primarySerialized = encodeURIComponent(JSON.stringify(primary));
      const overflowSerialized = encodeURIComponent(JSON.stringify(overflow));

      // Verify both fit (if not, we have too much data)
      if (
        primarySerialized.length > COOKIE_MAX_SIZE ||
        overflowSerialized.length > COOKIE_MAX_SIZE
      ) {
        console.warn(
          "Address data too large for cookies. Truncating to first few addresses."
        );
        // Fallback: Keep only first N addresses that fit
        const truncated = truncateAddressesToFit(addresses, COOKIE_MAX_SIZE);
        const truncatedSerialized = encodeURIComponent(
          JSON.stringify(truncated)
        );
        headers.push(createCookieHeader(COOKIE_NAME, truncatedSerialized));
        headers.push(createCookieHeader(COOKIE_NAME_OVERFLOW, "", 0));
      } else {
        headers.push(createCookieHeader(COOKIE_NAME, primarySerialized));
        headers.push(
          createCookieHeader(COOKIE_NAME_OVERFLOW, overflowSerialized)
        );
      }
    }
  } catch (error) {
    console.error("Failed to create address cookies:", error);
  }

  return headers;
}

/**
 * Create a Set-Cookie header string
 */
function createCookieHeader(
  name: string,
  value: string,
  maxAge: number = COOKIE_MAX_AGE
): string {
  const parts = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "SameSite=Lax",
  ];

  // Use Secure flag in production
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/**
 * Extract cookie value from Cookie header
 */
function getCookieValue(
  cookieHeader: string,
  cookieName: string
): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name === cookieName) {
      return valueParts.join("="); // Handle values with = in them
    }
  }
  return null;
}

/**
 * Truncate addresses array to fit within size limit
 */
function truncateAddressesToFit(
  addresses: WatchedAddress[],
  maxSize: number
): WatchedAddress[] {
  const result: WatchedAddress[] = [];

  for (const address of addresses) {
    const testArray = [...result, address];
    const serialized = encodeURIComponent(JSON.stringify(testArray));

    if (serialized.length > maxSize) {
      break; // Stop adding if we exceed size
    }

    result.push(address);
  }

  return result;
}

/**
 * Get enabled networks from cookies
 */
export function getEnabledNetworksFromCookies(
  request: Request
): Record<string, string[]> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return {};
  }

  try {
    const cookie = getCookieValue(cookieHeader, "chainglass_networks");
    if (!cookie) {
      return {};
    }

    const decoded = decodeURIComponent(cookie);
    const parsed = JSON.parse(decoded);
    return parsed || {};
  } catch (error) {
    console.error("Failed to parse enabled networks from cookies:", error);
    return {};
  }
}

/**
 * Create Set-Cookie header for enabled networks
 */
export function createEnabledNetworksCookieHeader(
  networks: Record<string, string[]>
): string {
  try {
    const serialized = JSON.stringify(networks);
    const encoded = encodeURIComponent(serialized);
    return createCookieHeader("chainglass_networks", encoded);
  } catch (error) {
    console.error("Failed to create enabled networks cookie:", error);
    return createCookieHeader("chainglass_networks", "", 0);
  }
}
