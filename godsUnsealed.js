

// Declare matches variable in a scope accessible to all functions
let matches;

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

// Function to display card list
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


// Function to fetch card data
async function fetchCardInfo(cardId) {
    try {
        const response = await fetch(`https://api.godsunchained.com/v0/proto/${cardId}`);
        const cardInfo = await response.json();

        // console.log(`Card Name: ${cardInfo.name}, Mana: ${cardInfo.mana}`);

        return cardInfo;
    } catch (error) {
        console.error('Error fetching card info:', error);
        return null;
    }
}

// Function to fetch match data
async function fetchRecentMatches() {
    try {
        const itemsPerPage = 1000; // Specify the desired items per page
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - 60 * 10; // 10 minutes

        // Fetch only the first page without fetching the total count
        const firstPageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&page=1`);
        const firstPageData = await firstPageResponse.json();

        // Get the total records from the first page data
        const totalRecords = firstPageData.total;
        console.log('Total records:', totalRecords);

        // Calculate the number of pages needed
        const totalPages = Math.ceil(totalRecords / itemsPerPage);

        // Fetch data for each page and concatenate the results
        let allMatches = firstPageData.records; // Use records from the first page
        for (let page = 2; page <= totalPages; page++) {
            const pageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&page=${page}`);
            const pageData = await pageResponse.json();
            allMatches = allMatches.concat(pageData.records);
        }

        // Filter by Sealed only and Sort by most recent
        const filteredMatches = allMatches.filter(match => match.game_mode === 7);
        filteredMatches.sort((a, b) => b.end_time - a.end_time);

        console.log('Filtered Game Mode 7 Matches:', filteredMatches.length);

        return filteredMatches;

    } catch (error) {
        console.error('Error fetching match data:', error);
    }
}


// Function to fetch user info
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

// Function to fetch user rank
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
            console.error(`No record found for user ${userId}`);
            return '1';
        }
    } catch (error) {
        console.error('Error fetching user rank:', error);
        return '1';
    }
}


// Function to create a user ID icon
function createUserIdIcon(userId) {
    const userIdDigits = userId.toString().split('').map(Number);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'user-id-icon';

    for (const digit of userIdDigits) {
        const digitDiv = document.createElement('div');
        digitDiv.className = 'user-id-digit';
        digitDiv.textContent = digit;
        iconContainer.appendChild(digitDiv);
    }

    return iconContainer;
}

// Function to fetch matches by player ID
// Function to fetch matches by player ID with pagination and null checks
async function fetchMatchesByUserId(userId, endTime = Math.floor(Date.now() / 1000)) {
    try {
        const itemsPerPage = 1000;
        const startTime = endTime - 60 * 60 * 24 * 3; //3 days, which is the max timeframe unfortunately

        // Fetch the first page to get total records for wins
        const winsFirstPageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_won=${userId}&page=1`);
        const winsFirstPageData = await winsFirstPageResponse.json();

        // Fetch the first page to get total records for losses
        const lossesFirstPageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_lost=${userId}&page=1`);
        const lossesFirstPageData = await lossesFirstPageResponse.json();

        const totalWins = winsFirstPageData.total;
        const totalLosses = lossesFirstPageData.total;

        console.log(`Total wins for player ${userId}:`, totalWins);
        console.log(`Total losses for player ${userId}:`, totalLosses);

        // Calculate the number of pages needed for wins
        const totalPagesWins = Math.ceil(totalWins / itemsPerPage);

        // Fetch data for each page and concatenate the results for wins
        let allWins = winsFirstPageData.records || [];
        for (let page = 2; page <= totalPagesWins; page++) {
            const pageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_won=${userId}&page=${page}`);
            const pageData = await pageResponse.json();
            allWins = allWins.concat(pageData.records || []);
        }

        // Calculate the number of pages needed for losses
        const totalPagesLosses = Math.ceil(totalLosses / itemsPerPage);

        // Fetch data for each page and concatenate the results for losses
        let allLosses = lossesFirstPageData.records || [];
        for (let page = 2; page <= totalPagesLosses; page++) {
            const pageResponse = await fetch(`https://api.godsunchained.com/v0/match?&end_time=${startTime}-${endTime}&perPage=${itemsPerPage}&player_lost=${userId}&page=${page}`);
            const pageData = await pageResponse.json();
            allLosses = allLosses.concat(pageData.records || []);
        }

        // Combine wins and losses
        const allMatches = allWins.concat(allLosses);

        // Filter by Sealed only and Sort by most recent
        const filteredMatches = allMatches.filter(match => match.game_mode === 7);
        filteredMatches.sort((a, b) => b.end_time - a.end_time);

        console.log(`Game mode 7 matches for player ${userId}:`, filteredMatches.length);

        return filteredMatches;

    } catch (error) {
        console.error('Error fetching match data:', error);
        return null;
    }
}


