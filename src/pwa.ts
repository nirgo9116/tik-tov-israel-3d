import { create } from 'zustand';

/** Install prompt saved by the browser (Chrome/Edge/Android), shown as an "install" button in the game. */
interface InstallState {
  prompt: any | null;
  installed: boolean;
}
export const useInstall = create<InstallState>(() => ({
  prompt: null,
  installed: typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches,
}));

export async function promptInstall() {
  const p = useInstall.getState().prompt;
  if (!p) return;
  p.prompt();
  const choice = await p.userChoice.catch(() => null);
  useInstall.setState({ prompt: null, installed: choice?.outcome === 'accepted' });
}

/** Register the offline worker only on the game's own site (not inside an embedded preview). */
export function setupPwa() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    useInstall.setState({ prompt: e });
  });
  window.addEventListener('appinstalled', () => useInstall.setState({ prompt: null, installed: true }));
  try {
    const topLevel = window.top === window.self;
    const secure = location.protocol === 'https:' || location.hostname === 'localhost';
    if ('serviceWorker' in navigator && topLevel && secure) {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    }
  } catch {
    // Embedded or restricted: the game still works, just without offline support
  }
}
