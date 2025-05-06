# SolBet API Testing Documentation

This document provides instructions for testing the SolBet API using Postman.

## Setup

1. Import the provided Postman collection or create a new collection
2. Set up environment variables:
   - `BASE_URL`: `http://localhost:8000`
   - `TOKEN`: Store the JWT token here after login

## Authentication Endpoints

### Get Authentication Nonce

```
GET {{BASE_URL}}/api/auth/nonce?walletAddress={{WALLET_ADDRESS}}
```

**Description:** Retrieves a nonce for wallet authentication

**Response Example:**
```json
{
  "message": "Please sign this nonce to authenticate",
  "nonce": "3a7e21f8b9c30d62e4f87b5309e7d6102a8f74b3c72d3e4a8f7b5c8d9e0f1a2b",
  "walletAddress": "YOUR_WALLET_ADDRESS"
}
```

### Login with Wallet

```
POST {{BASE_URL}}/api/auth/login
```

**Headers:**
- Content-Type: application/json

**Body:**
```json
{
  "walletAddress": "YOUR_WALLET_ADDRESS",
  "message": "NONCE_FROM_PREVIOUS_REQUEST",
  "signature": "SIGNATURE_FROM_WALLET"
}
```

**Response Example:**
```json
{
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "username": null,
    "email": null
  }
}
```

### Development Login (Testing Only)

```
POST {{BASE_URL}}/api/auth/dev-login
```

**Headers:**
- Content-Type: application/json

**Body:**
```json
{
  "walletAddress": "YOUR_WALLET_ADDRESS"
}
```

**Response Example:**
```json
{
  "message": "Development authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "walletAddress": "YOUR_WALLET_ADDRESS",
    "username": null,
    "email": null
  }
}
```

## Bet Endpoints

### Get All Bets

```
GET {{BASE_URL}}/api/bets?status=active&page=1&limit=10
```

**Description:** Retrieves a paginated list of bets, optionally filtered by status

**Query Parameters:**
- status: Filter by bet status (active, closed, resolved, disputed)
- page: Page number (default: 1)
- limit: Number of items per page (default: 10)

