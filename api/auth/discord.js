export default async function handler(req, res) {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `${req.headers.origin || 'http://localhost:3000'}/api/auth/discord/callback`;
    
    if (!DISCORD_CLIENT_ID) {
        return res.status(500).json({ error: 'Discord OAuth not configured' });
    }
    
    // Construct Discord OAuth URL
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;
    
    // Redirect user to Discord
    res.redirect(discordAuthUrl);
}
