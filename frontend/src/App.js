import React, { useState, useEffect } from "react";
import Search from "./Search";
import Results from "./Results";

function App() {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [lastType, setLastType] = useState('tracks');

  const doSearch = async (q, type) => {
    setLoading(true);
    setError('');
    setLastType(type);
    setTracks([]); setAlbums([]); setArtists([]);
    try {
      const resp = await fetch(`/search/${type}?q=${encodeURIComponent(q)}`);
      const data = await resp.json();
      if (type === "tracks") setTracks(data.results || []);
      if (type === "albums") setAlbums(data.results || []);
      if (type === "artists") setArtists(data.results || []);
      fetch("/history").then(res => res.json()).then(data =>
        setHistory(Object.keys(data.history) || [])
      );
    } catch (err) {
      setError("Failed to fetch results");
    }
    setLoading(false);
  };

  const doClear = async () => {
    setLoading(true);
    await fetch('/history', { method: 'DELETE' });
    setTracks([]); setAlbums([]); setArtists([]);
    setHistory([]);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/history").then(res => res.json()).then(data =>
      setHistory(Object.keys(data.history) || [])
    );
  }, []);

  return (
    <div style={{
      padding: "32px 24px",
      maxWidth: 1400,
      margin: "auto",
      fontFamily: "Montserrat, Arial, sans-serif",
      background: "#111",
      color: "#ededed",
      minHeight: "100vh"
    }}>
      <h1 style={{
        textAlign: "center",
        fontSize: "4rem",
        letterSpacing: "0.04em",
        marginBottom: 28,
        color: "#ffd242",
        textShadow: "0 8px 32px #000a"
      }}>
        Monochrome.TV <span style={{ color: "#00ffe7", fontWeight: "bold" }}>Music</span>
      </h1>
      <Search onSearch={doSearch} onClear={doClear} loading={loading} />
      <Results
        tracks={tracks}
        albums={albums}
        artists={artists}
        loading={loading}
        error={error}
      />
      <div style={{
        margin: "48px 0 0 0",
        padding: "24px",
        background: "#222",
        borderRadius: 28,
        boxShadow: "0 4px 48px #000c"
      }}>
        <h2 style={{marginTop:0, fontSize:"2.5rem", color:"#ffd242"}}>Recent Searches</h2>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: "2rem", gap: "22px", marginTop: "12px" }}>
          {history.map(q => <span key={q} style={{
            color: "#00ffe7",
            background: "#2a2742",
            padding: "16px 32px",
            borderRadius: "1em",
            fontWeight: 600,
            boxShadow: "0 2px 16px #090c"
          }}>{q}</span>)}
        </div>
      </div>
    </div>
  );
}

export default App;