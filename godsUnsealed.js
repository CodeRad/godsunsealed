// import cardDatabase from './cardDatabase.json';

let matches;
// let isMatchListLoading = false;

const DEBUG = false;

const godThemes = {
    war: {
        gradient: 'linear-gradient(0deg, rgba(75,5,5,1) 0%, rgba(75,5,5,1) 10%, rgba(75,5,5,0) 20%, rgba(0,0,0,0) 50%, rgba(75,5,5,1) 90%, rgba(75,5,5,1) 100%)',
        image: 'images/gods/war.png',
        name: 'Auros',
        color: 'rgba(235,5,5,1)'
    },
    death: {
        gradient: 'linear-gradient(0deg, rgba(50,50,50,1) 0%, rgba(50,50,50,1) 10%, rgba(0,50,50,0) 20%, rgba(0,0,0,0) 50%, rgba(50,50,50,1) 90%, rgba(50,50,50,1) 100%)',
        image: 'images/gods/death.png',
        name: 'Malissus',
        color: 'rgba(80,80,80,1)'
    },
    deception: {
        gradient: 'linear-gradient(0deg, rgba(100,15,255,1) 0%, rgba(100,15,255,1) 10%, rgba(100,15,255,0) 20%, rgba(0,0,0,0) 50%, rgba(100,15,255,1) 90%, rgba(100,15,255,1) 100%)',
        image: 'images/gods/deception.png',
        name: 'Ludia',
        color: 'rgb(153, 105, 241);'
    },
    nature: {
        gradient: 'linear-gradient(0deg, rgba(5,75,30,1) 0%, rgba(5,75,30,1) 10%, rgba(5,75,30,0) 20%, rgba(0,0,0,0) 50%, rgba(5,75,30,1) 90%, rgba(5,75,30,1) 100%)',
        image: 'images/gods/nature.png',
        name: 'Aeona',
        color: 'rgba(5,175,30,1)'
    },
    magic: {
        gradient: 'linear-gradient(0deg, rgba(20,175,255,1) 0%, rgba(20,175,255,1) 10%, rgba(20,175,255,0) 20%, rgba(0,0,0,0) 50%, rgba(20,175,255,1) 90%, rgba(20,175,255,1) 100%)',
        image: 'images/gods/magic.png',
        name: 'Elyrian',
        color: 'rgb(71, 222, 255)'
    },
    light: {
        gradient: 'linear-gradient(0deg, rgba(100,150,15,1) 0%, rgba(100,150,15,1) 10%, rgba(100,150,15,0) 20%, rgba(0,0,0,0) 50%, rgba(100,150,15,1) 90%, rgba(100,150,15,1) 100%)',
        image: 'images/gods/light.png',
        name: 'Lysander',
        color: 'rgb(255, 255, 124)'
    }
};

const godPowerNames = {
    100106: 'Soul Burn',
    102405: 'Create',
    100111: 'Fourish',
    100115: 'Summon Acolyte',
    100113: 'Enrage',
    100121: 'Animal Bond',
    100119: 'Flip',
    100127: 'Mage Bolt',
    102402: 'Fracture',
    100117: 'Heal',
    100125: 'Theivery',
    101307: 'Raid',
    100126: 'Clear Mind',
    102406: 'Ignite',
    102401: 'Radiance',
    101308: 'Stealth',
    101309: 'Sacrifice'
};

// Fetch recent matchlist
async function fetchRecentMatches() {
    try {
        const itemsPerPage = 1000; // Specify the desired items per page
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 60 * 10; // 10 minutes

        // Fetch only the first page without fetching the total count
        const firstPageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&page=1&game_mode=7&order=desc`);
        const firstPageData = await firstPageResponse.json();

        // Get the total records from the first page data
        const totalRecords = firstPageData.total;
        console.log('Total records:', totalRecords);

        // Calculate the number of pages needed
        const totalPages = Math.ceil(totalRecords / itemsPerPage);

        // Fetch data for each page and concatenate the results
        let allMatches = firstPageData.records; // Use records from the first page
        for (let page = 2; page <= totalPages; page++) {
            const pageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&page=${page}&game_mode=7&order=desc`);
            const pageData = await pageResponse.json();
            allMatches = allMatches.concat(pageData.records);
        }

        // Filter by Sealed only and Sort by most recent
        // const filteredMatches = allMatches.filter(match => match.game_mode === 7);
        allMatches.sort((a, b) => b.end_time - a.end_time);

        console.log('Filtered Game Mode 7 Matches:', allMatches.length);

        return allMatches;

    } catch (error) {
        console.error('Error fetching match data:', error);
    }
}

