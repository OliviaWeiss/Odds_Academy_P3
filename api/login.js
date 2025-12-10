import mongoose from 'mongoose';

let cachedDb = null;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  discordId: { type: String, unique: true, sparse: true },
  discordUsername: { type: String },
  email: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await mongoose.connect(process.env.MONGO_URI);
  cachedDb = db;
  return db;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    await connectToDatabase();
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Check password (plain text comparison - in production use bcrypt)
    // Handle Discord users who might not have a password
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Discord login. Please sign in with Discord.' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Successful login
    res.status(200).json({ 
      message: 'Login successful', 
      userId: user._id.toString(),
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}
