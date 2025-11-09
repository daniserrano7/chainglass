/**
 * Server-based scanner service
 * Uses the server-side API for cached data fetching
 */

import type { AddressPortfolio, Network } from "../types";
import { fetchBalancesFromServer } from "./api-client";
import { getEnabledNetworks } from "../config/networks";

export type ScanProgressCallback = (progress: {
  networkId: string;
  networkName: string;
  status: "pending" | "scanning" | "completed" | "error";
  error?: string;
}) => void;

/**
 * Scan an address using the server-side cache
 * This replaces the client-side scanAddressComplete function
 */
export async function scanAddressFromServer(
  addressId: string,
  address: string,
  label?: string,
  onProgress?: ScanProgressCallback,
  forceRefresh: boolean = false
): Promise<AddressPortfolio> {
  const networks = getEnabledNetworks();

  // Notify progress: start scanning
  if (onProgress) {
    networks.forEach((network: Network) => {
      onProgress({
        networkId: network.id,
        networkName: network.name,
        status: "scanning",
      });
    });
  }

  try {
    // Fetch from server (uses cache automatically)
    const result = await fetchBalancesFromServer(address, {
      forceRefresh,
    });

    // Build portfolio from server result
    const portfolio: AddressPortfolio = {
      addressId,
      address: result.address,
      label,
      networkBalances: result.balances,
      totalUsdValue: result.totalUsdValue,
      lastScanned: Date.now(),
    };

    // Notify progress: completed
    if (onProgress) {
      result.balances.forEach((balance) => {
        onProgress({
          networkId: balance.networkId,
          networkName: balance.networkName,
          status: balance.error ? "error" : "completed",
          error: balance.error,
        });
      });
    }

    return portfolio;
  } catch (error) {
    // Notify progress: error
    if (onProgress) {
      networks.forEach((network: Network) => {
        onProgress({
          networkId: network.id,
          networkName: network.name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });
    }

    throw error;
  }
}

/**
 * Check if we should use server-side scanning
 * Returns true if running in browser, false if running on server
 */
export function shouldUseServerScanning(): boolean {
  return typeof window !== "undefined";
}
