// Mapping of NFL team names to logo URLs (sample CDN, can be updated)
const nflTeamLogos = {
  "Arizona Cardinals": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/ARI",
  "Atlanta Falcons": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/ATL",
  "Baltimore Ravens": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/BAL",
  "Buffalo Bills": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/BUF",
  "Carolina Panthers": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/CAR",
  "Chicago Bears": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/CHI",
  "Cincinnati Bengals": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/CIN",
  "Cleveland Browns": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/CLE",
  "Dallas Cowboys": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/DAL",
  "Denver Broncos": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/DEN",
  "Detroit Lions": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/DET",
  "Green Bay Packers": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/GB",
  "Houston Texans": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/HOU",
  "Indianapolis Colts": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/IND",
  "Jacksonville Jaguars": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/JAX",
  "Kansas City Chiefs": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/KC",
  "Las Vegas Raiders": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/LV",
  "Los Angeles Chargers": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/LAC",
  "Los Angeles Rams": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/LAR",
  "Miami Dolphins": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/MIA",
  "Minnesota Vikings": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/MIN",
  "New England Patriots": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/NE",
  "New Orleans Saints": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/NO",
  "New York Giants": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/NYG",
  "New York Jets": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/NYJ",
  "Philadelphia Eagles": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/PHI",
  "Pittsburgh Steelers": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/PIT",
  "San Francisco 49ers": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/SF",
  "Seattle Seahawks": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/SEA",
  "Tampa Bay Buccaneers": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/TB",
  "Tennessee Titans": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/TEN",
  "Washington Commanders": "https://static.www.nfl.com/t_q-best/league/api/clubs/logos/WAS"
};

// Check if user is logged in
function checkAuth() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    window.location.href = 'login.html';
    return null;
  }
  return userId;
}

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      window.location.href = 'login.html';
    });
  }
  
  // Check authentication
  checkAuth();
});

