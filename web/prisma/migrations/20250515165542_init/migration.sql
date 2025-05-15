-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('ACTIVE', 'CLOSED', 'RESOLVED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "BetOutcome" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" TEXT NOT NULL,
    "betPublicKey" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "escrowAccount" TEXT NOT NULL,
    "totalPool" TEXT NOT NULL,
    "yesPool" TEXT NOT NULL,
    "noPool" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "BetStatus" NOT NULL DEFAULT 'ACTIVE',
    "outcome" "BetOutcome",
    "minBetAmount" TEXT NOT NULL,
    "maxBetAmount" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "betId" TEXT NOT NULL,
    "betPublicKey" TEXT NOT NULL,
    "userBetPublicKey" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "position" "BetOutcome" NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_betPublicKey_key" ON "Bet"("betPublicKey");

-- CreateIndex
CREATE INDEX "Bet_creatorId_idx" ON "Bet"("creatorId");

-- CreateIndex
CREATE INDEX "Bet_status_idx" ON "Bet"("status");

-- CreateIndex
CREATE INDEX "Bet_expiresAt_idx" ON "Bet"("expiresAt");

-- CreateIndex
CREATE INDEX "UserBet_userId_idx" ON "UserBet"("userId");

-- CreateIndex
CREATE INDEX "UserBet_betId_idx" ON "UserBet"("betId");

-- CreateIndex
CREATE INDEX "UserBet_userBetPublicKey_idx" ON "UserBet"("userBetPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserBet_userId_betId_key" ON "UserBet"("userId", "betId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBet" ADD CONSTRAINT "UserBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBet" ADD CONSTRAINT "UserBet_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
