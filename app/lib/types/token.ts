import { z } from "zod";

/**
 * Token schema - represents an ERC-20 token or similar
 */
export const TokenSchema = z.object({
  /** Token symbol (e.g., "USDC", "DAI") */
  symbol: z.string(),
  /** Contract address */
  address: z.string(),
  /** Token decimals (usually 18 for EVM tokens) */
  decimals: z.number(),
  /** CoinGecko ID for price fetching (optional) */
  coingeckoId: z.string().optional(),
  /** Token name (optional) */
  name: z.string().optional(),
  /** Logo URL (optional) */
  logoUrl: z.string().url().optional(),
  /** Whether this is a user-added custom token */
  isCustom: z.boolean().default(false),
});

export type Token = z.infer<typeof TokenSchema>;

/**
 * Token with network context
 */
export interface TokenWithNetwork extends Token {
  networkId: string;
}
