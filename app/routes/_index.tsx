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
import { ThemeToggle } from "~/components/ThemeToggle";
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
    <div className="bg-background min-h-screen p-3 sm:p-5 lg:p-8 max-w-7xl mx-auto">
      {/* Header with Theme Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            ChainGlass
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            See through your crypto
          </p>
        </div>
        <ThemeToggle />
      </div>

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
        <div className="text-center py-10 sm:py-[50px] lg:py-[60px] px-4 sm:px-5 bg-surface rounded-lg sm:rounded-[10px] lg:rounded-xl mt-5 sm:mt-6 lg:mt-8 shadow-sm">
          <div className="mx-auto mb-5 sm:mb-[22px] lg:mb-6 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 border-3 sm:border-[3px] lg:border-4 border-border border-t-brand-500 rounded-full animate-spin"></div>
          <h3 className="text-[17px] sm:text-[19px] lg:text-xl font-semibold text-text-primary mb-[6px] sm:mb-[7px] lg:mb-2">
            Loading your portfolio...
          </h3>
          <p className="text-sm sm:text-[15px] lg:text-base text-text-secondary">
            Fetching balances from server cache
          </p>
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
              <div className="mt-5 sm:mt-6 lg:mt-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-text-primary mb-4 sm:mb-[18px] lg:mb-5 px-1">
                  Tracked Addresses ({portfolios.length})
                </h2>
                <div className="flex flex-col">
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
            <div className="text-center py-10 sm:py-[50px] lg:py-[60px] px-4 sm:px-5 bg-surface border-2 border-dashed border-border rounded-lg sm:rounded-[10px] lg:rounded-xl mt-5 sm:mt-6 lg:mt-8">
              <div className="text-5xl sm:text-[56px] lg:text-[64px] mb-3 sm:mb-[14px] lg:mb-4">📊</div>
              <h3 className="text-[17px] sm:text-[19px] lg:text-xl font-semibold text-text-primary mb-[6px] sm:mb-[7px] lg:mb-2">
                No addresses tracked yet
              </h3>
              <p className="text-sm sm:text-[15px] lg:text-base text-text-secondary">
                Add your first address above to see your portfolio
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
