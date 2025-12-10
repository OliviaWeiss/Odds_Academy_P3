import mongoose from 'mongoose';

// User model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    discordId: { type: String, unique: true, sparse: true },
    discordUsername: { type: String },
    email: { type: String },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).send('No authorization code provided');
    }
    
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${req.headers.origin || 'http://localhost:3000'}/api/auth/discord/callback`;
    
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        return res.status(500).send('Discord OAuth not configured');
    }
    
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
            console.error('Token exchange failed:', errorText);
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
        
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/odds_academy';
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(mongoURI);
        }
        
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
        // The frontend will handle storing this in localStorage
        const redirectUrl = `/login.html?discord_login=success&userId=${user._id}&username=${encodeURIComponent(user.username)}&discord_user=true&discord_invite=${encodeURIComponent(discordInvite)}`;
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('Discord OAuth error:', error);
        res.redirect('/login.html?error=discord_auth_failed');
    }
}