// Fetch matchlist by player ID
async function fetchMatchesByUserId(userId, endTime = Math.floor(Date.now() / 1000)) {
    try {
        const itemsPerPage = 1000;
        const startTime = endTime - 60 * 60 * 24 * 3; // 3 days, which is the max timeframe unfortunately

        // Fetch data for the first page of wins
        const winsFirstPageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_won=${userId}&page=1&game_mode=7&order=desc`);
        const winsFirstPageData = await winsFirstPageResponse.json();
        const totalWins = winsFirstPageData.total;

        // Fetch data for the first page of losses
        const lossesFirstPageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_lost=${userId}&page=1&game_mode=7&order=desc`);
        const lossesFirstPageData = await lossesFirstPageResponse.json();
        const totalLosses = lossesFirstPageData.total;

        // Calculate the number of pages needed for wins and losses
        const totalPagesWins = Math.ceil(totalWins / itemsPerPage);
        const totalPagesLosses = Math.ceil(totalLosses / itemsPerPage);

        // Fetch and concatenate data for all pages of wins
        let allWins = winsFirstPageData.records || [];
        for (let page = 2; page <= totalPagesWins; page++) {
            const pageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_won=${userId}&page=${page}&game_mode=7&order=desc`);
            const pageData = await pageResponse.json();
            allWins = allWins.concat(pageData.records || []);
        }

        // Fetch and concatenate data for all pages of losses
        let allLosses = lossesFirstPageData.records || [];
        for (let page = 2; page <= totalPagesLosses; page++) {
            const pageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_lost=${userId}&page=${page}&game_mode=7&order=desc`);
            const pageData = await pageResponse.json();
            allLosses = allLosses.concat(pageData.records || []);
        }

        // Combine wins and losses
        const allMatches = allWins.concat(allLosses);

        // Filter by Sealed only and Sort by most recent
        allMatches.sort((a, b) => b.end_time - a.end_time);

        console.log(`Game mode 7 matches for player ${userId}:`, allMatches.length);

        return allMatches;

    } catch (error) {
        console.error('Error fetching match data:', error);
        return null;
    }
}


