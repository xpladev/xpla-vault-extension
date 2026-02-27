export const debug = {
  query: import.meta.env.DEV && import.meta.env.VITE_DEBUG_QUERY === 'true',
  translation:
    import.meta.env.DEV && import.meta.env.VITE_DEBUG_TRANSLATION === 'true',
  theme: import.meta.env.DEV && import.meta.env.VITE_DEBUG_THEME === 'true',
  auth: import.meta.env.DEV && import.meta.env.VITE_ELECTRON === 'true',
};
