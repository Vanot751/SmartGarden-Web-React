import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Tema inicial: 'pastel' (Pastel Minimalism) o 'oled' (True Black #000000)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartgarden_theme') || 'pastel';
  });

  useEffect(() => {
    localStorage.setItem('smartgarden_theme', theme);
    const root = document.documentElement;
    if (theme === 'oled') {
      root.classList.add('dark', 'oled');
      root.style.backgroundColor = '#000000';
    } else {
      root.classList.remove('dark', 'oled');
      root.style.backgroundColor = '#F5F5F0';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'pastel' ? 'oled' : 'pastel'));
  };

  const isOled = theme === 'oled';

  return (
    <ThemeContext.Provider value={{ theme, isOled, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}

