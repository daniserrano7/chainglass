import {
  createPublicClient,
  http,
  type PublicClient,
  type Address,
  formatUnits,
} from "viem";
import type { Network, Token } from "../types";

/**
 * ERC-20 ABI for balanceOf function
 */
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
] as const;

/**
 * Cache for RPC clients to avoid creating multiple instances
 */
const clientCache = new Map<string, PublicClient>();

/**
 * Get or create a public client for a network
 */
export function getPublicClient(network: Network): PublicClient {
  const cached = clientCache.get(network.id);
  if (cached) {
    return cached;
  }

  const client = createPublicClient({
    transport: http(network.rpcUrl, {
      timeout: 30_000, // 30 second timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
  });

  clientCache.set(network.id, client);
  return client;
}

/**
 * Fetch native token balance for an address on a network
 */
export async function fetchNativeBalance(
  network: Network,
  address: string
): Promise<{ amount: bigint; formatted: string }> {
  const client = getPublicClient(network);

  try {
    const balance = await client.getBalance({
      address: address as Address,
    });

    const formatted = formatUnits(balance, network.nativeToken.decimals);

    return {
      amount: balance,
      formatted,
    };
  } catch (error) {
    console.error(
      `Failed to fetch native balance on ${network.name}:`,
      error
    );
    throw new Error(
      `Failed to fetch native balance on ${network.name}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch ERC-20 token balance for an address
 */
export async function fetchTokenBalance(
  network: Network,
  tokenAddress: string,
  walletAddress: string,
  decimals: number
): Promise<{ amount: bigint; formatted: string }> {
  const client = getPublicClient(network);

  try {
    const balance = (await client.readContract({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [walletAddress as Address],
    })) as bigint;

    const formatted = formatUnits(balance, decimals);

    return {
      amount: balance,
      formatted,
    };
  } catch (error) {
    console.error(
      `Failed to fetch token balance on ${network.name} for ${tokenAddress}:`,
      error
    );
    throw new Error(
      `Failed to fetch token balance: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Fetch multiple token balances in sequence
 * Returns only tokens with non-zero balances
 */
export async function fetchTokenBalances(
  network: Network,
  tokens: Token[],
  walletAddress: string
): Promise<
  Array<{
    token: Token;
    amount: bigint;
    formatted: string;
  }>
> {
  const results: Array<{
    token: Token;
    amount: bigint;
    formatted: string;
  }> = [];

  for (const token of tokens) {
    try {
      const balance = await fetchTokenBalance(
        network,
        token.address,
        walletAddress,
        token.decimals
      );

      // Only include tokens with non-zero balance
      if (balance.amount > 0n) {
        results.push({
          token,
          amount: balance.amount,
          formatted: balance.formatted,
        });
      }
    } catch (error) {
      // Log error but continue with other tokens
      console.warn(
        `Skipping token ${token.symbol} on ${network.name}:`,
        error
      );
    }
  }

  return results;
}

/**
 * Fetch token metadata from contract (for custom tokens)
 */
export async function fetchTokenMetadata(
  network: Network,
  tokenAddress: string
): Promise<{
  symbol: string;
  name: string;
  decimals: number;
}> {
  const client = getPublicClient(network);

  try {
    const [symbol, name, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "symbol",
      }) as Promise<string>,
      client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "name",
      }) as Promise<string>,
      client.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as Promise<number>,
    ]);

    return { symbol, name, decimals };
  } catch (error) {
    throw new Error(
      `Failed to fetch token metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Batch fetch balances using multicall (for future optimization)
 * This is a placeholder for Phase 3 optimization
 */
export async function fetchBalancesMulticall(
  network: Network,
  tokens: Token[],
  walletAddress: string
): Promise<
  Array<{
    token: Token;
    amount: bigint;
    formatted: string;
  }>
> {
  // For now, just use sequential fetching
  // In Phase 3, implement actual multicall optimization
  return fetchTokenBalances(network, tokens, walletAddress);
}
