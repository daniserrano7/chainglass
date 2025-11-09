/**
 * API route for fetching token prices
 * GET /api/prices?tokens=ethereum,matic-network,binancecoin
 */

import type { LoaderFunctionArgs } from "react-router";
import { getTokenPrices, getPriceCacheStats } from "../lib/server/prices.server";
import {
  handleApiError,
  createValidationError,
} from "../lib/utils/api-error";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const tokensParam = url.searchParams.get("tokens");
    const includeStats = url.searchParams.get("includeStats") === "true";

    // Validate required parameter
    if (!tokensParam) {
      throw createValidationError(
        "Missing 'tokens' query parameter. Expected format: 'symbol1:coingeckoId1,symbol2:coingeckoId2'"
      );
    }

    // Parse tokens parameter
    // Expected format: "symbol1:coingeckoId1,symbol2:coingeckoId2"
    // Example: "ETH:ethereum,MATIC:matic-network"
    const tokenPairs = tokensParam.split(",").map((pair) => {
      const [symbol, coingeckoId] = pair.split(":");
      if (!symbol || !coingeckoId) {
        throw createValidationError(
          `Invalid token format in '${pair}'. Expected format: 'symbol:coingeckoId'`
        );
      }
      return { symbol, coingeckoId };
    });

    // Fetch prices
    const result = await getTokenPrices(tokenPairs);

    // Convert Map to object for JSON serialization
    const pricesObject: Record<string, number> = {};
    result.prices.forEach((price, coingeckoId) => {
      pricesObject[coingeckoId] = price;
    });

    const response: any = {
      prices: pricesObject,
      cached: result.cached,
      fetched: result.fetched,
      errors: result.errors,
    };

    if (includeStats) {
      response.cacheStats = getPriceCacheStats();
    }

    return Response.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
