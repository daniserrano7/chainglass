import { z } from "zod";

/**
 * Network schema - represents a blockchain network configuration
 */
export const NetworkSchema = z.object({
  /** Unique identifier for the network (e.g., "ethereum", "polygon") */
  id: z.string(),
  /** Display name (e.g., "Ethereum", "Polygon") */
  name: z.string(),
  /** Chain ID (numeric, e.g., 1 for Ethereum) */
  chainId: z.number(),
  /** RPC URL for connecting to the network */
  rpcUrl: z.string().url(),
  /** Native token information */
  nativeToken: z.object({
    symbol: z.string(),
    decimals: z.number(),
    coingeckoId: z.string(),
  }),
  /** Block explorer URL */
  blockExplorerUrl: z.string().url(),
  /** Multicall contract address for batch requests */
  multicallAddress: z.string().optional(),
  /** Chain family (e.g., "evm", "bitcoin", "solana") */
  chainFamily: z.enum(["evm", "bitcoin", "solana", "polkadot"]),
});

export type Network = z.infer<typeof NetworkSchema>;

/**
 * Chain family type
 */
export type ChainFamily = "evm" | "bitcoin" | "solana" | "polkadot";
