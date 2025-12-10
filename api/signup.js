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

  const { username, password, discordId, discordUsername, email, avatar } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Password is only required for non-Discord users
  if (!discordId && (!password || password.length < 6)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    await connectToDatabase();
    
    // Check if user already exists by username or discordId
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        ...(discordId ? [{ discordId }] : [])
      ]
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Create new user with Discord info if available
    const userData = { username };
    if (password) userData.password = password;
    if (discordId) userData.discordId = discordId;
    if (discordUsername) userData.discordUsername = discordUsername;
    if (email) userData.email = email;
    if (avatar) userData.avatar = avatar;
    
    const newUser = new User(userData);
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
