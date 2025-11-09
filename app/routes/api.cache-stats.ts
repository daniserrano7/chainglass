/**
 * API route for cache statistics and management
 * GET /api/cache-stats - Get cache statistics
 * POST /api/cache-stats?action=clear&type=prices|balances - Clear caches
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { getPriceCacheStats, clearPriceCache } from "../lib/server/prices.server";
import { getAllCacheStats, clearAllBalanceCaches, clearUserBalanceCache } from "../lib/server/balances.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const priceStats = getPriceCacheStats();
    const balanceStats = getAllCacheStats();

    return json({
      prices: priceStats,
      balances: balanceStats,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error in /api/cache-stats:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const type = url.searchParams.get("type");
  const address = url.searchParams.get("address");

  if (action === "clear") {
    try {
      if (type === "prices") {
        clearPriceCache();
        return json({ success: true, message: "Price cache cleared" });
      } else if (type === "balances") {
        if (address) {
          clearUserBalanceCache(address);
          return json({
            success: true,
            message: `Balance cache cleared for ${address}`,
          });
        } else {
          clearAllBalanceCaches();
          return json({ success: true, message: "All balance caches cleared" });
        }
      } else {
        return json(
          { error: "Invalid cache type. Use 'prices' or 'balances'" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      return json(
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}
