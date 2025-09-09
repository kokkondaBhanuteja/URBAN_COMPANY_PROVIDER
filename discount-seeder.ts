import mongoose from 'mongoose';
import * as dotenv from 'dotenv'; // FIX 1: Use a namespace import for dotenv
import Discount, { IDiscount } from './src/database/discountModel'; // Adjust path if needed

// Load environment variables from a .env file
dotenv.config();

// This type can remain the same. It correctly represents our source data.
type DiscountSeedData = Omit<IDiscount, keyof mongoose.Document | 'createdAt' | 'updatedAt'>;

const discounts: DiscountSeedData[] = [
  {
    promoCode: 'SAVE10',
    description: 'Get 10% off your entire order.',
    discountPercentage: 10,
    isActive: true,
  },
  {
    promoCode: 'SUMMER25',
    description: 'Summer Sale! Get 25% off on all summer collection items.',
    discountPercentage: 25,
    validFrom: new Date('2025-06-01'),
    validUntil: new Date('2025-08-31'),
    isActive: true,
  },
  {
    promoCode: 'WINTERSALE',
    description: 'An expired Winter Sale discount code.',
    discountPercentage: 20,
    validFrom: new Date('2024-12-01'),
    validUntil: new Date('2025-01-31'),
    isActive: false,
  },
  {
    promoCode: 'FLASH50',
    description: 'Flash Sale! 50% off for the next 24 hours only!',
    discountPercentage: 50,
    validFrom: new Date(),
    validUntil: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    promoCode: 'NEWBIE15',
    description: 'A special 15% discount for our new customers.',
    discountPercentage: 15,
    isActive: true,
  },
  {
    promoCode: 'AUTUMN15',
    description: 'Get 15% off our new Autumn collection.',
    discountPercentage: 15,
    validFrom: new Date('2025-09-15'),
    validUntil: new Date('2025-11-30'),
    isActive: true,
  },

  // A holiday-specific discount for Diwali (which is in October 2025)
  {
    promoCode: 'DIWALI25',
    description: 'Celebrate the Festival of Lights with 25% off everything!',
    discountPercentage: 25,
    validFrom: new Date('2025-10-10'),
    validUntil: new Date('2025-10-25'),
    isActive: true,
  },
  
  // A "Back to School/University" offer valid through September
  {
    promoCode: 'STUDYHARD20',
    description: '20% off for students to start the academic year right!',
    discountPercentage: 20,
    validUntil: new Date('2025-09-30'),
    isActive: true,
  },

  // A flash sale scheduled for the next upcoming weekend
  {
    promoCode: 'WEEKENDFLASH',
    description: 'A special 40% discount, this weekend only!',
    discountPercentage: 40,
    validFrom: new Date('2025-09-12T00:00:00'), // Starts Friday
    validUntil: new Date('2025-09-14T23:59:59'), // Ends Sunday
    isActive: true,
  },

  // A generic loyalty code for returning customers with no expiration
  {
    promoCode: 'COMEBACK10',
    description: 'We miss you! Here is 10% off your next purchase.',
    discountPercentage: 10,
    isActive: true,
  },

  // A high-value discount for VIP customers
  {
    promoCode: 'VIP30',
    description: 'A special 30% discount for our most valued customers.',
    discountPercentage: 30,
    isActive: true,
  },
];

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB Connected successfully. 🍃');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

const seedDatabase = async (): Promise<void> => {
  try {
    // FIX 2: The call to deleteMany is correct, the error was likely a side-effect.
    await Discount.deleteMany({});
    console.log('Previous discount data cleared.');

    // FIX 3: Use Model.create() which is typed to accept plain objects.
    await Discount.create(discounts);
    console.log('Discount data has been seeded successfully! 🌱');
  } catch (error) {
    console.error(`Error seeding the database: ${(error as Error).message}`);
    process.exit(1);
  }
};

const runSeeder = async (): Promise<void> => {
  await connectDB();
  await seedDatabase();
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
};

runSeeder();