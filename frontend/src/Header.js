import React from "react";

export default function Header() {
  return (
    <header className="top-header">
      <div style={{display:'flex', gap:20}}>
         <button className="nav-btn" style={{width:40, height:40, margin:0, background: '#222'}}>
            <img src="/svg-icons/track.svg" style={{width:16, height:16}} alt="back" />
         </button>
      </div>
      
      <div className="user-pill">
        <img 
          src="/svg-icons/user.svg" 
          alt="User" 
          style={{width:32, height:32, borderRadius:'50%', background:'#333', padding:4}} 
        />
        <span style={{marginRight:8}}>My Profile</span>
      </div>
    </header>
  );
}