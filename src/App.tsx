import { Theme } from '@consta/uikit/Theme';
import classes from './App.module.css';
import { presetBarbashDesignDefault } from './barbashDesign/presets/presetBarbasDesignDefault';
import { presetBarbashDesignDark } from './barbashDesign/presets/presetBarbashDesignDark'
import AppRouter from './routers/AppRouter';
import { useEffect, useState } from 'react';

function App() {

  const [themePreset, setThemePreset] = useState(presetBarbashDesignDefault);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setThemePreset(presetBarbashDesignDark);
      } else {
        setThemePreset(presetBarbashDesignDefault);
      }
    };

    // Задаем начальную тему
    handleThemeChange(mediaQuery as unknown as MediaQueryListEvent);

    // Добавляем слушатель изменений
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
}, []);

  return (
      <Theme preset={themePreset} className={classes.BarbaShlyakhov}>
        <div style={{width: '100vw', height: '100vh', backgroundColor: 'var(--color-bg-green)'}}>
           <AppRouter/>
        </div>
         
      </Theme>
  );
}

export default App;
