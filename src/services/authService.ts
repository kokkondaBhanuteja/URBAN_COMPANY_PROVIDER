// src/services/authService.ts
import User, { IUser } from '@/database/userModel';
import Provider from '@/database/ProviderModel';
import jwt from 'jsonwebtoken';
import { Types  } from 'mongoose';

interface RegisterParams {
  userName: string;
  email: string;
  password?: string;
  mobileNumber: string;
  userType: "consumer" | "provider" | "admin";

  // Provider-specific
  bio?: string;
  servicesOffered?: Types.ObjectId[];
  serviceableLocations?: Types.ObjectId[];
  availability?: {
    startTime: Date;
    endTime: Date;
    isUnavailable?: boolean;
  }[];
}

export const registerUser = async (data: RegisterParams): Promise<IUser> => {
  const { userName, email, password, mobileNumber, userType, bio, servicesOffered, serviceableLocations, availability } = data;

  // Step 1: Save User
  const user = new User({ userName, email, password, mobileNumber, userType });
  await user.save();

  // Step 2: If provider, also save provider-specific data
  if (userType === "provider") {
    const provider = new Provider({
      userId: user._id,
      bio,
      servicesOffered,
      serviceableLocations,
      availability,
    });
    await provider.save();
  }

  return user;
};


export const loginUser = async (email: string, password?: string, userType?: string) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (userType && user.userType !== userType) {
        throw new Error('You are not authorized to access this page');
    }

    if(password){
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
    }

    const token = jwt.sign({ id: user._id, userType: user.userType, name: user.userName }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    return { token, user };
};
