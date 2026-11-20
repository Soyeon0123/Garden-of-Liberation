// ─────────────────────────────────────────────────────────────
// assetProgress.js — 3D 파일 로딩 진행 상황을 세는 작은 저장소
//
//   three.js 의 LoadingManager 는 파일을 받기 시작할 때 itemStart(url),
//   다 받으면(실패해도) itemEnd(url) 를 불러요. 그 두 함수를 살짝 감싸서 개수를 셉니다.
//
//   onStart/onProgress/onLoad 를 덮어쓰지 않고 이렇게 감싸는 이유
//     1) 그 자리는 하나뿐이라 drei 의 useProgress 등 다른 코드와 서로 덮어쓰게 돼요.
//        itemStart/itemEnd 를 감싸는 방식은 누가 onLoad 를 바꾸든 영향을 받지 않아요.
//        (예전 flow/loadProgress.js 의 역할을 이 파일이 대신해요)
//     2) 이 파일은 three 를 import 하지 않아서, App 첫 화면 번들에 three·drei 가 끼어들지 않아요.
//        (매니저는 Scene3D.jsx 가 불러와질 때 trackLoadingManager 로 넘겨줘요)
// ─────────────────────────────────────────────────────────────
import { useSyncExternalStore } from 'react'

// 로딩 화면이 기다리지 않을 파일 — 환경광(HDR/EXR)은 Scene3D 에서 일부러 따로 받게 해 두었으니 제외
const NON_BLOCKING = [/\.hdr(\?|#|$)/i, /\.exr(\?|#|$)/i]

const isBlocking = (url) => !(typeof url === 'string' && NON_BLOCKING.some((re) => re.test(url)))

const pending = new Map()   // url → 받는 중인 개수
const errors  = []          // 실패한 url
let started  = 0
let finished = 0
let snapshot = { started: 0, finished: 0, pending: 0 }
const listeners = new Set()

function emit() {
  let count = 0
  pending.forEach((n) => { count += n })
  snapshot = { started, finished, pending: count }
  listeners.forEach((l) => l())
}

const tracked = new WeakSet()

export function trackLoadingManager(manager) {
  if (!manager || tracked.has(manager)) return
  tracked.add(manager)

  const origStart = manager.itemStart.bind(manager)
  const origEnd   = manager.itemEnd.bind(manager)
  const origError = manager.itemError.bind(manager)

  // 실패한 파일 기록 (three 는 실패해도 itemEnd 를 불러서 로딩 화면이 멈추지는 않아요)
  manager.itemError = (url) => {
    errors.push(url)
    if (import.meta.env?.DEV) console.warn('[assetProgress] 불러오기 실패:', url)
    origError(url)
  }

  manager.itemStart = (url) => {
    if (isBlocking(url)) {
      started++
      pending.set(url, (pending.get(url) || 0) + 1)
      emit()
    }
    origStart(url)
  }

  manager.itemEnd = (url) => {
    origEnd(url)
    const n = pending.get(url)
    if (n) {
      if (n === 1) pending.delete(url)
      else pending.set(url, n - 1)
      finished++
      emit()
    }
  }
}

// 개발용: 지금 받고 있는(끝나지 않은) 파일 목록 / 실패한 파일 목록
export const getPendingUrls = () => [...pending.keys()]
export const getFailedUrls  = () => [...errors]

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
const getSnapshot = () => snapshot

export function useAssetProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