// Fetch user properties
async function fetchUserInfo(userId) {
    try {
        const userInfoResponse = await fetch(`https://api.godsunchained.com/v0/properties?user_id=${userId}`);
        const userInfo = await userInfoResponse.json();
        return userInfo.records[0];
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Fetch user rank
async function fetchUserRank(userId) {
    try {
        const userRankResponse = await fetch(`https://api.godsunchained.com/v0/rank?user_id=${userId}`);
        const userRank = await userRankResponse.json();

        // Find the rank of the player in constructed
        const userRecord = userRank.records.find(record => record.game_mode === 13);

        if (userRecord) {
            // Return the rank_level if the record is found
            return userRecord.rank_level;
        } else {
            console.error(`No constructed rank record found for user ${userId}`);
            return '1';
        }
    } catch (error) {
        console.error('Error fetching user rank:', error);
        return '1';
    }
}

// Fetch card data
async function fetchCardInfo(cardId) {
    try {
        // Fetch the card database JSON file
        const response = await fetch('https://coderad.github.io/godsunsealed/cardDatabase.json');
        const cardDatabase = await response.json();

        // Find the card with the specified cardId locally
        const cardInfoLocal = cardDatabase.records.find(card => card.id === cardId);

        if (cardInfoLocal) {
            // If the card is found locally, return it
            return cardInfoLocal;
        } else {
            // If the card is not found locally, fetch it from the API
            const apiResponse = await fetch(`https://api.godsunchained.com/v0/proto/${cardId}`);
            const cardInfoApi = await apiResponse.json();
            return cardInfoApi;
        }
    } catch (error) {
        console.error('Error fetching or parsing card data:', error);
        return null;
    }
}


// Get info about sealed matchs sets and win loss records
async function getPlayerMatchStats(userId, endTime) {
    const matches = await fetchMatchesByUserId(userId, endTime);

    // Figure out which gods are being used //
    // Get the main god for the player
    const mainGod = matches[0].player_info.find(player => player.user_id === userId).god;

    // Find the other two gods by fetching card data
    const otherGods = new Set();
    const playerDeck = matches[0].player_info.find(player => player.user_id === userId).cards;

    // Fetch card information for each card in the player's deck until gods #2 and #3 are found
    for (const cardId of playerDeck) {
        const cardInfo = await fetchCardInfo(cardId);

        if (cardInfo && cardInfo.god !== mainGod && cardInfo.god !== 'neutral') {
            otherGods.add(cardInfo.god);

            // Break if we have found cards from two different gods
            if (otherGods.size === 2) {
                break;
            }
        }
    }

    const godsUsed = [mainGod, ...Array.from(otherGods)];

    while (godsUsed.length < 3) {
        godsUsed.push(godsUsed[0]);
    }

    console.log(`${userId} used gods: ${godsUsed.join(', ')}`);


    // Get player overall match stats

    let totalWins = 0;
    let dominationWins = 0;
    let decisiveWins = 0;
    let closeCalls = 0;
    let totalLosses = 0;
    let dominationLosses = 0;
    let decisiveLosses = 0;
    let nearMisses = 0;
    let concessions = 0;

    // Iterate through each match
    for (const match of matches) {
        // Check if our player won or lost
        const playerWon = match.player_won === userId;
        const playerLost = match.player_lost === userId;

        if (playerWon) {
            totalWins++;
            if (match.player_info[0].health >= 26) {
                dominationWins++;
            } else if (match.player_info[0].health >= 20) {
                decisiveWins++;
            } else if (match.player_info[0].health < 5) {
                closeCalls++;
            }
        } else if (playerLost) {
            totalLosses++;
            if (match.player_info[0].status === "conceded") {
                concessions++;
            } else if (match.player_info[0].health >= 26) {
                dominationLosses++;
            } else if (match.player_info[0].health >= 20) {
                decisiveLosses++;
            } else if (match.player_info[0].health < 5) {
                nearMisses++;
            }

        }
    }

    // Calculate win/loss percentages
    const winPercentage = totalWins / (totalWins + totalLosses) * 100;

    // Get Sealed Set information //
    // Trim data to last 10 matches before we search for Game 1
    const recentMatches = matches.slice(0, 10);

    // Function to compare two card lists and determine if they have significant changes
    const hasSignificantDeckChange = (deck1, deck2) => {
        const changedCardCount = deck1.filter(card => !deck2.includes(card)).length;
        const changePercentage = (changedCardCount / deck1.length) * 100;
        return changePercentage >= 50;
    };

    // Compare decks between matches until game 1 is found and track wins and losses 
    let winCountInSet = 0;
    let lossCountInSet = 0;
    let changeDetected = false;

    for (let i = 0; i < recentMatches.length - 1; i++) {

        if (recentMatches[i].player_won === userId) {
            winCountInSet++;
        } else if (recentMatches[i].player_lost === userId) {
            lossCountInSet++;
        }

        const playerIndex = recentMatches[i].player_won === userId ? 0 : 1;
        const currentDeck = recentMatches[i].player_info[playerIndex].cards;

        const nextPlayerIndex = recentMatches[i + 1].player_won === userId ? 0 : 1;
        const nextDeck = recentMatches[i + 1].player_info[nextPlayerIndex].cards;

        if (hasSignificantDeckChange(currentDeck, nextDeck) || !nextDeck) {
            changeDetected = true;
            break;
        }
    }

    // Handle the last game in the series only if no change has been detected
    if (!changeDetected && recentMatches.length > 0) {
        const lastMatch = recentMatches[recentMatches.length - 1];
        if (lastMatch.player_won === userId) {
            winCountInSet++;
        } else if (lastMatch.player_lost === userId) {
            lossCountInSet++;
        }
    }


    console.log(`${userId} Set Wins: ${winCountInSet} Losses: ${lossCountInSet}`);

    return {
        totalWins,
        dominationWins,
        decisiveWins,
        closeCalls,
        totalLosses,
        dominationLosses,
        decisiveLosses,
        nearMisses,
        concessions,
        winPercentage,
        winCountInSet,
        lossCountInSet,
        godsUsed
    };
}

// Display matchlist
async function displayMatchList(userId) {
    const matchInfoDiv = document.getElementById('match-list');
    matchInfoDiv.innerHTML = '';

    // // Check if a match list is currently being loaded
    // if (isMatchListLoading) {
    //     console.log('Aborting previous match list loading.');
    //     return;
    // }

    // Set the flag to indicate that a match list is now being loaded
    // isMatchListLoading = true;

    try {
        //let matches;

        if (userId) {
            // Fetch match data by user ID
            matches = await fetchMatchesByUserId(userId);
        } else {
            // Fetch recent match data
            matches = await fetchRecentMatches();
        }

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const playerWonInfo = await fetchUserInfo(match.player_won);
            const playerLostInfo = await fetchUserInfo(match.player_lost);
            const playerWonRank = await fetchUserRank(match.player_won);
            const playerLostRank = await fetchUserRank(match.player_lost);
            const playerWonMatchInfo = await getPlayerMatchStats(match.player_won, match.end_time);
            const playerLostMatchInfo = await getPlayerMatchStats(match.player_lost, match.end_time);

            // const matchStartTime = new Date(match.start_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            // const matchEndTime = new Date(match.end_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const matchLength = ((match.end_time - match.start_time) / 60).toFixed(2);
            const matchTimeAgo = getTimeAgo(match.end_time);

            // Generate HTML for loss point elements based on the number of loss points
            const playerWonLossPointsHTML = Array.from({ length: 3 }, (_, index) => {
                const isVisible = index < playerWonMatchInfo.lossCountInSet;
                return `<div class="lost-match" id="lost-match-${index + 1}-right" style="display: ${isVisible ? '' : 'none'}">/</div>`;
            }).join('');
            const playerLostLossPointsHTML = Array.from({ length: 3 }, (_, index) => {
                const isVisible = index < playerLostMatchInfo.lossCountInSet;
                return `<div class="lost-match" id="lost-match-${index + 1}-right" style="display: ${isVisible ? '' : 'none'}">/</div>`;
            }).join('');

            console.log('--------------------------------------------------------------------------------');
            if (!DEBUG) {
                // Create a new match banner element
                const matchBanner = document.createElement('div');
                matchBanner.className = 'match-banner dropIn';
                matchBanner.id = `match-banner-${i}`;
                matchBanner.onclick = () => handleMatchClick(i, playerWonMatchInfo, playerLostMatchInfo);

                // Your match banner content
                matchBanner.innerHTML = `
                    <div class="banner-top" id="overlay">
                        <div class="match-info">
                            ${match.total_rounds} rounds, ${matchLength} minutes. Posted ${matchTimeAgo}.
                        </div>
                    </div>

                    <div class="panel-container">
                        <div class="match-banner-panel banner-left">
                            <div class="godpower-list" style="background-image: url(https://images.godsunchained.com/art2/250/${match.player_info[0].god_power}.webp)">
                                <div class="god-tag" id="god-tag-1" style="background-color: ${godThemes[playerWonMatchInfo.godsUsed[2]].color}"></div>
                                <div class="god-tag" id="god-tag-2" style="background-color: ${godThemes[playerWonMatchInfo.godsUsed[1]].color}"></div>
                                <div class="god-tag" id="god-tag-3" style="background-color: ${godThemes[playerWonMatchInfo.godsUsed[0]].color}"></div>
                                <div class="rank rank-left">${playerWonRank}</div>
                            </div>
                            <div class="bar-container">
                                <div class="list-bar" id="bar-top">
                                    <div class="user-list-text">${playerWonInfo.username} (${playerWonInfo.user_id})</div>
                                </div>
                                <div class="list-bar" id="bar-bottom">

                                    ${playerWonLossPointsHTML}
                                    <div class="won-matches">${playerWonMatchInfo.winCountInSet}</div>
                                    <div class="winrate">${playerWonMatchInfo.winPercentage.toFixed(2)}%</div>
                                </div>
                            </div>
                        </div>
                        <div class="match-banner-panel banner-right">
                            <div class="godpower-list" style="background-image: url(https://images.godsunchained.com/art2/250/${match.player_info[1].god_power}.webp)">
                                <div class="god-tag" id="god-tag-1-right" style="background-color: ${godThemes[playerLostMatchInfo.godsUsed[2]].color}"></div>
                                <div class="god-tag" id="god-tag-2-right" style="background-color: ${godThemes[playerLostMatchInfo.godsUsed[1]].color}"></div>
                                <div class="god-tag" id="god-tag-3-right" style="background-color: ${godThemes[playerLostMatchInfo.godsUsed[0]].color}"></div>
                                <div class="rank rank-right">${playerLostRank}</div>
                            </div>
                            <div class="bar-container">
                                <div class="list-bar bar-right" id="bar-top">
                                    <div class="user-list-text text-right">(${playerLostInfo.user_id}) ${playerLostInfo.username}</div>
                                </div>
                                <div class="list-bar bar-right" id="bar-bottom">

                                    ${playerLostLossPointsHTML}
                                    <div class="won-matches">${playerLostMatchInfo.winCountInSet}</div>
                                    <div class="winrate winrate-right">${playerLostMatchInfo.winPercentage.toFixed(2)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>`;

                // Append the match banner to the DOM
                matchInfoDiv.appendChild(matchBanner);
            } else {

                matchInfoDiv.innerHTML += `
            <div class='debug-panel'>
                <p class='debug-text'>
                    player_won: ${playerWonInfo.user_id} (${playerWonRank}) ${match.player_info[0].god} (${godPowerNames[match.player_info[0].god_power]}) WL ${playerWonMatchInfo.winPercentageOverall.toFixed(2)}%
                    (${playerWonMatchInfo.winCountInSet}W ${playerWonMatchInfo.lossCountInSet}L)<BR>
                    player_lost: ${playerLostInfo.user_id} (${playerLostRank}) ${match.player_info[1].god} (${godPowerNames[match.player_info[1].god_power]}) WL ${playerLostMatchInfo.winPercentageOverall.toFixed(2)}%
                    (${playerLostMatchInfo.winCountInSet}W ${playerLostMatchInfo.lossCountInSet}L)<BR>
                    start: ${matchStartTime}|end: ${matchEndTime}|l: ${matchLength}m|${matchTimeAgo}
                </p>
            </div>
        `;
            }


        }

    } catch (error) {
        console.error('Error displaying match list and fetching data:', error);
    } finally {
        // Reset the flag when the loading process is complete or encountered an error
        // isMatchListLoading = false;
    }
}

// Display player panel
async function displayPlayerPanel(panelId, playerInfo, playerMatchInfo) {
    const panel = document.getElementById(panelId);

    // const playerMatchHistory = await getPlayerMatchStats(playerInfo.user_id);
    const godTheme = godThemes[playerInfo.god];

    const playerBasicInfo = await fetchUserInfo(playerInfo.user_id);
    const playerRank = await fetchUserRank(playerInfo.user_id);

    // Fetch card information for all cards
    const cardInfoArray = await Promise.all(playerInfo.cards.map(fetchCardInfo));
    // Calculate mana curve data
    const manaCurveData = Array.from({ length: 10 }, (_, mana) => {
        if (mana === 0 || mana === 1) {
            // Count cards with mana values of 0 or 1 as 1-mana cards
            return cardInfoArray.filter(card => card.mana === 0 || card.mana === 1).length;
        } else if (mana >= 9) {
            // Count cards with mana values of 9 and above as 9-mana cards
            return cardInfoArray.filter(card => card.mana >= 9).length;
        } else {
            // Count cards with the specific mana value
            return cardInfoArray.filter(card => card.mana === mana).length;
        }
    });

    // Calculate the maximum count for scaling the bar graph
    const maxCount = Math.max(...manaCurveData);

    // Dynamically generate bar graph HTML
    const barGraphHTML = manaCurveData.map((count, mana) => `
    <div class="bar" style="background-color: ${godTheme.color}; height: ${count / maxCount * 100}%;"></div>
`).join('');

    const normalWins = playerMatchInfo.totalWins - playerMatchInfo.dominationWins - playerMatchInfo.decisiveWins - playerMatchInfo.closeCalls;
    const normalLosses = playerMatchInfo.totalLosses - playerMatchInfo.dominationLosses - playerMatchInfo.decisiveLosses - playerMatchInfo.nearMisses - playerMatchInfo.concessions;

    panel.innerHTML = `
<div class="player-card" style="background: ${godTheme.gradient};">
<div class="player-overview">
    <div class="bar-graph">
        ${barGraphHTML}
    </div>
    <img class="player-overview-gp" src="https://images.godsunchained.com/art2/250/${playerInfo.god_power}.webp">
    <div class="player-overview-name" style="color: ${godTheme.color};">${playerBasicInfo.username}</div>
    <div class="player-overview-userid" style="color: ${godTheme.color};">(${playerBasicInfo.user_id})</div>
    <div class="player-overview-rank" style="color: ${godTheme.color};">${playerRank}</div>
    <div class="player-overview-level"><small>Lv.</small> ${playerBasicInfo.xp_level}</div>

    <div class="circle-container">
        <div class="circle" style="background-color: ${godThemes[playerMatchInfo.godsUsed[0]].color};">
            <img src="${godThemes[playerMatchInfo.godsUsed[0]].image}" class="zoomed-image">
        </div>
        <div class="circle" style="background-color: ${godThemes[playerMatchInfo.godsUsed[1]].color};">
            <img src="${godThemes[playerMatchInfo.godsUsed[1]].image}" class="zoomed-image">
        </div>
        <div class="circle" style="background-color: ${godThemes[playerMatchInfo.godsUsed[2]].color};">
            <img src="${godThemes[playerMatchInfo.godsUsed[2]].image}" class="zoomed-image">
        </div>
    </div>
</div>

    <!-- Tabbed section -->
    <div class="tabs">
        <button class="tab-button active" id="statsTab">Overall</button>
        <button class="tab-button" id="viewCardsTab">Deck</button>
        <!-- <button class="tab-button" id="setDetailsTab">Sets</button> -->
        <button class="button player-matchlist-button" id="showMatchesButton">Match List</button>
    </div>
    
    <div class="tab-content" id="statsTabContent">
    <div class="tab-rule"></div>
    <div class="stats-container">
    <p>Total Sealed Games: ${playerMatchInfo.totalWins + playerMatchInfo.totalLosses} (Data is for 3 Days)</p>
    <p>Total Wins: ${playerMatchInfo.totalWins} Total Losses: ${playerMatchInfo.totalLosses}</p>
    <p>Set Wins: ${playerMatchInfo.winCountInSet} Set Losses: ${playerMatchInfo.lossCountInSet}</p>

    <div class="chart-container">

    <div class="legend" id="${panelId}-legend">
      <div class="legend-item">
        <div class="legend-color" style="background-color: blue;"></div>
        <span>${playerMatchInfo.dominationWins} Domination Wins</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: deepskyblue;"></div>
        <span>${playerMatchInfo.decisiveWins} Decisive Wins</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: dodgerblue;"></div>
        <span>${normalWins} Normal Wins</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: purple;"></div>
        <span>${playerMatchInfo.closeCalls} Close Calls</span>
      </div>
    </div>



    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background-color: mediumorchid;"></div>
        <span>${playerMatchInfo.dominationLosses} Domination Losses</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: darkorchid;"></div>
        <span>${playerMatchInfo.decisiveLosses} Decisive Losses</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: red;"></div>
        <span>${normalLosses} Normal Losses</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: orangered;"></div>
        <span>${playerMatchInfo.nearMisses} Near Misses</span>
      </div>
  
      <div class="legend-item">
        <div class="legend-color" style="background-color: black;"></div>
        <span>${playerMatchInfo.concessions} Concessions</span>
      </div>
    </div>

    <canvas id="${panelId}-wl-pie-chart" width="100" height="100"></canvas>
    
  </div>


</div>
    <div class="tab-rule"></div>
    </div>
    
    <div class="tab-content" id="viewCardsTabContent">
    <div class="tab-rule"></div>
        <div class="card-list-container">
            <div class="card-list ${panelId}-card-list" id="${panelId}-card-list"></div>
        </div>
        <div class="tab-rule"></div>
    </div>
    
    <div class="portrait-container">
        <img class="portrait" src="${godTheme.image}" alt="${playerInfo.god}">
    </div>
</div>
`;

    drawWinLossPieChart(`${panelId}-wl-pie-chart`, playerMatchInfo);

    // Display card list for "View Cards" tab
    displayCardList(playerInfo.cards, `${panelId}-card-list`);



    // Set up tab functionality
    const statsTabButton = panel.querySelector('#statsTab');
    const viewCardsTabButton = panel.querySelector('#viewCardsTab');
    const statsTabContent = panel.querySelector('#statsTabContent');
    const viewCardsTabContent = panel.querySelector('#viewCardsTabContent');

    statsTabButton.addEventListener('click', () => {
        statsTabButton.classList.add('active');
        viewCardsTabButton.classList.remove('active');
        statsTabContent.style.display = 'block';
        viewCardsTabContent.style.display = 'none';
    });

    viewCardsTabButton.addEventListener('click', () => {
        statsTabButton.classList.remove('active');
        viewCardsTabButton.classList.add('active');
        statsTabContent.style.display = 'none';
        viewCardsTabContent.style.display = 'block';
    });

    // Initial state
    statsTabButton.classList.add('active');
    statsTabContent.style.display = 'block';
    viewCardsTabContent.style.display = 'none';

    const showMatchesButton = panel.querySelector('#showMatchesButton');
    showMatchesButton.addEventListener('click', async () => {
        await displayMatchList(playerInfo.user_id);
    });
}

async function displayCardList(cardIds, containerId) {
    const cardListDiv = document.getElementById(containerId);

    // Clear previous content
    cardListDiv.innerHTML = '';

    // Fetch card information for all cards
    const cardInfoArray = await Promise.all(cardIds.map(fetchCardInfo));

    // Sort cards by mana cost
    cardInfoArray.sort((a, b) => a.mana - b.mana);

    // Create and append card elements
    for (const cardInfo of cardInfoArray) {
        const cardElement = document.createElement('img');
        cardElement.src = `https://images.godsunchained.com/art2/250/${cardInfo.id}.webp`;
        cardElement.title = `(${cardInfo.mana}) ${cardInfo.name}`;
        cardElement.className = 'card-icon';

        // Attach click event listener to each card
        cardElement.addEventListener('click', () => {
            openCardModal(cardInfo);
        });

        cardListDiv.appendChild(cardElement);
    }
}
let currentModal = null;

function openCardModal(cardInfo) {
    // Close the existing modal, if any
    if (currentModal) {
        closeExistingModal();
    }

    const modal = document.createElement('div');
    modal.className = 'card-modal';
    modal.innerHTML = `
    <div class="modal-content">
    <span class="close-modal">&times;</span>
    <img src="https://card.godsunchained.com/?id=${cardInfo.id}&q=4" class="card-image">
    <div class="buy-links">
        <a href="https://tokentrove.com/collection/GodsUnchainedCards/${cardInfo.id}-4?currency=GODS&ref=godsunsealed" class="buy-link" style="background-image: url('images/icon-tt-4.png');" target="_blank" alt="Buy Meteorite at TokenTrove"></a>
        <a href="https://tokentrove.com/collection/GodsUnchainedCards/${cardInfo.id}-3?currency=GODS&ref=godsunsealed" class="buy-link" style="background-image: url('images/icon-tt-3.png');" target="_blank" alt="Buy Shadow at TokenTrove"></a>
        <a href="https://tokentrove.com/collection/GodsUnchainedCards/${cardInfo.id}-2?currency=GODS&ref=godsunsealed" class="buy-link" style="background-image: url('images/icon-tt-2.png');" target="_blank" alt="Buy Gold at TokenTrove"></a>
        <a href="https://tokentrove.com/collection/GodsUnchainedCards/${cardInfo.id}-1?currency=GODS&ref=godsunsealed" class="buy-link" style="background-image: url('images/icon-tt-1.png');" target="_blank" alt="Buy Diamond at TokenTrove"></a>
    </div>
</div>
    `;

    const closeModal = () => {
        document.body.removeChild(modal);
        currentModal = null;
    };

    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', closeModal);

    // Close modal on Escape key press
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    // Close modal when clicking outside the modal content
    modal.addEventListener('click', (event) => {
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent.contains(event.target)) {
            closeModal();
        }
    });

    document.body.appendChild(modal);
    currentModal = modal;
}

