import { z } from "zod";
import type { ChainFamily } from "./network";

/**
 * Watched address schema - represents an address being tracked
 */
export const WatchedAddressSchema = z.object({
  /** Unique identifier for this watched address */
  id: z.string(),
  /** The blockchain address */
  address: z.string(),
  /** Chain family (evm, bitcoin, solana, etc.) */
  chainFamily: z.enum(["evm", "bitcoin", "solana", "polkadot"]),
  /** Optional label/alias for this address */
  label: z.string().optional(),
  /** Timestamp when address was added */
  addedAt: z.number(),
  /** Timestamp of last scan */
  lastScanned: z.number().optional(),
  /** List of network IDs that were scanned */
  networksScanned: z.array(z.string()).default([]),
});

export type WatchedAddress = z.infer<typeof WatchedAddressSchema>;

/**
 * Address validation patterns
 */
export const ADDRESS_PATTERNS = {
  evm: /^0x[a-fA-F0-9]{40}$/,
  // Bitcoin patterns can be added later
  // Solana patterns can be added later
  // Polkadot patterns can be added later
} as const;

/**
 * Validates an address format based on chain family
 */
export function isValidAddress(address: string, chainFamily: ChainFamily): boolean {
  const pattern = ADDRESS_PATTERNS[chainFamily as keyof typeof ADDRESS_PATTERNS];
  if (!pattern) return false;
  return pattern.test(address);
}

/**
 * Truncates an address for display (e.g., "0x1234...5678")
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
