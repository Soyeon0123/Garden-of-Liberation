// src/capture/BackgroundCapture.jsx
// ─────────────────────────────────────────────────────────────
// 3D 배경 캡처 모드
//   주소 끝에 ?bg 를 붙이면 (예: http://localhost:5173/?bg)
//   웹툰·대화창·캐릭터 일러스트·standing 아이콘 없이 3D 공간만 보여주고,
//   P 키를 누르면 배경 이미지 + 3D 화면을 합친 PNG 를 저장해요.
//
//   P 키             : PNG 저장
//   F 키             : 저장 해상도 바꾸기 (1920×1080 FHD ↔ 2560×1440 QHD/2K)
//   1 / 2 / 3 / 0 키 : 배경 바꾸기 (Nakai_bg / Jang_bg / Paper_tex_2 / 투명)
//   H 키             : 안내 문구 숨기기·보이기 (안내 문구는 PNG 에 안 찍혀요)
//
//   주소로 시작값 정하기: ?bg=jang&size=2k  (bg: nakai·jang·paper·none / size: fhd·2k)
//
//   저장하는 순간에만 Scene3D 의 HiResCapture 가 3D 를 목표 해상도 이상으로
//   다시 그려요 → 1080p 모니터에서도 2K 가 선명하게 나와요.
// ─────────────────────────────────────────────────────────────
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'

const BASE = import.meta.env.BASE_URL

export const CAPTURE_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('bg')

const Scene3D = lazy(() => import('../components/3D/Scene3D'))

const BACKGROUNDS = {
  1: { name: 'nakai', src: `${BASE}images/Nakai_bg.png` },
  2: { name: 'jang',  src: `${BASE}images/Jang_bg.png` },
  3: { name: 'paper', src: `${BASE}images/Paper_tex_2.png` },
  0: { name: 'transparent', src: null },
}

// 저장 해상도 (16:9). 창 비율이 달라도 가운데 기준으로 잘라 정확히 이 크기로 저장해요.
const SIZES = {
  fhd:  { label: 'FHD',      w: 1920, h: 1080 },
  '2k': { label: '2K (QHD)', w: 2560, h: 1440 },
}

const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

function initialBgKey() {
  const v = params.get('bg')
  if (v === 'jang') return 2
  if (v === 'paper') return 3
  if (v === 'none' || v === 'transparent') return 0
  return 1
}

function initialSize() {
  const v = (params.get('size') || '').toLowerCase()
  return v === '2k' || v === 'qhd' || v === '1440' ? '2k' : 'fhd'
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// CSS 의 background-size: cover 와 똑같이 채워 그리기 (넘치는 부분은 가운데 기준으로 잘림)
function drawCover(ctx, src, srcW, srcH, w, h) {
  const scale = Math.max(w / srcW, h / srcH)
  const dw = srcW * scale
  const dh = srcH * scale
  ctx.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh)
}

export default function BackgroundCapture() {
  const [bgKey, setBgKey] = useState(initialBgKey)
  const [sizeKey, setSizeKey] = useState(initialSize)
  const [showHint, setShowHint] = useState(true)
  const [busy, setBusy] = useState(false)
  const captureRef = useRef(null)     // Scene3D 안의 HiResCapture 가 여기에 저장 함수를 넣어줌
  const bg = BACKGROUNDS[bgKey]
  const target = SIZES[sizeKey]

  useEffect(() => {
    const capture = async () => {
      if (busy) return
      if (!captureRef.current) { console.warn('[capture] 3D 공간이 아직 준비되지 않았어요'); return }
      setBusy(true)
      try {
        const out = document.createElement('canvas')
        out.width = target.w
        out.height = target.h
        const ctx = out.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // 배경 이미지를 먼저 불러와 깔고
        if (bg.src) {
          const img = await loadImage(bg.src)
          drawCover(ctx, img, img.width, img.height, out.width, out.height)
        }
        // 3D 를 고해상도로 다시 그린 순간의 화면을 위에 합치기
        let srcSize = ''
        await captureRef.current(target, (glCanvas) => {
          srcSize = `${glCanvas.width}×${glCanvas.height}`
          drawCover(ctx, glCanvas, glCanvas.width, glCanvas.height, out.width, out.height)
        })
        console.log(`[capture] 3D 렌더 ${srcSize} → 저장 ${out.width}×${out.height}`)

        const link = document.createElement('a')
        link.download = `garden-3d-${bg.name}-${out.width}x${out.height}-${Date.now()}.png`
        link.href = out.toDataURL('image/png')
        link.click()
      } finally {
        setBusy(false)
      }
    }

    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'p') capture()
      else if (k === 'h') setShowHint((s) => !s)
      else if (k === 'f') setSizeKey((s) => (s === 'fhd' ? '2k' : 'fhd'))
      else if (BACKGROUNDS[k]) setBgKey(Number(k))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bg, target, busy])

  return (
    <div style={{
      width: '100vw', height: '100vh',
      // 투명 모드일 땐 체크무늬로 투명 부분을 보여줌 (PNG 에는 안 찍힘)
      background: bg.src ? '#1a1410' : 'repeating-conic-gradient(#555 0% 25%, #777 0% 50%) 0 0 / 24px 24px',
    }}>
      {bg.src && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url(${bg.src})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      )}

      <Suspense fallback={null}>
        <Scene3D
          showNakaiIcon={false}
          showHyungdooIcon={false}
          onNakaiIconClick={() => {}}
          onHyungdooIconClick={() => {}}
          controlsEnabled={true}
          captureMode={true}
          captureRef={captureRef}
        />
      </Suspense>

      {showHint && (
        <div style={{
          position: 'fixed', top: 16, left: 16, zIndex: 9999,
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(0,0,0,0.6)', color: 'white',
          font: '13px/1.6 monospace', pointerEvents: 'none',
        }}>
          배경 캡처 모드 · 배경: <b>{bg.name}</b> · 저장 해상도: <b>{target.w}×{target.h}</b> ({target.label})
          {busy && <span style={{ color: '#ff8' }}> · 저장 중…</span>}<br />
          P 저장 · F 해상도 · 1 Nakai · 2 Jang · 3 Paper · 0 투명 · H 안내 숨기기
        </div>
      )}
    </div>
  )
}
