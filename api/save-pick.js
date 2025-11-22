import mongoose from 'mongoose';

let cachedDb = null;

const pickSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  matchupId: { type: String, required: true },
  teamName: { type: String, required: true },
  opponentName: { type: String, required: true },
  gameDate: { type: String, required: true },
  week: { type: Number },
});

const Pick = mongoose.models.Pick || mongoose.model('Pick', pickSchema);

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

  const { userId, matchupId, teamName, opponentName, gameDate, week } = req.body;

  if (!userId || !matchupId || !teamName || !opponentName || !gameDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await connectToDatabase();
    console.log('Saving pick:', { userId, matchupId, teamName, opponentName, gameDate, week });
    const newPick = new Pick({ userId, matchupId, teamName, opponentName, gameDate, week });
    await newPick.save();
    res.status(201).json({ message: 'Pick saved successfully' });
  } catch (error) {
    console.error('Error saving pick:', error);
    res.status(500).json({ error: 'Failed to save pick' });
  }
}
