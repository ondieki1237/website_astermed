import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config(); // Will pick up .env in CWD (server/)

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('No MONGODB_URI found in .env');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const email = 'bellarinseth@gmail.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists. Ensuring admin access...');
      existingUser.isAdmin = true;
      existingUser.password = 'password123'; // Reset password for easy testing
      await existingUser.save();
      console.log(`Updated user ${email} to Admin with password 'password123'`);
    } else {
      const newUser = new User({
        name: 'Seth Bellarin',
        email: email,
        password: 'password123',
        isAdmin: true,
      });
      await newUser.save();
      console.log(`Created new admin user ${email} with password 'password123'`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err);
    process.exit(1);
  }
};

seedAdmin();