// Calculate NFL week based on season start date
function getNFLWeek(gameDate) {
  // 2024 NFL season started September 5, 2024 (Week 1)
  // 2025 NFL season started September 4, 2025 (Week 1) - opening Thursday
  // 2026 NFL season starts September 10, 2026 (Week 1)
  const date = new Date(gameDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  
  let seasonStart;
  // If it's before September, use previous year's season
  if (month < 8) { // Before September (months 0-7)
    if (year === 2025) {
      seasonStart = new Date('2024-09-05T00:00:00');
    } else if (year === 2026) {
      seasonStart = new Date('2025-09-04T00:00:00');
    } else {
      seasonStart = new Date(year - 1, 8, 5); // September 5th of previous year
    }
  } else { // September or later (months 8-11)
    if (year === 2024) {
      seasonStart = new Date('2024-09-05T00:00:00');
    } else if (year === 2025) {
      seasonStart = new Date('2025-09-04T00:00:00');
    } else if (year === 2026) {
      seasonStart = new Date('2026-09-10T00:00:00');
    } else {
      seasonStart = new Date(year, 8, 5); // September 5th
    }
  }
  
  const diffTime = date - seasonStart;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  
  // Clamp between 1 and 18
  return Math.max(1, Math.min(18, week));
}



// Coin balance logic
const STARTING_COINS = 200;
let coinBalance = STARTING_COINS;
// Track user picks and bet amounts per matchup
const userPicks = {}; // { [matchupId]: { team: string, bet: number } }


function updateCoinBalanceDisplay() {
  const el = document.getElementById('coin-balance-amount');
  if (el) el.textContent = coinBalance;
}

// Display odds for all games
function displayOdds(games) {
  const oddsSection = document.getElementById('odds');
  oddsSection.innerHTML = '';
  games.forEach(game => {
    // Get team logos
    const homeLogo = nflTeamLogos[game.home_team] || '';
    const awayLogo = nflTeamLogos[game.away_team] || '';
    const commence = new Date(game.commence_time).toLocaleString();
    let oddsGrid = '';
    let fanduel = null;
    if (Array.isArray(game.bookmakers)) {
      fanduel = game.bookmakers.find(bm => bm.title === 'FanDuel');
    }
    if (fanduel && Array.isArray(fanduel.markets)) {
      // Build odds grid: 3 columns (Moneyline, Spread, Over/Under), 2 rows (home/away), with small logos
      const marketOrder = ['h2h', 'spreads', 'totals'];
      const marketLabels = ['Moneyline', 'Spread', 'Over/Under'];
      oddsGrid += `<div class="odds-grid" style="grid-template-columns: 40px repeat(3, 1fr);">
        <div></div>
        <div class="odds-header">Over/Under
          <span class="tooltip"><span class="tooltip-icon">&#9432;</span>
            <span class="tooltiptext">Bet on the total combined score of both teams. Over: higher than the line. Under: lower than the line.</span>
          </span>
        </div>
        <div class="odds-header">Moneyline
          <span class="tooltip"><span class="tooltip-icon">&#9432;</span>
            <span class="tooltiptext">Pick who wins the game. Minus (-): Favorite. Plus (+): Underdog.</span>
          </span>
        </div>
        <div class="odds-header">Spread
          <span class="tooltip"><span class="tooltip-icon">&#9432;</span>
            <span class="tooltiptext">Bet on the margin of victory. Favorite must win by more than the spread. Underdog can lose by less or win.</span>
          </span>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;"><img src="${homeLogo}" alt="${game.home_team}" style="height:28px;width:auto;"></div>
        ${(() => {
          // Home team row
          const overUnder = (() => {
            const market = fanduel.markets.find(m => m.key === 'totals');
            if (!market) return '<div style="color:#888;">-</div>';
            const outcome = market.outcomes.find(o => o.name === 'Over');
            if (!outcome) return '<div style="color:#888;">-</div>';
            return `<div style=\"color:#fff;font-size:1.1em;\">Over ${outcome.point} (${outcome.price > 0 ? '+' : ''}${outcome.price})</div>`;
          })();
          const moneyline = (() => {
            const market = fanduel.markets.find(m => m.key === 'h2h');
            if (!market) return '<div style="color:#888;">-</div>';
            const outcome = market.outcomes.find(o => o.name === game.home_team);
            if (!outcome) return '<div style="color:#888;">-</div>';
            return `<div style=\"color:#fff;font-size:1.1em;\">${outcome.price > 0 ? '+' : ''}${outcome.price}</div>`;
          })();
          const spread = (() => {
            const market = fanduel.markets.find(m => m.key === 'spreads');
            if (!market) return '<div style="color:#888;">-</div>';
            const outcome = market.outcomes.find(o => o.name === game.home_team);
            if (!outcome) return '<div style="color:#888;">-</div>';
            return `<div style=\"color:#fff;font-size:1.1em;\">${outcome.point > 0 ? '+' : ''}${outcome.point} (${outcome.price > 0 ? '+' : ''}${outcome.price})</div>`;
          })();
          return [overUnder, moneyline, spread].join('');
        })()}
        <div style="display:flex;align-items:center;justify-content:center;"><img src="${awayLogo}" alt="${game.away_team}" style="height:28px;width:auto;"></div>
        ${(() => {
          // Away team row
          const overUnder = (() => {
            const market = fanduel.markets.find(m => m.key === 'totals');
            if (!market) return '<div style="color:#888;">-</div>';
            const outcome = market.outcomes.find(o => o.name === 'Under');
            if (!outcome) return '<div style="color:#888;">-</div>';
            return `<div style=\"color:#fff;font-size:1.1em;\">Under ${outcome.point} (${outcome.price > 0 ? '+' : ''}${outcome.price})</div>`;
          })();
          const moneyline = (() => {
            const market = fanduel.markets.find(m => m.key === 'h2h');
            if (!market) return '<div style="color:#888;">-</div>';
            const outcome = market.outcomes.find(o => o.name === game.away_team);
            if (!outcome) return '<div style="color:#888;">-</div>';
            return `<div style=\"color:#fff;font-size:1.1em;\">${outcome.price > 0 ? '+' : ''}${outcome.price}</div>`;
          })();
          const spread = (() => {
            const market = fanduel.markets.find(m => m.key === 'spreads');
            if (!market) return '<div style="color:#888;">-</div>';
            const outcome = market.outcomes.find(o => o.name === game.away_team);
            if (!outcome) return '<div style="color:#888;">-</div>';
            return `<div style=\"color:#fff;font-size:1.1em;\">${outcome.point > 0 ? '+' : ''}${outcome.point} (${outcome.price > 0 ? '+' : ''}${outcome.price})</div>`;
          })();
          return [overUnder, moneyline, spread].join('');
        })()}
      </div>`;
    } else {
      oddsGrid = '<div style="color:#888;text-align:center;">No odds available.</div>';
    }
    const matchupId = `matchup-${game.id || game.home_team.replace(/\s/g,'') + '-' + game.away_team.replace(/\s/g,'')}`;
    oddsSection.innerHTML += `
      <div class="matchup" id="${matchupId}" data-game-date="${game.commence_time}" style="margin-bottom:2.5em;background:#10141a;border-radius:18px;box-shadow:0 2px 16px #0005;padding:2em 0 1.5em 0;max-width:700px;margin-left:auto;margin-right:auto;">
        <div class="team-logos" style="display:flex;align-items:center;justify-content:center;gap:3.5em;margin-bottom:1.2em;cursor:pointer;">
          <img src="${homeLogo}" alt="${game.home_team}" class="team-pick" data-matchup="${matchupId}" data-team="${game.home_team}" style="height:110px;width:auto;transition:box-shadow 0.2s,outline 0.2s;"> 
          <span style="margin:0 1.5em;color:#fff;font-size:2.8em;font-family:'TwentiethCenturyMedium',sans-serif;">vs</span> 
          <img src="${awayLogo}" alt="${game.away_team}" class="team-pick" data-matchup="${matchupId}" data-team="${game.away_team}" style="height:110px;width:auto;transition:box-shadow 0.2s,outline 0.2s;">
        </div>
        <div style="margin-bottom:0.7em;color:#bfc9db;font-size:1.08em;">Start: ${commence}</div>
        ${oddsGrid}
        <div style="width:100%;display:flex;justify-content:center;align-items:center;gap:1em;">
          <input type="number" min="1" max="${coinBalance}" value="5" class="bet-amount-input" data-matchup="${matchupId}" style="margin-top:1.5em;padding:0.7em 1em;border-radius:8px;border:1px solid #bfc9db;font-size:1.1em;width:90px;">
          <button class="make-pick-btn" data-matchup="${matchupId}" disabled style="margin-top:1.5em;padding:0.85em 2.2em;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:1.13em;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.10);font-family:'TwentiethCenturyMedium',sans-serif;opacity:0.6;">Make Pick</button>
        </div>
      </div>
    `;
  });
}

// Fetch NFL odds from your backend API and display them
function fetchAndDisplayOdds() {
  // Update this URL to your backend endpoint that proxies the Odds API
  fetch('/odds')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch odds');
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        displayOdds(data);
      } else if (Array.isArray(data.data)) {
        displayOdds(data.data);
      } else {
        document.getElementById('odds').innerText = 'No NFL odds available.';
      }
    })
    .catch(err => {
      console.error('Odds API error:', err);
      document.getElementById('odds').innerText = 'Failed to load NFL odds.';
    });
}

// Highlight team selection per matchup and handle Make Pick button
document.addEventListener('click', function(e) {
  // Team selection highlight
  if (e.target.classList.contains('team-pick')) {
    const matchupId = e.target.getAttribute('data-matchup');
    const all = document.querySelectorAll(`img.team-pick[data-matchup='${matchupId}']`);
    all.forEach(img => {
      img.style.boxShadow = '';
      img.style.outline = '';
      img.style.filter = '';
      img.removeAttribute('data-selected');
    });
    // Only highlight the selected team and mark as selected
    e.target.style.boxShadow = '0 0 0 0 #2563eb';
    e.target.style.outline = '4px solid #2563eb';
    e.target.style.filter = 'brightness(1.08)';
    e.target.setAttribute('data-selected', 'true');
    // Enable the Make Pick button for this matchup
    const btn = document.querySelector(`button.make-pick-btn[data-matchup='${matchupId}']`);
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
    }
    // If user already made a pick for this matchup, re-enable input/button and refund coins
    if (userPicks[matchupId]) {
      const prevBet = userPicks[matchupId].bet;
      coinBalance += prevBet;
      updateCoinBalanceDisplay();
      // Re-enable input/button
      const input = document.querySelector(`input.bet-amount-input[data-matchup='${matchupId}']`);
      if (input) input.disabled = false;
      if (btn) {
        btn.textContent = 'Make Pick';
        btn.style.background = '#2563eb';
        btn.style.color = '#fff';
        btn.disabled = false;
        btn.style.opacity = '1';
      }
      delete userPicks[matchupId];
    }
  }

  // Make Pick button logic
  if (e.target.classList.contains('make-pick-btn')) {
    const matchupId = e.target.getAttribute('data-matchup');
    const selected = document.querySelector(`img.team-pick[data-matchup='${matchupId}'][data-selected='true']`);
    if (!selected) {
      alert('Please select a team before making a pick.');
      return;
    }
    const input = document.querySelector(`input.bet-amount-input[data-matchup='${matchupId}']`);
    let betAmount = parseInt(input && input.value, 10);
    if (isNaN(betAmount) || betAmount < 1) {
      alert('Please enter a valid bet amount.');
      return;
    }
    // Ensure opponentName is correctly identified
    const opponent = [...document.querySelectorAll(`img.team-pick[data-matchup='${matchupId}']`)].find(img => img !== selected);
    if (!opponent) {
      alert('Opponent data is missing.');
      return;
    }

    // Send the pick to the backend
    const userId = localStorage.getItem('userId');
    const matchupDiv = document.getElementById(matchupId);
    const gameDate = matchupDiv ? matchupDiv.getAttribute('data-game-date') : new Date().toISOString();
    const week = getNFLWeek(gameDate);
    
    console.log('Sending pick to backend:', {
        userId,
        matchupId,
        teamName: selected.getAttribute('data-team'),
        opponentName: opponent.getAttribute('data-team'),
        gameDate,
        week,
    });
    fetch('/save-pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        matchupId,
        teamName: selected.getAttribute('data-team'),
        opponentName: opponent.getAttribute('data-team'),
        gameDate,
        week,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save pick');
      }
      return response.json();
    })
    .then(data => {
      console.log('Pick saved:', data);
      
      // Deduct the bet amount from coin balance
      coinBalance -= betAmount;
      updateCoinBalanceDisplay();
      
      // Store the pick locally
      userPicks[matchupId] = {
        teamName: selected.getAttribute('data-team'),
        bet: betAmount
      };
      
      // Change button to green to indicate success
      const btn = e.target;
      btn.style.background = '#10b981';
      btn.style.color = '#fff';
      btn.textContent = 'Pick Saved!';
      btn.disabled = true;
      btn.style.opacity = '1';
      
      // Disable the bet amount input
      if (input) input.disabled = true;
    })
    .catch(err => {
      console.error('Error saving pick:', err);
      // Show error state
      const btn = e.target;
      btn.style.background = '#ef4444';
      btn.textContent = 'Error - Try Again';
    });
  }
});

// Fetch and display odds on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayOdds);

// Fetch saved picks from the backend and highlight them on page load
document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userId');

    fetch(`/get-picks?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch picks');
            }
            return response.json();
        })
        .then(picks => {
            picks.forEach(pick => {
                const teamElement = document.querySelector(`img.team-pick[data-matchup='${pick.matchupId}'][data-team='${pick.teamName}']`);
                if (teamElement) {
                    teamElement.style.boxShadow = '0 0 0 0 #2563eb';
                    teamElement.style.outline = '4px solid #2563eb';
                    teamElement.style.filter = 'brightness(1.08)';
                    teamElement.setAttribute('data-selected', 'true');
                }
            });
        })
        .catch(err => {
            console.error('Error fetching picks:', err);
        });
});

