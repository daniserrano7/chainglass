# ChainGlass - Project Requirements

## Project Overview

**Name:** ChainGlass

**Tagline:** "See through your crypto"

**Description:** Multi-chain portfolio tracker for watch-only addresses. Add any wallet address, and see all your crypto holdings across multiple chains and ecosystems in one unified dashboard.

**Type:** Web Application (Frontend-focused, no backend required for MVP)

**Core Value Proposition:**
- NOT a wallet (does not manage private keys)
- Watch-only portfolio aggregation across multiple addresses and chains
- Perfect for: tracking multiple personal wallets, monitoring investments, watching addresses of interest

---

## User Personas

1. **Multi-wallet user**: Has funds in hardware wallet, mobile wallet, and hot wallet - wants unified view
2. **Multi-chain investor**: Has assets across Ethereum, Polygon, Arbitrum, etc. - wants aggregated portfolio
3. **Crypto analyst**: Tracks external addresses (whales, exchanges, smart contracts) without owning the keys
4. **DeFi participant**: Manages positions across multiple chains and wants holistic view

---

## Core Features (MVP - Phase 1)

### 1. Address Management

#### Add Address
- **Input fields:**
  - Address text input (required)
  - Chain family selector: "EVM" (only option for MVP)
  - Label/alias text input (optional) - e.g., "Hardware Wallet", "MetaMask Mobile"

- **Validation:**
  - Validate address format based on chain family
  - EVM: Must match `0x[a-fA-F0-9]{40}` pattern
  - Show clear error message if invalid
  - Prevent duplicate address+family combinations

- **Action:** "Add Address" button triggers auto-scan process

#### Auto-Scan Process
When user adds an address:
1. Validate address format
2. Create unique identifier for this watched address
3. Scan ALL enabled networks in the selected chain family
4. For each network:
   - Fetch native token balance
   - Fetch balances for all configured tokens (common + custom)
   - Fetch USD prices for all assets
5. Show progress indicator: "Scanning Ethereum... Polygon... Arbitrum..."
6. Store results and display

#### Address List Display
- Show all added addresses as cards
- Each card shows:
  - Label (or "Unnamed Address" if no label)
  - Truncated address: `0x1234...5678`
  - Chain family badge: "EVM"
  - Last scanned timestamp
  - Networks with balances (expanded)
  - Networks without balances (collapsed)
  - Total portfolio value for this address
  - "Rescan" button - re-triggers scan for this address
  - "Remove" button - deletes this address from tracking

#### Address Persistence
- Store in browser localStorage:
  - Address string
  - Chain family
  - Label
  - Date added
  - Last scan timestamp
  - List of networks scanned
- Do NOT store balances (always fetch fresh)
- On page reload: restore addresses and auto-fetch current balances

---

### 2. Network Management

#### Default EVM Networks (Phase 1)
Include these networks in auto-scan by default:
- Ethereum Mainnet
- Polygon
- Arbitrum One
- Optimism
- Base

#### Network Configuration Structure
Each network must define:
- Network ID (unique string, e.g., "ethereum", "polygon")
- Display name (e.g., "Ethereum", "Polygon")
- Chain ID (numeric, e.g., 1 for Ethereum)
- RPC URL (public endpoint)
- Native token info:
  - Symbol (e.g., "ETH", "MATIC")
  - Decimals (usually 18 for EVM)
  - CoinGecko ID for price fetching
- Block explorer URL (e.g., "https://etherscan.io")
- Multicall contract address (for batch requests optimization)
- List of common tokens for this network

#### Common Tokens per Network
Pre-configured token lists (ERC-20 standard):

**Ethereum:**
- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- DAI: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`
- LINK: `0x514910771AF9Ca656af840dff83E8264EcF986CA`
- UNI: `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`

**Polygon:**
- USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- USDT: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- DAI: `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063`
- WMATIC: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`

**Arbitrum One:**
- USDC: `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8`
- USDT: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- DAI: `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1`
- WETH: `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1`

**Optimism:**
- USDC: `0x7F5c764cBc14f9669B88837ca1490cCa17c31607`
- USDT: `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58`
- DAI: `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1`
- WETH: `0x4200000000000000000000000000000000000006`

**Base:**
- USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- DAI: `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb`

Note: Only show tokens with balance > 0

---

### 3. Balance Fetching & Display

#### Native Token Balance
For each network:
- Fetch native token balance (ETH, MATIC, ARB, OP, etc.)
- Display amount with full precision (e.g., "2.456789 ETH")
- Display USD equivalent
- Show token logo/icon

