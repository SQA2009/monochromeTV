import React from "react";

function Results({ results }) {
  return (
    <div>
      {results.length === 0 ?
        <p>No results yet.</p>
        :
        <ul>
          {results.map((r, i) =>
            <li key={i}><a href={r.link} target="_blank" rel="noopener noreferrer">{r.title}</a></li>
          )}
        </ul>
      }
    </div>
  );
}

export default Results;