# ChainGlass 🔍

**See through your crypto** - Multi-chain portfolio tracker for watch-only addresses

## Features

- 💰 **USD Value Display**: Real-time USD values for all tokens
- ⛓️ **Multi-Chain Support**: Track balances across 5 EVM networks
  - Ethereum Mainnet
  - Polygon
  - Arbitrum One
  - Optimism
  - Base
- 🪙 **Token Detection**: Automatic detection of native and ERC-20 tokens
- 💵 **Price Integration**: CoinGecko API with 5-minute caching
- 📊 **Portfolio Aggregation**: Total portfolio value across all addresses and networks
- 💾 **Persistent Storage**: LocalStorage-based data persistence
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

1. **Add an Address**: Enter any Ethereum address in the form (e.g., `0x...`)
2. **Optional Label**: Give it a friendly name like "My Wallet" or "Trading Account"
3. **View Balances**: The app will automatically scan all 5 networks for:
   - Native tokens (ETH, MATIC)
   - Common ERC-20 tokens (USDC, USDT, DAI, etc.)
4. **See USD Values**: Each token displays its current USD value
5. **Track Portfolio**: View total portfolio value across all addresses

## USD Value Features

### Token Display
Each token shows:
- Token symbol and type (Native/Stablecoin badge)
- Token balance with proper decimal formatting
- Current price per token in USD
- Total USD value for that token balance

### Network Totals
Each network section displays:
- Total USD value across all tokens on that network
- Expandable/collapsible view of individual tokens

### Portfolio Aggregation
- Total portfolio value across all addresses
- Total value per address
- Breakdown by network

### Price Handling
- **Live Prices**: Fetched from CoinGecko API
- **Caching**: 5-minute cache to minimize API calls
- **Stablecoins**: Hardcoded at $1.00 (USDC, USDT, DAI)
- **Wrapped Tokens**: Use underlying asset price (WETH = ETH price)
- **Graceful Degradation**: Shows balances even if price unavailable

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Blockchain**: ethers.js v6
- **Price Data**: CoinGecko API (free tier)
- **Styling**: CSS with CSS Variables for theming
- **Storage**: Browser LocalStorage

## Project Structure

```
src/
├── components/         # React components
│   ├── Dashboard.tsx   # Main portfolio view
│   ├── AddressCard.tsx # Individual address display
│   ├── AddressForm.tsx # Add new address
│   ├── NetworkSection.tsx # Network breakdown
│   ├── TokenList.tsx   # List of tokens
│   └── TokenItem.tsx   # Individual token with USD value
├── services/          # Business logic
│   ├── priceService.ts # CoinGecko integration
│   ├── rpcService.ts   # Blockchain RPC calls
│   └── storageService.ts # LocalStorage management
├── config/            # Configuration
│   └── networks.ts    # Network definitions
├── types/             # TypeScript types
│   └── index.ts
└── utils/             # Utility functions
    └── formatting.ts  # Number/USD formatting
```

## Example Usage

Try with Vitalik's address:
```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Or any other Ethereum address you want to track!

## Privacy & Security

- **Watch-Only**: No private keys needed or stored
- **Client-Side**: All processing happens in your browser
- **No Backend**: Direct RPC calls to public endpoints
- **Local Storage**: Data stored only in your browser

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
- Stablecoins: USDC, USDT, DAI
- Wrapped native: WETH, WMATIC
- DeFi: LINK, UNI

## License

MIT