#### ERC-20 Token Balances
For each configured token on each network:
- Fetch balance using ERC-20 standard `balanceOf(address)` call
- Only display if balance > 0
- Show: token logo, symbol, amount, USD value

#### Balance Display Structure
```
Address Card
  ├─ Native Balance (if > 0)
  │   └─ ETH: 5.5 ($11,000)
  │
  ├─ Token Balances (if > 0)
  │   ├─ USDC: 1,000 ($1,000)
  │   ├─ DAI: 50 ($50)
  │   └─ LINK: 25 ($325)
  │
  └─ Total for this network: $12,375
```

#### Networks Without Balance
- Collapse by default
- Show count: "ø 8 other networks (no balance found)"
- Allow expanding to see which networks were scanned

---

### 4. Price Feeds

#### Integration with CoinGecko API
- Use CoinGecko free tier API
- Fetch USD prices for:
  - All native tokens (ETH, MATIC, etc.)
  - All ERC-20 tokens being tracked
- Cache prices for 5 minutes to reduce API calls
- If API call fails: show balances without USD values (graceful degradation)

#### Stablecoin Pricing
- Hardcode $1.00 for: USDC, USDT, DAI
- No need to fetch from API

#### Wrapped Token Pricing
- WETH price = ETH price
- WMATIC price = MATIC price
- etc.

---

### 5. Portfolio Aggregation

#### Total Portfolio Value
- Sum ALL balances across ALL addresses and ALL networks
- Display prominently at top of dashboard
- Update when any balance changes or refreshes

#### Breakdown by Network
Show total holdings per network across all addresses:
- Ethereum: $45,000 (60%)
- Polygon: $20,000 (26%)
- Arbitrum: $8,000 (11%)
- Optimism: $2,000 (3%)

#### Breakdown by Address
Each address card shows its own subtotal across all networks it was found on

#### Optional: Breakdown by Asset Type
- Total in ETH (including WETH)
- Total in stablecoins (USDC + USDT + DAI)
- Total in other tokens

---

### 6. User Interface Requirements

#### Main Dashboard Layout
```
┌────────────────────────────────────────────┐
│  ChainGlass Logo                           │
│  Total Portfolio: $95,000                  │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Add New Address                           │
│  ┌──────────────────────────────────────┐ │
│  │ Address: [0x________________]        │ │
│  │ Chain Family: [EVM ▼]                │ │
│  │ Label (optional): [__________]       │ │
│  │ [Add & Scan Address]                 │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Tracked Addresses (3)                     │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 💼 Hardware Wallet                   │ │
│  │ 0x1234...5678 (EVM)                  │ │
│  │ Last scanned: 2 minutes ago          │ │
│  │                                      │ │
│  │ ✓ Ethereum                           │ │
│  │   ETH: 5.5 ($11,000)                 │ │
│  │   USDC: 1,000 ($1,000)               │ │
│  │   Subtotal: $12,000                  │ │
│  │                                      │ │
│  │ ✓ Polygon                            │ │
│  │   MATIC: 100 ($50)                   │ │
│  │   USDC: 500 ($500)                   │ │
│  │   Subtotal: $550                     │ │
│  │                                      │ │
│  │ ø 3 other networks (no balance)      │ │
│  │                                      │ │
│  │ Address Total: $12,550               │ │
│  │ [Rescan] [Remove]                    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [More address cards...]                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│  Portfolio Breakdown                       │
│  ├─ Ethereum: $45,000 ██████████ 47%      │
│  ├─ Polygon:  $30,000 ██████░░░ 32%       │
│  ├─ Arbitrum: $15,000 ███░░░░░░ 16%       │
│  └─ Optimism: $5,000  █░░░░░░░░ 5%        │
└────────────────────────────────────────────┘
```

#### UI States

**Empty State (no addresses added):**
```
┌────────────────────────────────────────┐
│   📊                                   │
│   No addresses tracked yet             │
│   Add your first address above         │
│   to see your portfolio                │
└────────────────────────────────────────┘
```

**Loading State (during scan):**
```
┌────────────────────────────────────────┐
│   🔍 Scanning address...               │
│   ✓ Ethereum (found balance)           │
│   ⟳ Polygon (scanning...)              │
│   ⋯ Arbitrum (pending...)              │
│   ⋯ Optimism (pending...)              │
│                                        │
│   [Cancel Scan]                        │
└────────────────────────────────────────┘
```