function closeExistingModal() {
    if (currentModal) {
        document.body.removeChild(currentModal);
        currentModal = null;
    }
}

// Build string for Time Ago
function getTimeAgo(timestamp) {
    const currentTime = Math.floor(Date.now() / 1000);
    const secondsAgo = currentTime - timestamp;

    if (secondsAgo < 60) {
        return `${secondsAgo} second${secondsAgo !== 1 ? 's' : ''} ago`;
    }

    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) {
        const remainingSeconds = secondsAgo % 60;
        return `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) {
        const remainingMinutes = minutesAgo % 60;
        return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) {
        const remainingHours = hoursAgo % 24;
        return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''} ago`;
    }

    const monthsAgo = Math.floor(daysAgo / 30);
    return `${monthsAgo} month${monthsAgo !== 1 ? 's' : ''} ago`;
}

function drawWinLossPieChart(canvasId, playerMatchInfo) {

    const totalGames = playerMatchInfo.totalWins + playerMatchInfo.totalLosses;
    const normalWins = playerMatchInfo.totalWins - playerMatchInfo.dominationWins - playerMatchInfo.decisiveWins - playerMatchInfo.closeCalls;
    const normalLosses = playerMatchInfo.totalLosses - playerMatchInfo.dominationLosses - playerMatchInfo.decisiveLosses - playerMatchInfo.nearMisses - playerMatchInfo.concessions;

    const percentages = [
        getPercentage(totalGames, playerMatchInfo.dominationWins),
        getPercentage(totalGames, playerMatchInfo.decisiveWins),
        getPercentage(totalGames, normalWins),
        getPercentage(totalGames, playerMatchInfo.closeCalls),
        getPercentage(totalGames, playerMatchInfo.dominationLosses),
        getPercentage(totalGames, playerMatchInfo.decisiveLosses),
        getPercentage(totalGames, normalLosses),
        getPercentage(totalGames, playerMatchInfo.nearMisses),
        getPercentage(totalGames, playerMatchInfo.concessions)
        // Add more percentages as needed
    ];

    drawConicalPieChart(canvasId, percentages, playerMatchInfo.winPercentage.toFixed(2));
}


