# ChainGlass

> **See through your crypto** - Multi-chain portfolio tracker for watch-only addresses

ChainGlass is a modern, privacy-focused portfolio tracker that lets you monitor crypto holdings across multiple blockchain networks without connecting your wallet or exposing your private keys.

## Features

- 🔍 **Watch-only tracking** - No private keys required
- 🌐 **Multi-chain support** - Track assets across Ethereum, Polygon, Arbitrum, Optimism, Base, and more
- 💎 **Beautiful UI** - Futuristic design inspired by Linear with ShadCN UI components
- 🎨 **Modern tech stack** - Built with React, TypeScript, Vite, and Tailwind CSS v4
- 🚀 **Fast & lightweight** - Pure frontend, no backend required
- 🌙 **Dark-first design** - Optimized for extended viewing sessions

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Components**: ShadCN UI
- **Icons**: Lucide React
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

## Design System

ChainGlass features a comprehensive design system with:

- **Futuristic color palette** - Deep dark backgrounds with vibrant purple-blue gradients
- **Custom components** - Built with ShadCN UI and enhanced with crypto-specific patterns
- **Glow effects** - Subtle glows on important elements
- **Smooth animations** - Fade-ins, transitions, and micro-interactions
- **Network-specific colors** - Distinct colors for each blockchain network

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete documentation.

## Project Structure

```
chainglass/
├── src/
│   ├── components/
│   │   ├── ui/              # ShadCN UI base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── badge.tsx
│   │   └── crypto/          # Crypto-specific components
│   │       ├── AddAddressForm.tsx
│   │       ├── NetworkBadge.tsx
│   │       ├── PortfolioSummary.tsx
│   │       ├── TokenIcon.tsx
│   │       └── WalletCard.tsx
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── styles/
│   │   └── app.css          # Global styles and design tokens
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── index.html
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
├── postcss.config.js        # PostCSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking

### Code Style

- TypeScript strict mode enabled
- ESLint configured
- Prettier for code formatting
- Conventional commits encouraged

## Roadmap

### Phase 1 - MVP ✅
- [x] Design system setup
- [x] ShadCN UI integration
- [x] Tailwind CSS v4 configuration
- [x] Core UI components
- [x] Demo application with mock data

### Phase 2 - Core Functionality (In Progress)
- [ ] Address input and validation
- [ ] Multi-chain RPC integration
- [ ] Balance fetching (native + ERC-20)
- [ ] CoinGecko price feeds
- [ ] LocalStorage persistence

### Phase 3 - Enhanced Features
- [ ] Custom token management
- [ ] Network management
- [ ] Portfolio breakdown charts
- [ ] Export functionality
- [ ] Transaction history

### Phase 4 - Multi-Ecosystem
- [ ] Bitcoin support
- [ ] Solana support
- [ ] Polkadot support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- Design inspiration from [Linear](https://linear.app)
- UI components from [ShadCN UI](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

Built with ❤️ for the crypto community
