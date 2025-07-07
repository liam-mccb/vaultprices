import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import './Settings.css';

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

        {/* ––– dark-mode slider ––– */}
        <label className="theme-switch">
            {/* the real control (visually hidden, still keyboard-accessible) */}
            <input
            type="checkbox"
            checked={dark}
            onChange={e => setDark(e.target.checked)}
            aria-label="Toggle dark mode"
            />

            {/* track + thumb */}
            <span className="toggle" aria-hidden="true" />

            {/* caption (always shown) */}
            <span>Dark mode</span>
        </label>
        </section>

      {/* font slider  +  preview row */}
      <section className="font-scale">
        <h2>Font size</h2>

        <div className="slider-wrapper">
          {/* preview letters */}
          <div className="preview-row">
            {Array.from({ length: 14 }, (_, i) => (0.7 + i * 0.1).toFixed(2))
                .map(scale => (
                <span
                    key={scale}
                    className={
                    Math.abs(font - scale) < 0.001 ? 'preview active' : 'preview'
                    }
                    style={{ fontSize: `${16 * scale}px` }}
                >
                    A
                </span>
                ))}
        </div>

          {/* range with built-in ticks */}
          <input
            type="range"
            min="0.7"
            max="2.0"
            step="0.1"
            value={font}
            onChange={e => setFont(Number(e.target.value))}
            list="font-ticks"
          />
          <datalist id="font-ticks">
            {Array.from({ length: 14 }, (_, i) => (
              <option key={i} value={(0.7 + i * 0.1).toFixed(2)} />
            ))}
          </datalist>
        </div> {/* ── slider-wrapper ── */}

        <p className="percent">{Math.round(font * 100)} %</p>
      </section>
    </div>
  );
}
