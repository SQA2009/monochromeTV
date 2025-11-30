import React from "react";

export default function History({ history }) {
  if (!history || history.length === 0) {
    return <div style={{color:'#666', fontSize:'1.2rem', fontStyle:'italic'}}>No recent history</div>;
  }
  
  return (
    <div>
      <div style={{color: '#aaa', marginBottom: 16, fontWeight: 'bold', fontSize: '1rem'}}>RECENT SEARCHES</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {history.map((q, i) => (
          <div 
            key={i} 
            tabIndex="0"
            className="history-chip"
            style={{
              background: "#333",
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 50,
              fontSize: "1.1rem",
              cursor: "pointer",
              border: "2px solid transparent",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
               e.target.style.background = "#fff";
               e.target.style.color = "#000";
            }}
            onBlur={(e) => {
               e.target.style.background = "#333";
               e.target.style.color = "#fff";
            }}
          >
            {q}
          </div>
        ))}
      </div>
    </div>
  );
}