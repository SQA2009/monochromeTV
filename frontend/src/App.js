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

const INITIAL_SERVERS = [
  "https://ohio.monochrome.tf",
  "https://maus.qqdl.site",
  "https://vogel.qqdl.site",
  "https://wolf.qqdl.site",
  "https://katze.qqdl.site",
  "https://virginia.monochrome.tf",
  "https://oregon.monochrome.tf",
  "https://california.monochrome.tf",
  "https://frankfurt.monochrome.tf",
  "https://singapore.monochrome.tf",
  "https://tokyo.monochrome.tf",
  "https://jakarta.monochrome.tf",
  "https://hund.qqdl.site",
  "https://tidal.401658.xyz"
];

function App() {
  const [view, setView] = useState('home');
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // --- SERVER MANAGEMENT STATE ---
  const [serverList, setServerList] = useState(() => {
    const saved = localStorage.getItem("my_servers");
    return saved ? JSON.parse(saved) : INITIAL_SERVERS;
  });
  
  const [activeServer, setActiveServer] = useState(() => {
    return localStorage.getItem("active_server") || INITIAL_SERVERS[0];
  });

  const [serverStatuses, setServerStatuses] = useState({}); // { url: { status: 'Online', latency: 120 } }
  const [newServerInput, setNewServerInput] = useState("");

  // --- QUEUE & PLAYER ---
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTrack = queue[currentIndex] || null;

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // --- INITIAL ---
  useEffect(() => {
    fetch("/history").then(res => res.json()).then(data => setHistory(Object.keys(data.history) || []));
  }, []);

  useEffect(() => {
    localStorage.setItem("my_servers", JSON.stringify(serverList));
    localStorage.setItem("active_server", activeServer);
  }, [serverList, activeServer]);

  // --- API HELPER (Injects Server Header) ---
  const apiFetch = async (endpoint, opts = {}) => {
    const headers = { ...opts.headers, 'x-server-url': activeServer };
    return fetch(endpoint, { ...opts, headers });
  };

  // --- SERVER ACTIONS ---
  const addServer = () => {
    if (newServerInput && !serverList.includes(newServerInput)) {
      setServerList([...serverList, newServerInput]);
      setNewServerInput("");
    }
  };

  const removeServer = (url) => {
    const newList = serverList.filter(s => s !== url);
    setServerList(newList);
    if (activeServer === url && newList.length > 0) setActiveServer(newList[0]);
  };

  const testAllServers = async () => {
    setServerStatuses({}); // Reset
    for (const url of serverList) {
      // Mark as testing
      setServerStatuses(prev => ({ ...prev, [url]: { status: "Testing...", latency: null } }));
      
      try {
        const res = await fetch("/server/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        setServerStatuses(prev => ({ ...prev, [url]: data }));
      } catch (e) {
        setServerStatuses(prev => ({ ...prev, [url]: { status: "Error", latency: null } }));
      }
    }
  };

  // --- PLAYER ACTIONS ---
  const handlePlayTrack = (track) => { setQueue([track]); setCurrentIndex(0); };
  const startQueue = (list, idx = 0) => { setQueue(list); setCurrentIndex(idx); };
  const handleNext = () => { if (currentIndex < queue.length - 1) setCurrentIndex(prev => prev + 1); };
  const handlePrev = () => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); };

  // --- NAV ---
  const handleAlbumClick = async (album) => {
    setLoading(true); setView('album'); setSelectedAlbum(album); setAlbumTracks([]); 
    try {
      const res = await apiFetch(`/album/${album.id}`);
      const data = await res.json();
      setAlbumTracks((data.results || []).map(t => ({...t, coverUrl: album.coverUrl})));
    } catch (e) {}
    setLoading(false);
  };

  const doSearch = async (q, type) => {
    setLoading(true);
    if (view !== 'search') setView('search');
    setTracks([]); setAlbums([]); setArtists([]);
    try {
      const res = await apiFetch(`/search/${type}?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (type === "tracks") setTracks(data.results || []);
      if (type === "albums") setAlbums(data.results || []);
      if (type === "artists") setArtists(data.results || []);
    } catch (err) {}
    setLoading(false);
  };

  const doClearHistory = async () => { await fetch('/history', { method: 'DELETE' }); setHistory([]); };

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <img src="/logo.png" alt="Logo" className="sidebar-logo" />
        <button className={`nav-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}><img src="/svg-icons/home.svg" alt="Home" /></button>
        <button className={`nav-btn ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}><img src="/svg-icons/search.svg" alt="Search" /></button>
        <button className={`nav-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}><img src="/svg-icons/library.svg" alt="Library" /></button>
        <button className={`nav-btn mt-auto ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}><img src="/svg-icons/settings.svg" alt="Settings" /></button>
      </nav>

      <main className="main-content">
        <Header />

        {view === 'home' && (
          <>
            <div className="hero-banner">
              <div className="hero-content">
                 <h4 style={{margin:0, color:'#E60023'}}>Featured</h4>
                 <h1>Duality</h1>
                 <p>Luna Li • Album</p>
              </div>
            </div>
            <Results title="Recommended" items={MOCK_HOME} type="albums" onPlay={handleAlbumClick} />
            {history.length > 0 && <div className="content-padding"><History history={history} /></div>}
          </>
        )}

        {view === 'search' && (
          <div className="content-padding">
            <h1 style={{fontSize:'3rem', marginBottom:30}}>Search</h1>
            <SearchBar onSearch={doSearch} loading={loading} />
            {loading ? <div style={{fontSize:'2rem', padding:40, color:'#888'}}>Searching...</div> : (
              <>
                {tracks.length > 0 && <Results title="Tracks" items={tracks} type="tracks" onPlay={handlePlayTrack} />}
                {albums.length > 0 && <Results title="Albums" items={albums} type="albums" onPlay={handleAlbumClick} />}
                {artists.length > 0 && <Results title="Artists" items={artists} type="artists" onPlay={(a)=>{setView('artist'); setSelectedArtist(a);}} />}
              </>
            )}
          </div>
        )}

        {view === 'album' && selectedAlbum && (
          <div>
             <div className="album-header">
                <img src={selectedAlbum.coverUrl || "/svg-icons/album.svg"} alt="" />
                <div>
                   <div style={{color:'#E60023', fontWeight:'bold'}}>ALBUM</div>
                   <h1 style={{fontSize:'3.5rem', margin:'10px 0'}}>{selectedAlbum.title}</h1>
                   <div style={{color:'#ccc', fontSize:'1.2rem', marginBottom: 20}}>{selectedAlbum.artist}</div>
                   <button className="control-btn large" style={{width:'auto', padding:'0 32px', borderRadius:50, color:'#000', fontWeight:'bold', fontSize:'1.2rem'}} onClick={() => startQueue(albumTracks)}>
                     <img src="/svg-icons/play.svg" style={{filter:'none', width:20, marginRight:10}} alt=""/> PLAY ALBUM
                   </button>
                </div>
             </div>
             <div className="content-padding">
                {loading ? <div>Loading...</div> : (
                  <div style={{display:'flex', flexDirection:'column'}}>
                     {albumTracks.map((t, i) => (
                        <div key={i} className="album-list-row" onClick={() => startQueue(albumTracks, i)}>
                           <span style={{width:30, fontWeight:'bold', color:'#666'}}>{i+1}</span>
                           <span style={{flex:1, fontSize:'1.1rem'}}>{t.title}</span>
                           {t.duration && <span>{Math.floor(t.duration/60)}:{String(t.duration%60).padStart(2,'0')}</span>}
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="content-padding">
            <h1 style={{fontSize:'3rem', marginBottom:30}}>Settings</h1>
            <div style={{background:'#222', padding:40, borderRadius:16, maxWidth:1000}}>
                <h2 style={{marginTop:0}}>Server Manager</h2>
                <p style={{color:'#aaa'}}>Manage and test backend mirrors.</p>
                
                <div style={{display:'flex', gap:10, marginBottom:20}}>
                  <input 
                    value={newServerInput} 
                    onChange={e=>setNewServerInput(e.target.value)} 
                    placeholder="https://new-mirror.url" 
                    style={{flex:1, padding:12, borderRadius:8, border:'none', background:'#333', color:'#fff'}}
                  />
                  <button onClick={addServer} style={{padding:'12px 24px', borderRadius:8, background:'#444', color:'#fff', border:'none', cursor:'pointer'}}>Add</button>
                  <button onClick={testAllServers} style={{padding:'12px 24px', borderRadius:8, background:'#fff', color:'#000', border:'none', cursor:'pointer', fontWeight:'bold'}}>Test All</button>
                </div>

                <div style={{display:'grid', gridTemplateColumns: '1fr', gap: 12}}>
                   {serverList.map(url => {
                     const stats = serverStatuses[url];
                     return (
                       <div key={url} style={{display:'flex', alignItems:'center', background: activeServer === url ? '#2a2a2a' : '#1a1a1a', padding: 16, borderRadius: 8, border: activeServer === url ? '2px solid #E60023' : '2px solid transparent'}}>
                          <div style={{flex:1}}>
                             <div style={{fontSize:'1.1rem', fontWeight: activeServer === url ? 'bold':'normal'}}>{url}</div>
                             {stats && (
                               <div style={{fontSize:'0.9rem', color: stats.status === 'Online' ? '#4caf50' : '#f44336', marginTop:4}}>
                                  {stats.status} {stats.latency && `(${stats.latency}ms)`}
                               </div>
                             )}
                          </div>
                          <button onClick={() => setActiveServer(url)} style={{padding:'8px 16px', marginRight:10, borderRadius:4, border:'none', background: activeServer===url ? '#E60023':'#444', color:'#fff', cursor:'pointer'}}>
                            {activeServer === url ? 'Active' : 'Select'}
                          </button>
                          <button onClick={() => removeServer(url)} style={{padding:'8px', borderRadius:4, border:'none', background:'transparent', color:'#666', cursor:'pointer'}}>X</button>
                       </div>
                     );
                   })}
                </div>

                <hr style={{borderColor:'#333', margin:'40px 0'}}/>
                <h2 style={{marginTop:0}}>Data</h2>
                <button onClick={doClearHistory} style={{background: '#E60023', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer'}}>CLEAR HISTORY</button>
            </div>
          </div>
        )}
      </main>

      <Player track={currentTrack} activeServerUrl={activeServer} onNext={handleNext} onPrev={handlePrev} />
    </div>
  );
}

export default App;