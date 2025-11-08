import { z } from "zod";

/**
 * Balance schema - represents a token or native balance
 */
export const BalanceSchema = z.object({
  /** Token symbol (e.g., "ETH", "USDC") */
  symbol: z.string(),
  /** Raw balance amount (as string to preserve precision) */
  amount: z.string(),
  /** Formatted balance amount (human-readable) */
  formattedAmount: z.string(),
  /** USD value (if available) */
  usdValue: z.number().optional(),
  /** Token decimals */
  decimals: z.number(),
  /** Whether this is a native token */
  isNative: z.boolean().default(false),
  /** Token contract address (if ERC-20) */
  contractAddress: z.string().optional(),
});

export type Balance = z.infer<typeof BalanceSchema>;

/**
 * Network balance - all balances for a single address on a single network
 */
export interface NetworkBalance {
  networkId: string;
  networkName: string;
  nativeBalance?: Balance;
  tokenBalances: Balance[];
  totalUsdValue: number;
  hasBalance: boolean;
  lastFetched: number;
  error?: string;
}

/**
 * Address portfolio - complete portfolio for a watched address
 */
export interface AddressPortfolio {
  addressId: string;
  address: string;
  label?: string;
  networkBalances: NetworkBalance[];
  totalUsdValue: number;
  lastScanned: number;
}

/**
 * Portfolio summary - aggregated view across all addresses
 */
export interface PortfolioSummary {
  totalUsdValue: number;
  totalAddresses: number;
  networkBreakdown: Array<{
    networkId: string;
    networkName: string;
    totalUsdValue: number;
    percentage: number;
  }>;
  assetBreakdown?: Array<{
    symbol: string;
    totalAmount: string;
    totalUsdValue: number;
    percentage: number;
  }>;
}
