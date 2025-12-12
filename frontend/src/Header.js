import React from "react";

export default function Header({ view, onBack }) {
  const showBack = view === 'album' || view === 'artist';
  const hideOnSettings = view === 'settings';

  return (
    <header className="top-header transparent-header">
      {/* Back island: only render the island when the back button should exist */}
      {showBack && !hideOnSettings && (
        <div className="header-island material-island with-top-margin">
          <button
            className="nav-btn header-back"
            style={{ width: 48, height: 48, margin: 0, background: '#222' }}
            onClick={onBack}
            aria-label="Go back"
            title="Back"
          >
            <img src="/svg-icons/back.svg" style={{ width: 20, height: 20 }} alt="back" />
          </button>
        </div>
      )}

      <div className="header-island material-island with-top-margin">
        <div className="user-pill">
          <img
            src="/svg-icons/user.svg"
            alt="User"
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#333', padding: 4 }}
          />
          <span style={{ marginRight: 8 }}>My Profile</span>
        </div>
      </div>
    </header>
  );
}