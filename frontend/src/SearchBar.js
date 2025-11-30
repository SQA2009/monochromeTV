import React, { useState, useEffect } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("tracks");

  useEffect(() => {
    if (q.length > 3) {
      const delayDebounceFn = setTimeout(() => {
        onSearch(q, type);
      }, 800);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [q, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (q) onSearch(q, type);
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: '#222', 
          padding: '8px 16px', 
          borderRadius: 50, 
          border: '1px solid #333',
          maxWidth: 900,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <img src="/svg-icons/search.svg" alt="" style={{ width:24, height:24, margin:'0 16px', opacity: 0.7, filter: 'invert(1)' }} />
        
        <input
          type="text"
          autoFocus
          placeholder="Search for tracks, albums..."
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.6rem', flex: 1, outline: 'none', padding: '12px 0', fontFamily: 'inherit' }}
        />
        
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 30, padding: '10px 20px', fontSize: '1.1rem', marginRight: 10, cursor: 'pointer', outline: 'none' }}
        >
          <option value="tracks">Tracks</option>
          <option value="albums">Albums</option>
          <option value="artists">Artists</option>
        </select>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ background: '#fff', color: '#000', border:'none', borderRadius: 30, padding: '12px 32px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          {loading ? '...' : 'GO'}
        </button>
      </form>
    </div>
  );
}