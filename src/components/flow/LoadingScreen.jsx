import { useEffect, useRef, useState } from 'react'
import { useAssetProgress, getPendingUrls } from '../../flow/assetProgress'
import './LoadingScreen.css'

// ─────────────────────────────────────────────────────────────
// LoadingScreen
//   3D 공간(Scene3D)이 준비될 때까지 덮어 두는 로딩 화면.
//
//   진행률은 flow/assetProgress.js 에서 읽어요.
//   (three.js LoadingManager 의 itemStart/itemEnd 를 세는 방식 — 모델·Draco·텍스처 전부 집계,
//    환경광 HDR 은 제외)
//
//   "끝났다" 의 기준은 두 가지가 모두 참일 때:
//     1) sceneMounted : Scene3D 코드 조각(lazy)이 내려받아져 화면에 붙음
//     2) pending === 0 : 받는 중인 파일이 없음
// ─────────────────────────────────────────────────────────────

const SETTLE_MS    = 500     // 다 받은 것 같아도 다음 파일이 이어서 시작될 수 있어 잠깐 지켜보는 시간
const HOLD_MS      = 600     // 100% 와 꽃이 다 핀 모습을 잠깐 보여주는 시간
const FADE_MS      = 700     // 사라지는 시간 (LoadingScreen.css 의 --loader-fade 와 맞추기)
const FAST_MS      = 450     // 이 시간 안에 끝나면(이미 미리 받아 둔 경우) 로딩 화면 없이 바로 넘어감
const SCENE_MAX_MS = 20000   // Scene3D 가 붙은 뒤에도 파일이 안 끝나면 이만큼 기다린 뒤 넘어감
const HARD_MAX_MS  = 40000   // 무슨 일이 있어도 이 시간이 지나면 로딩 화면을 걷음

// 가지를 따라 피는 미선나무 꽃 — at: 이 진행률(%)에 닿으면 핌
const BLOSSOMS = [
  { x: 85,  y: 117, s: 0.9,  r: 10,  at: 12 },
  { x: 170, y: 93,  s: 1.05, r: -8,  at: 32 },
  { x: 259, y: 86,  s: 0.85, r: 20,  at: 52 },
  { x: 323, y: 65,  s: 1.1,  r: 0,   at: 72 },
  { x: 376, y: 38,  s: 0.95, r: -15, at: 92 },
]

function Blossom({ x, y, s, r, open }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <g className={`loader-blossom${open ? ' is-open' : ''}`}>
        {[0, 90, 180, 270].map((deg) => (
          <ellipse key={deg} className="loader-petal" cx="0" cy="-8" rx="4.6" ry="8" transform={`rotate(${deg})`} />
        ))}
        <circle className="loader-heart" r="2.6" />
      </g>
    </g>
  )
}

// Scene3D 와 같은 <Suspense> 안에 넣어 두는 신호 컴포넌트.
// Scene3D 코드가 내려받아져 화면에 붙은 뒤에야 이 effect 가 실행돼요.
export function SceneMountedSignal({ onMounted }) {
  useEffect(() => { onMounted() }, [onMounted])
  return null
}

export default function LoadingScreen({ sceneMounted, onFinished }) {
  const { started, finished, pending } = useAssetProgress()
  const [phase, setPhase]       = useState('loading')   // loading → complete → leaving
  const [percent, setPercent]   = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  const mountedAt   = useRef(performance.now())
  const base        = useRef({ started, finished })     // 이 화면이 뜨기 전까지의 개수
  const finishRef   = useRef(onFinished)
  finishRef.current = onFinished

  // 진행률: 이 화면이 뜬 뒤 기준으로 계산하고, 뒤로 가지 않게 함
  useEffect(() => {
    const todo = started - base.current.finished      // 화면이 뜰 때 받던 것 + 그 뒤에 시작된 것
    if (todo <= 0) return
    const done = finished - base.current.finished
    const next = Math.round((done / todo) * 100)
    setPercent((p) => Math.max(p, Math.min(next, 99)))
  }, [started, finished])

  // 끝났는지 확인
  const ready = (sceneMounted && pending === 0) || timedOut
  useEffect(() => {
    if (!ready || phase !== 'loading') return
    const t = setTimeout(() => {
      setPercent(100)
      const fast = performance.now() - mountedAt.current < FAST_MS + SETTLE_MS
      setPhase(fast ? 'leaving' : 'complete')
    }, SETTLE_MS)
    return () => clearTimeout(t)
  }, [ready, phase])

  useEffect(() => {
    if (phase === 'complete') {
      const t = setTimeout(() => setPhase('leaving'), HOLD_MS)
      return () => clearTimeout(t)
    }
    if (phase === 'leaving') {
      const t = setTimeout(() => finishRef.current?.(), FADE_MS)
      return () => clearTimeout(t)
    }
  }, [phase])

  // 안전장치: Scene3D 가 붙은 뒤 SCENE_MAX_MS, 또는 화면이 뜬 뒤 HARD_MAX_MS 가 지나면 그냥 넘어감
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), sceneMounted ? SCENE_MAX_MS : HARD_MAX_MS)
    return () => clearTimeout(t)
  }, [sceneMounted])

  // 개발 중에만: 진행 상황과, 시간 초과 시 끝나지 않은 파일을 콘솔에 남김
  useEffect(() => {
    if (!import.meta.env.DEV) return
    console.log('[LoadingScreen]', { sceneMounted, started, finished, pending })
  }, [sceneMounted, started, finished, pending])
  useEffect(() => {
    if (import.meta.env.DEV && timedOut) {
      console.warn('[LoadingScreen] 시간 초과로 넘어갔어요. 끝나지 않은 파일:', getPendingUrls())
    }
  }, [timedOut])

  const caption = percent === 0
    ? 'Preparing the garden…'
    : phase === 'loading'
      ? 'Following the fragrance of the miseon blossoms…'
      : 'The garden is ready.'

  return (
    <div
      className={`loading-screen${phase === 'leaving' ? ' is-leaving' : ''}`}
      role="progressbar"
      aria-label="Loading the 3D garden"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="loading-content">
        <svg className="loader-branch" viewBox="0 0 400 150" aria-hidden="true">
          {/* 진행률만큼 자라는 가지 */}
          <path
            className="loader-branch-path"
            pathLength="100"
            d="M 20 128 C 100 124, 150 86, 220 88 C 290 90, 330 60, 384 34"
            style={{ strokeDashoffset: 100 - percent }}
          />
          {BLOSSOMS.map((b) => (
            <Blossom key={b.at} {...b} open={percent >= b.at} />
          ))}
        </svg>

        <div className="loading-percent">{percent}%</div>
        <div className="loading-caption">{caption}</div>
      </div>
    </div>
  )
}
