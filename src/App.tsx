import { useState, useEffect } from "react"
import { PortfolioSummary } from "./components/crypto/PortfolioSummary"
import { AddAddressForm } from "./components/crypto/AddAddressForm"
import { WalletCard } from "./components/crypto/WalletCard"
import { NetworkManager } from "./components/crypto/NetworkManager"
import { TokenManager } from "./components/crypto/TokenManager"
import { Eye, Loader2 } from "lucide-react"
import { NETWORKS, NETWORKS_BY_ID } from "./config/networks"
import { AddressData, NetworkBalance, WatchedAddress } from "./types"
import * as storageService from "./services/storageService"
import * as rpcService from "./services/rpcService"

function App() {
  const [addressesData, setAddressesData] = useState<AddressData[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Load addresses from storage on mount
  useEffect(() => {
    loadAddresses()
  }, [])

  /**
   * Load all watched addresses from storage and fetch their balances
   */
  async function loadAddresses() {
    setInitialLoading(true)
    try {
      const watchedAddresses = storageService.getWatchedAddresses()

      if (watchedAddresses.length === 0) {
        setAddressesData([])
        setInitialLoading(false)
        return
      }

      // Initialize address data with loading state
      const initialData: AddressData[] = watchedAddresses.map((addr) => ({
        address: addr,
        networkBalances: NETWORKS.map((network) => ({
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
        })),
        totalUsdValue: 0,
      }))

      setAddressesData(initialData)
      setInitialLoading(false)

      // Fetch balances for all addresses
      for (const addr of watchedAddresses) {
        await fetchBalancesForAddress(addr.id)
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
      setInitialLoading(false)
    }
  }

  /**
   * Fetch balances for a specific address across all networks
   */
  async function fetchBalancesForAddress(addressId: string) {
    setAddressesData((prevData) => {
      const addressData = prevData.find((data) => data.address.id === addressId)
      if (!addressData) return prevData

      return prevData.map((data) => {
        if (data.address.id !== addressId) return data

        return {
          ...data,
          networkBalances: data.networkBalances.map((nb) => ({
            ...nb,
            isLoading: true,
            error: undefined,
          })),
        }
      })
    })

    const addressData = addressesData.find((data) => data.address.id === addressId)
    if (!addressData) return

    const address = addressData.address.address

    // Fetch balances for each network in parallel
    const networkBalancePromises = NETWORKS.map(async (network) => {
      try {
        const { nativeBalance, tokenBalances } = await rpcService.getAllBalances(
          address,
          network
        )

        // Calculate total USD value for this network
        const nativeUsdValue = nativeBalance.usdValue || 0
        const tokensUsdValue = tokenBalances.reduce(
          (sum, tb) => sum + (tb.usdValue || 0),
          0
        )
        const totalUsdValue = nativeUsdValue + tokensUsdValue

        const networkBalance: NetworkBalance = {
          network,
          nativeBalance,
          tokenBalances,
          totalUsdValue,
          isLoading: false,
        }

        return networkBalance
      } catch (error) {
        console.error(`Error fetching balances for ${network.displayName}:`, error)
        return {
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
          isLoading: false,
          error: 'Failed to load balances',
        } as NetworkBalance
      }
    })

    const networkBalances = await Promise.all(networkBalancePromises)

    // Calculate total USD value across all networks
    const totalUsdValue = networkBalances.reduce(
      (sum, nb) => sum + nb.totalUsdValue,
      0
    )

    // Update state with fetched balances
    setAddressesData((prevData) =>
      prevData.map((data) => {
        if (data.address.id !== addressId) return data

        return {
          ...data,
          networkBalances,
          totalUsdValue,
        }
      })
    )

    // Update last scanned timestamp in storage
    const scannedNetworks = networkBalances
      .filter((nb) => !nb.error)
      .map((nb) => nb.network.networkId)
    storageService.updateLastScanned(addressId, scannedNetworks)
  }

  /**
   * Add a new address
   */
  async function handleAddAddress(address: string, label: string) {
    setIsAddingAddress(true)

    try {
      // Add to storage
      const watchedAddress = storageService.addWatchedAddress(address, label)

      if (!watchedAddress) {
        // Address already exists
        alert('This address is already being tracked')
        setIsAddingAddress(false)
        return
      }

      // Add to state with loading state
      const newAddressData: AddressData = {
        address: watchedAddress,
        networkBalances: NETWORKS.map((network) => ({
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
        })),
        totalUsdValue: 0,
      }

      setAddressesData((prev) => [...prev, newAddressData])

      // Fetch balances
      await fetchBalancesForAddress(watchedAddress.id)
    } catch (error) {
      console.error('Error adding address:', error)
      alert('Failed to add address. Please try again.')
    } finally {
      setIsAddingAddress(false)
    }
  }

  /**
   * Remove an address
   */
  function handleRemoveAddress(addressId: string) {
    if (!confirm('Are you sure you want to remove this address?')) {
      return
    }

    storageService.removeWatchedAddress(addressId)
    setAddressesData((prev) => prev.filter((data) => data.address.id !== addressId))
  }

  /**
   * Rescan an address
   */
  async function handleRescanAddress(addressId: string) {
    await fetchBalancesForAddress(addressId)
  }

  // Calculate portfolio summary
  const totalPortfolioValue = addressesData.reduce(
    (sum, data) => sum + data.totalUsdValue,
    0
  )

  const uniqueNetworks = new Set(
    addressesData.flatMap((data) =>
      data.networkBalances
        .filter((nb) => nb.totalUsdValue > 0)
        .map((nb) => nb.network.networkId)
    )
  )

  // Transform data for WalletCard component
  const walletCardsData = addressesData.map((data) => ({
    id: data.address.id,
    label: data.address.label,
    address: data.address.address,
    chainFamily: data.address.chainFamily,
    totalValue: data.totalUsdValue,
    lastScanned: data.address.lastScanned ? new Date(data.address.lastScanned) : undefined,
    networks: data.networkBalances.map((nb) => ({
      network: nb.network.displayName,
      totalValue: nb.totalUsdValue,
      nativeToken: {
        symbol: nb.nativeBalance.token.symbol,
        amount: parseFloat(nb.nativeBalance.balanceFormatted),
        usdValue: nb.nativeBalance.usdValue || 0,
      },
      tokens: nb.tokenBalances.map((tb) => ({
        symbol: tb.token.symbol,
        amount: parseFloat(tb.balanceFormatted),
        usdValue: tb.usdValue || 0,
      })),
      isLoading: nb.isLoading,
      error: nb.error,
    })),
  }))

  return (
    <div className="min-h-screen bg-[--color-background]">
      {/* Header */}
      <header className="border-b border-[--color-border] bg-[--color-background-secondary]/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[--color-brand-500] to-[--color-accent-500] flex items-center justify-center glow">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">ChainGlass</h1>
                <p className="text-xs text-[--color-text-tertiary]">
                  See through your crypto
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Portfolio Summary */}
          <section className="animate-fade-in">
            <PortfolioSummary
              totalValue={totalPortfolioValue}
              addressCount={addressesData.length}
              networkCount={uniqueNetworks.size}
            />
          </section>

          {/* Add Address Form */}
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <AddAddressForm onAdd={handleAddAddress} isLoading={isAddingAddress} />
          </section>

          {/* Network Manager */}
          <section className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <NetworkManager
              onNetworkAdded={(network) => {
                console.log("Network added:", network)
                // TODO: Implement custom network support
              }}
            />
          </section>

          {/* Token Manager */}
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <TokenManager
              onTokenAdded={(token) => {
                console.log("Token added:", token)
                // TODO: Implement custom token support
              }}
            />
          </section>

          {/* Wallet Cards */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Tracked Addresses
              <span className="text-sm text-[--color-text-tertiary] font-normal">
                ({addressesData.length})
              </span>
            </h2>

            {/* Loading state */}
            {initialLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[--color-brand-500]" />
              </div>
            )}

            {/* Empty state */}
            {!initialLoading && addressesData.length === 0 && (
              <div className="text-center py-12 px-4 border border-[--color-border] rounded-lg bg-[--color-background-secondary]/50">
                <div className="w-16 h-16 rounded-full bg-[--color-background-tertiary] flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-[--color-text-tertiary]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No addresses tracked yet</h3>
                <p className="text-[--color-text-secondary] mb-4">
                  Add your first address above to start tracking your crypto portfolio
                </p>
                <p className="text-sm text-[--color-text-tertiary]">
                  Try Vitalik's address: <code className="font-mono bg-[--color-background-tertiary] px-2 py-1 rounded">0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</code>
                </p>
              </div>
            )}

            {/* Wallet cards */}
            {!initialLoading && walletCardsData.length > 0 && (
              <div className="space-y-4">
                {walletCardsData.map((wallet, index) => (
                  <div
                    key={wallet.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <WalletCard
                      {...wallet}
                      onRescan={() => handleRescanAddress(wallet.id)}
                      onRemove={() => handleRemoveAddress(wallet.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="text-center text-sm text-[--color-text-tertiary] py-8">
            <p>
              ChainGlass is a watch-only portfolio tracker. Your private keys
              never leave your wallet.
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