**Error State (RPC failure):**
```
┌────────────────────────────────────────┐
│   ⚠️ Failed to fetch from Ethereum     │
│   RPC Error: Connection timeout        │
│   [Retry]                              │
└────────────────────────────────────────┘
```

**Zero Balance State:**
```
┌────────────────────────────────────────┐
│ 📭 0x1234...5678                       │
│ Valid address, but no balances found   │
│ on any scanned network                 │
│ [Rescan] [Remove]                      │
└────────────────────────────────────────┘
```

#### Responsive Design
- Desktop: Multi-column layout
- Tablet: 2-column layout
- Mobile: Single column, cards stack vertically

#### Color Scheme & Theming
- Light/Dark mode toggle (optional for MVP)
- Color-code networks (e.g., Ethereum = purple, Polygon = purple, Arbitrum = blue)
- Clear visual hierarchy (totals prominent, details secondary)

---

### 7. Data Persistence

#### LocalStorage Schema
```json
{
  "watchedAddresses": [
    {
      "id": "uuid-1234-5678",
      "address": "0x1234567890123456789012345678901234567890",
      "chainFamily": "evm",
      "label": "Hardware Wallet",
      "addedAt": 1699564800000,
      "lastScanned": 1699651200000,
      "networksScanned": ["ethereum", "polygon", "arbitrum", "optimism", "base"]
    }
  ],
  "enabledNetworks": {
    "evm": ["ethereum", "polygon", "arbitrum", "optimism", "base"]
  },
  "customTokens": {
    "ethereum": [
      {
        "symbol": "PEPE",
        "address": "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        "decimals": 18,
        "addedBy": "user"
      }
    ]
  }
}
```

#### What to Store
- ✅ Watched addresses metadata
- ✅ User preferences (enabled networks, custom tokens)
- ❌ DO NOT store balances (always fetch fresh)
- ❌ DO NOT store prices (always fetch fresh)

#### On Page Load
1. Read localStorage
2. Restore watched addresses
3. Trigger auto-scan for each address
4. Display results as they arrive

---

## Phase 2 Features (Post-MVP)

### Manage Networks
**Purpose:** Allow users to enable/disable networks for auto-scan

**UI:**
```
┌────────────────────────────────────────┐
│  Manage EVM Networks                   │
│                                        │
│  Default Networks (scanned by default):│
│  ☑ Ethereum                            │
│  ☑ Polygon                             │
│  ☑ Arbitrum One                        │
│  ☑ Optimism                            │
│  ☑ Base                                │
│                                        │
│  Additional Networks (opt-in):         │
│  ☐ Avalanche C-Chain                   │
│  ☐ BNB Chain                           │
│  ☐ Fantom                              │
│  ☐ Gnosis Chain                        │
│  ☐ Energy Web Chain                    │
│                                        │
│  [Save Changes]                        │
└────────────────────────────────────────┘
```

**Behavior:**
- Checkbox toggles whether network is included in auto-scan
- Changes saved to localStorage
- Next scan uses updated network list
- Can trigger "Rescan All" to apply immediately

### Manage Tokens
**Purpose:** Allow users to add custom ERC-20 tokens

**UI:**
```
┌────────────────────────────────────────┐
│  Manage Tokens                         │
│                                        │
│  Common Tokens (pre-configured):       │
│  USDC, USDT, DAI, WETH, LINK, UNI...   │
│                                        │
│  Your Custom Tokens (5):               │
│  🟣 PEPE     0x6982...1b23 (Ethereum)  │
│     [Remove]                           │
│  🔵 ENERGY   0x1e4a...5c89 (Energy Web)│
│     [Remove]                           │
│                                        │
│  Add Custom Token:                     │
│  Network: [Ethereum ▼]                 │
│  Contract Address: [0x________]        │
│  [Detect Info] ← auto-fetch metadata   │
│                                        │
│  Symbol: [____] (auto-detected)        │
│  Decimals: [__] (auto-detected)        │
│  [Add Token]                           │
└────────────────────────────────────────┘
```

**Token Detection:**
- When user inputs contract address, call:
  - `symbol()` to get token symbol
  - `decimals()` to get decimals
  - Auto-populate fields
- Fallback: manual entry if detection fails

**Behavior:**
- Custom tokens saved to localStorage per network
- Merged with common tokens during balance fetch
- Custom tokens tracked across all addresses

### Progress Indicator Enhancement
Show detailed progress during scan:
- Network-by-network status
- Estimated time remaining
- Percentage complete
- Ability to cancel mid-scan

