import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  username?: string;
  email?: string;
  activeBets: string[];
  createdBets: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  username: { 
    type: String,
    sparse: true 
  },
  email: { 
    type: String,
    sparse: true 
  },
  activeBets: {
    type: [String],
    default: []
  },
  createdBets: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true 
});

export default mongoose.model<IUser>('User', UserSchema);