**Response Example:**
```json
{
  "bets": [
    {
      "_id": "60f8a5c50c8b2a001f3e8b9a",
      "title": "Will BTC hit $100K in 2023?",
      "description": "This bet is about whether BTC will reach $100,000 in 2023",
      "creatorWallet": "CREATOR_WALLET_ADDRESS",
      "betAccount": "BET_ACCOUNT_PUBLIC_KEY",
      "escrowAccount": "ESCROW_ACCOUNT_PUBLIC_KEY",
      "totalPool": 10000000000,
      "yesPool": 6000000000,
      "noPool": 4000000000,
      "minBetAmount": 1000000000,
      "maxBetAmount": 5000000000,
      "expiresAt": "2023-12-31T23:59:59.999Z",
      "status": "active",
      "participants": [
        {
          "walletAddress": "PARTICIPANT_WALLET_ADDRESS",
          "position": "yes",
          "amount": 2000000000,
          "hasClaimed": false
        }
      ],
      "createdAt": "2023-07-21T12:00:00.000Z",
      "updatedAt": "2023-07-21T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Get Bet by ID

```
GET {{BASE_URL}}/api/bets/{{BET_ID}}
```

**Description:** Retrieves details for a specific bet

**Response Example:**
```json
{
  "_id": "60f8a5c50c8b2a001f3e8b9a",
  "title": "Will BTC hit $100K in 2023?",
  "description": "This bet is about whether BTC will reach $100,000 in 2023",
  "creatorWallet": "CREATOR_WALLET_ADDRESS",
  "betAccount": "BET_ACCOUNT_PUBLIC_KEY",
  "escrowAccount": "ESCROW_ACCOUNT_PUBLIC_KEY",
  "totalPool": 10000000000,
  "yesPool": 6000000000,
  "noPool": 4000000000,
  "minBetAmount": 1000000000,
  "maxBetAmount": 5000000000,
  "expiresAt": "2023-12-31T23:59:59.999Z",
  "status": "active",
  "participants": [
    {
      "walletAddress": "PARTICIPANT_WALLET_ADDRESS",
      "position": "yes",
      "amount": 2000000000,
      "hasClaimed": false
    }
  ],
  "createdAt": "2023-07-21T12:00:00.000Z",
  "updatedAt": "2023-07-21T12:00:00.000Z"
}
```

### Create New Bet

```
POST {{BASE_URL}}/api/bets
```

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{TOKEN}}

**Body:**
```json
{
  "title": "Will ETH merge happen in September 2023?",
  "description": "This bet is about whether the Ethereum merge will happen in September 2023",
  "expiresAt": "2023-09-30T23:59:59.999Z",
  "minBetAmount": 1000000000,
  "maxBetAmount": 5000000000
}
```

**Response Example:**
```json
{
  "message": "Bet created successfully",
  "bet": {
    "_id": "60f8a5c50c8b2a001f3e8b9a",
    "title": "Will ETH merge happen in September 2023?",
    "description": "This bet is about whether the Ethereum merge will happen in September 2023",
    "creatorWallet": "YOUR_WALLET_ADDRESS",
    "betAccount": "BET_ACCOUNT_PUBLIC_KEY",
    "escrowAccount": "ESCROW_ACCOUNT_PUBLIC_KEY",
    "totalPool": 0,
    "yesPool": 0,
    "noPool": 0,
    "minBetAmount": 1000000000,
    "maxBetAmount": 5000000000,
    "expiresAt": "2023-09-30T23:59:59.999Z",
    "status": "active",
    "participants": [],
    "createdAt": "2023-07-21T12:00:00.000Z",
    "updatedAt": "2023-07-21T12:00:00.000Z"
  },
  "transactionSignature": "SOLANA_TRANSACTION_SIGNATURE"
}
```

### Resolve Bet

```
PUT {{BASE_URL}}/api/bets/{{BET_ID}}/resolve
```

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{TOKEN}}

**Body:**
```json
{
  "outcome": "yes"
}
```

**Response Example:**
```json
{
  "message": "Bet resolved successfully",
  "bet": {
    "_id": "60f8a5c50c8b2a001f3e8b9a",
    "title": "Will ETH merge happen in September 2023?",
    "description": "This bet is about whether the Ethereum merge will happen in September 2023",
    "creatorWallet": "YOUR_WALLET_ADDRESS",
    "betAccount": "BET_ACCOUNT_PUBLIC_KEY",
    "escrowAccount": "ESCROW_ACCOUNT_PUBLIC_KEY",
    "totalPool": 10000000000,
    "yesPool": 6000000000,
    "noPool": 4000000000,
    "minBetAmount": 1000000000,
    "maxBetAmount": 5000000000,
    "expiresAt": "2023-09-30T23:59:59.999Z",
    "status": "resolved",
    "outcome": "yes",
    "participants": [
      {
        "walletAddress": "PARTICIPANT_WALLET_ADDRESS",
        "position": "yes",
        "amount": 2000000000,
        "hasClaimed": false
      }
    ],
    "createdAt": "2023-07-21T12:00:00.000Z",
    "updatedAt": "2023-07-21T12:00:00.000Z"
  },
  "transactionSignature": "SOLANA_TRANSACTION_SIGNATURE"
}
```

### Get Bets by Creator

```
GET {{BASE_URL}}/api/bets/user/{{WALLET_ADDRESS}}?page=1&limit=10
```

**Description:** Retrieves bets created by a specific user

**Response Example:**
```json
{
  "bets": [
    {
      "_id": "60f8a5c50c8b2a001f3e8b9a",
      "title": "Will ETH merge happen in September 2023?",
      "description": "This bet is about whether the Ethereum merge will happen in September 2023",
      "creatorWallet": "CREATOR_WALLET_ADDRESS",
      "betAccount": "BET_ACCOUNT_PUBLIC_KEY",
      "escrowAccount": "ESCROW_ACCOUNT_PUBLIC_KEY",
      "totalPool": 10000000000,
      "yesPool": 6000000000,
      "noPool": 4000000000,
      "minBetAmount": 1000000000,
      "maxBetAmount": 5000000000,
      "expiresAt": "2023-09-30T23:59:59.999Z",
      "status": "active",
      "participants": [
        {
          "walletAddress": "PARTICIPANT_WALLET_ADDRESS",
          "position": "yes",
          "amount": 2000000000,
          "hasClaimed": false
        }
      ],
      "createdAt": "2023-07-21T12:00:00.000Z",
      "updatedAt": "2023-07-21T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Get Bets Participated In

```
GET {{BASE_URL}}/api/bets/participated/{{WALLET_ADDRESS}}?page=1&limit=10
```

**Description:** Retrieves bets in which a user has participated

**Response Example:** 
*Same format as "Get Bets by Creator"*

## User Bet Endpoints

### Place a Bet

```
POST {{BASE_URL}}/api/user-bets
```

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{TOKEN}}

**Body:**
```json
{
  "betId": "60f8a5c50c8b2a001f3e8b9a",
  "position": "yes",
  "amount": 2000000000
}
```

**Note:** This endpoint is planned for future implementation.

### Get User's Bets

```
GET {{BASE_URL}}/api/user-bets/{{WALLET_ADDRESS}}
```

**Description:** Retrieves all bets placed by a user

**Note:** This endpoint is planned for future implementation.

### Withdraw from Bet

```
POST {{BASE_URL}}/api/user-bets/withdraw
```

**Headers:**
- Content-Type: application/json
- Authorization: Bearer {{TOKEN}}

**Body:**
```json
{
  "betId": "60f8a5c50c8b2a001f3e8b9a"
}
```

**Note:** This endpoint is planned for future implementation.

## Troubleshooting

### Common Issues:

1. **Authentication Failed**: Ensure your wallet address and signature are correct
2. **Invalid Token**: Get a new authentication token
3. **Solana RPC Error**: Check the RPC endpoint URL in .env file
4. **MongoDB Connection Error**: Verify your MongoDB URI in .env file

### Error Response Format:

```json
{
  "message": "Error message describing what went wrong",
  "error": "Detailed error information (only in development mode)"
}
```
