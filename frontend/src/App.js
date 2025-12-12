import React, { useState, useEffect } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Results from "./Results";
import History from "./History";
import Player from "./Player";
import "./styles/styles.css";

const MOCK_HOME = [
  { id: 1, title: "Party Vibes", subtitle: "Mix", coverUrl: "https://picsum.photos/id/129/300/300" },
  { id: 2, title: "Late Night", subtitle: "Playlist", coverUrl: "https://picsum.photos/id/10/300/300" },
  { id: 3, title: "Focus Flow", subtitle: "Album", coverUrl: "https://picsum.photos/id/20/300/300" },
  { id: 4, title: "Jazz Classics", subtitle: "Playlist", coverUrl: "https://picsum.photos/id/30/300/300" }
];

function App() {
  const [view, setView] = useState('home');
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Back stack
  const [viewStack, setViewStack] = useState([]);
  const pushView = (next) => { if (next !== view) setViewStack(prev => [...prev, view]); setView(next); };
  const goBack = () => {
    setViewStack(prev => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setView(last);
      return prev.slice(0, -1);
    });
  };

  // Player/queue
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTrack = queue[currentIndex] || null;

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    fetch("/history").then(res => res.json()).then(data => setHistory(Object.keys(data.history) || []));
  }, []);

  const apiFetch = async (endpoint, opts = {}) => {
    return fetch(endpoint, opts);
  };

  // --- PLAYER ACTIONS ---
  
  const handlePlayTrack = (track) => { 
      setQueue([track]); 
      setCurrentIndex(0); 
  };
  
  const startQueue = (list, idx = 0) => { 
      setQueue([...list]); 
      setCurrentIndex(idx); 
  };

  const handleShuffleAlbum = (list) => {
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentIndex(0);
  };

  const handleNext = () => { if (currentIndex < queue.length - 1) setCurrentIndex(i => i + 1); };
  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1); };

  // --- NAVIGATION ---

  const handleAlbumClick = async (album) => {
    setLoading(true);
    pushView('album'); 
    setSelectedAlbum(album); 
    setAlbumTracks([]); // Clear previous
    
    try {
      // Use the new dedicated endpoint
      const res = await apiFetch(`/album/${album.id}`); 
      const data = await res.json();
      
      const tracksWithMetadata = (data.results || []).map(t => ({
        ...t,
        coverUrl: album.coverUrl,
        artist: album.artist || t.artist, // Fallback to album artist if track artist missing
        // Crucial: Create a specific query for this track so backend can find it
        // Format: "ArtistName TrackTitle"
        originalQuery: `${album.artist || t.artist || ""} ${t.title}`.trim()
      }));
      
      setAlbumTracks(tracksWithMetadata);
    } catch (e) {
        console.error("Failed to load album tracks", e);
    }
    setLoading(false);
  };

  const handleArtistOpen = (artist) => { pushView('artist'); setSelectedArtist(artist); };

  const doSearch = async (q, type) => {
    setLoading(true);
    if (view !== 'search') pushView('search');
    setTracks([]); setAlbums([]); setArtists([]);
    try {
      const res = await apiFetch(`/search/${type}?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      
      if (type === "tracks") {
        setTracks((data.results || []).map(t => ({ ...t, originalQuery: q })));
      }
      if (type === "albums") setAlbums(data.results || []);
      if (type === "artists") setArtists(data.results || []);
    } catch {}
    setLoading(false);
  };
  const doClearHistory = async () => { await fetch('/history', { method: 'DELETE' }); setHistory([]); };

  const playerVisible = Boolean(currentTrack);

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <img src="/logo.png" alt="Logo" className="sidebar-logo logo-hover" tabIndex={-1} />
        <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
          <img src="/svg-icons/home.svg" alt="Home" />
        </button>
        <button className={`nav-btn ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}>
          <img src="/svg-icons/search.svg" alt="Search" />
        </button>
        <button className={`nav-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>
          <img src="/svg-icons/library.svg" alt="Library" />
        </button>

        <button
          className={`nav-btn sidebar-settings ${view === 'settings' ? 'active' : ''} ${playerVisible ? 'above-player' : 'at-bottom'}`}
          onClick={() => setView('settings')}
        >
          <img src="/svg-icons/settings.svg" alt="Settings" />
        </button>
      </nav>

      <main className="main-content">
        <Header view={view} onBack={goBack} />

        {view === 'home' && (
          <>
            <div className="hero-banner">
              <div className="hero-content">
                <h4 style={{ margin: 0, color: '#E60023' }}>Featured</h4>
                <h1>Duality</h1>
                <p>Luna Li • Album</p>
              </div>
            </div>
            <Results title="Recommended" items={MOCK_HOME} type="albums" onPlay={handleAlbumClick} />
          </>
        )}

        {view === 'library' && (
          <div className="content-padding">
            <h1 style={{ fontSize: '3rem', marginBottom: 30 }}>Library</h1>
            <History history={history} />
          </div>
        )}

        {view === 'search' && (
          <div className="content-padding">
            <h1 style={{ fontSize: '3rem', marginBottom: 30 }}>Search</h1>
            <SearchBar onSearch={doSearch} loading={loading} />
            {loading ? (
              <div style={{ fontSize: '2rem', padding: 40, color: '#888' }}>Searching...</div>
            ) : (
              <>
                {tracks.length > 0 && <Results title="Tracks" items={tracks} type="tracks" onPlay={handlePlayTrack} />}
                {albums.length > 0 && <Results title="Albums" items={albums} type="albums" onPlay={handleAlbumClick} />}
                {artists.length > 0 && <Results title="Artists" items={artists} type="artists" onPlay={handleArtistOpen} />}
              </>
            )}
          </div>
        )}

        {view === 'album' && selectedAlbum && (
          <div>
            <div className="album-header">
              <img src={selectedAlbum.coverUrl || "/svg-icons/album.svg"} alt="" />
              <div>
                <div style={{ color: '#E60023', fontWeight: 'bold' }}>ALBUM</div>
                <h1 style={{ fontSize: '3.5rem', margin: '10px 0' }}>{selectedAlbum.title}</h1>
                <div style={{ color: '#ccc', fontSize: '1.2rem', marginBottom: 20 }}>{selectedAlbum.artist}</div>
                
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="control-btn large"
                      style={{ width: 'auto', padding: '0 32px', borderRadius: 50, color: '#000', fontWeight: 'bold', fontSize: '1.2rem' }}
                      onClick={() => startQueue(albumTracks, 0)}
                      disabled={albumTracks.length === 0}
                    >
                      <img src="/svg-icons/play.svg" style={{ filter: 'none', width: 20, marginRight: 10 }} alt="" /> PLAY
                    </button>
                    
                     <button
                      className="control-btn large"
                      style={{ width: 'auto', padding: '0 32px', borderRadius: 50, background: '#333', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}
                      onClick={() => handleShuffleAlbum(albumTracks)}
                      disabled={albumTracks.length === 0}
                    >
                      SHUFFLE
                    </button>
                </div>

              </div>
            </div>
            <div className="content-padding">
              {loading ? (
                <div>Loading tracks...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {albumTracks.length === 0 ? (
                      <div style={{color: '#888', fontStyle: 'italic'}}>No tracks found.</div>
                  ) : (
                      albumTracks.map((t, i) => (
                        <div key={i} className="album-list-row" onClick={() => startQueue(albumTracks, i)}>
                          <span style={{ width: 30, fontWeight: 'bold', color: '#666' }}>{i + 1}</span>
                          <span style={{ flex: 1, fontSize: '1.1rem' }}>{t.title}</span>
                          <span style={{color: '#888'}}>{t.duration}</span>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'artist' && selectedArtist && (
          <div>
            <div className="artist-header">
              <img src={selectedArtist.picture || "/svg-icons/artist.svg"} alt="" />
              <div>
                <div style={{ color: '#E60023', fontWeight: 'bold' }}>ARTIST</div>
                <h1 style={{ fontSize: '3.5rem', margin: '10px 0' }}>{selectedArtist.name}</h1>
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="content-padding">
            <h1 style={{ fontSize: '3rem', marginBottom: 30 }}>Settings</h1>
            <div style={{ background: '#222', padding: 40, borderRadius: 16, maxWidth: 1000 }}>
              <h2 style={{ marginTop: 0 }}>Data</h2>
              <button onClick={doClearHistory} style={{ background: '#E60023', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                CLEAR HISTORY
              </button>
            </div>
          </div>
        )}
      </main>

      <Player track={currentTrack} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}

export default App;