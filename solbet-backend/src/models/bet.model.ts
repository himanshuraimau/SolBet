import mongoose, { Document, Schema } from 'mongoose';

export enum BetStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  RESOLVED = 'resolved',
  DISPUTED = 'disputed'
}

export enum BetOutcome {
  YES = 'yes',
  NO = 'no'
}

interface Participant {
  walletAddress: string;
  position: BetOutcome;
  amount: number;
  hasClaimed: boolean;
}

export interface IBet extends Document {
  title: string;
  description: string;
  creatorWallet: string;
  betAccount: string;
  escrowAccount: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  minBetAmount: number;
  maxBetAmount: number;
  expiresAt: Date;
  status: BetStatus;
  outcome?: BetOutcome;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
}

const BetSchema: Schema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creatorWallet: {
    type: String,
    required: true,
    index: true
  },
  betAccount: {
    type: String,
    required: true,
    unique: true
  },
  escrowAccount: {
    type: String,
    required: true
  },
  totalPool: {
    type: Number,
    default: 0
  },
  yesPool: {
    type: Number,
    default: 0
  },
  noPool: {
    type: Number,
    default: 0
  },
  minBetAmount: {
    type: Number,
    required: true
  },
  maxBetAmount: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(BetStatus),
    default: BetStatus.ACTIVE
  },
  outcome: {
    type: String,
    enum: Object.values(BetOutcome),
    default: null
  },
  participants: [{
    walletAddress: {
      type: String,
      required: true
    },
    position: {
      type: String,
      enum: Object.values(BetOutcome),
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    hasClaimed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
BetSchema.index({ status: 1 });
BetSchema.index({ expiresAt: 1 });

export default mongoose.model<IBet>('Bet', BetSchema);
