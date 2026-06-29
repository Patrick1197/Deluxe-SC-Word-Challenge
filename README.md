# Deluxe-SC-Word-Challenge

A polished React/Vite localization word challenge for Deluxe Media Group.

## Features

- Login using only `@bydeluxe.com` email addresses
- Single attempt per user, no restart
- 25 randomized questions across English, localization, and workflow topics
- 15-second timer per question
- Top 10 leaderboard on login and completion screens
- Animated, branded Deluxe-style interface

## Run the app

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the local URL shown in the terminal.

## Notes

- Scores are stored in browser local storage for leaderboard display.
- Users who already completed the challenge with a `@bydeluxe.com` email will be blocked from retrying.

## Project structure

- `src/App.jsx` - main challenge UI and app state
- `src/challenge.js` - question pool
- `src/styles.css` - polished Deluxe styling
- `src/main.jsx` - React entry point
