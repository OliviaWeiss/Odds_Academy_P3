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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  console.log('Received request for /get-picks with userId:', userId);

  if (!userId) {
    console.error('Missing userId query parameter');
    return res.status(400).json({ error: 'Missing userId query parameter' });
  }

  try {
    await connectToDatabase();
    const picks = await Pick.find({ userId });
    const formattedPicks = picks.map(pick => {
      const [homeTeam, awayTeam] = pick.matchupId.split('-');
      return {
        homeTeam: homeTeam || 'Unknown',
        awayTeam: awayTeam || 'Unknown',
        teamName: pick.teamName,
        opponentName: pick.opponentName || 'Unknown Opponent',
        gameDate: pick.gameDate || 'Unknown',
        week: pick.week || null,
      };
    });
    console.log('Fetched picks:', formattedPicks);
    res.status(200).json(formattedPicks);
  } catch (error) {
    console.error('Error retrieving picks:', error);
    res.status(500).json({ error: 'Failed to retrieve picks' });
  }
}
