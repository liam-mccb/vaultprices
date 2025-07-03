// src/hooks/useDark.js
import { useState, useEffect } from 'react';

export default function useDark() {
  const [dark, setDark] = useState(() => {
    // first load: localStorage → else OS preference
    const saved = localStorage.getItem('theme');
    if (saved === 'dark')   return true;
    if (saved === 'light')  return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark',  dark);
    root.classList.toggle('light', !dark);   // 💡 keeps light tokens in place
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
}
