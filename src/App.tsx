import { useState } from "react"
import { PortfolioSummary } from "./components/crypto/PortfolioSummary"
import { AddAddressForm } from "./components/crypto/AddAddressForm"
import { WalletCard } from "./components/crypto/WalletCard"
import { NetworkManager } from "./components/crypto/NetworkManager"
import { Eye } from "lucide-react"

// Mock data for demonstration
const mockWallets = [
  {
    id: "1",
    label: "Hardware Wallet",
    address: "0x1234567890123456789012345678901234567890",
    chainFamily: "EVM",
    totalValue: 85420.5,
    lastScanned: new Date(Date.now() - 120000),
    networks: [
      {
        network: "Ethereum",
        totalValue: 65200.0,
        nativeToken: {
          symbol: "ETH",
          amount: 20.5,
          usdValue: 51250.0,
        },
        tokens: [
          { symbol: "USDC", amount: 10000, usdValue: 10000 },
          { symbol: "DAI", amount: 3950, usdValue: 3950 },
        ],
      },
      {
        network: "Polygon",
        totalValue: 20220.5,
        nativeToken: {
          symbol: "MATIC",
          amount: 8500,
          usdValue: 6800,
        },
        tokens: [
          { symbol: "USDC", amount: 12000, usdValue: 12000 },
          { symbol: "WETH", amount: 0.42, usdValue: 1050 },
          { symbol: "AAVE", amount: 15.6, usdValue: 370.5 },
        ],
      },
      {
        network: "Arbitrum",
        totalValue: 0,
        nativeToken: { symbol: "ETH", amount: 0, usdValue: 0 },
        tokens: [],
      },
      {
        network: "Optimism",
        totalValue: 0,
        nativeToken: { symbol: "ETH", amount: 0, usdValue: 0 },
        tokens: [],
      },
      {
        network: "Base",
        totalValue: 0,
        nativeToken: { symbol: "ETH", amount: 0, usdValue: 0 },
        tokens: [],
      },
    ],
  },
  {
    id: "2",
    label: "MetaMask Mobile",
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    chainFamily: "EVM",
    totalValue: 4580.75,
    lastScanned: new Date(Date.now() - 300000),
    networks: [
      {
        network: "Ethereum",
        totalValue: 0,
        nativeToken: { symbol: "ETH", amount: 0, usdValue: 0 },
        tokens: [],
      },
      {
        network: "Arbitrum",
        totalValue: 4580.75,
        nativeToken: {
          symbol: "ETH",
          amount: 1.5,
          usdValue: 3750,
        },
        tokens: [
          { symbol: "USDC", amount: 750, usdValue: 750 },
          { symbol: "ARB", amount: 125.5, usdValue: 80.75 },
        ],
      },
      {
        network: "Polygon",
        totalValue: 0,
        nativeToken: { symbol: "MATIC", amount: 0, usdValue: 0 },
        tokens: [],
      },
      {
        network: "Optimism",
        totalValue: 0,
        nativeToken: { symbol: "ETH", amount: 0, usdValue: 0 },
        tokens: [],
      },
      {
        network: "Base",
        totalValue: 0,
        nativeToken: { symbol: "ETH", amount: 0, usdValue: 0 },
        tokens: [],
      },
    ],
  },
]

function App() {
  const [wallets] = useState(mockWallets)

  const totalPortfolioValue = wallets.reduce(
    (sum, wallet) => sum + wallet.totalValue,
    0
  )

  const uniqueNetworks = new Set(
    wallets.flatMap((w) =>
      w.networks.filter((n) => n.totalValue > 0).map((n) => n.network)
    )
  )

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
              addressCount={wallets.length}
              networkCount={uniqueNetworks.size}
            />
          </section>

          {/* Add Address Form */}
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <AddAddressForm
              onAdd={(address, label) => {
                console.log("Adding address:", address, label)
                // In a real app, this would trigger the scanning process
              }}
            />
          </section>

          {/* Network Manager */}
          <section className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <NetworkManager
              onNetworkAdded={(network) => {
                console.log("Network added:", network)
                // Trigger a rescan of all addresses to fetch balances for the new network
                wallets.forEach((wallet) => {
                  console.log("Rescanning address for new network:", wallet.address, network.name)
                })
              }}
            />
          </section>

          {/* Wallet Cards */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Tracked Addresses
              <span className="text-sm text-[--color-text-tertiary] font-normal">
                ({wallets.length})
              </span>
            </h2>

            <div className="space-y-4">
              {wallets.map((wallet, index) => (
                <div
                  key={wallet.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <WalletCard
                    {...wallet}
                    onRescan={() => console.log("Rescanning:", wallet.id)}
                    onRemove={() => console.log("Removing:", wallet.id)}
                  />
                </div>
              ))}
            </div>
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
