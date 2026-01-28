import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in environment');
    return null;
  }

  const baseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5s
  };

  // Try IPv4 first to avoid IPv6 routing issues seen on some networks
  const tryConnect = async (opts) => {
    try {
      const conn = await mongoose.connect(uri, opts);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      throw err;
    }
  };

  // Attempt a few retries with exponential backoff
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const opts = { ...baseOptions, family: 4 };
      return await tryConnect(opts);
    } catch (err) {
      console.error(`MongoDB connect attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Final failure — show actionable tips and rethrow
      console.error('Failed to connect to MongoDB after multiple attempts. Tips:');
      console.error('- Ensure your Atlas IP access list allows this machine or use 0.0.0.0/0 for testing');
      console.error('- Verify the credentials and the connection string in MONGODB_URI');
      console.error('- If your network blocks IPv6, forcing IPv4 (family:4) can help');
      console.error('- You can run a local MongoDB and set MONGODB_URI=mongodb://localhost:27017/astermed for local dev');

      // Rethrow so callers can inspect the error if they want
      throw err;
    }
  }
};

export default connectDB;
