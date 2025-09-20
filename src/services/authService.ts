// src/services/authService.ts

import User, { IUser } from '@/database/userModel';
import Provider from '@/database/ProviderModel';
import Address from '@/database/addressmodel';
import Wallet from '@/database/walletModel';
import jwt from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose'; // Import mongoose

interface RegisterParams {
  userName: string;
  email: string;
  password?: string;
  mobileNumber: string;
  userType: "consumer" | "provider" | "admin";
  address: {
    addressLine1: string;
    city: string;
    pincode: string;
    state: string;
    country: string;
    addressType: "home" | "work" | "other";
  };
  bio?: string;
  servicesOffered?: string[];
  serviceableLocations?: string[];
  isActive?: boolean;
  availability?: {
    startTime: Date;
    endTime: Date;
  }[];
}

export const registerUser = async (data: RegisterParams): Promise<IUser> => {
  const { userName, email, password, mobileNumber, userType, bio, servicesOffered, serviceableLocations, availability, address } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = new User({ userName, email, password, mobileNumber, userType });
    await user.save({ session });

    const newAddress = new Address({
      userId: user._id,
      ...address,
    });
    await newAddress.save({ session });

    if (userType === "provider") {
      const newWallet = new Wallet({
        userId: user._id,
        balance: 0,
      });
      await newWallet.save({ session });

      const provider = new Provider({
        userId: user._id,
        walletId: newWallet._id,
        bio,
        servicesOffered,
        serviceableLocations,
        isActive: false,
        availability,
      });
      await provider.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// --- THIS IS THE COMPLETE AND CORRECTED FUNCTION ---
export const loginUser = async (email: string, password?: string, userType?: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (userType && user.userType !== userType) {
        throw new Error('You are not authorized to access this page');
    }

    if (password) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
    }

    if (user.userType === 'provider') {
        const provider = await Provider.findOne({ userId: user._id });
        if (!provider) {
            // This case handles if a user exists but has no provider profile
            throw new Error('Provider profile not found.');
        }
        if (!provider.isVerified) {
            // This is the crucial check for new providers
            throw new Error('Your account is pending admin verification.');
        }
    }

    const token = jwt.sign({ id: user._id, userType: user.userType, name: user.userName }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    
    return { token, user };
};
