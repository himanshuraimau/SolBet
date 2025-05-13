# SolBet Hooks

This directory contains React hooks used throughout the SolBet application. Hooks are organized by category and follow a consistent pattern.

## How to Use Hooks

All hooks can be imported from the central `hooks` index:

```tsx
import { useBet, useIsMobile, useToast } from "@/hooks";

function Component() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { createBet } = useBet();
  
  // Use hooks in your component...
}
```

## Available Hooks

### UI/UX Hooks

| Hook | Description |
|------|-------------|
| `useIsMobile` | Detects if the current viewport is mobile-sized |
| `useToast` | Provides toast notification functionality |

### Authentication Hooks

| Hook | Description |
|------|-------------|
| `useWalletAuth` | Manages wallet connection and user authentication |

### Bet Interaction Hooks

| Hook | Description |
|------|-------------|
| `useBet` | High-level hook for bet creation, participation, and resolution |
| `useBets` | Hook for fetching and filtering bet listings |
| `useSolanaBet` | Low-level Solana blockchain interactions for bets |

### Data Fetching Hooks

| Hook | Description |
|------|-------------|
| `useQueryBet` | Fetch individual bet data |
| `useQueryBets` | Fetch lists of bets |
| `useCommunityActivity` | Fetch community activity feed |
| `useLeaderboard` | Fetch leaderboard data |
| `useUserActivity` | Fetch user's activity |
| `useUserBets` | Fetch user's bet participation |
| `useUserProfile` | Fetch user profile data |
| `useUserStats` | Fetch user statistics |
| `useBettingHistory` | Fetch user's betting history |
| `usePortfolioPerformance` | Fetch and format portfolio performance data |
| `useUserTransactions` | Fetch user transaction history |

## Creating New Hooks

1. Copy the `HOOK_TEMPLATE.ts` file
2. Follow the structure and patterns established in the template
3. Add proper documentation with JSDoc comments
4. Export the hook from the central `index.ts` file

## Error Handling

All hooks should use the centralized error handling system:

```tsx
import { showErrorToast } from "@/lib/error-handling";

try {
  // Your code here
} catch (error) {
  showErrorToast(error);
  throw error; // Optionally re-throw if needed
}
```

## Testing Hooks

For guidance on testing hooks, refer to the `HOOKS_OVERVIEW.md` file in the docs directory.