async function getPlayerMatchStats(userId, endTime) {
    const matches = await fetchMatchesByUserId(userId, endTime);

    // Get overall Sealed mode W/L
    const winCountOverall = matches.filter(match => match.player_won === userId).length;
    const lossCountOverall = matches.length - winCountOverall;
    const winPercentageOverall = (winCountOverall / matches.length) * 100;

        // Get the main god for the player
        const mainGod = matches[0].player_info.find(player => player.user_id === userId).god;

        // Find the other two gods by fetching card data
        const otherGods = new Set();
    
        for (const match of matches) {
            const playerDeck = match.player_info.find(player => player.user_id === userId).cards;
    
            // Fetch card information for each card in the player's deck
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
    
            // Break if we have found cards from two different gods
            if (otherGods.size === 2) {
                break;
            }
        }
    
        const godsUsed = [mainGod, ...Array.from(otherGods)];
        console.log(`${userId} used gods: ${godsUsed.join(', ')}`);
    

    //console.log(`${userId} Overall Wins: ${winCountOverall} Losses: ${lossCountOverall} Win Percentage: ${winPercentageOverall.toFixed(2)}%`);

    // Get Sealed Set information
    // Trim data to last 10 matches before we search for Game 1
    const recentMatches = matches.slice(0, 10);

    // Function to compare two card lists and determine if they have significant changes
    const hasSignificantDeckChange = (deck1, deck2) => {
        const changedCardCount = deck1.filter(card => !deck2.includes(card)).length;
        const changePercentage = (changedCardCount / deck1.length) * 100;
        return changePercentage >= 50; // You can adjust the threshold as needed
    };

    // Find the index of the first game in the set
    let firstGameIndex = recentMatches.length - 1;
    for (let i = recentMatches.length - 2; i >= 0; i--) {
        const playerIndex = recentMatches[i].player_won === userId ? 0 : 1;
        const currentDeck = recentMatches[i].player_info[playerIndex].cards;
        const previousDeck = recentMatches[i + 1].player_info[playerIndex].cards;

        if (hasSignificantDeckChange(currentDeck, previousDeck)) {
            // Found the first game with significant deck change
            firstGameIndex = i;
        } else {
            // No significant deck change, stop searching
            console.log(`No significant deck change detected between game ${i + 1} and game ${i}`);
            //console.log(`Current Deck (Player ${playerIndex + 1}):`, currentDeck);
            //console.log(`Previous Deck (Player ${playerIndex + 1}):`, previousDeck);
            break;
        }
    }

    // Count wins and losses in the sealed set
    const winsInSet = recentMatches.slice(firstGameIndex).filter(match => match.player_won === userId);
    const lossesInSet = recentMatches.slice(firstGameIndex).filter(match => match.player_lost === userId);
    const winCountInSet = winsInSet.length;
    const lossCountInSet = lossesInSet.length;


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


// Function to display match information
async function displayMatchList(userId) {
    const matchInfoDiv = document.getElementById('match-list');
    matchInfoDiv.innerHTML = ''; 

    try {
        if (userId) {
            // Fetch match data by user ID
            matches = await fetchMatchesByUserId(userId);
        } else {
            // Fetch recent match data
            matches = await fetchRecentMatches();
        }

    } catch (error) {
        console.error('Error displaying match list and fetching data:', error);
    }

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const playerWonInfo = await fetchUserInfo(match.player_won);
        const playerLostInfo = await fetchUserInfo(match.player_lost);
        const playerWonRank = await fetchUserRank(match.player_won);
        const playerLostRank = await fetchUserRank(match.player_lost);
        const playerWonMatchInfo = await getPlayerMatchStats(match.player_won, match.end_time);
        const playerLostMatchInfo = await getPlayerMatchStats(match.player_lost, match.end_time);

        const matchStartTime = new Date(match.start_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const matchEndTime = new Date(match.end_time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const matchLength = ((match.end_time - match.start_time) / 60).toFixed(2); // in minutes
        const matchTimeAgo = getTimeAgo(match.end_time);

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
}




// Function to display player information and card list
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


// Function to handle match click event and populate panels
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



document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display match data on page load
    displayMatchList();//(1979626);
});
