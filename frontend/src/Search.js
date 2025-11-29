import React, { useState } from "react";

function Search({ onSearch, onClear, loading }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("tracks");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (q) onSearch(q, type);
  };

  return (
    <div style={{
      position: "relative",
      marginBottom: 36,
      display: "flex",
      justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        gap: "38px",
        alignItems: "center",
        background:"#232b3a",
        padding:"32px 36px",
        borderRadius:"1.2em",
        boxShadow:"0 2px 30px #000c"
      }}>
        <input
          type="text"
          autoFocus
          placeholder="Search music…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{
            fontSize: "2.7rem",
            width: "430px",
            height: "70px",
            borderRadius: "18px",
            border: "2px solid #ffbf00",
            padding: "18px 34px",
            background: "#181c20",
            color: "#ffe",
            outline: "none"
          }}
          disabled={loading}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          style={{
            fontSize: "2.4rem",
            borderRadius: "14px",
            background: "#253244",
            color: "#f8e585",
            height:"70px",
            padding: "12px 40px",
            border: "2px solid #ffd242",
            outline:"none"
          }}
          disabled={loading}
        >
          <option value="tracks">Tracks</option>
          <option value="albums">Albums</option>
          <option value="artists">Artists</option>
        </select>
        <button type="submit" style={{
          fontSize: "2.6rem",
          borderRadius: "18px",
          background: "linear-gradient(90deg,#ffd580,#f5c358,#fea902)",
          color: "#232e37",
          padding: "18px 60px",
          fontWeight:"900",
          boxShadow:"0 2px 30px #ffd23955"
        }} disabled={loading}>
          🔎 Search
        </button>
      </form>
      <button
        onClick={onClear}
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          fontSize: "2.3rem",
          padding: "14px 32px",
          color: "white",
          background: "linear-gradient(90deg,#e00,#fd7320)",
          border: "none",
          borderRadius: "32px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 24px #000a"
        }}
        disabled={loading}
        title="Delete search history & cache"
      >
        🗑 CLEAR
      </button>
    </div>
  );
}

export default Search;