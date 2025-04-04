// Spotify API Configuration
const CLIENT_ID = config.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = config.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = config.REDIRECT_URI;

// Popular genres for dropdown options
const POPULAR_GENRES = [
    'rock', 'pop', 'hip hop', 'jazz', 'electronic', 
    'classical', 'r&b', 'country', 'metal', 'indie', 
    'folk', 'reggae', 'blues', 'soul', 'punk'
];

// DOM Elements
const genre1Input = document.getElementById('genre1');
const genre2Input = document.getElementById('genre2');
const findSongsButton = document.getElementById('findSongs');
const loadingElement = document.getElementById('loading');
const songCard = document.getElementById('songCard');
const albumArt = document.getElementById('albumArt');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumName = document.getElementById('albumName');
const previewAudio = document.getElementById('previewAudio');
const spotifyLink = document.getElementById('spotifyLink');

let accessToken = null;

// Initialize the application
async function init() {
    try {
        await getAccessToken();
        populateGenreDropdowns();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize the application. Please try again later.');
    }
}

// Populate genre dropdowns with options
function populateGenreDropdowns() {
    // Sort genres alphabetically
    POPULAR_GENRES.sort();
    
    // Add options to both dropdowns
    POPULAR_GENRES.forEach(genre => {
        // Add to first dropdown
        const option1 = document.createElement('option');
        option1.value = genre;
        option1.textContent = genre.charAt(0).toUpperCase() + genre.slice(1); // Capitalize first letter
        genre1Input.appendChild(option1);
        
        // Add to second dropdown
        const option2 = document.createElement('option');
        option2.value = genre;
        option2.textContent = genre.charAt(0).toUpperCase() + genre.slice(1); // Capitalize first letter
        genre2Input.appendChild(option2);
    });
}

// Get Spotify access token
async function getAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        accessToken = data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    findSongsButton.addEventListener('click', handleFindSongs);
}

// Handle find songs button click
async function handleFindSongs() {
    const genre1 = genre1Input.value.trim();
    const genre2 = genre2Input.value.trim();

    if (!genre1 || !genre2) {
        alert('Please select both genres');
        return;
    }

    if (genre1 === genre2) {
        alert('Please select different genres');
        return;
    }

    showLoading(true);
    try {
        const song = await findMatchingSong(genre1, genre2);
        displaySong(song);
    } catch (error) {
        console.error('Error finding song:', error);
        
        // Create fallback song (Yellow Submarine by The Beatles)
        const fallbackSong = {
            name: "Yellow Submarine",
            artists: [{ name: "The Beatles" }],
            album: { 
                name: "Revolver",
                images: [{ url: "https://i.scdn.co/image/ab67616d0000b27328b8b9b46428896e6491e97a" }]
            },
            preview_url: "https://p.scdn.co/mp3-preview/b7e3b2ca6cf43dea151c6e61c6a93b7c46b4b5bd",
            external_urls: {
                spotify: "https://open.spotify.com/track/5wVVoYm3hIjRWeJF53mL5X"
            }
        };
        
        // Display custom message
        document.querySelector('#results').insertAdjacentHTML('beforeend', 
            '<p class="fallback-message">Couldn\'t find a match, but I think you\'ll enjoy this instead!</p>');
        
        // Display the fallback song
        displaySong(fallbackSong);
    } finally {
        showLoading(false);
    }
}

// Find a song that matches both genres
async function findMatchingSong(genre1, genre2) {
    // First, get tracks for each genre
    const genre1Tracks = await getTracksByGenre(genre1);
    const genre2Tracks = await getTracksByGenre(genre2);

    // Find common artists between the two genres
    const genre1Artists = new Set(genre1Tracks.map(track => track.artists[0].id));
    const genre2Artists = new Set(genre2Tracks.map(track => track.artists[0].id));
    const commonArtists = [...genre1Artists].filter(id => genre2Artists.has(id));

    if (commonArtists.length === 0) {
        throw new Error('No common artists found between the genres');
    }

    // Get tracks from common artists
    const commonArtistTracks = await getTracksByArtists(commonArtists.slice(0, 5));

    // Return a random track from the common artists
    return commonArtistTracks[Math.floor(Math.random() * commonArtistTracks.length)];
}

// Get tracks by genre
async function getTracksByGenre(genre) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${genre}&type=track&limit=50`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get tracks for genre: ${genre}`);
        }

        const data = await response.json();
        return data.tracks.items;
    } catch (error) {
        console.error(`Error getting tracks for genre ${genre}:`, error);
        throw error;
    }
}

// Get tracks by artist IDs
async function getTracksByArtists(artistIds) {
    try {
        const tracks = [];
        for (const artistId of artistIds) {
            const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                continue;
            }

            const data = await response.json();
            tracks.push(...data.tracks);
        }
        return tracks;
    } catch (error) {
        console.error('Error getting tracks by artists:', error);
        throw error;
    }
}

// Display song information
function displaySong(song) {
    albumArt.src = song.album.images[0].url;
    songTitle.textContent = song.name;
    artistName.textContent = song.artists[0].name;
    albumName.textContent = song.album.name;
    previewAudio.src = song.preview_url;
    spotifyLink.href = song.external_urls.spotify;

    songCard.style.display = 'flex';
}

// Show/hide loading state
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
    songCard.style.display = show ? 'none' : 'flex';
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 