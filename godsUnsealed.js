// import cardDatabase from './cardDatabase.json';

let matches;
// let isMatchListLoading = false;

const DEBUG = false;

const godThemes = {
    war: {
        gradient: 'linear-gradient(0deg, rgba(75,5,5,1) 0%, rgba(75,5,5,1) 10%, rgba(75,5,5,0) 20%, rgba(0,0,0,0) 50%, rgba(75,5,5,1) 90%, rgba(75,5,5,1) 100%)',
        image: 'images/gods/war.png',
        name: 'Auros',
        color: 'rgba(255,5,5,1)'
    },
    death: {
        gradient: 'linear-gradient(0deg, rgba(50,50,50,1) 0%, rgba(50,50,50,1) 10%, rgba(0,50,50,0) 20%, rgba(0,0,0,0) 50%, rgba(50,50,50,1) 90%, rgba(50,50,50,1) 100%)',
        image: 'images/gods/death.png',
        name: 'Malissus',
        color: 'rgba(50,50,50,1)'
    },
    deception: {
        gradient: 'linear-gradient(0deg, rgba(100,15,255,1) 0%, rgba(100,15,255,1) 10%, rgba(100,15,255,0) 20%, rgba(0,0,0,0) 50%, rgba(100,15,255,1) 90%, rgba(100,15,255,1) 100%)',
        image: 'images/gods/deception.png',
        name: 'Ludia',
        color: 'rgba(100,15,255,1)'
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
        color: 'rgba(20,175,255,1)'
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
        const startTime = endTime - 60 * 5; // 10 minutes

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

    // Get overall Sealed mode W/L
    const winCountOverall = matches.filter(match => match.player_won === userId).length;
    const lossCountOverall = matches.length - winCountOverall;
    const winPercentageOverall = (winCountOverall / matches.length) * 100;

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

    for (let i = 0; i < recentMatches.length - 1; i++) {
        const playerIndex = recentMatches[i].player_won === userId ? 0 : 1;
        const currentDeck = recentMatches[i].player_info[playerIndex].cards;

        // Use the playerIndex of the next match (i+1) to get the correct player's deck
        const nextPlayerIndex = recentMatches[i + 1].player_won === userId ? 0 : 1;
        const nextDeck = recentMatches[i + 1].player_info[nextPlayerIndex].cards;

        if (hasSignificantDeckChange(currentDeck, nextDeck)) {
            // Next deck is different. So this is the first game of a set.
            console.log(`Game ${i} is the first game of the set`);
            // Increment win or loss counters for the current game
            if (recentMatches[i].player_won === userId) {
                winCountInSet++;
            } else if (recentMatches[i].player_lost === userId) {
                lossCountInSet++;
            }

            break;
        } else {
            // No significant deck change, mark it as part of the same set
            console.log(`Game ${i} is part of the same set`);
            // Increment win or loss counters for the current game
            if (recentMatches[i].player_won === userId) {
                winCountInSet++;
            } else if (recentMatches[i].player_lost === userId) {
                lossCountInSet++;
            }
        }
    }

    console.log(`${userId} Set Wins: ${winCountInSet} Losses: ${lossCountInSet}`);

    return {
        winCountOverall,
        lossCountOverall,
        winPercentageOverall,
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
                matchBanner.onclick = () => handleMatchClick(i);

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
                                    <div class="winrate">${playerWonMatchInfo.winPercentageOverall.toFixed(2)}%</div>
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
                                    <div class="winrate winrate-right">${playerLostMatchInfo.winPercentageOverall.toFixed(2)}%</div>
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
async function displayPlayerPanel(panelId, playerMatchInfo, isWinner) {
    const panel = document.getElementById(panelId);

    // const playerMatchHistory = await getPlayerMatchStats(playerMatchInfo.user_id);
    const godTheme = godThemes[playerMatchInfo.god];
    const outcomeClass = isWinner ? 'winner' : 'loser';
    const outcomeText = isWinner ? 'WINNER' : 'LOSER';

    const playerInfo = await fetchUserInfo(playerMatchInfo.user_id);
    const playerRank = await fetchUserRank(playerMatchInfo.user_id);

    panel.innerHTML = `
        <div class="player-card" style="background: ${godTheme.gradient};">

            <div class="outcome ${outcomeClass}">${outcomeText}</div><br>
            <div class="player-overview">
                <div style="display: flex; align-items: flex-start;">
                    <div style="margin-right: 20px; text-align: center;">
                        <img class="godpower-card" src="https://images.godsunchained.com/art2/250/${playerMatchInfo.god_power}.webp" style="align: top;"><br>
                        <p class="player-info-field">${godPowerNames[playerMatchInfo.god_power]}</p>
                    </div>
                    <div>
                        <p class="player-info-field">${playerInfo.user_id}</p>
                        <p class="player-info-field">${playerInfo.username}</p>
                        <p class="player-info-field">Constructed Rank: ${playerRank}</p>
                        <p class="player-info-field">Player Level: ${playerInfo.xp_level}</p>
                        <button class="button player-matchlist-button" id="showMatchesButton">Match List</button>
                    </div>
                </div>
            </div>
            <div class="card-list ${outcomeClass}-card-list" id="${outcomeClass}-card-list"></div>
            <!---<div class="portrait-container"> ---!>







            <img class="portrait" src="${godTheme.image}" alt="${playerMatchInfo.god}">
            <!---</div> ---!>
        </div>
    `;
    //             <!--- <img class="portrait-left" src="${godThemes[playerMatchHistory.godsUsed[1]].image}"> ---!>
    // <!--- <img class="portrait-right" src="${godThemes[playerMatchHistory.godsUsed[2]].image}"> ---!></img>
    displayCardList(playerMatchInfo.cards, `${outcomeClass}-card-list`);

    const showMatchesButton = panel.querySelector('#showMatchesButton');
    showMatchesButton.addEventListener('click', async () => {
        await displayMatchList(playerMatchInfo.user_id);
    });
}

// Display card list on player panel
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

        cardListDiv.appendChild(cardElement);
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


// Handle matchlist click event and populate panels
async function handleMatchClick(matchIndex) {
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
        displayPlayerPanel('winner-card', match.player_info[0], true);
        displayPlayerPanel('loser-card', match.player_info[1], false);
    } else {
        console.error(`Match banner with ID match-banner-${matchIndex} not found.`);
    }
}

// Program entry point
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display match data on page load
    displayMatchList();//(1979626);
});
