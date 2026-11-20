// src/flow/loadProgress.js
// 3D 에셋 로딩 진행률을 App 과 Scene3D 사이에서 공유하는 작은 저장소.
// ※ 이 파일은 three 를 import 하지 않아요 → App 첫 번들이 무거워지지 않음.
//   three 의 LoadingManager 는 Scene3D 쪽에서 attachLoadingManager() 로 연결합니다.
import { useSyncExternalStore } from 'react'

let state = {
  started: false,   // 매니저가 한 번이라도 로딩을 시작했는지
  loaded: 0,        // 끝난 파일 수
  total: 0,         // 지금까지 발견된 파일 수 (GLTF 안의 텍스처 등이 발견되면 늘어남)
  done: false,      // 대기열이 전부 끝났는지 (onLoad)
  errors: [],       // 실패한 URL
}
const listeners = new Set()

function update(patch) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
const getSnapshot = () => state

/** Scene3D.jsx 모듈 맨 위에서 한 번 호출 (모델 로딩이 시작되기 전에) */
export function attachLoadingManager(manager) {
  manager.onStart = (_url, loaded, total) => {
    update({ started: true, done: false, loaded, total })
  }
  manager.onProgress = (_url, loaded, total) => {
    update({ loaded, total })
  }
  manager.onLoad = () => {
    update({ done: true, loaded: state.total })
  }
  manager.onError = (url) => {
    update({ errors: [...state.errors, url] })
  }
}

export function useLoadProgress() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
