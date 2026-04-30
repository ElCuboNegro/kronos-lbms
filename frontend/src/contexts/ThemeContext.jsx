import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check local storage or default to dark mode
  const [theme, setTheme] = useState(() => localStorage.getItem('seymour_theme') || 'dark');

  useEffect(() => {
    // Apply the theme to the HTML root element
    document.documentElement.setAttribute('data-theme', theme);
    // Persist preference
    localStorage.setItem('seymour_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
