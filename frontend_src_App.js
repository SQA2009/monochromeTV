import React, { useState } from "react";
import Search from "./Search";
import Results from "./Results";

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const doSearch = async (q) => {
    setLoading(true);
    try {
      const resp = await fetch(`/search?q=${encodeURIComponent(q)}`);
      const data = await resp.json();
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetch("/history").then(res => res.json()).then(data =>
      setHistory(Object.keys(data.history) || [])
    );
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Monochrome.TV Music Search</h1>
      <Search onSearch={doSearch} />
      {loading ? <div>Loading...</div> : <Results results={results} />}
      <h3>Recent Searches</h3>
      <ul>
        {history.map(q => <li key={q}>{q}</li>)}
      </ul>
    </div>
  );
}

export default App;