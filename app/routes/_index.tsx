import { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";
import type { ChainFamily, AddressPortfolio, WatchedAddress, Network } from "~/lib/types";
import { AddAddressForm } from "~/components/AddAddressForm";
import { AddressCard } from "~/components/AddressCard";
import { PortfolioSummary } from "~/components/PortfolioSummary";
import { ScanProgress } from "~/components/ScanProgress";
import { NetworkManager } from "~/components/NetworkManager";
import { TokenManager } from "~/components/TokenManager";
import { ErrorDisplay } from "~/components/ErrorDisplay";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import {
  getWatchedAddresses,
  addWatchedAddress,
  removeWatchedAddress,
  updateLastScanned,
  generateAddressId,
  aggregatePortfolio,
  getEnabledNetworks,
} from "~/lib/services";
import { scanAddressFromServer } from "~/lib/services/scanner-server";

export const meta: MetaFunction = () => {
  return [
    { title: "ChainGlass - See through your crypto" },
    {
      name: "description",
      content: "Multi-chain portfolio tracker for watch-only addresses",
    },
  ];
};

interface ScanState {
  addressId: string;
  networks: Array<{
    networkId: string;
    networkName: string;
    status: "pending" | "scanning" | "completed" | "error";
    error?: string;
  }>;
}

export default function Index() {
  const [portfolios, setPortfolios] = useState<AddressPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load addresses on mount and scan them
  useEffect(() => {
    loadAndScanAddresses();
  }, []);

  const loadAndScanAddresses = async () => {
    const addresses = getWatchedAddresses();

    if (addresses.length === 0) {
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);

    try {
      // Scan each address
      for (const address of addresses) {
        try {
          await scanAddress(address, false);
        } catch (err) {
          console.error(`Failed to scan address ${address.address}:`, err);
          // Continue with other addresses even if one fails
        }
      }
    } finally {
      // Always clear loading state when done
      setIsInitialLoading(false);
    }
  };

  const scanAddress = async (
    watchedAddress: WatchedAddress,
    showProgress: boolean = true,
    forceRefresh: boolean = false
  ) => {
    try {
      const networks = getEnabledNetworks();

      if (showProgress) {
        // Initialize scan state
        setScanState({
          addressId: watchedAddress.id,
          networks: networks.map((n: Network) => ({
            networkId: n.id,
            networkName: n.name,
            status: "pending" as const,
          })),
        });
      }

      // Scan the address using server-side cache
      const portfolio = await scanAddressFromServer(
        watchedAddress.id,
        watchedAddress.address,
        watchedAddress.label,
        (progress) => {
          if (showProgress) {
            setScanState((prev) => {
              if (!prev) return prev;

              return {
                ...prev,
                networks: prev.networks.map((n) =>
                  n.networkId === progress.networkId
                    ? {
                        networkId: progress.networkId,
                        networkName: progress.networkName,
                        status: progress.status,
                        error: progress.error,
                      }
                    : n
                ),
              };
            });
          }
        },
        forceRefresh
      );

      // Update portfolio in state
      setPortfolios((prev) => {
        const existing = prev.findIndex((p) => p.addressId === watchedAddress.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = portfolio;
          return updated;
        }
        return [...prev, portfolio];
      });

      // Update last scanned in storage
      updateLastScanned(
        watchedAddress.id,
        portfolio.networkBalances.map((nb) => nb.networkId)
      );
    } catch (err) {
      console.error("Failed to scan address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to scan address"
      );
    } finally {
      if (showProgress) {
        // Clear scan state after a brief delay
        setTimeout(() => setScanState(null), 2000);
      }
    }
  };

  const handleAddAddress = async (
    address: string,
    chainFamily: ChainFamily,
    label?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create watched address
      const watchedAddress: WatchedAddress = {
        id: generateAddressId(),
        address,
        chainFamily,
        label,
        addedAt: Date.now(),
        networksScanned: [],
      };

      // Save to localStorage
      addWatchedAddress(watchedAddress);

      // Scan the address
      await scanAddress(watchedAddress, true);
    } catch (err) {
      console.error("Failed to add address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = async (addressId: string) => {
    const watchedAddress = getWatchedAddresses().find(
      (a) => a.id === addressId
    );

    if (!watchedAddress) {
      setError("Address not found");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await scanAddress(watchedAddress, true, true); // Force refresh on manual rescan
    } catch (err) {
      console.error("Failed to rescan address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to rescan address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (addressId: string) => {
    try {
      removeWatchedAddress(addressId);
      setPortfolios((prev) => prev.filter((p) => p.addressId !== addressId));
    } catch (err) {
      console.error("Failed to remove address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove address"
      );
    }
  };

  // Calculate portfolio summary
  const summary = aggregatePortfolio(portfolios);

  return (
    <div className="dashboard">
      {/* Portfolio Summary */}
      <ErrorBoundary
        fallback={
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">Failed to load portfolio summary</p>
          </div>
        }
      >
        <PortfolioSummary summary={summary} />
      </ErrorBoundary>

      {/* Add Address Form */}
      <ErrorBoundary
        fallback={
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">Failed to load add address form</p>
          </div>
        }
      >
        <AddAddressForm onAddAddress={handleAddAddress} isLoading={isLoading} />
      </ErrorBoundary>

      {/* Network Manager */}
      <ErrorBoundary
        fallback={
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">Failed to load network manager</p>
          </div>
        }
      >
        <NetworkManager
          onNetworkAdded={(network) => {
            console.log("Network added:", network);
            // Rescan all addresses to fetch balances for the new network
            const addresses = getWatchedAddresses();
            addresses.forEach((addr) => {
              scanAddress(addr, false);
            });
          }}
        />
      </ErrorBoundary>

      {/* Token Manager */}
      <ErrorBoundary
        fallback={
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">Failed to load token manager</p>
          </div>
        }
      >
        <TokenManager
          onTokenAdded={(token) => {
            console.log("Token added:", token);
            // Rescan all addresses to fetch balances for the new token
            const addresses = getWatchedAddresses();
            addresses.forEach((addr) => {
              scanAddress(addr, false);
            });
          }}
        />
      </ErrorBoundary>

      {/* Error Message */}
      <ErrorDisplay
        error={error}
        onDismiss={() => setError(null)}
        onRetry={() => {
          setError(null);
          loadAndScanAddresses();
        }}
        className="mb-6"
      />

      {/* Scan Progress */}
      {scanState && <ScanProgress networks={scanState.networks} />}

      {/* Initial Loading State */}
      {isInitialLoading && portfolios.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Loading your portfolio...</h3>
          <p>Fetching balances from server cache</p>
        </div>
      ) : (
        <>
          {/* Tracked Addresses */}
          {portfolios.length > 0 ? (
            <ErrorBoundary
              fallback={
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6">
                  <p className="text-red-300">
                    Failed to display address cards. Try refreshing the page.
                  </p>
                </div>
              }
            >
              <div className="addresses-section">
                <h2>Tracked Addresses ({portfolios.length})</h2>
                <div className="addresses-list">
                  {portfolios.map((portfolio) => (
                    <AddressCard
                      key={portfolio.addressId}
                      portfolio={portfolio}
                      onRescan={handleRescan}
                      onRemove={handleRemove}
                      isScanning={
                        scanState?.addressId === portfolio.addressId || isLoading
                      }
                    />
                  ))}
                </div>
              </div>
            </ErrorBoundary>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No addresses tracked yet</h3>
              <p>Add your first address above to see your portfolio</p>
            </div>
          )}
        </>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, sans-serif;
          background-color: #f9fafb;
          color: #111827;
        }

        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 16px;
        }

        .addresses-section {
          margin-top: 32px;
        }

        .addresses-section h2 {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 20px;
        }

        .addresses-list {
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          margin-top: 32px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 16px;
          color: #6b7280;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          margin-top: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .loading-state h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        .loading-state p {
          font-size: 16px;
          color: #6b7280;
        }

        .spinner {
          margin: 0 auto 24px;
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }

          .addresses-section h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
