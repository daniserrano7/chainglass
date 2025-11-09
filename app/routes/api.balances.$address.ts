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
import {
  handleApiError,
  createValidationError,
} from "../lib/utils/api-error";

export async function loader({ params, request }: LoaderFunctionArgs) {
  try {
    const { address } = params;

    // Validate address parameter
    if (!address) {
      throw createValidationError("Missing address parameter");
    }

    // Validate address format (basic check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw createValidationError(
        "Invalid Ethereum address format. Expected format: 0x followed by 40 hexadecimal characters"
      );
    }

    const url = new URL(request.url);
    const networksParam = url.searchParams.get("networks");
    const forceRefresh = url.searchParams.get("forceRefresh") === "true";
    const includeStats = url.searchParams.get("includeStats") === "true";

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
    return handleApiError(error);
  }
}
