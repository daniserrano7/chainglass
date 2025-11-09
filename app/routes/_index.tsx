import { useState, useEffect } from "react";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { json, useLoaderData, useActionData, useNavigation, useRevalidator } from "react-router";
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
  addWatchedAddress as addWatchedAddressLocal,
  removeWatchedAddress as removeWatchedAddressLocal,
  updateLastScanned,
  generateAddressId,
  aggregatePortfolio,
  getEnabledNetworks,
  getEnabledNetworksForFamily,
} from "~/lib/services";
import { scanAddressFromServer } from "~/lib/services/scanner-server";
import {
  syncAddressesToCookies,
  hasAddressesInCookies,
} from "~/lib/services/cookie-sync";
import { scanAddress } from "~/lib/server/balances.server";
import {
  getWatchedAddressesFromCookies,
  createAddressesCookieHeaders,
} from "~/lib/server/cookies.server";

export const meta: MetaFunction = () => {
  return [
    { title: "ChainGlass - See through your crypto" },
    {
      name: "description",
      content: "Multi-chain portfolio tracker for watch-only addresses",
    },
  ];
};

/**
 * Server-side loader: Pre-fetch addresses and their balances
 * This enables SSR by making data available on initial page load
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Get addresses from cookies
  const addresses = getWatchedAddressesFromCookies(request);

  if (addresses.length === 0) {
    return json({
      portfolios: [],
      addresses: [],
      loadedFromCache: false,
    });
  }

  // Pre-fetch all balances in parallel using server cache
  const portfolioResults = await Promise.allSettled(
    addresses.map(async (addr) => {
      try {
        const result = await scanAddress(addr.address, {
          forceRefresh: false, // Use cache when available
          networksToScan: getEnabledNetworksForFamily(addr.chainFamily).map(
            (n) => n.id
          ),
        });

        // Convert to AddressPortfolio format
        const portfolio: AddressPortfolio = {
          addressId: addr.id,
          address: addr.address,
          label: addr.label,
          networkBalances: result.balances,
          totalUsdValue: result.totalUsdValue,
        };

        return portfolio;
      } catch (error) {
        console.error(`Failed to load portfolio for ${addr.address}:`, error);
        // Return empty portfolio on error
        return {
          addressId: addr.id,
          address: addr.address,
          label: addr.label,
          networkBalances: [],
          totalUsdValue: 0,
        } as AddressPortfolio;
      }
    })
  );

  // Extract successful results
  const portfolios = portfolioResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<AddressPortfolio>).value);

  return json({
    portfolios,
    addresses,
    loadedFromCache: true,
  });
}

/**
 * Server-side action: Handle address add/remove/rescan with cookie updates
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("action");

  // Get current addresses from cookies
  let addresses = getWatchedAddressesFromCookies(request);

  switch (actionType) {
    case "add": {
      const address = formData.get("address") as string;
      const chainFamily = formData.get("chainFamily") as ChainFamily;
      const label = formData.get("label") as string | undefined;

      if (!address || !chainFamily) {
        return json(
          { error: "Address and chain family are required" },
          { status: 400 }
        );
      }

      // Create new watched address
      const newAddress: WatchedAddress = {
        id: generateAddressId(),
        address,
        chainFamily,
        label: label || undefined,
        addedAt: Date.now(),
        networksScanned: [],
      };

      // Add to addresses array
      addresses.push(newAddress);

      // Update cookies and return
      const headers = createAddressesCookieHeaders(addresses);
      return json(
        { success: true, address: newAddress },
        { headers: { "Set-Cookie": headers } }
      );
    }

    case "remove": {
      const addressId = formData.get("addressId") as string;

      if (!addressId) {
        return json({ error: "Address ID is required" }, { status: 400 });
      }

      // Remove from addresses array
      addresses = addresses.filter((a) => a.id !== addressId);

      // Update cookies and return
      const headers = createAddressesCookieHeaders(addresses);
      return json(
        { success: true, addressId },
        { headers: { "Set-Cookie": headers } }
      );
    }

    case "rescan": {
      const addressId = formData.get("addressId") as string;
      const forceRefresh = formData.get("forceRefresh") === "true";

      if (!addressId) {
        return json({ error: "Address ID is required" }, { status: 400 });
      }

      const address = addresses.find((a) => a.id === addressId);
      if (!address) {
        return json({ error: "Address not found" }, { status: 404 });
      }

      // Rescan the address
      try {
        const result = await scanAddress(address.address, {
          forceRefresh,
          networksToScan: getEnabledNetworksForFamily(
            address.chainFamily
          ).map((n) => n.id),
        });

        const portfolio: AddressPortfolio = {
          addressId: address.id,
          address: address.address,
          label: address.label,
          networkBalances: result.balances,
          totalUsdValue: result.totalUsdValue,
        };

        return json({ success: true, portfolio });
      } catch (error) {
        console.error(`Failed to rescan address ${address.address}:`, error);
        return json(
          {
            error:
              error instanceof Error ? error.message : "Failed to rescan",
          },
          { status: 500 }
        );
      }
    }

    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
}

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
  // Get data from server-side loader
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();

  // Client-side state for UI only
  const [portfolios, setPortfolios] = useState<AddressPortfolio[]>(
    loaderData.portfolios
  );
  const [scanState, setScanState] = useState<ScanState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cookiesSynced, setCookiesSynced] = useState(false);

  // Sync loader data to state when it changes
  useEffect(() => {
    setPortfolios(loaderData.portfolios);
  }, [loaderData]);

  // Migration: Sync localStorage to cookies on first visit
  useEffect(() => {
    if (cookiesSynced) return;

    const syncLocalStorageToCookies = () => {
      try {
        // Check if we have addresses in localStorage but not in cookies
        const localAddresses = getWatchedAddresses();

        if (localAddresses.length > 0 && !hasAddressesInCookies()) {
          console.log(
            `Migrating ${localAddresses.length} addresses from localStorage to cookies...`
          );

          // Sync to cookies client-side
          syncAddressesToCookies(localAddresses);

          // Trigger a revalidation to reload with cookie data
          setTimeout(() => {
            revalidator.revalidate();
          }, 100);
        } else if (
          localAddresses.length === 0 &&
          loaderData.addresses.length > 0
        ) {
          // Reverse sync: cookies exist but localStorage is empty
          // Sync from cookies to localStorage
          console.log(
            `Syncing ${loaderData.addresses.length} addresses from cookies to localStorage...`
          );
          loaderData.addresses.forEach((addr) => {
            addWatchedAddressLocal(addr);
          });
        }

        setCookiesSynced(true);
      } catch (err) {
        console.error("Failed to sync localStorage to cookies:", err);
        setCookiesSynced(true); // Don't block on error
      }
    };

    syncLocalStorageToCookies();
  }, [cookiesSynced, loaderData.addresses, revalidator]);

  // Client-side scanning for progress UI (when user manually adds/rescans)
  const scanAddressClient = async (
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
    setError(null);

    try {
      // Create new address
      const watchedAddress: WatchedAddress = {
        id: generateAddressId(),
        address,
        chainFamily,
        label,
        addedAt: Date.now(),
        networksScanned: [],
      };

      // Save to localStorage as fallback
      addWatchedAddressLocal(watchedAddress);

      // Sync to cookies client-side (for immediate cookie update)
      const updatedAddresses = [...loaderData.addresses, watchedAddress];
      syncAddressesToCookies(updatedAddresses);

      // Submit to server action to confirm
      const formData = new FormData();
      formData.append("action", "add");
      formData.append("address", address);
      formData.append("chainFamily", chainFamily);
      if (label) formData.append("label", label);

      await fetch("?index", {
        method: "POST",
        body: formData,
      });

      // Scan the newly added address with progress UI
      await scanAddressClient(watchedAddress, true);

      // Revalidate to get fresh data from server
      revalidator.revalidate();
    } catch (err) {
      console.error("Failed to add address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add address"
      );
    }
  };

  const handleRescan = async (addressId: string) => {
    const watchedAddress = loaderData.addresses.find(
      (a) => a.id === addressId
    );

    if (!watchedAddress) {
      setError("Address not found");
      return;
    }

    setError(null);

    try {
      // Show progress UI while rescanning
      await scanAddressClient(watchedAddress, true, true);

      // Revalidate to get fresh data from server
      revalidator.revalidate();
    } catch (err) {
      console.error("Failed to rescan address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to rescan address"
      );
    }
  };

  const handleRemove = async (addressId: string) => {
    try {
      // Remove from localStorage as fallback
      removeWatchedAddressLocal(addressId);

      // Sync to cookies client-side (for immediate cookie update)
      const updatedAddresses = loaderData.addresses.filter(
        (a) => a.id !== addressId
      );
      syncAddressesToCookies(updatedAddresses);

      // Submit to server action to remove from cookies
      const formData = new FormData();
      formData.append("action", "remove");
      formData.append("addressId", addressId);

      await fetch("?index", {
        method: "POST",
        body: formData,
      });

      // Optimistically update UI
      setPortfolios((prev) => prev.filter((p) => p.addressId !== addressId));

      // Revalidate to get fresh data from server
      revalidator.revalidate();
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
        <AddAddressForm
          onAddAddress={handleAddAddress}
          isLoading={navigation.state === "submitting"}
        />
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
            loaderData.addresses.forEach((addr) => {
              scanAddressClient(addr, false);
            });
            // Revalidate to refresh data
            revalidator.revalidate();
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
            loaderData.addresses.forEach((addr) => {
              scanAddressClient(addr, false);
            });
            // Revalidate to refresh data
            revalidator.revalidate();
          }}
        />
      </ErrorBoundary>

      {/* Error Message */}
      <ErrorDisplay
        error={error}
        onDismiss={() => setError(null)}
        onRetry={() => {
          setError(null);
          revalidator.revalidate();
        }}
        className="mb-6"
      />

      {/* Scan Progress */}
      {scanState && <ScanProgress networks={scanState.networks} />}

      {/* Initial Loading State */}
      {navigation.state === "loading" && portfolios.length === 0 ? (
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
                        scanState?.addressId === portfolio.addressId ||
                        navigation.state === "submitting"
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
        /* Mobile-first base styles */
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
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .dashboard {
          max-width: 100%;
          margin: 0 auto;
          padding: 12px;
          min-height: 100vh;
        }

        .addresses-section {
          margin-top: 20px;
        }

        .addresses-section h2 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .addresses-list {
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          text-align: center;
          padding: 40px 16px;
          background: white;
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          margin-top: 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .empty-state h3 {
          font-size: 17px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .empty-state p {
          font-size: 14px;
          color: #6b7280;
        }

        .loading-state {
          text-align: center;
          padding: 40px 16px;
          background: white;
          border-radius: 8px;
          margin-top: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .loading-state h3 {
          font-size: 17px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .loading-state p {
          font-size: 14px;
          color: #6b7280;
        }

        .spinner {
          margin: 0 auto 20px;
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Tablet styles (640px+) */
        @media (min-width: 640px) {
          .dashboard {
            padding: 20px;
          }

          .addresses-section {
            margin-top: 24px;
          }

          .addresses-section h2 {
            font-size: 20px;
            margin-bottom: 18px;
          }

          .empty-state {
            padding: 50px 20px;
            border-radius: 10px;
            margin-top: 24px;
          }

          .empty-icon {
            font-size: 56px;
            margin-bottom: 14px;
          }

          .empty-state h3 {
            font-size: 19px;
            margin-bottom: 7px;
          }

          .empty-state p {
            font-size: 15px;
          }

          .loading-state {
            padding: 50px 20px;
            border-radius: 10px;
            margin-top: 24px;
          }

          .loading-state h3 {
            font-size: 19px;
            margin-bottom: 7px;
          }

          .loading-state p {
            font-size: 15px;
          }

          .spinner {
            margin-bottom: 22px;
            width: 44px;
            height: 44px;
          }
        }

        /* Desktop styles (1024px+) */
        @media (min-width: 1024px) {
          .dashboard {
            max-width: 1200px;
            padding: 32px 24px;
          }

          .addresses-section {
            margin-top: 32px;
          }

          .addresses-section h2 {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .empty-state {
            padding: 60px 20px;
            border-radius: 12px;
            margin-top: 32px;
          }

          .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .empty-state p {
            font-size: 16px;
          }

          .loading-state {
            padding: 60px 20px;
            border-radius: 12px;
            margin-top: 32px;
          }

          .loading-state h3 {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .loading-state p {
            font-size: 16px;
          }

          .spinner {
            margin-bottom: 24px;
            width: 48px;
            height: 48px;
            border-width: 4px;
          }
        }

        /* Large desktop styles (1280px+) */
        @media (min-width: 1280px) {
          .dashboard {
            padding: 32px 16px;
          }
        }
      `}</style>
    </div>
  );
}
