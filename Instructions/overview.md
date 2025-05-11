Here's a comprehensive technical documentation for your project:

```markdown
# Next.js Web3 Admin Dashboard - Technical Specification

## Project Structure
```
src/
├── app/
│   ├── [locale]/               # Localized routes
│   │   ├── (admin)/           # Admin routes
│   │   ├── layout.tsx         # Locale wrapper
│   │   └── page.tsx           # Localized homepage
│   ├── (full-width-pages)/    # Public pages
│   ├── layout.tsx             # Root layout (untouched)
│   └── not-found.tsx
├── components/
│   ├── LanguageSwitcher.tsx
│   └── Web3/                  # Web3 components
├── hooks/
│   ├── useLocale.ts
│   └── useWeb3.ts
├── lib/
│   ├── i18n/
│   │   ├── config.ts
│   │   └── dictionaries/      # JSON translation files
│   └── web3/
│       ├── connectors.ts      # Wallet connectors
│       └── contracts.ts       # Contract ABIs
└── middleware.ts              # Routing middleware
```

## Internationalization System

### Core Logic
1. **Middleware Routing**:
   - Auto-detects locale from:
     - Cookies (`NEXT_LOCALE`)
     - Browser headers (`Accept-Language`)
   - Redirects root (`/`) → `/{locale}`
   - Forces locale prefix on all routes

2. **Client-Side Handling**:
```typescript
// hooks/useLocale.ts
const locale = usePathname().split('/')[1] // Simple path extraction
const t = dictionaries[locale] // Direct JSON access
```

3. **Key Features**:
   - Zero-dependency translation system
   - Cookie-based persistence
   - RTL/LTR auto-detection
   - Type-safe dictionaries

## Web3 Integration

### Authentication Flow
1. **Wallet Connection**:
   - Supports MetaMask, WalletConnect, Coinbase Wallet
   - Uses Web3Modal for unified interface

2. **Session Management**:
```typescript
// hooks/useWeb3.ts
const { address, chainId } = useAccount()
const { login, logout } = useAuth()
```

3. **Contract Interaction**:
   - Custom hooks for each smart contract
   - Automatic chain switching
   - Error handling for RPC failures

## Technical Stack

| Layer          | Technology               |
|----------------|--------------------------|
| Framework      | Next.js 14 (App Router)  |
| State          | Zustand + Jotai          |
| Styling        | Tailwind CSS             |
| Web3           | Wagmi + viem             |
| i18n           | Custom JSON system       |
| Auth           | Next-Auth + Web3         |

## Key Design Decisions

1. **Modular Architecture**:
   - Isolated Web3 logic in `/lib/web3`
   - Self-contained i18n system
   - Admin routes colocated with locale

2. **Performance Optimizations**:
   - Middleware runs at edge
   - No client-side locale detection
   - Wallet connection lazy loading

3. **Security**:
   - CSRF protection for auth
   - Contract calls use prepared statements
   - Cookie encryption

## Maintenance Guide

### Adding Contracts
1. Add ABI to `lib/web3/contracts.ts`
2. Create custom hook:
```typescript
export function useContractX() {
  return useContract({
    address: CONTRACT_ADDRESS,
    abi: ContractXABI
  })
}
```

### Testing Locales
```bash
# Verify redirects
curl -I http://localhost:3000/register

# Check cookie setting
curl -v http://localhost:3000 --header "Accept-Language: fa"
```

This documentation captures the complete technical implementation while maintaining your clean architecture and separation of concerns.
```