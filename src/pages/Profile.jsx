import { useEffect, useState } from 'react';
import './Settings.css';              // optional, keeps page-specific styles

export default function Settings() {
  /* ---- persistent theme ---- */
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark',  dark);
    document.documentElement.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  /* ---- global font scale ---- */
  const [font, setFont] = useState(() =>
    Number(localStorage.getItem('fontScale')) || 1
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--vp-font-scale', font);
    localStorage.setItem('fontScale', font);
  }, [font]);

  return (
    <div className="container">
      <h1>Settings</h1>

      {/* theme switch */}
      <section>
        <h2>Appearance</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
          />
          <span className="slider" /> {/* purely cosmetic */}
          <span>{dark ? 'Dark mode' : 'Light mode'}</span>
        </label>
      </section>

      {/* font slider */}
      <section>
        <h2>Font size</h2>
        <input
          type="range"
          min="0.8"
          max="1.4"
          step="0.05"
          value={font}
          onChange={e => setFont(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <p style={{ marginTop: 8 }}>
          {Math.round(font * 100)} % of default
        </p>
      </section>
    </div>
  );
}
