import React from 'react';

function ResultSection({ title, items, type }) {
  if (!items || items.length === 0 || (items.length === 1 && (items[0].name || items[0].title)?.includes("Demo - No results"))) {
    return (
      <div style={{ marginBottom: 34 }}>
        <h2 style={{ color: "#ffd242", fontSize: "2.6rem", marginBottom: 18 }}>{title}</h2>
        <span style={{ color: "#ccc", fontSize:"2.2rem" }}>No {title.toLowerCase()} found.</span>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: "2.8rem",
      padding: "22px 56px",
      background: "#262830",
      borderRadius: "2em",
      boxShadow: "0 4px 40px #090e",
      minHeight: "150px"
    }}>
      <h2 style={{
        color: "#ffd242",
        margin: "0 0 18px 0",
        fontWeight: "bold",
        fontSize: "2.7rem"
      }}>{title}</h2>
      <div style={{
        display: "flex", 
        flexWrap: "wrap", 
        gap: "52px", 
        justifyContent: "flex-start",
        alignItems: "flex-start"
      }}>
        {items.map((item, i) => (
          <div key={item.id || item.name || i} style={{
            background: "#191b22",
            borderRadius: "1em",
            padding: "36px 22px 18px 22px",
            width: "320px",
            minHeight: "180px",
            display: "flex",
            flexDirection:"column",
            alignItems: "center",
            boxShadow: "0 2px 32px #111d",
            outline: "none",
            transition: "box-shadow 0.2s",
          }}
          tabIndex={0}
          >
            <img
              src={item.coverUrl || item.picture || ""}
              alt=""
              width={148}
              height={148}
              style={{
                borderRadius: "1em",
                background: "#111",
                marginBottom: 18,
                boxShadow: "0 2px 30px #000b"
              }}
            />
            {type === 'tracks' && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
              color: "#54fff2", fontSize: "2.1rem", fontWeight:"bold", textDecoration:"none", marginBottom:"3px"
            }}>{item.title}</a>}
            {type === 'albums' && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
              color: "#ffd242", fontSize: "2.1rem", fontWeight:"bold", textDecoration:"none", marginBottom:"3px"
            }}>{item.title}</a>}
            {type === 'artists' && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
              color: "#ffd242", fontSize: "2.1rem", fontWeight:"bold", textDecoration:"none", marginBottom:"3px"
            }}>{item.name}</a>}
            <div style={{ color: "#b6ffcb", fontSize: "1.4rem", marginBottom: "6px" }}>
              {type === 'tracks' && item.artist && <>by <b>{item.artist}</b></>}
              {type === 'albums' && item.artist && <>by <b>{item.artist}</b></>}
            </div>
            <div style={{ color: "#e9e2bf", fontSize: "1.3rem" }}>
              {type === 'tracks' ? `Length: ${item.duration}s` : null}
              {type === 'albums' ? `Release: ${item.releaseDate}` : null}
              {type === 'tracks' || type === 'albums'
                ? <> {' | Popularity: '}<span style={{ fontWeight: 600 }}>{item.popularity}</span></>
                : null}
              {item.explicit ? <> <span style={{ color: "#e00", marginLeft: 8, fontWeight: "bold" }}>EXPLICIT</span></> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Results({
  tracks = [],
  albums = [],
  artists = [],
  loading,
  error
}) {
  if (loading) return <div style={{ color: "#ffd242", fontSize: "3rem", textAlign: "center", margin: "50px 0" }}>Loading…</div>;
  if (error) return <div style={{ color: "#e00", fontWeight: "bold", fontSize: "2.2rem", textAlign: "center", margin: "40px 0" }}>{error}</div>;

  return (
    <div>
      <ResultSection title="Tracks" items={tracks} type="tracks" />
      <ResultSection title="Albums" items={albums} type="albums" />
      <ResultSection title="Artists" items={artists} type="artists" />
    </div>
  );
}