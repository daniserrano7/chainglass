/**
 * API route for fetching address balances
 * GET /api/balances/:address?networks=ethereum,polygon&forceRefresh=false&includeStats=false
 */


import type { LoaderFunctionArgs } from "react-router";
import {
  scanAddress,
  getBalanceCacheStats,
} from "../lib/server/balances.server";
import { registerActiveAddress } from "../lib/server/background-refresh.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { address } = params;

  if (!address) {
    return Response.json({ error: "Missing address parameter" }, { status: 400 });
  }

  // Validate address format (basic check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return Response.json({ error: "Invalid Ethereum address format" }, { status: 400 });
  }

  const url = new URL(request.url);
  const networksParam = url.searchParams.get("networks");
  const forceRefresh = url.searchParams.get("forceRefresh") === "true";
  const includeStats = url.searchParams.get("includeStats") === "true";

  try {
    // Register address as active for background refresh
    registerActiveAddress(address);

    // Parse networks parameter
    const networksToScan = networksParam
      ? networksParam.split(",").filter(Boolean)
      : undefined;

    // Scan address
    const result = await scanAddress(address, {
      forceRefresh,
      networksToScan,
    });

    const response: any = {
      address,
      balances: result.balances,
      totalUsdValue: result.totalUsdValue,
      cached: result.cached,
      fetched: result.fetched,
      errors: result.errors,
      refreshStrategy: result.refreshStrategy,
    };

    if (includeStats) {
      response.cacheStats = getBalanceCacheStats(address);
    }

    return Response.json(response);
  } catch (error) {
    console.error(`Error in /api/balances/${address}:`, error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
