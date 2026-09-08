const KEY = 'happy-golf-profile-name';
export function loadProfileName(fallback = '김지호') { try { return localStorage.getItem(KEY)?.trim() || fallback; } catch { return fallback; } }
export function saveProfileName(name: string) { try { localStorage.setItem(KEY, name.trim()); } catch {} }
