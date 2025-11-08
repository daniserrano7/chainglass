# ChainGlass 🔍

> **See through your crypto** - Multi-chain portfolio tracker for watch-only addresses

ChainGlass is a modern, privacy-focused portfolio tracker that lets you monitor crypto holdings across multiple blockchain networks without connecting your wallet or exposing your private keys.

## Features

- 🔍 **Watch-only tracking** - No private keys required
- 💰 **USD Value Display** - Real-time USD values for all tokens via CoinGecko API
- ⛓️ **Multi-Chain Support** - Track balances across 5 EVM networks:
  - Ethereum Mainnet
  - Polygon
  - Arbitrum One
  - Optimism
  - Base
- 🪙 **Token Detection** - Automatic detection of native and ERC-20 tokens
- 💵 **Price Integration** - CoinGecko API with 5-minute caching
- 📊 **Portfolio Aggregation** - Total portfolio value across all addresses and networks
- 💾 **Persistent Storage** - LocalStorage-based data persistence
- 💎 **Beautiful UI** - Futuristic design inspired by Linear with ShadCN UI components
- 🌙 **Dark-first design** - Optimized for extended viewing sessions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Components**: ShadCN UI
- **Icons**: Lucide React
- **Blockchain**: viem + ethers.js v6
- **Price Data**: CoinGecko API (free tier)
- **Package manager**: npm

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chainglass

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## How to Use

1. **Add an Address**: Enter any Ethereum address (e.g., `0x...`)
2. **Optional Label**: Give it a friendly name like "Hardware Wallet" or "Trading Account"
3. **Auto-Scan**: The app automatically scans all 5 networks for:
   - Native tokens (ETH, MATIC)
   - Common ERC-20 tokens (USDC, USDT, DAI, WETH, LINK, UNI)
4. **View USD Values**: Each token displays its current USD value
5. **Track Portfolio**: View total portfolio value across all addresses

### Example

Try with Vitalik's address:
```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

## Design System

ChainGlass features a comprehensive futuristic design system:

- **Color Palette**: Deep dark backgrounds (#0a0a0f) with vibrant purple-blue gradients and electric cyan accents
- **Typography**: Inter for UI text, JetBrains Mono for addresses and code
- **Components**: Built with ShadCN UI and enhanced with crypto-specific patterns
- **Effects**: Glow effects, gradient borders, smooth animations
- **Network Colors**: Distinct colors for each blockchain network

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete documentation.

## USD Value Features

### Token Display
Each token shows:
- Token symbol with native/stablecoin badge
- Token balance with proper decimal formatting
- Current price per token in USD
- Total USD value for that balance

### Price Handling
- **Live Prices**: Fetched from CoinGecko API
- **Caching**: 5-minute cache to minimize API calls
- **Stablecoins**: Hardcoded at $1.00 (USDC, USDT, DAI)
- **Wrapped Tokens**: Use underlying asset price (WETH = ETH)
- **Graceful Degradation**: Shows balances even if price unavailable

## Project Structure

```
chainglass/
├── src/
│   ├── components/
│   │   ├── ui/                    # ShadCN UI base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── badge.tsx
│   │   └── crypto/                # Crypto-specific components
│   │       ├── AddAddressForm.tsx
│   │       ├── NetworkBadge.tsx
│   │       ├── PortfolioSummary.tsx
│   │       ├── TokenIcon.tsx
│   │       └── WalletCard.tsx
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   ├── services/                  # Business logic (from develop)
│   │   ├── priceService.ts        # CoinGecko integration
│   │   ├── rpcService.ts          # Blockchain RPC calls
│   │   └── storageService.ts      # LocalStorage management
│   ├── config/                    # Network & token configs
│   │   └── networks.ts
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   ├── styles/
│   │   └── app.css                # Global styles and design tokens
│   ├── App.tsx                    # Main application component
│   └── main.tsx                   # Application entry point
├── index.html
├── tailwind.config.ts             # Tailwind configuration
├── vite.config.ts                 # Vite configuration
├── postcss.config.js              # PostCSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## Networks Supported

| Network | Chain ID | Native Token |
|---------|----------|--------------|
| Ethereum | 1 | ETH |
| Polygon | 137 | MATIC |
| Arbitrum One | 42161 | ETH |
| Optimism | 10 | ETH |
| Base | 8453 | ETH |

## Common Tokens

The app automatically checks for popular tokens on each network:
- **Stablecoins**: USDC, USDT, DAI
- **Wrapped native**: WETH, WMATIC
- **DeFi**: LINK, UNI

## Privacy & Security

- **Watch-Only**: No private keys needed or stored
- **Client-Side**: All processing happens in your browser
- **No Backend**: Direct RPC calls to public endpoints
- **Local Storage**: Data stored only in your browser
- **Privacy-First**: Your addresses never leave your device

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- Conventional commits encouraged

## Roadmap

### Phase 1 - MVP ✅
- [x] Design system setup with ShadCN UI
- [x] Tailwind CSS v4 configuration
- [x] Core UI components
- [x] Multi-chain RPC integration
- [x] Balance fetching (native + ERC-20)
- [x] CoinGecko price feeds
- [x] LocalStorage persistence
- [x] USD value display

### Phase 2 - Enhanced Features (In Progress)
- [ ] Custom token management
- [ ] Network management UI
- [ ] Portfolio breakdown charts
- [ ] Export functionality
- [ ] Transaction history
- [ ] Historical price tracking

### Phase 3 - Multi-Ecosystem
- [ ] Bitcoin support
- [ ] Solana support
- [ ] Polkadot support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Design inspiration from [Linear](https://linear.app)
- UI components from [ShadCN UI](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Price data from [CoinGecko](https://www.coingecko.com)

---

Built with ❤️ for the crypto community
