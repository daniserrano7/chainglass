import { JsonRpcProvider, Contract, formatUnits } from 'ethers';
import { Network, Token, TokenBalance } from '../types';
import { getTokenPrice } from './priceService';

// ERC-20 ABI - only the functions we need
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

/**
 * Fetches native token balance for an address on a network
 */
export async function getNativeBalance(
  address: string,
  network: Network
): Promise<TokenBalance> {
  try {
    const provider = new JsonRpcProvider(network.rpcUrl);
    const balance = await provider.getBalance(address);
    const balanceFormatted = formatUnits(balance, network.nativeToken.decimals);

    // Fetch USD price
    const usdPrice = await getTokenPrice(network.nativeToken.coinGeckoId);
    const usdValue = usdPrice !== null ? parseFloat(balanceFormatted) * usdPrice : null;

    return {
      token: network.nativeToken,
      balance: balance.toString(),
      balanceFormatted,
      usdValue,
      usdPrice,
    };
  } catch (error) {
    console.error(`Error fetching native balance on ${network.displayName}:`, error);
    return {
      token: network.nativeToken,
      balance: '0',
      balanceFormatted: '0',
      usdValue: null,
      usdPrice: null,
    };
  }
}

/**
 * Fetches ERC-20 token balance for an address
 */
export async function getTokenBalance(
  address: string,
  token: Token,
  rpcUrl: string
): Promise<TokenBalance | null> {
  if (!token.address) {
    console.error('Token address is required for ERC-20 tokens');
    return null;
  }

  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const contract = new Contract(token.address, ERC20_ABI, provider);

    const balance = await contract.balanceOf(address);
    const balanceFormatted = formatUnits(balance, token.decimals);

    // Skip tokens with zero balance
    if (balance === 0n) {
      return null;
    }

    // Fetch USD price
    const usdPrice = await getTokenPrice(token.coinGeckoId);
    const usdValue = usdPrice !== null ? parseFloat(balanceFormatted) * usdPrice : null;

    return {
      token,
      balance: balance.toString(),
      balanceFormatted,
      usdValue,
      usdPrice,
    };
  } catch (error) {
    console.error(`Error fetching balance for ${token.symbol}:`, error);
    return null;
  }
}

/**
 * Fetches all token balances (native + ERC-20) for an address on a network
 */
export async function getAllBalances(
  address: string,
  network: Network
): Promise<{ nativeBalance: TokenBalance; tokenBalances: TokenBalance[] }> {
  // Fetch native balance
  const nativeBalance = await getNativeBalance(address, network);

  // Fetch ERC-20 token balances in parallel
  const tokenBalancePromises = network.commonTokens.map((token) =>
    getTokenBalance(address, token, network.rpcUrl)
  );

  const tokenBalanceResults = await Promise.all(tokenBalancePromises);

  // Filter out null results (zero balances or errors)
  const tokenBalances = tokenBalanceResults.filter(
    (balance): balance is TokenBalance => balance !== null
  );

  return {
    nativeBalance,
    tokenBalances,
  };
}

/**
 * Validates an Ethereum address
 */
export function isValidAddress(address: string): boolean {
  // Basic EVM address validation: 0x followed by 40 hexadecimal characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Formats an address for display (shortened version)
 */
export function formatAddress(address: string): string {
  if (!isValidAddress(address)) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
