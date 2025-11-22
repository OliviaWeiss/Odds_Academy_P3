// import Express library and activate it

import express from "express"; 
import mongoose from 'mongoose';
 
console.log( process.env.ODDS_KEY)
console.log( process.env.TEST)


const app = express();


// Serve static files from /public folder (useful when running Node locally, optional on Vercel).
app.use(express.static('public'))
// Define index.html as the root explicitly (useful on Vercel, optional when running Node locally).
app.get('/', (req, res) => { res.redirect('/index.html') })




// NFL Odds API proxy route
app.get('/odds', async (req, res) => {
    try {
        const apiKey = process.env.ODDS_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not set in environment variables.' });
        }
        const oddsUrl = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&apiKey=${apiKey}&markets=h2h,spreads,totals`;
        
        console.log('Fetching odds from URL:', oddsUrl);
        const response = await fetch(oddsUrl);
        if (!response.ok) {
            // Only read the body once as text for error logging
            const errorText = await response.text();
            console.error('Odds API error:', response.status, errorText);
            return res.status(500).json({ error: 'Failed to fetch odds from Odds API', status: response.status, body: errorText });
        }
        // Only read the body once as JSON for success
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Error fetching odds', details: err.message });
    }
});


// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/odds_academy';
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


// Update the schema to include gameDate and week
const pickSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    matchupId: { type: String, required: true },
    teamName: { type: String, required: true },
    opponentName: { type: String, required: true },
    gameDate: { type: String, required: true },
    week: { type: Number, required: true }, // NFL week number (1-18)
});

// Create a model for picks
const Pick = mongoose.model('Pick', pickSchema);

// API endpoint to save user picks
app.post('/save-pick', express.json(), async (req, res) => {
    const { userId, matchupId, teamName, opponentName, gameDate, week } = req.body;

    if (!userId || !matchupId || !teamName || !opponentName || !gameDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    
    try {
        console.log('Saving pick:', { userId, matchupId, teamName, opponentName, gameDate, week });
        const newPick = new Pick({ userId, matchupId, teamName, opponentName, gameDate, week });
        await newPick.save();
        res.status(201).json({ message: 'Pick saved successfully' });
    } catch (error) {
        console.error('Error saving pick:', error);
        res.status(500).json({ error: 'Failed to save pick' });
    }
});


// API endpoint to retrieve user picks
app.get('/get-picks', async (req, res) => {
    const { userId } = req.query;

    console.log('Received request for /get-picks with userId:', userId);

    if (!userId) {
        console.error('Missing userId query parameter');
        return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    try {
        const picks = await Pick.find({ userId });
        const formattedPicks = picks.map(pick => {
            const [homeTeam, awayTeam] = pick.matchupId.split('-'); // Derive home and away teams from matchupId
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
});


// API endpoint to delete picks for a specific user
app.delete('/delete-picks', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    try {
        const result = await Pick.deleteMany({ userId });
        console.log(`Deleted ${result.deletedCount} picks for userId: ${userId}`);
        res.status(200).json({ message: `Deleted ${result.deletedCount} picks for userId: ${userId}` });
    } catch (error) {
        console.error('Error deleting picks:', error);
        res.status(500).json({ error: 'Failed to delete picks' });
    }
});


const port = 3000
// app.listen(...): starts the web server and prints a message when it's ready.
// You can then open the URL in your browser to use the app locally.
app.listen(port, () => {
    console.log(`Express is live at http://localhost:${port}`)
})
