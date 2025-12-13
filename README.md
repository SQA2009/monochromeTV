# Tidal UI TV Wrapper

## Overview

This is a specialized TV application wrapper designed for music streaming instances running **[@uimaxbai/tidal-ui](https://github.com/uimaxbai/tidal-ui)**.

It is designed specifically for **Google TV** and **Android TV** platforms (not optimized for smartphones). It allows you to search for music, browse history, and navigate easily using a TV remote on any supported instance, such as:
- `https://music.binimum.org/`
- `https://tidal.squid.wtf/`

## Features

- **Universal Support**: Works with any backend instance running `@uimaxbai/tidal-ui`.
- **TV-First Design**: Optimized navigation for TV remotes.
- **Search History**: Browse and reuse your previous searches.
- **Performance**: Built-in response caching for faster browsing.
- **Flexible Deployment**: Can be packaged as an Android TV/Google TV app or used as a standalone web app on supported TV browsers.

## Getting Started

### Backend

Requires [Node.js](https://nodejs.org/).

1. Navigate to the backend directory:
   ```bash
   cd backend/
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```

### Frontend (TV/Web)

Requires [Node.js](https://nodejs.org/).

1. Navigate to the frontend source directory:
   ```bash
   cd frontend/src
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

Once started, open the provided local server link in your TV or desktop web browser, or package it into a TV app using a WebView solution.

> **Note:**  
> The app is **NOT** designed for smartphones or small-screen browsers; it is tailored specifically for TV screens and remote navigation.

## Usage

- **Connect**: Point the application to your preferred `@uimaxbai/tidal-ui` instance.
- **Search**: Find music by artist, track, or album.
- **Navigate**: Use your TV remote (D-pad) or compatible keyboard.
- **Cache**: Enjoy faster load times with session-based caching.

## Technology Stack

- **JavaScript**: Backend & Frontend logic.
- **HTML**: Structure.
- **Node.js**: Runtime environment.
- **@uimaxbai/tidal-ui**: The underlying music streaming interface.

## Credits

- **Icons**: [Material Design Icons](https://github.com/google/material-design-icons) by Google.
- **Backend API Source**: Compatible with instances of @uimaxbai/tidal-ui [@uimaxbai/tidal-ui](https://github.com/uimaxbai/tidal-ui).
