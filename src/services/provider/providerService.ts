// src/services/providerService.ts
import Provider, { IProvider } from '@/database/ProviderModel';
import ProviderPayout from '@/database/providerPayoutModel';
import { Types } from 'mongoose';

// Get provider profile
export const getProviderProfile = async (userId: string) => {
    return Provider.findOne({ userId }).populate('servicesOffered').populate('serviceableLocations');
};

// Update provider profile
export const updateProviderProfile = async (userId: string, profileData: Partial<IProvider>) => {
    return Provider.findOneAndUpdate({ userId }, profileData, { new: true });
};

// Manage availability
export const updateAvailability = async (userId: string, availability: IProvider['availability']) => {
    const provider = await Provider.findOne({ userId });
    if (!provider) throw new Error('Provider not found');
    provider.availability = availability;
    await provider.save();
    return provider;
};

// Request a payout
export const requestPayout = async (providerId: string, amount: number) => {
    const payout = new ProviderPayout({
        providerId: new Types.ObjectId(providerId),
        amount,
    });
    await payout.save();
    return payout;
};
