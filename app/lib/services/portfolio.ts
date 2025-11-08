import type { AddressPortfolio, PortfolioSummary } from "../types";

/**
 * Aggregate multiple address portfolios into a summary
 */
export function aggregatePortfolio(
  portfolios: AddressPortfolio[]
): PortfolioSummary {
  // Calculate total USD value across all addresses
  const totalUsdValue = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.totalUsdValue,
    0
  );

  // Aggregate by network
  const networkTotals = new Map<
    string,
    { name: string; totalUsdValue: number }
  >();

  for (const portfolio of portfolios) {
    for (const networkBalance of portfolio.networkBalances) {
      const existing = networkTotals.get(networkBalance.networkId);

      if (existing) {
        existing.totalUsdValue += networkBalance.totalUsdValue;
      } else {
        networkTotals.set(networkBalance.networkId, {
          name: networkBalance.networkName,
          totalUsdValue: networkBalance.totalUsdValue,
        });
      }
    }
  }

  // Convert to array and calculate percentages
  const networkBreakdown = Array.from(networkTotals.entries())
    .map(([networkId, data]) => ({
      networkId,
      networkName: data.name,
      totalUsdValue: data.totalUsdValue,
      percentage: totalUsdValue > 0 ? (data.totalUsdValue / totalUsdValue) * 100 : 0,
    }))
    .sort((a, b) => b.totalUsdValue - a.totalUsdValue); // Sort by value descending

  // Aggregate by asset (optional, for future enhancement)
  const assetTotals = new Map<
    string,
    { totalAmount: number; totalUsdValue: number; decimals: number }
  >();

  for (const portfolio of portfolios) {
    for (const networkBalance of portfolio.networkBalances) {
      // Native balances
      if (networkBalance.nativeBalance) {
        const symbol = networkBalance.nativeBalance.symbol;
        const amount = parseFloat(
          networkBalance.nativeBalance.formattedAmount
        );
        const usdValue = networkBalance.nativeBalance.usdValue || 0;
        const decimals = networkBalance.nativeBalance.decimals;

        const existing = assetTotals.get(symbol);
        if (existing) {
          existing.totalAmount += amount;
          existing.totalUsdValue += usdValue;
        } else {
          assetTotals.set(symbol, {
            totalAmount: amount,
            totalUsdValue: usdValue,
            decimals,
          });
        }
      }

      // Token balances
      for (const token of networkBalance.tokenBalances) {
        const symbol = token.symbol;
        const amount = parseFloat(token.formattedAmount);
        const usdValue = token.usdValue || 0;
        const decimals = token.decimals;

        const existing = assetTotals.get(symbol);
        if (existing) {
          existing.totalAmount += amount;
          existing.totalUsdValue += usdValue;
        } else {
          assetTotals.set(symbol, {
            totalAmount: amount,
            totalUsdValue: usdValue,
            decimals,
          });
        }
      }
    }
  }

  // Convert asset totals to array and calculate percentages
  const assetBreakdown = Array.from(assetTotals.entries())
    .map(([symbol, data]) => ({
      symbol,
      totalAmount: data.totalAmount.toFixed(data.decimals),
      totalUsdValue: data.totalUsdValue,
      percentage: totalUsdValue > 0 ? (data.totalUsdValue / totalUsdValue) * 100 : 0,
    }))
    .sort((a, b) => b.totalUsdValue - a.totalUsdValue); // Sort by value descending

  return {
    totalUsdValue,
    totalAddresses: portfolios.length,
    networkBreakdown,
    assetBreakdown,
  };
}

/**
 * Get networks with balances from a portfolio
 */
export function getNetworksWithBalance(
  portfolio: AddressPortfolio
): string[] {
  return portfolio.networkBalances
    .filter((nb) => nb.hasBalance)
    .map((nb) => nb.networkId);
}

/**
 * Get networks without balances from a portfolio
 */
export function getNetworksWithoutBalance(
  portfolio: AddressPortfolio
): string[] {
  return portfolio.networkBalances
    .filter((nb) => !nb.hasBalance && !nb.error)
    .map((nb) => nb.networkId);
}

/**
 * Get networks with errors from a portfolio
 */
export function getNetworksWithErrors(
  portfolio: AddressPortfolio
): Array<{ networkId: string; error: string }> {
  return portfolio.networkBalances
    .filter((nb) => nb.error)
    .map((nb) => ({
      networkId: nb.networkId,
      error: nb.error!,
    }));
}

/**
 * Format USD value for display
 */
export function formatUsdValue(value: number | undefined): string {
  if (value === undefined || value === null) {
    return "—";
  }

  if (value === 0) {
    return "$0.00";
  }

  // For values less than $0.01, show more decimal places
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  }

  // For values less than $1, show 4 decimal places
  if (value < 1) {
    return `$${value.toFixed(4)}`;
  }

  // For normal values, show 2 decimal places with commas
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  const num = parseFloat(amount);

  if (num === 0) {
    return "0";
  }

  // For very small amounts, show more decimals
  if (num < 0.000001) {
    return num.toFixed(decimals);
  }

  // For small amounts, show 6 decimals
  if (num < 1) {
    return num.toFixed(6);
  }

  // For normal amounts, show 4 decimals
  if (num < 1000) {
    return num.toFixed(4);
  }

  // For large amounts, show with commas and 2 decimals
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calculate percentage of portfolio
 */
export function calculatePercentage(
  part: number,
  total: number
): number {
  if (total === 0) {
    return 0;
  }
  return (part / total) * 100;
}

/**
 * Sort portfolios by total value (descending)
 */
export function sortPortfoliosByValue(
  portfolios: AddressPortfolio[]
): AddressPortfolio[] {
  return [...portfolios].sort(
    (a, b) => b.totalUsdValue - a.totalUsdValue
  );
}

/**
 * Filter portfolios with non-zero balances
 */
export function filterPortfoliosWithBalance(
  portfolios: AddressPortfolio[]
): AddressPortfolio[] {
  return portfolios.filter((p) => p.totalUsdValue > 0);
}

/**
 * Get total balance count across all portfolios
 */
export function getTotalBalanceCount(portfolios: AddressPortfolio[]): number {
  let count = 0;

  for (const portfolio of portfolios) {
    for (const networkBalance of portfolio.networkBalances) {
      if (networkBalance.nativeBalance) {
        count++;
      }
      count += networkBalance.tokenBalances.length;
    }
  }

  return count;
}
