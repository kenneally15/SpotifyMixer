# Spotify Genre Mixer

A web application that recommends songs based on a combination of two music genres using Spotify's API.

## Setup Instructions

1. Create a Spotify Developer account at https://developer.spotify.com/
2. Create a new application in the Spotify Developer Dashboard
3. Get your Client ID and Client Secret from your application
4. Add `http://localhost:5500` to your application's Redirect URIs in the Spotify Dashboard
5. Create a `.env` file in the root directory with your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```
6. Install dependencies:
   ```bash
   npm install
   ```
7. Start the development server:
   ```bash
   npm start
   ```

## Features

- Select two different genres
- Get song recommendations that blend both genres
- View song details including artist, album, and preview
- Direct link to listen on Spotify

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Spotify Web API
- Node.js (for development server) 
