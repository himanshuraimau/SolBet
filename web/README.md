# SolBet Web Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Code Structure

The SolBet web application follows a structured organization to ensure readability and maintainability.

### Directories

- **app**: Next.js app router pages and layouts
- **components**: UI components organized by feature
- **hooks**: Custom React hooks
- **lib**: Utility functions, services, and API clients
- **providers**: React context providers
- **store**: Global state management using Zustand
- **types**: TypeScript type definitions
- **prisma**: Database schema and migrations

### Code Organization

We follow a consistent structure within files to improve readability and maintainability. See the [Code Style Guide](./docs/CODE_STYLE_GUIDE.md) for details.

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
