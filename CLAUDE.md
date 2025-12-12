# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application built on the Obyte blockchain platform. It's a social DApp called "Friend" that allows users to connect, earn rewards, manage governance, and track leaderboards. The app features a sophisticated real-time state synchronization system using Server-Sent Events (SSE) and an LRU cache-based global store.

## Core Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture Overview

### State Management Architecture

The app uses a custom real-time state synchronization system:

1. **GlobalStore** (`src/global-store.ts`): Server-only singleton that manages application state using LRU caches
   - Stores AA (Autonomous Agent) state variables from Obyte blockchain
   - Manages governance state separately
   - Caches token metadata, leaderboard data, and attestations
   - Emits events on state updates via EventEmitter

2. **SSE Stream** (`src/app/api/data/stream/route.tsx`): Real-time updates to clients
   - Streams state changes to connected clients
   - Events: SNAPSHOT (full state), STATE_UPDATE (partial), GOVERNANCE_STATE_UPDATE

3. **Client Context** (`src/app/context.tsx`): React context that subscribes to SSE
   - Maintains client-side state synchronized with server
   - Auto-reconnects on connection loss
   - Provides `useData()` hook for components

### Bootstrap Process

The app initializes via Next.js instrumentation hooks:
- `src/instrumentation.ts` - Routes to runtime-specific implementations
- `src/instrumentation.node.ts` - Server bootstrap logic:
  1. Connects to Obyte client
  2. Loads all state variables from main AA and governance AA
  3. Fetches token metadata from token registry
  4. Initializes GlobalStore with initial state
  5. Watches AAs for state changes

### Feature-Based Organization

Code is organized by domain features in `src/features/`:
- `claim/` - Reward claiming functionality
- `deposit/` - Asset deposits
- `faq/` - FAQ components
- `governance/` - Governance proposals and voting
- `profile/` - User profiles
- `ghost/` - Ghost/avatar system
- `leaderboard/` - Rankings and leaderboards

Each feature typically has:
- `ui/` - React components
- `domain/` - Business logic, hooks, utilities
- `index.ts` - Public exports

### Obyte Integration

The app connects to the Obyte DAG (Directed Acyclic Graph) blockchain:
- Uses `obyte` package for client connection
- Watches Autonomous Agents (AAs) for state changes
- State variables are prefixed by type: `user_`, `friend_`, `deposit_asset_`, etc.
- Main AA address and governance AA address configured in environment

### Key Configuration Files

- `src/env.ts` - Environment validation using @t3-oss/env-nextjs and Zod
- `src/app-config.ts` - App constants (AA addresses, attestors, bot URLs, initial params)
- `src/constants.ts` - Shared constants like events, token metadata
- `types/index.d.ts` - Global TypeScript types

### Environment Variables

Required environment variables (see `src/env.ts`):
- `NEXT_PUBLIC_TESTNET` - Boolean for testnet mode
- `NEXT_PUBLIC_AA_ADDRESS` - Main Autonomous Agent address
- `NEXT_PUBLIC_SITE_URL` - Site URL
- `NEXT_PUBLIC_NOTIFY_URL` - Notification service URL
- `NEXT_PUBLIC_NOTIFY_PAIRING_URL` - Pairing URL for notifications

### Routing Structure

Next.js App Router with these main routes:
- `/` - Home page
- `/[address]` - User profile pages (dynamic route)
- `/leaderboard` - Rankings
- `/governance` - Governance proposals
- `/faq` - FAQ page

API routes for OG images:
- `/api/og/puzzle/[address]` - Puzzle OG images
- `/api/og/chart/[address]` - Chart OG images
- `/api/og/rewards/[address]` - Rewards OG images
- `/api/og/leaderboard` - Leaderboard OG image
- `/api/og/common/[page]` - Common pages OG images

### UI Component Library

Built with shadcn/ui and Radix UI primitives:
- Components in `src/components/ui/` follow shadcn conventions
- Custom components in `src/components/layouts/` and `src/components/magicui/`
- Tailwind CSS v4 for styling
- Uses React Compiler for optimization

### Data Flow

1. Server bootstrap loads initial state from Obyte blockchain
2. GlobalStore holds canonical state on server
3. SSE streams state updates to connected clients
4. Client context manages local state and auto-syncs
5. Components use `useData()` hook to access state
6. User interactions trigger Obyte transactions, which update AA state
7. AA state changes flow back through GlobalStore → SSE → clients

### Important Patterns

**Server vs Client Code:**
- Use `"use client"` directive for client components
- Import `"server-only"` for server-only modules
- Import `"client-only"` for client-only modules
- Avoid mixing server/client code

**State Access:**
- On server: `globalThis.__GLOBAL_STORE__` (after bootstrap)
- On client: `useData()` hook from context

**Calculations:**
- Reward calculations in `src/lib/calculations/`
- Use `getCeilingPrice()` and `getTotalBalance()` for leaderboard

**Obyte Client:**
- Access via `globalThis.__OBYTE_CLIENT__` on server
- Initialized once during bootstrap
- Used for AA state queries and attestation lookups

## Development Guidelines

### TypeScript & Code Style

From `.github/copilot-instructions.md`:
- Use functional and declarative programming patterns; avoid classes
- Favor iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`)
- Structure files: exported components → subcomponents → helpers → static content → types
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`)

### React Best Practices

- Minimize `'use client'`, `useEffect`, and `setState`
- Favor React Server Components (RSC) and Next.js SSR features
- Implement dynamic imports for code splitting
- Use responsive design with mobile-first approach
- Optimize images: WebP format, size data, lazy loading

### Error Handling

- Prioritize error handling and edge cases
- Use early returns for error conditions
- Implement guard clauses for preconditions
- Use custom error types for consistency

### State Management

- Use SWR for data fetching (configured in `client-providers.tsx`)
- Use Zod for schema validation
- Leverage the custom SSE-based state sync system

### Testing & Documentation

- Write unit tests with Jest and React Testing Library
- Provide clear comments for complex logic
- Use JSDoc comments for better IDE intellisense

## Working with Obyte State

State variables follow naming conventions:
- `constants` - AA configuration (asset, governance_aa, launch_ts)
- `variables` - Runtime parameters (AgentParams type)
- `user_{address}` - User data (balances, streaks, rewards)
- `friend_{address}_{friendAddress}` - Friend relationships
- `deposit_asset_{asset}` - Deposit asset configuration

Access patterns:
- Server: `globalThis.__GLOBAL_STORE__.state.get(key)`
- Client: `useData()` then access from returned object

## Debugging

The app logs bootstrap progress to console:
- `log(bootstrap): Start bootstrapping...`
- `log(bootstrap): all frd state vars are loaded`
- `log(bootstrap): watching main AA`
- `log(bootstrap): GlobalStore is ready`

Check these logs when debugging initialization issues.

## Component Configuration

The project uses `components.json` for shadcn/ui configuration. When adding new components, use the shadcn CLI or follow existing patterns in `src/components/ui/`.
