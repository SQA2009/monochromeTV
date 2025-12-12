import React, { useState, useEffect, useRef } from "react";

export default function Player({ track, onNext, onPrev }) {
  const audioRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0); 
  const [error, setError] = useState(false);
  
  const [specs, setSpecs] = useState(null);
  const [fixedDuration, setFixedDuration] = useState(null); 

  useEffect(() => {
    if (!track) return;

    const resolveAudio = async () => {
      setLoading(true);
      setPlaying(false);
      setError(false);
      setAudioSrc(null);
      setSpecs(null);
      setFixedDuration(null);

      try {
        const queryToUse = track.query || track.title;
        const targetTitle = track.exactTitle || track.title;
        
        const url = `/stream?q=${encodeURIComponent(queryToUse)}&title=${encodeURIComponent(targetTitle)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.link) {
          setAudioSrc(data.link);
          setSpecs(data.specs);
          // Parse duration "4:24" -> seconds
          if (data.metadata && data.metadata.duration) {
             const parts = data.metadata.duration.split(':');
             if (parts.length === 2) {
                 const min = parseInt(parts[0]);
                 const sec = parseInt(parts[1]);
                 if (!isNaN(min) && !isNaN(sec)) {
                     setFixedDuration(min * 60 + sec);
                 }
             }
          }
        } else {
          setError(true);
        }
      } catch (e) {
        console.error("Stream failed", e);
        setError(true);
      }
      setLoading(false);
    };

    resolveAudio();
  }, [track]);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
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
      if (!fixedDuration) {
          setDuration(audioRef.current.duration || 0);
      }
    }
  };

  if (!track) return null;

  const fmt = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const finalDuration = fixedDuration || duration;

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
          
          <div style={{marginTop: 4, display:'flex', gap: 6, alignItems:'center'}}>
             {loading && <span className="lossless-badge" style={{background:'#444'}}>LOADING...</span>}
             {error && <span className="lossless-badge" style={{background:'#E60023'}}>UNAVAILABLE</span>}
             
             {!loading && !error && specs && (
               <span className="lossless-badge tag-lossless">
                  {specs.quality || "LOSSLESS"}
               </span>
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
          <div className="progress-fill" style={{ width: `${(progress / (finalDuration || 1)) * 100}%` }} />
        </div>
        <span className="time-text">{fmt(finalDuration)}</span>
      </div>
    </div>
  );
}
