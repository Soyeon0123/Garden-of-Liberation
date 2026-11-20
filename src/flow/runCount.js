// 회차 기록: localStorage에 저장 → 탭을 닫거나 며칠 뒤 다시 와도 유지
// (같은 컴퓨터, 같은 브라우저 기준. 시크릿 모드에서는 창을 닫으면 초기화됨)
const KEY = 'gol_completed_runs'

export function getCompletedRuns() {
  try { return Number(localStorage.getItem(KEY)) || 0 } catch { return 0 }
}

export function addCompletedRun() {
  const next = getCompletedRuns() + 1
  try { localStorage.setItem(KEY, String(next)) } catch { /* 저장 실패 시 이번 접속에서만 반영 */ }
  return next
}

// 테스트용: 브라우저 콘솔에서 localStorage.removeItem('gol_completed_runs') 로도 초기화 가능
export function resetCompletedRuns() {
  try { localStorage.removeItem(KEY) } catch { /* noop */ }
}