### Visual Enhancements
- Pie chart for portfolio distribution
- Bar charts for network breakdown
- Line graph for portfolio value over time (requires historical tracking)
- Token logos from CoinGecko or token lists

---

## Phase 3 Features (Future Expansion)

### Additional EVM Networks
Expand to 10-15 EVM networks:
- Avalanche C-Chain
- BNB Chain (BSC)
- Fantom
- Gnosis Chain
- Celo
- Moonbeam
- Moonriver
- Energy Web Chain
- Aurora

### Performance Optimizations
- Multicall contract integration (batch token balance calls)
- Parallel network scanning with concurrency limits
- Aggressive caching strategy
- Request deduplication

### Export Functionality
- Export portfolio to CSV
- Export to JSON
- Print-friendly view

### Transaction History
- Show recent transactions per address
- Filter by network, token, date range
- Export transaction history

---

## Phase 4 Features (Multi-Ecosystem)

### Bitcoin Support
- Add "Bitcoin" chain family
- Support address formats: Legacy, SegWit, Native SegWit
- Fetch BTC balance and USD value
- No tokens (Bitcoin has no token standard)
- Use Blockstream API or similar

### Solana Support
- Add "Solana" chain family
- Fetch SOL balance
- Fetch SPL token balances
- Use Solana RPC endpoints

### Polkadot Support
- Add "Polkadot" chain family
- Fetch DOT balance on relay chain
- Support parachain scanning (Acala, Moonbeam, Astar, Energy Web X, etc.)
- Fetch parachain native tokens and assets
- Use Subscan API or @polkadot/api

---

## Technical Constraints

### No Backend Required (MVP)
- Pure frontend application
- All data fetching via RPC endpoints and public APIs
- All persistence via browser localStorage
- No database, no server-side code

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- LocalStorage support required

### API Dependencies
- EVM RPC endpoints (public or Infura/Alchemy free tier)
- CoinGecko API (free tier, no API key required)
- Future: Blockstream API, Solana RPC, Subscan API

### Rate Limiting Awareness
- Be mindful of RPC rate limits (typically 100-300 req/min for free tiers)
- Implement request throttling and retry logic
- Cache aggressively to minimize redundant calls

---

## Non-Functional Requirements

### Performance
- Initial page load: < 3 seconds
- Address scan (5 networks): < 30 seconds
- Balance refresh: < 10 seconds
- UI should remain responsive during background scans

### Security
- NO private keys, mnemonics, or sensitive data stored anywhere
- All connections via HTTPS
- Input sanitization for addresses
- XSS prevention

### Usability
- Clear error messages
- Loading indicators for all async operations
- Graceful degradation if API fails
- Mobile-friendly interface

### Reliability
- Handle network failures gracefully
- Retry failed requests (with exponential backoff)
- Don't let one network failure block others
- Preserve user data even if scan fails

---

## Out of Scope

The following are explicitly NOT part of this project:

❌ Wallet functionality (create/import/export keys)
❌ Transaction sending
❌ Token swaps or DEX integration
❌ NFT tracking (future consideration)
❌ DeFi position tracking (staking, LP tokens)
❌ User authentication/accounts
❌ Backend server or database
❌ Real-time price updates (WebSockets)
❌ Push notifications
❌ Mobile native apps (web only)
❌ Browser extension

---

## Success Criteria

The MVP is considered complete when:

✅ User can add an EVM address with label
✅ App automatically scans 5 EVM networks
✅ Native token balances displayed with USD values
✅ ERC-20 token balances (common tokens) displayed with USD values
✅ Total portfolio value calculated and displayed
✅ Breakdown by network shown
✅ User can refresh balances manually
✅ User can remove addresses
✅ Data persists across page reloads
✅ UI is responsive and works on mobile
✅ All states handled (loading, error, empty, zero balance)
✅ App works with public/free APIs (no costs)

---

## Glossary

- **Watch-only address**: An address being tracked without access to its private keys
- **Chain family**: A group of blockchains sharing similar architecture (e.g., EVM, Bitcoin, Solana)
- **Native token**: The base currency of a blockchain (ETH, MATIC, BTC, SOL, DOT)
- **ERC-20**: Ethereum token standard (also used on EVM-compatible chains)
- **Multicall**: A smart contract pattern that batches multiple read calls into one request
- **RPC**: Remote Procedure Call - how applications communicate with blockchain nodes
- **Parachain**: A blockchain connected to the Polkadot relay chain

---

## Document Version

- **Version**: 1.0
- **Date**: November 2025
- **Status**: Final for MVP Phase 1
