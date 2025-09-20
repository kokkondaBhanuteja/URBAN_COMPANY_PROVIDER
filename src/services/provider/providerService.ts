import Provider, { IProvider } from '@/database/ProviderModel';
import ProviderPayout from '@/database/providerPayoutModel';
import { Types, startSession } from 'mongoose';
import logger from '@/lib/logger';

export const getProviderProfile = async (userId: string) => {
    logger.info(`Fetching provider profile for userId: ${userId}`);
    return Provider.findOne({ userId }).populate('servicesOffered').populate('serviceableLocations');
};

export const updateProviderProfile = async (userId: string, profileData: Partial<IProvider>) => {
    const session = await startSession();
    session.startTransaction();
    logger.info(`Starting transaction to update provider profile for userId: ${userId}`);
    try {
        const updatedProvider = await Provider.findOneAndUpdate({ userId }, profileData, { new: true, session });
        await session.commitTransaction();
        logger.info(`Transaction committed for provider profile update: ${userId}`);
        session.endSession();
        return updatedProvider;
    } catch (error: any) {
        await session.abortTransaction();
        logger.error(`Provider profile update transaction aborted for userId: ${userId}`, { error: error.message, stack: error.stack });
        session.endSession();
        throw error;
    }
};

export const updateAvailability = async (userId: string, availability: IProvider['availability']) => {
    logger.info(`Updating availability for userId: ${userId}`);
    const provider = await Provider.findOne({ userId });
    if (!provider) {
      logger.warn(`Provider not found for userId: ${userId}`);
      throw new Error('Provider not found');
    }
    provider.availability = availability;
    await provider.save();
    logger.info(`Successfully updated availability for userId: ${userId}`);
    return provider;
};

export const requestPayout = async (providerId: string, amount: number) => {
    logger.info(`Requesting payout for providerId: ${providerId}`);
    const payout = new ProviderPayout({
        providerId: new Types.ObjectId(providerId),
        amount,
    });
    await payout.save();
    logger.info(`Successfully requested payout for providerId: ${providerId}`);
    return payout;
};