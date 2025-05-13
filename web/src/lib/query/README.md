# SolBet Query System

This directory contains the React Query implementation for data fetching and state management in the SolBet application.

## Directory Structure

- `config.ts` - QueryClient configuration and query key definitions
- `hooks/` - React Query hooks organized by domain
  - `index.ts` - Central export for all hooks 
  - `use-bets.ts` - Hooks for fetching betting data
  - `use-community-data.ts` - Hooks for community-wide data
  - `use-user-*.ts` - Various hooks for user-related data
  - `use-wallet.ts` - Hooks for wallet operations
- `mutations/` - Mutation hooks for data modifications
  - `create-bet.ts` - Mutation for creating new bets
  - `place-bet.ts` - Mutation for placing bets

## Key Features

1. **Centralized Query Keys**: All query keys are defined in `config.ts` for consistent caching and invalidation.

2. **API Abstraction**: API calls are abstracted away in `/lib/api/index.ts`.

3. **Optimistic Updates**: Mutations include optimistic updates for immediate UI feedback.

4. **Type Safety**: Strong TypeScript typing throughout the query system.

5. **Consistent Patterns**: All hooks follow consistent patterns for readability and maintainability.

## Usage Examples

```tsx
// Fetch a list of bets
const { data, isLoading } = useBets("sports", "active");

// Fetch a specific bet
const { data: bet, solanaBetData } = useBet("bet-123");

// Create a new bet
const { mutate: createBet, isLoading: isCreating } = useCreateBet();
createBet({
  title: "Will Team A win?",
  description: "Betting on the championship game",
  category: "sports",
  minimumBet: 0.1,
  maximumBet: 5,
  endTime: new Date(),
  creator: "wallet-address"
});

// Place a bet
const { mutate: placeBet } = usePlaceBet();
placeBet({
  betId: "bet-123",
  position: "yes",
  amount: 1.5,
  walletAddress: "wallet-address"
});
```

## Best Practices

1. **Query Invalidation**: When mutating data, invalidate relevant queries to keep data consistent.

2. **Stale Times**: Configure appropriate stale times based on how frequently data changes.

3. **Error Handling**: All API functions include error handling with user-friendly messages.

4. **Optimistic Updates**: Use optimistic updates for mutations to improve perceived performance.

5. **Query Keys**: Use the predefined query keys from `config.ts` to ensure proper cache management.
