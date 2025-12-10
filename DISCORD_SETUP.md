# Discord OAuth Setup Instructions

## Setting up Discord OAuth for Login

Follow these steps to enable Discord login on your Odds Academy application:

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Odds Academy")
4. Click "Create"

### 2. Get Your Client ID and Secret

1. In your application's settings, go to the "OAuth2" section
2. Copy your **Client ID**
3. Click "Reset Secret" to generate a new **Client Secret** (or reveal existing one)
4. Copy your **Client Secret** (keep this secure!)

### 3. Set Up Redirect URI

1. Still in the "OAuth2" section, scroll down to "Redirects"
2. Add your redirect URI:
   - For local development: `http://localhost:3000/api/auth/discord/callback`
   - For production (Vercel): `https://your-domain.vercel.app/api/auth/discord/callback`
3. Click "Save Changes"

### 4. Update Environment Variables

Add these to your `.env` file:

```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback
```

For Vercel deployment, add these as Environment Variables in your Vercel project settings.

### 5. Test the Integration

1. Start your server: `npm run start`
2. Go to `http://localhost:3000/login.html`
3. Click "Continue with Discord"
4. Authorize the application
5. You should be redirected back and logged in!

## How It Works

1. User clicks "Continue with Discord" button
2. They're redirected to Discord's OAuth page
3. After authorization, Discord redirects to `/api/auth/discord/callback`
4. The callback exchanges the code for an access token
5. User info is fetched from Discord API
6. A user account is created/found in MongoDB
7. User is logged in and redirected to the main page

## Security Notes

- Never commit your `.env` file to Git
- Keep your Client Secret secure
- Use HTTPS in production
- The redirect URI must match exactly what's configured in Discord
