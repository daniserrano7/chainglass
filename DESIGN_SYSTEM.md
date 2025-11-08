# ChainGlass Design System

A futuristic, Linear-inspired design system built with **ShadCN UI** and **Tailwind CSS v4** for the ChainGlass crypto portfolio tracker.

## Overview

This design system combines the sleek, minimalist aesthetic of Linear with a futuristic crypto theme featuring vibrant gradients, subtle glow effects, and a dark color palette optimized for displaying crypto data.

## Design Philosophy

- **Dark-first**: Optimized for low-light environments and extended viewing sessions
- **Futuristic**: Gradients, glow effects, and modern UI patterns
- **High contrast**: Clear visual hierarchy for easy scanning of portfolio data
- **Linear-inspired**: Tight spacing, clean typography, and smooth transitions
- **Crypto-native**: Colors and styles that feel at home in Web3

## Color System

### Background Colors
```css
--color-background: #0a0a0f           /* Main background - deep dark */
--color-background-secondary: #111118  /* Secondary surfaces */
--color-background-tertiary: #17171f   /* Tertiary surfaces */
--color-background-hover: #1d1d27      /* Hover state */
--color-background-active: #23232f     /* Active state */
```

### Surface Colors (Cards & Panels)
```css
--color-surface: #17171f
--color-surface-hover: #1d1d27
--color-surface-active: #23232f
```

### Border Colors
```css
--color-border: #2a2a35           /* Default borders */
--color-border-hover: #3a3a48     /* Hover state */
--color-border-focus: #5b5bd6     /* Focus state */
```

### Text Colors
```css
--color-text-primary: #e6e6ef     /* Primary text - high contrast */
--color-text-secondary: #9999a8   /* Secondary text - medium contrast */
--color-text-tertiary: #6b6b7a    /* Tertiary text - low contrast */
--color-text-inverse: #0a0a0f     /* Inverse text (for colored backgrounds) */
```

### Brand Colors (Purple-Blue Gradient)
A vibrant purple-blue gradient inspired by Linear, perfect for primary actions and brand elements.

```css
--color-brand-500: #5b5bd6  /* Primary brand color */
--color-brand-600: #4747b8  /* Hover state */
--color-brand-700: #36369a  /* Active state */
```

### Accent Colors (Electric Cyan)
Electric cyan/teal for accents and highlights - gives that crypto/tech vibe.

```css
--color-accent-500: #00d9ff  /* Primary accent */
--color-accent-600: #00b8d9  /* Hover state */
--color-accent-700: #0097b3  /* Active state */
```

### Semantic Colors

**Success** (Vibrant Green):
```css
--color-success-500: #00e699
```

**Warning** (Amber/Gold):
```css
--color-warning-500: #ffcc00
```

**Error** (Electric Red):
```css
--color-error-500: #ff0033
```

## Typography

### Font Families
- **Sans-serif**: Inter - Clean, modern, excellent for UI
- **Monospace**: JetBrains Mono - Perfect for addresses, hashes, and code

### Font Sizes
```css
text-xs:   12px  /* Small labels */
text-sm:   14px  /* Secondary text */
text-base: 16px  /* Body text */
text-lg:   18px  /* Large body */
text-xl:   20px  /* Subheadings */
text-2xl:  24px  /* Section headers */
text-3xl:  30px  /* Page headers */
```

## Spacing

Linear-inspired tight, compact spacing for a dense but readable layout:

```css
spacing-1:  4px   (0.25rem)
spacing-2:  8px   (0.5rem)
spacing-3:  12px  (0.75rem)
spacing-4:  16px  (1rem)
spacing-6:  24px  (1.5rem)
spacing-8:  32px  (2rem)
```

## Border Radius

```css
rounded-sm:  6px   /* Small elements */
rounded-md:  8px   /* Standard elements */
rounded-lg:  12px  /* Cards, panels */
rounded-xl:  16px  /* Large containers */
rounded-2xl: 24px  /* Extra large */
```

## Shadows

Subtle shadows with optional glow effects:

```css
shadow-sm: Subtle shadow for small elements
shadow-md: Default card shadow
shadow-lg: Elevated panels
shadow-glow: Purple glow effect (brand)
shadow-glow-accent: Cyan glow effect (accent)
```

## Custom Utilities

### Gradient Border
Creates a gradient border effect using purple-to-cyan gradient:
```tsx
<div className="gradient-border">
  {/* Content */}
</div>
```

### Text Gradient
Applies gradient to text:
```tsx
<h1 className="text-gradient">ChainGlass</h1>
```

### Glow Effects
```tsx
<Button className="glow">Brand Glow</Button>
<Button className="glow-accent">Accent Glow</Button>
```

### Animations
```tsx
<Card className="animate-fade-in">Fades in from bottom</Card>
<div className="animate-shimmer">Loading shimmer effect</div>
```

## Components

### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Default (Brand with glow)
<Button variant="default">Primary Action</Button>

// Secondary (Subtle)
<Button variant="secondary">Secondary Action</Button>

// Accent (Cyan with glow)
<Button variant="accent">Accent Action</Button>

// Ghost (Transparent)
<Button variant="ghost">Ghost Button</Button>

// Semantic
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Input

```tsx
import { Input } from "@/components/ui/input"

<Input placeholder="0x..." className="font-mono" />
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Default</Badge>
<Badge variant="accent">Accent</Badge>
<Badge variant="success">Success</Badge>
```

### Network Badge (Crypto-specific)

```tsx
import { NetworkBadge } from "@/components/crypto/NetworkBadge"

<NetworkBadge network="Ethereum" />
<NetworkBadge network="Polygon" />
```

### Token Icon (Crypto-specific)

```tsx
import { TokenIcon } from "@/components/crypto/TokenIcon"

<TokenIcon symbol="ETH" size="md" />
```

## Network Colors

Pre-defined colors for popular blockchain networks:

```tsx
{
  ethereum: "#627eea",  // Purple-blue
  polygon: "#8247e5",   // Purple
  arbitrum: "#28a0f0",  // Blue
  optimism: "#ff0420",  // Red
  base: "#0052ff",      // Blue
  avalanche: "#e84142", // Red
  bnb: "#f3ba2f",       // Yellow
}
```

## Scrollbar Styling

Custom dark scrollbars that match the theme:
- Width: 8px
- Track: `--color-background-secondary`
- Thumb: `--color-border`
- Thumb hover: `--color-border-hover`

## Usage Guidelines

### Do's ✅
- Use brand colors for primary actions and key metrics
- Use accent colors for highlights and interactive elements
- Maintain tight spacing for a compact, information-dense layout
- Use glow effects sparingly on important elements
- Apply gradient borders to highlight premium or important cards
- Use monospace font for addresses, hashes, and numeric data

### Don'ts ❌
- Avoid using too many glow effects (max 2-3 per screen)
- Don't use bright colors for large areas
- Avoid mixing gradients - stick to one gradient per major section
- Don't use borders without hover states
- Avoid cluttering the interface - embrace whitespace

## Accessibility

- All text meets WCAG AA contrast requirements
- Focus states are clearly visible with brand color rings
- Interactive elements have minimum 44x44px touch targets
- Semantic HTML is used throughout
- Color is never the only indicator of state

## Development

### Running the Dev Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Future Enhancements

- [ ] Light mode support
- [ ] Additional network colors
- [ ] More animation utilities
- [ ] Loading skeleton components
- [ ] Toast notifications
- [ ] Modal dialogs
- [ ] Data visualization components (charts, graphs)

---

Built with ❤️ using ShadCN UI and Tailwind CSS v4
