import React from 'react';

function ResultSection({ title, items, type, onPlay }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="section-title">{title}</div>
      <div className="horizontal-scroll-container">
        {items.map((item, i) => (
          <div 
            key={item.id || i} 
            className={`tv-card ${type === 'artists' ? 'artist' : ''}`} 
            tabIndex="0"
            // Generic click handler that does the right thing based on type passed from App.js
            onClick={() => {
               if (onPlay) onPlay(item);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onPlay) onPlay(item);
            }}
          >
            <div className="tv-card-img-wrapper">
              <img
                src={item.coverUrl || item.picture || "/svg-icons/album.svg"}
                alt=""
                onError={(e) => {e.target.src = "/svg-icons/album.svg"}}
              />
            </div>
            <div className="tv-card-title">
               {item.title || item.name}
            </div>
            <div className="tv-card-subtitle">
               {/* Terminology: Song -> Track */}
               {type === 'tracks' && (item.artist || "Track")}
               {type === 'albums' && (item.artist || "Album")}
               {type === 'artists' && "Artist"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Results({ title, items, type, tracks, albums, artists, onPlay }) {
  if (items) {
    return <ResultSection title={title} items={items} type={type} onPlay={onPlay} />;
  }
  return (
    <>
      <ResultSection title="Tracks" items={tracks} type="tracks" onPlay={onPlay} />
      <ResultSection title="Albums" items={albums} type="albums" onPlay={onPlay} />
      <ResultSection title="Artists" items={artists} type="artists" onPlay={onPlay} />
    </>
  );
}