import type { Request, Response } from 'express';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import Bet, { BetStatus, BetOutcome } from '../models/bet.model';
import User from '../models/user.model';
import { connection } from '../config/solana';
import { submitTransaction } from '../solana/connection';
import { 
  createInitializeBetInstruction,
  createResolveBetInstruction
} from '../solana/instructions';

/**
 * Get all active bets
 */
export const getAllBets = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Prepare filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    
    // Set up pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Find bets with pagination
    const bets = await Bet.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Bet.countDocuments(filter);
    
    return res.status(200).json({
      bets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return res.status(500).json({ message: 'Error fetching bets' });
  }
};

/**
 * Get a specific bet by ID
 */
export const getBetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const bet = await Bet.findById(id);
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    return res.status(200).json(bet);
  } catch (error) {
    console.error('Error fetching bet:', error);
    return res.status(500).json({ message: 'Error fetching bet details' });
  }
};

/**
 * Create a new bet
 */
export const createBet = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.user!;
    const { 
      title, 
      description, 
      expiresAt, 
      minBetAmount, 
      maxBetAmount 
    } = req.body;
    
    // Validate input
    if (!title || !description || !expiresAt || !minBetAmount || !maxBetAmount) {
      return res.status(400).json({ message: 'Missing required bet parameters' });
    }
    
    // Generate keypair for the bet account
    const betAccount = Keypair.generate();
    const escrowAccount = Keypair.generate();
    
    // Create transaction to initialize bet on Solana
    const transaction = new Transaction();
    transaction.add(
      createInitializeBetInstruction(
        new PublicKey(walletAddress),
        betAccount.publicKey,
        escrowAccount.publicKey,
        Math.floor(new Date(expiresAt).getTime() / 1000), // Convert to Unix timestamp
        minBetAmount,
        maxBetAmount
      )
    );
    
    // Submit transaction to Solana
    const signature = await submitTransaction(transaction, [
      betAccount,
      escrowAccount
    ]);
    
    // Create bet in MongoDB
    const bet = new Bet({
      title,
      description,
      creatorWallet: walletAddress,
      betAccount: betAccount.publicKey.toString(),
      escrowAccount: escrowAccount.publicKey.toString(),
      minBetAmount,
      maxBetAmount,
      expiresAt: new Date(expiresAt),
      status: BetStatus.ACTIVE
    });
    
    await bet.save();
    
    // Update user's created bets
    await User.findOneAndUpdate(
      { walletAddress },
      { $push: { createdBets: bet._id } }
    );
    
    return res.status(201).json({
      message: 'Bet created successfully',
      bet,
      transactionSignature: signature
    });
  } catch (error) {
    console.error('Error creating bet:', error);
    return res.status(500).json({ message: 'Error creating bet' });
  }
};

/**
 * Resolve a bet (creator only)
 */
export const resolveBet = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.user!;
    const { id } = req.params;
    const { outcome } = req.body;
    
    // Validate outcome
    if (!outcome || !Object.values(BetOutcome).includes(outcome)) {
      return res.status(400).json({ message: 'Invalid bet outcome' });
    }
    
    // Find the bet
    const bet = await Bet.findById(id);
    
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    
    // Ensure only the creator can resolve
    if (bet.creatorWallet !== walletAddress) {
      return res.status(403).json({ message: 'Only the bet creator can resolve it' });
    }
    
    // Ensure bet is still active
    if (bet.status !== BetStatus.ACTIVE) {
      return res.status(400).json({ message: 'Bet is not active and cannot be resolved' });
    }
    
    // Create transaction to resolve bet on Solana
    const transaction = new Transaction();
    transaction.add(
      createResolveBetInstruction(
        new PublicKey(walletAddress),
        new PublicKey(bet.betAccount),
        new PublicKey(bet.escrowAccount),
        outcome as BetOutcome
      )
    );
    
    // Submit transaction (only creator needs to sign)
    // Note: In production, you would need to get the creator's signature
    // through a client-side signing process
    const signature = await connection.sendTransaction(transaction, []);
    
    // Update bet status in MongoDB
    bet.status = BetStatus.RESOLVED;
    bet.outcome = outcome as BetOutcome;
    await bet.save();
    
    return res.status(200).json({
      message: 'Bet resolved successfully',
      bet,
      transactionSignature: signature
    });
  } catch (error) {
    console.error('Error resolving bet:', error);
    return res.status(500).json({ message: 'Error resolving bet' });
  }
};

/**
 * Get bets created by a user
 */
export const getBetsByCreator = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Set up pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Find bets by creator
    const bets = await Bet.find({ creatorWallet: walletAddress })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count
    const total = await Bet.countDocuments({ creatorWallet: walletAddress });
    
    return res.status(200).json({
      bets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bets by creator:', error);
    return res.status(500).json({ message: 'Error fetching bets' });
  }
};

/**
 * Get bets a user participated in
 */
export const getBetsParticipated = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Set up pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Find bets where user is a participant
    const bets = await Bet.find({ 'participants.walletAddress': walletAddress })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count
    const total = await Bet.countDocuments({ 'participants.walletAddress': walletAddress });
    
    return res.status(200).json({
      bets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching participated bets:', error);
    return res.status(500).json({ message: 'Error fetching bets' });
  }
};
