import { useSyncExternalStore } from 'react';

const darkModeQuery = '(prefers-color-scheme: dark)';

const subscribeToDarkMode = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(darkModeQuery);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
};

export const useIsDarkMode = () =>
  useSyncExternalStore(
    subscribeToDarkMode,
    () => window.matchMedia(darkModeQuery).matches,
    () => false
  );
