import { useState, useEffect } from 'react';
import { AddressData, NetworkBalance, WatchedAddress } from '../types';
import { NETWORKS } from '../config/networks';
import { getAllBalances } from '../services/rpcService';
import {
  addWatchedAddress,
  getWatchedAddresses,
  removeWatchedAddress,
  updateLastScanned,
} from '../services/storageService';
import AddressForm from './AddressForm';
import AddressCard from './AddressCard';
import './Dashboard.css';

function Dashboard() {
  const [addressesData, setAddressesData] = useState<AddressData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load watched addresses on mount
  useEffect(() => {
    loadAllAddresses();
  }, []);

  const loadAllAddresses = async () => {
    const watchedAddresses = getWatchedAddresses();

    if (watchedAddresses.length === 0) {
      setAddressesData([]);
      return;
    }

    setIsLoading(true);

    const addressDataPromises = watchedAddresses.map((watchedAddress) =>
      loadAddressData(watchedAddress)
    );

    const results = await Promise.all(addressDataPromises);
    setAddressesData(results);
    setIsLoading(false);
  };

  const loadAddressData = async (watchedAddress: WatchedAddress): Promise<AddressData> => {
    const networkBalances: NetworkBalance[] = [];

    // Fetch balances for all networks in parallel
    const networkPromises = NETWORKS.map(async (network) => {
      const networkBalance: NetworkBalance = {
        network,
        nativeBalance: {
          token: network.nativeToken,
          balance: '0',
          balanceFormatted: '0',
          usdValue: null,
          usdPrice: null,
        },
        tokenBalances: [],
        totalUsdValue: 0,
        isLoading: true,
      };

      try {
        const { nativeBalance, tokenBalances } = await getAllBalances(
          watchedAddress.address,
          network
        );

        // Calculate total USD value for this network
        let totalUsdValue = nativeBalance.usdValue || 0;
        tokenBalances.forEach((tb) => {
          totalUsdValue += tb.usdValue || 0;
        });

        networkBalance.nativeBalance = nativeBalance;
        networkBalance.tokenBalances = tokenBalances;
        networkBalance.totalUsdValue = totalUsdValue;
        networkBalance.isLoading = false;
      } catch (error) {
        networkBalance.isLoading = false;
        networkBalance.error = 'Failed to load balances';
        console.error(`Error loading balances for ${network.displayName}:`, error);
      }

      return networkBalance;
    });

    const balances = await Promise.all(networkPromises);
    networkBalances.push(...balances);

    // Calculate total portfolio value
    const totalUsdValue = networkBalances.reduce(
      (sum, nb) => sum + nb.totalUsdValue,
      0
    );

    // Update last scanned timestamp
    updateLastScanned(
      watchedAddress.id,
      NETWORKS.map((n) => n.networkId)
    );

    return {
      address: watchedAddress,
      networkBalances,
      totalUsdValue,
    };
  };

  const handleAddAddress = async (address: string, label: string) => {
    const newAddress = addWatchedAddress(address, label);

    if (!newAddress) {
      alert('Address already being watched');
      return;
    }

    // Reload all addresses to include the new one
    await loadAllAddresses();
  };

  const handleRemoveAddress = (id: string) => {
    removeWatchedAddress(id);
    setAddressesData((prev) => prev.filter((data) => data.address.id !== id));
  };

  const totalPortfolioValue = addressesData.reduce(
    (sum, data) => sum + data.totalUsdValue,
    0
  );

  return (
    <div className="dashboard">
      <AddressForm onAddAddress={handleAddAddress} />

      {isLoading && addressesData.length === 0 && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading addresses...</p>
        </div>
      )}

      {!isLoading && addressesData.length === 0 && (
        <div className="empty-state">
          <h3>No addresses added yet</h3>
          <p>Add an Ethereum address above to start tracking your portfolio</p>
        </div>
      )}

      {addressesData.length > 0 && (
        <>
          {addressesData.length > 1 && (
            <div className="portfolio-summary">
              <h2>Total Portfolio</h2>
              <div className="portfolio-total">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(totalPortfolioValue)}
              </div>
            </div>
          )}

          <div className="addresses-list">
            {addressesData.map((data) => (
              <AddressCard
                key={data.address.id}
                addressData={data}
                onRemove={handleRemoveAddress}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
