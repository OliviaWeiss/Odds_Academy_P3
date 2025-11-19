import fetch from 'node-fetch';

const oddsUrl = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&apiKey=9841336088515d0173058af648bfad51&markets=h2h,spreads,totals';

fetch(oddsUrl)
  .then(async (res) => {
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  })
  .catch((err) => {
    console.error('Fetch error:', err);
  });
