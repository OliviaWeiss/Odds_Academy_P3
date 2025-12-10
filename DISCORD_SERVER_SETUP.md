# Discord Server Setup Guide for Odds Academy

## Complete Setup Instructions

### Part 1: Create Your Discord Server

1. **Open Discord** (desktop app or web browser)

2. **Create a new server:**
   - Click the "+" button on the left sidebar
   - Select "Create My Own"
   - Choose "For a club or community"
   - Name it: **Odds Academy**
   - Upload an icon (optional)

### Part 2: Organize Your Channels

Delete the default channels and create this structure:

#### 📢 Text Channels

**GENERAL**
- `#announcements` - Weekly updates and important news
- `#general` - General discussion
- `#introductions` - New members introduce themselves

**LEARNING**
- `#learning-resources` - Tips, guides, and educational content
- `#strategy-discussion` - Discuss different betting strategies
- `#ask-questions` - Help and support

**WEEKLY PICKS**
- `#week-13` - Current week picks and discussion
- `#week-14` - Next week picks and discussion  
- `#week-15` - Following week picks
- (Add more as needed)

**RESULTS**
- `#weekly-results` - Post your wins and losses
- `#leaderboard` - Track top performers

### Part 3: Create Your Permanent Invite Link

1. Right-click your server name at the top
2. Click **"Invite People"**
3. Click **"Edit invite link"** at the bottom
4. Configure settings:
   - Expire after: **Never**
   - Max number of uses: **No limit**
5. Copy the invite link (e.g., `https://discord.gg/abc123xyz`)

### Part 4: Update Your Application Settings

1. Open your `.env` file
2. Find the line: `DISCORD_SERVER_INVITE=https://discord.gg/YOUR_INVITE_CODE`
3. Replace with your actual invite link: `DISCORD_SERVER_INVITE=https://discord.gg/abc123xyz`
4. Save the file

### Part 5: Set Channel Permissions (Optional but Recommended)

For `#announcements`:
- Right-click the channel → Edit Channel → Permissions
- Click on @everyone
- Disable "Send Messages" (so only admins can post)
- Keep "Read Messages" enabled

### Part 6: Test Everything

1. Restart your server: `npm start`
2. Log in with Discord
3. You should see a "Discord" link in the navigation bar
4. Click it to join your Odds Academy server!

## Server Rules to Post

Create a `#rules` channel and post:

```
📜 **Odds Academy Server Rules**

1. **Be Respectful** - No harassment, hate speech, or bullying
2. **Stay On Topic** - Keep discussions relevant to NFL picks and betting strategies
3. **No Spam** - Don't flood channels with repeated messages
4. **No Advertising** - Don't promote other servers or services
5. **Keep it Legal** - This is for educational purposes only
6. **Help Each Other** - We're all here to learn and improve
7. **Have Fun!** - Enjoy discussing picks and strategies
```

## Channel Organization Tips

### Weekly Channels
Create new week channels as needed. Archive old weeks to keep things clean:
- Right-click channel → Edit Channel → Permissions
- Disable "Send Messages" for @everyone (makes it read-only)

### Category Organization
Use categories to group channels:
```
📢 WELCOME
  ├─ #rules
  ├─ #announcements
  └─ #introductions

📚 LEARNING
  ├─ #learning-resources
  ├─ #strategy-discussion
  └─ #ask-questions

🏈 CURRENT PICKS
  ├─ #week-13
  ├─ #week-14
  └─ #week-15

📊 RESULTS
  ├─ #weekly-results
  └─ #leaderboard

💬 GENERAL
  └─ #general
```

## Future Enhancements

Consider adding:
- **Discord Bot** - Automatically post picks from your app to Discord
- **Voice Channels** - For live game discussions
- **Roles** - Award roles for performance (Top Picker, Strategist, etc.)
- **Weekly Recap** - Automated summaries of picks and results

## Need Help?

If your invite link changes, just update the `.env` file and restart your server!
