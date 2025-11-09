/**
 * API route for fetching token prices
 * GET /api/prices?tokens=ethereum,matic-network,binancecoin
 */


import type { LoaderFunctionArgs } from "react-router";
import { getTokenPrices, getPriceCacheStats } from "../lib/server/prices.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const tokensParam = url.searchParams.get("tokens");
  const includeStats = url.searchParams.get("includeStats") === "true";

  if (!tokensParam) {
    return Response.json(
      { error: "Missing 'tokens' query parameter" },
      { status: 400 }
    );
  }

  try {
    // Parse tokens parameter
    // Expected format: "symbol1:coingeckoId1,symbol2:coingeckoId2"
    // Example: "ETH:ethereum,MATIC:matic-network"
    const tokenPairs = tokensParam.split(",").map((pair) => {
      const [symbol, coingeckoId] = pair.split(":");
      return { symbol: symbol || "", coingeckoId: coingeckoId || "" };
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
    console.error("Error in /api/prices:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
