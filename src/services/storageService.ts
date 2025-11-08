import { WatchedAddress, StorageData, Token } from '../types';

const STORAGE_KEY = 'chainglass_data';

// Default storage data
const DEFAULT_STORAGE: StorageData = {
  watchedAddresses: [],
  enabledNetworks: {
    evm: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
  },
  customTokens: {},
};

/**
 * Loads data from localStorage
 */
export function loadStorage(): StorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STORAGE;
    }

    const parsed = JSON.parse(stored) as StorageData;

    // Validate and merge with defaults
    return {
      watchedAddresses: parsed.watchedAddresses || [],
      enabledNetworks: parsed.enabledNetworks || DEFAULT_STORAGE.enabledNetworks,
      customTokens: parsed.customTokens || {},
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return DEFAULT_STORAGE;
  }
}

/**
 * Saves data to localStorage
 */
export function saveStorage(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Adds a new watched address
 */
export function addWatchedAddress(
  address: string,
  label: string = ''
): WatchedAddress | null {
  const data = loadStorage();

  // Check if address already exists
  const exists = data.watchedAddresses.some(
    (watched) => watched.address.toLowerCase() === address.toLowerCase()
  );

  if (exists) {
    console.warn('Address already being watched');
    return null;
  }

  const newAddress: WatchedAddress = {
    id: crypto.randomUUID(),
    address: address.toLowerCase(),
    chainFamily: 'evm',
    label: label || `Address ${data.watchedAddresses.length + 1}`,
    addedAt: Date.now(),
  };

  data.watchedAddresses.push(newAddress);
  saveStorage(data);

  return newAddress;
}

/**
 * Removes a watched address by ID
 */
export function removeWatchedAddress(id: string): void {
  const data = loadStorage();
  data.watchedAddresses = data.watchedAddresses.filter((addr) => addr.id !== id);
  saveStorage(data);
}

/**
 * Updates a watched address label
 */
export function updateAddressLabel(id: string, label: string): void {
  const data = loadStorage();
  const address = data.watchedAddresses.find((addr) => addr.id === id);

  if (address) {
    address.label = label;
    saveStorage(data);
  }
}

/**
 * Updates last scanned timestamp for an address
 */
export function updateLastScanned(id: string, networksScanned: string[]): void {
  const data = loadStorage();
  const address = data.watchedAddresses.find((addr) => addr.id === id);

  if (address) {
    address.lastScanned = Date.now();
    address.networksScanned = networksScanned;
    saveStorage(data);
  }
}

/**
 * Gets all watched addresses
 */
export function getWatchedAddresses(): WatchedAddress[] {
  const data = loadStorage();
  return data.watchedAddresses;
}

/**
 * Gets enabled networks
 */
export function getEnabledNetworks(): string[] {
  const data = loadStorage();
  return data.enabledNetworks.evm;
}

/**
 * Adds a custom token for a network
 */
export function addCustomToken(networkId: string, token: Token): void {
  const data = loadStorage();

  if (!data.customTokens[networkId]) {
    data.customTokens[networkId] = [];
  }

  // Check if token already exists
  const exists = data.customTokens[networkId].some(
    (t) => t.address?.toLowerCase() === token.address?.toLowerCase()
  );

  if (!exists) {
    data.customTokens[networkId].push(token);
    saveStorage(data);
  }
}

/**
 * Gets custom tokens for a network
 */
export function getCustomTokens(networkId: string): Token[] {
  const data = loadStorage();
  return data.customTokens[networkId] || [];
}

/**
 * Clears all data from localStorage
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
