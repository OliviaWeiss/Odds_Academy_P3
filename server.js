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


// User schema for authentication
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    discordId: { type: String, unique: true, sparse: true },
    discordUsername: { type: String },
    email: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// Discord OAuth routes
app.get('/api/auth/discord', (req, res) => {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    // Use DEV redirect URI for local development, otherwise use production
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI_DEV || process.env.DISCORD_REDIRECT_URI || `http://localhost:3000/api/auth/discord/callback`;
    
    if (!DISCORD_CLIENT_ID) {
        return res.status(500).json({ error: 'Discord OAuth not configured' });
    }
    
    console.log('Initiating Discord OAuth with redirect URI:', REDIRECT_URI);
    
    // Construct Discord OAuth URL
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;
    
    // Redirect user to Discord
    res.redirect(discordAuthUrl);
});

app.get('/api/auth/discord/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect('/login.html?error=discord_auth_failed');
    }
    
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    // Use DEV redirect URI for local development, otherwise use production
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI_DEV || process.env.DISCORD_REDIRECT_URI || `http://localhost:3000/api/auth/discord/callback`;
    
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        return res.redirect('/login.html?error=discord_auth_failed');
    }
    
    console.log('Using redirect URI:', REDIRECT_URI);
    
    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });
        
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Discord token exchange failed:', tokenResponse.status, errorText);
            throw new Error('Failed to exchange code for token');
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        // Get user info from Discord
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user info from Discord');
        }
        
        const discordUser = await userResponse.json();
        
        // Check if user exists, otherwise create new user
        let user = await User.findOne({ discordId: discordUser.id });
        
        if (!user) {
            // Create new user with Discord info
            user = new User({
                username: discordUser.username,
                discordId: discordUser.id,
                discordUsername: discordUser.username,
                email: discordUser.email,
                avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
            });
            await user.save();
        }
        
        // Get Discord server invite URL from environment
        const discordInvite = process.env.DISCORD_SERVER_INVITE || '';
        
        // Redirect to login page with user info in URL params
        const redirectUrl = `/login.html?discord_login=success&userId=${user._id}&username=${encodeURIComponent(user.username)}&discord_user=true&discord_invite=${encodeURIComponent(discordInvite)}`;
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect('/login.html?error=discord_auth_failed');
    }
});

// Login endpoint
app.post('/login', express.json(), async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        if (!user.password) {
            return res.status(401).json({ error: 'This account uses Discord login. Please use "Continue with Discord".' });
        }
        
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        res.status(200).json({ 
            message: 'Login successful', 
            userId: user._id.toString(),
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Signup endpoint
app.post('/signup', express.json(), async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        
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
});


const port = 3000
// app.listen(...): starts the web server and prints a message when it's ready.
// You can then open the URL in your browser to use the app locally.
app.listen(port, () => {
    console.log(`Express is live at http://localhost:${port}`)
})