function drawConicalPieChart(canvasId, percentages, winPercentage) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);
    const innerRadius = radius / 1.6; // Adjust as needed

    let startAngle = 0;

    // Draw the outer slices
    percentages.forEach((percentage, index) => {
        const endAngle = startAngle + (percentage / 100) * (2 * Math.PI);

        const gradient = ctx.createLinearGradient(
            centerX, centerY,
            centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius
        );

        gradient.addColorStop(0, getGradientColor(index));
        gradient.addColorStop(1, getGradientColor(index));

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.fillStyle = gradient;
        ctx.fill();

        startAngle = endAngle;
    });

    // Draw the inner circle to make it hollow
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#333'; // Set the color to match your background
    ctx.fill();

    // Add the text in the center
    ctx.fillStyle = 'beige'; // Set the color of the text
    ctx.font = '28px Lilita One';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(winPercentage + '%', centerX, centerY);
}

function getGradientColor(index) {
    // Provide your color logic here, for simplicity using a set of colors
    const colors = [
        'blue', 'deepskyblue', 'dodgerblue',
        'purple', 'mediumorchid', 'darkorchid',
        'red', 'orangered', 'black'
    ];
    return colors[index % colors.length];
}

function getPercentage(total, value) {
    return (value / total) * 100;
}

// Handle matchlist click event and populate panels
async function handleMatchClick(matchIndex, playerWonMatchInfo, playerLostMatchInfo) {
    const match = matches[matchIndex];

    // Remove 'active' class from all match banners
    const allMatchBanners = document.querySelectorAll('.match-banner');
    allMatchBanners.forEach(banner => {
        banner.classList.remove('active');
        banner.style.opacity = 0.5; // Set opacity for non-active banners
    });

    // Add 'active' class to the selected match banner
    const matchBanner = document.getElementById(`match-banner-${matchIndex}`);
    if (matchBanner) {
        matchBanner.classList.add('active');
        matchBanner.style.opacity = 1; // Set full opacity for the selected banner
        // console.log(match);
        displayPlayerPanel('panel-left', match.player_info[0], playerWonMatchInfo);
        displayPlayerPanel('panel-right', match.player_info[1], playerLostMatchInfo);
    } else {
        console.error(`Match banner with ID match-banner-${matchIndex} not found.`);
    }
}

// Program entry point
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display match data on page load
    displayMatchList();//(1979626);
});
