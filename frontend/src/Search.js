import React, { useState } from "react";

function Search({ onSearch }) {
  const [q, setQ] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (q) onSearch(q);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search music..."
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{ fontSize: 24, width: 300 }}
      />
      <button type="submit" style={{ fontSize: 24 }}>Search</button>
    </form>
  );
}

export default Search;
