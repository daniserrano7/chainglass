import { useState, useEffect } from "react";
import type { MetaFunction } from "react-router";
import type { ChainFamily, AddressPortfolio, WatchedAddress, Network } from "~/lib/types";
import { AddAddressForm } from "~/components/AddAddressForm";
import { AddressCard } from "~/components/AddressCard";
import { PortfolioSummary } from "~/components/PortfolioSummary";
import { ScanProgress } from "~/components/ScanProgress";
import { NetworkManager } from "~/components/NetworkManager";
import {
  getWatchedAddresses,
  addWatchedAddress,
  removeWatchedAddress,
  updateLastScanned,
  generateAddressId,
  scanAddressComplete,
  aggregatePortfolio,
  getEnabledNetworks,
} from "~/lib/services";

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
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load addresses on mount and scan them
  useEffect(() => {
    loadAndScanAddresses();
  }, []);

  const loadAndScanAddresses = async () => {
    const addresses = getWatchedAddresses();

    if (addresses.length === 0) {
      return;
    }

    // Scan each address
    for (const address of addresses) {
      await scanAddress(address, false);
    }
  };

  const scanAddress = async (
    watchedAddress: WatchedAddress,
    showProgress: boolean = true
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

      // Scan the address
      const portfolio = await scanAddressComplete(
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
        }
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
      await scanAddress(watchedAddress, true);
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
      <PortfolioSummary summary={summary} />

      {/* Add Address Form */}
      <AddAddressForm onAddAddress={handleAddAddress} isLoading={isLoading} />

      {/* Network Manager */}
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

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="error-close" onClick={() => setError(null)}>
            ×
          </button>
        </div>
      )}

      {/* Scan Progress */}
      {scanState && <ScanProgress networks={scanState.networks} />}

      {/* Tracked Addresses */}
      {portfolios.length > 0 ? (
        <div className="addresses-section">
          <h2>
            Tracked Addresses ({portfolios.length})
          </h2>
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
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No addresses tracked yet</h3>
          <p>Add your first address above to see your portfolio</p>
        </div>
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

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 24px;
        }

        .error-icon {
          font-size: 20px;
        }

        .error-close {
          margin-left: auto;
          background: none;
          border: none;
          color: #dc2626;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .error-close:hover {
          background-color: rgba(220, 38, 38, 0.1);
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
