import { debug } from 'utils/env';

export const sandbox =
  debug.auth ||
  import.meta.env.VITE_SANDBOX === 'true' ||
  navigator.userAgent.includes('Electron');
