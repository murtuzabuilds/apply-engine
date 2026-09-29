import { useEffect, useState } from 'react';
// localStorage-backed state that fails quietly in private mode
export function usePersisted(key, initial) {
  const [v, set] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, set];
}
