# SolBet Web Application

This is the front-end application for SolBet, a decentralized betting platform on Solana.

## Code Structure

### Core Components

- `providers/` - React context providers for global state and functionality
  - `wallet-provider.tsx` - Solana wallet adapter integration
  - `auth-provider.tsx` - User authentication state management
  - `query-provider.tsx` - React Query client provider

### Utilities

- `lib/` - Utility functions and services
  - `date-utils.ts` - Date formatting and calculation functions
  - `utils.ts` - General utility functions
  - `wallet.ts` - Wallet address formatting utilities
  - `solana.ts` - Solana blockchain interaction functions
  - `solana-program.ts` - SolBet program-specific constants
  - `solana-errors.ts` - Error handling for Solana transactions
  - `solana-debug.ts` - Debugging utilities for Solana transactions
  - `services.ts` - Backend service functions
  - `prisma.ts` - Database client setup
  - `error-handling.ts` - Application-wide error handling

### State Management

- `store/` - Global state management using Zustand
  - `wallet-store.ts` - Wallet-related state and actions

## Interacting with Solana

The application interacts with the Solana blockchain in several ways:

1. **Wallet Connection**: Using Solana Wallet Adapter for connecting to various wallets
2. **Transaction Signing**: For creating and placing bets
3. **Account Management**: For tracking bet status and user positions

## Error Handling

The application has a comprehensive error handling system:

- `error-handling.ts` provides centralized error handling
- `solana-errors.ts` specializes in Solana transaction errors
- `solana-debug.ts` offers debugging tools for blockchain interactions

## Development Guidelines

1. Use TypeScript for all new files
2. Follow the existing pattern of module exports
3. Keep UI components separate from business logic
4. Document new functions with JSDoc comments
5. Handle errors appropriately using the error handling utilities

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Guidelines

1. **Follow the Template**: Use the hook template in `src/hooks/HOOK_TEMPLATE.ts` when creating new hooks.
2. **Consistent Structure**: Maintain the sectioned structure in files for better readability.
3. **Documentation**: Add JSDoc comments to all exported functions and components.
4. **Testing**: Write tests for critical functionality.

## Code Structure Best Practices

1. **Group Related Code**: Organize hooks, components, and utilities by feature area
2. **Section Markers**: Use section dividers like `// -------------------------------------------------------` to organize code
3. **Document Complex Logic**: Use inline comments for complex logic
4. **Consistent API**: Maintain consistent patterns for hooks and components

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
