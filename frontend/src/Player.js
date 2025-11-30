import React, { useState, useEffect, useRef } from "react";

export default function Player({ track, activeServerUrl, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  
  // New State for Audio Specs
  const [specs, setSpecs] = useState(null);

  useEffect(() => {
    if (!track) return;

    const resolveAudio = async () => {
      setLoading(true);
      setPlaying(false);
      setError(false);
      setAudioSrc(null);
      setSpecs(null);

      try {
        // Send the active server in headers
        const res = await fetch(`/stream/${track.id}`, {
          headers: { 'x-server-url': activeServerUrl }
        });
        const data = await res.json();

        if (data.link) {
          setAudioSrc(data.link);
          setSpecs(data.specs); // Capture the specs from backend
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Stream fetch failed", e);
        setError(true);
      }
      setLoading(false);
    };

    resolveAudio();
  }, [track, activeServerUrl]);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  if (!track) return null;

  const fmt = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  // Format Sample Rate (e.g., 44100 -> 44.1 kHz)
  const fmtHz = (hz) => {
    if (!hz) return "";
    return `${(hz / 1000).toFixed(1).replace('.0', '')} kHz`;
  };

  return (
    <div className="player-bar">
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => { setPlaying(false); onNext(); }}
          onError={() => { setError(true); setPlaying(false); }}
        />
      )}

      <div className="player-info">
        <div className="player-art-wrapper">
          <img src={track.coverUrl || track.picture || "/svg-icons/album.svg"} alt="" />
        </div>
        <div className="player-text">
          <div className="player-title">{track.title || track.name}</div>
          <div className="player-artist">
            {track.artist || "Unknown"}
          </div>
          
          {/* TECHNICAL DETAILS TAGS */}
          <div style={{marginTop: 4, display:'flex', gap: 6, alignItems:'center'}}>
             {loading && <span className="lossless-badge" style={{background:'#444'}}>LOADING...</span>}
             {error && <span className="lossless-badge" style={{background:'#E60023'}}>UNAVAILABLE</span>}
             
             {!loading && !error && specs && (
               <>
                 <span className={`lossless-badge ${specs.bitDepth > 16 ? 'tag-hires' : 'tag-lossless'}`}>
                    {specs.quality || "LOSSLESS"}
                 </span>
                 <span style={{fontSize:'0.7rem', color:'#888', fontWeight:'bold'}}>
                    {specs.bitDepth}-BIT / {fmtHz(specs.sampleRate)} {specs.audioMode}
                 </span>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="player-controls">
        <button className="control-btn small" onClick={onPrev}><img src="/svg-icons/prev.svg" alt="Prev" width={20} /></button>
        <button className="control-btn large" onClick={togglePlay} disabled={error||loading} style={{opacity:error?0.5:1}}>
          <img src={playing ? "/svg-icons/pause.svg" : "/svg-icons/play.svg"} alt="Play" />
        </button>
        <button className="control-btn small" onClick={onNext}><img src="/svg-icons/next.svg" alt="Next" width={20} /></button>
      </div>

      <div className="player-progress">
        <span className="time-text">{fmt(progress)}</span>
        <div className="progress-bar-bg">
          <div className="progress-fill" style={{ width: `${(progress / (duration || 1)) * 100}%` }} />
        </div>
        <span className="time-text">{fmt(duration)}</span>
      </div>
    </div>
  );
}