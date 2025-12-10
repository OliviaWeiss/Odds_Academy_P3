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

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Create new user (storing plain text password - in production use bcrypt)
    const newUser = new User({ username, password });
    await newUser.save();
    
    res.status(201).json({ 
      message: 'User created successfully', 
      userId: newUser._id.toString(),
      username: newUser.username
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
}
