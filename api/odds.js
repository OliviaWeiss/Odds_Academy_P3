// Vercel serverless function for NFL odds API proxy
export default async function handler(req, res) {
  const apiKey = process.env.ODDS_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not set in environment variables.' });
  }
  const oddsUrl = `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&apiKey=${apiKey}&markets=h2h,spreads,totals`;
  try {
    const response = await fetch(oddsUrl);
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: 'Failed to fetch odds from Odds API', status: response.status, body: errorText });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching odds', details: err.message });
  }
}
