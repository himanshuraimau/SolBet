# SolBet Backend

A backend service for the SolBet decentralized betting platform on Solana.

## Technologies

- **Runtime**: Bun
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Blockchain**: Solana Web3.js

## Project Structure

```
/back
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── solana/              # Solana integration
│   │   ├── connection.ts    # Solana connection setup
│   │   ├── instructions.ts  # Transaction instructions
│   │   └── accounts.ts      # Account management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── index.ts             # Application entry point
├── tests/                   # Test files
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example environment variables
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js (>= 16.x) or Bun runtime
- MongoDB (local or remote instance)
- Solana CLI tools (optional, for testing with devnet)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solbet.git
cd solbet/back
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory:
```
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/solbet

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your_program_id
ADMIN_PRIVATE_KEY=your_admin_private_key

# Authentication
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
bun run dev
```

5. The server should now be running at http://localhost:8000
