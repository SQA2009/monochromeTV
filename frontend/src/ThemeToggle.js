import React from 'react';
// expects moon.svg and sun.svg in /public/svg-icons/
export default function ThemeToggle({ theme, setTheme }) {
  const icon = theme === "dark" ? "moon" : "sun";
  return (
    <button
      className="md-icon-btn"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{ marginLeft: "auto", marginRight: "18px" }}
    >
      <img src={`/svg-icons/${icon}.svg`} width={32} height={32} alt={`${icon} icon`} />
    </button>
  );
}