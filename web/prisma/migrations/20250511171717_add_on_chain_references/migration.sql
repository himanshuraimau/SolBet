-- AlterTable
ALTER TABLE "Bet" ADD COLUMN     "onChainBetAddress" TEXT,
ADD COLUMN     "onChainEscrowAddress" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "txHash" TEXT;

-- AlterTable
ALTER TABLE "UserBet" ADD COLUMN     "onChainTxId" TEXT;

-- CreateIndex
CREATE INDEX "Bet_onChainBetAddress_idx" ON "Bet"("onChainBetAddress");