// Fetch picks from the API and render them on the history.html page
async function fetchAndRenderPicks() {
    try {
        const userId = "exampleUserId"; // Replace with actual user ID
        const response = await fetch(`/get-picks?userId=${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch picks");
        }
        const picks = await response.json();

        const picksGrid = document.querySelector("#picks-grid");
        if (!picksGrid) {
            console.error("Grid container not found in history.html");
            return;
        }

        picksGrid.innerHTML = ""; // Clear existing rows

        picks.forEach(pick => {
            const gameDiv = document.createElement("div");
            gameDiv.classList.add("history-game");

            const teamLogosDiv = document.createElement("div");
            teamLogosDiv.classList.add("team-logos");

            const homeTeamLogo = document.createElement("img");
            homeTeamLogo.src = nflTeamLogos[pick.homeTeam] || "";
            homeTeamLogo.alt = pick.homeTeam || "Unknown";

            const awayTeamLogo = document.createElement("img");
            awayTeamLogo.src = nflTeamLogos[pick.awayTeam] || "";
            awayTeamLogo.alt = pick.awayTeam || "Unknown";

            teamLogosDiv.appendChild(homeTeamLogo);
            teamLogosDiv.appendChild(awayTeamLogo);

            const gameInfoDiv = document.createElement("div");
            gameInfoDiv.classList.add("game-info");
            gameInfoDiv.textContent = `${pick.teamName || "Unknown"} vs ${pick.opponentName || "Unknown"} - ${pick.gameDate || "Unknown"}`;

            gameDiv.appendChild(teamLogosDiv);
            gameDiv.appendChild(gameInfoDiv);

            picksGrid.appendChild(gameDiv); // Append each pick as a separate rectangle
        });
    } catch (error) {
        console.error("Error fetching and rendering picks:", error);
    }
}

// Call the function to fetch and render picks on page load
if (document.body.id === "history-page") { // Ensure this runs only on history.html
    document.addEventListener("DOMContentLoaded", fetchAndRenderPicks);
}

document.addEventListener("DOMContentLoaded", function () {
    const picksGrid = document.querySelector("#picks-grid");

    // Ensure the script only runs if the grid container exists
    if (!picksGrid) {
        console.warn("Grid container not found. This script is intended for history.html.");
        return;
    }

    const userId = "exampleUserId"; // Replace with actual user ID

    let allPicks = [];

    async function fetchPicks() {
        try {
            const response = await fetch(`/get-picks?userId=${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch picks");
            }
            allPicks = await response.json();
            renderPicks(allPicks);
        } catch (error) {
            console.error("Error fetching picks:", error);
        }
    }

    function renderPicks(picks) {
        picksGrid.innerHTML = ""; // Clear existing rows

        picks.forEach(pick => {
            const gameDiv = document.createElement("div");
            gameDiv.classList.add("history-game");

            const teamLogosDiv = document.createElement("div");
            teamLogosDiv.classList.add("team-logos");

            const homeTeamLogo = document.createElement("img");
            homeTeamLogo.src = nflTeamLogos[pick.homeTeam] || "";
            homeTeamLogo.alt = pick.homeTeam || "Unknown";

            const awayTeamLogo = document.createElement("img");
            awayTeamLogo.src = nflTeamLogos[pick.awayTeam] || "";
            awayTeamLogo.alt = pick.awayTeam || "Unknown";

            teamLogosDiv.appendChild(homeTeamLogo);
            teamLogosDiv.appendChild(awayTeamLogo);

            const gameInfoDiv = document.createElement("div");
            gameInfoDiv.classList.add("game-info");
            gameInfoDiv.textContent = `${pick.teamName || "Unknown"} vs ${pick.opponentName || "Unknown"} - ${pick.gameDate || "Unknown"}`;

            gameDiv.appendChild(teamLogosDiv);
            gameDiv.appendChild(gameInfoDiv);

            picksGrid.appendChild(gameDiv);
        });
    }

    function filterByWeek() {
        const weekPicks = allPicks.filter(pick => {
            const gameDate = new Date(pick.gameDate);
            const currentWeek = Math.ceil(gameDate.getDate() / 7); // Simplified week calculation
            return currentWeek === 1; // Replace with selected week number
        });
        renderPicks(weekPicks);
    }

    function filterByYear() {
        const yearPicks = allPicks.filter(pick => {
            const gameDate = new Date(pick.gameDate);
            return gameDate.getFullYear() === 2025; // Replace with selected year
        });
        renderPicks(yearPicks);
    }

    function filterByTeam(teamName) {
        const teamPicks = allPicks.filter(pick => pick.teamName === teamName || pick.opponentName === teamName);
        renderPicks(teamPicks);
    }

    document.getElementById("filter-week").addEventListener("click", filterByWeek);
    document.getElementById("filter-year").addEventListener("click", filterByYear);

    function initializeDropdownListeners() {
        const dropdownButtons = document.querySelectorAll(".dropdown-content button");
        dropdownButtons.forEach(button => {
            button.addEventListener("click", function () {
                const teamName = this.textContent;
                filterByTeam(teamName);
            });
        });
    }

    // Reinitialize dropdown listeners after DOM updates
    const dropdown = document.querySelector(".dropdown-content");
    if (dropdown) {
        const observer = new MutationObserver(() => {
            initializeDropdownListeners();
        });
        observer.observe(dropdown, { childList: true });
    }

    fetchPicks();
    initializeDropdownListeners();
});