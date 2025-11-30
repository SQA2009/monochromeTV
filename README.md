# MonochromeTV Music Search

## Overview

MonochromeTV is a specialized TV application wrapper for the [monochrome.tf](https://monochrome.tf/) music streaming service.  
It’s designed for Google TV and Android TV platforms (not optimized for smartphones).  
You can search for music, jump through your search history, and enjoy faster usage with built-in caching.

## Features

- Search for music via the monochrome.tf backend
- Browse and reuse your previous searches
- Response caching for quicker browsing
- TV-friendly remote navigation interface
- Can be packaged as an Android TV/Google TV app
- Usable as a standalone web app on supported TV browsers

## Getting Started

### Backend

Requires [Node.js](https://nodejs.org/).

```bash
cd backend/
npm install
node server.js
```

### Frontend (TV/Web)

Requires [Node.js](https://nodejs.org/).

```bash
cd frontend/src
npm install
npm start
```

Open the provided local server link in your TV or desktop web browser, or package it into a TV app using a WebView solution.

> **Note:**  
> The app is NOT designed for smartphones or small-screen browsers; it's tailored for TV screens and remotes.

## Usage

- Search by artist, track, or album
- Use your TV remote or compatible keyboard to navigate results
- Previous searches can be revisited for convenience
- Search responses are cached during your session for speed

## Technology Stack

- JavaScript (backend & frontend)
- HTML
- Node.js
- monochrome.tf API

## Credits

Uses the [Material Design Icons](https://github.com/google/material-design-icons) by Google.

Music streaming features powered by [monochrome.tf](https://monochrome.tf/).
