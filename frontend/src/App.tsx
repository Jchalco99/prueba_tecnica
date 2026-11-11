import * as React from 'react';
import { EquiposPage } from './pages/equipos/ui/equipos-page';

export function App() {
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem('flota_theme') === 'dark';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      window.localStorage.setItem('flota_theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('flota_theme', 'light');
    }
  }, [darkMode]);

  return (
    <EquiposPage
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode((prev) => !prev)}
    />
  );
}

export default App;
