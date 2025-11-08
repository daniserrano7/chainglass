import type {
  Network,
  NetworkBalance,
  Balance,
  AddressPortfolio,
} from "../types";
import { getEnabledNetworks, getTokensForNetwork } from "../config";
import {
  fetchNativeBalance,
  fetchTokenBalances,
} from "./rpc";
import { getTokenPrice, fetchTokenPrices } from "./prices";

/**
 * Scan progress callback type
 */
export type ScanProgressCallback = (progress: {
  networkId: string;
  networkName: string;
  status: "pending" | "scanning" | "completed" | "error";
  error?: string;
}) => void;

/**
 * Scan a single network for an address
 */
export async function scanNetwork(
  network: Network,
  address: string
): Promise<NetworkBalance> {
  const startTime = Date.now();

  try {
    const tokens = getTokensForNetwork(network.id);

    // Fetch native balance
    const nativeBalanceResult = await fetchNativeBalance(network, address);

    // Fetch token balances (only non-zero)
    const tokenBalanceResults = await fetchTokenBalances(
      network,
      tokens,
      address
    );

    // Collect all CoinGecko IDs for batch price fetching
    const coingeckoIds = new Set<string>();
    coingeckoIds.add(network.nativeToken.coingeckoId);

    for (const result of tokenBalanceResults) {
      if (result.token.coingeckoId) {
        coingeckoIds.add(result.token.coingeckoId);
      }
    }

    // Fetch all prices in batch
    const prices = await fetchTokenPrices(Array.from(coingeckoIds));

    // Process native balance
    let nativeBalance: Balance | undefined = undefined;
    let totalUsdValue = 0;

    if (nativeBalanceResult.amount > 0n) {
      const nativePrice =
        prices[network.nativeToken.coingeckoId] || null;
      const usdValue = nativePrice
        ? parseFloat(nativeBalanceResult.formatted) * nativePrice
        : undefined;

      nativeBalance = {
        symbol: network.nativeToken.symbol,
        amount: nativeBalanceResult.amount.toString(),
        formattedAmount: nativeBalanceResult.formatted,
        usdValue,
        decimals: network.nativeToken.decimals,
        isNative: true,
      };

      if (usdValue) {
        totalUsdValue += usdValue;
      }
    }

    // Process token balances
    const tokenBalances: Balance[] = [];

    for (const result of tokenBalanceResults) {
      const price = await getTokenPrice(
        result.token.symbol,
        result.token.coingeckoId
      );
      const usdValue = price
        ? parseFloat(result.formatted) * price
        : undefined;

      tokenBalances.push({
        symbol: result.token.symbol,
        amount: result.amount.toString(),
        formattedAmount: result.formatted,
        usdValue,
        decimals: result.token.decimals,
        isNative: false,
        contractAddress: result.token.address,
      });

      if (usdValue) {
        totalUsdValue += usdValue;
      }
    }

    const hasBalance = nativeBalance !== undefined || tokenBalances.length > 0;

    return {
      networkId: network.id,
      networkName: network.name,
      nativeBalance,
      tokenBalances,
      totalUsdValue,
      hasBalance,
      lastFetched: startTime,
    };
  } catch (error) {
    console.error(`Error scanning ${network.name}:`, error);

    return {
      networkId: network.id,
      networkName: network.name,
      tokenBalances: [],
      totalUsdValue: 0,
      hasBalance: false,
      lastFetched: startTime,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Scan an address across all enabled networks
 */
export async function scanAddress(
  address: string,
  progressCallback?: ScanProgressCallback
): Promise<NetworkBalance[]> {
  const networks = getEnabledNetworks();
  const results: NetworkBalance[] = [];

  // Notify about pending networks
  if (progressCallback) {
    for (const network of networks) {
      progressCallback({
        networkId: network.id,
        networkName: network.name,
        status: "pending",
      });
    }
  }

  // Scan each network sequentially
  // In Phase 3, we can parallelize this with concurrency limits
  for (const network of networks) {
    if (progressCallback) {
      progressCallback({
        networkId: network.id,
        networkName: network.name,
        status: "scanning",
      });
    }

    try {
      const result = await scanNetwork(network, address);
      results.push(result);

      if (progressCallback) {
        progressCallback({
          networkId: network.id,
          networkName: network.name,
          status: "completed",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      results.push({
        networkId: network.id,
        networkName: network.name,
        tokenBalances: [],
        totalUsdValue: 0,
        hasBalance: false,
        lastFetched: Date.now(),
        error: errorMessage,
      });

      if (progressCallback) {
        progressCallback({
          networkId: network.id,
          networkName: network.name,
          status: "error",
          error: errorMessage,
        });
      }
    }
  }

  return results;
}

/**
 * Build an AddressPortfolio from scan results
 */
export function buildAddressPortfolio(
  addressId: string,
  address: string,
  networkBalances: NetworkBalance[],
  label?: string
): AddressPortfolio {
  const totalUsdValue = networkBalances.reduce(
    (sum, nb) => sum + nb.totalUsdValue,
    0
  );

  return {
    addressId,
    address,
    label,
    networkBalances,
    totalUsdValue,
    lastScanned: Date.now(),
  };
}

/**
 * Scan an address and return a complete portfolio
 */
export async function scanAddressComplete(
  addressId: string,
  address: string,
  label?: string,
  progressCallback?: ScanProgressCallback
): Promise<AddressPortfolio> {
  const networkBalances = await scanAddress(address, progressCallback);
  return buildAddressPortfolio(addressId, address, networkBalances, label);
}

/**
 * Rescan a single network for an address (for retry functionality)
 */
export async function rescanNetwork(
  network: Network,
  address: string
): Promise<NetworkBalance> {
  return scanNetwork(network, address);
}

/**
 * Scan multiple addresses in parallel (with concurrency limit)
 */
export async function scanMultipleAddresses(
  addresses: Array<{ id: string; address: string; label?: string }>,
  progressCallback?: ScanProgressCallback,
  concurrency: number = 2
): Promise<AddressPortfolio[]> {
  const results: AddressPortfolio[] = [];

  // Simple sequential processing for MVP
  // In Phase 3, implement proper concurrency control
  for (const addr of addresses) {
    const portfolio = await scanAddressComplete(
      addr.id,
      addr.address,
      addr.label,
      progressCallback
    );
    results.push(portfolio);
  }

  return results;
}
