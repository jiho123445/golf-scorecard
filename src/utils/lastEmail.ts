const KEY = 'happy-golf-last-email';

/** 마지막으로 로그인/가입에 성공한 이메일을 기억해, 다음 방문 시 자동으로 채워준다. */
export function loadLastEmail(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveLastEmail(email: string) {
  try {
    localStorage.setItem(KEY, email.trim());
  } catch {
    // 저장 실패(프라이빗 모드 등)해도 로그인 자체에는 영향 없음
  }
}
