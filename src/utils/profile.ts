const KEY = 'happy-golf-profile-name';
// 이름을 한 번도 설정하지 않은 신규 회원에게 특정 인물의 이름이 보이면 안 되므로
// 기본값은 누구에게나 무난한 "골퍼"로 둔다.
export const DEFAULT_PROFILE_NAME = '골퍼';
export function loadProfileName(fallback: string = DEFAULT_PROFILE_NAME) { try { return localStorage.getItem(KEY)?.trim() || fallback; } catch { return fallback; } }
export function saveProfileName(name: string) { try { localStorage.setItem(KEY, name.trim()); } catch {} }
