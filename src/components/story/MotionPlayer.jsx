import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
// MotionPlayer — 챕터 모션그래픽/애니메이션 영상을 전체화면으로 재생
//   - 끝나면 천천히 어두워진 뒤 onComplete()
//   - 브라우저가 소리 있는 자동재생을 막으면 소리 없이 재생하고 "소리 켜기" 버튼을 보여줌
//   - allowSkip 이면 오른쪽 아래에 건너뛰기 버튼 (2회차 이상 / 개발 중)
// ─────────────────────────────────────────────────────────────

const FADE_MS = 600

export default function MotionPlayer({ src, onComplete, allowSkip = false }) {
  const videoRef = useRef(null)
  const doneRef  = useRef(false)
  const [muted,   setMuted]   = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [failed,  setFailed]  = useState(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setLeaving(true)
    setTimeout(() => onComplete?.(), FADE_MS)
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {
      // 소리 있는 자동재생이 막힌 경우 → 소리 끄고 재생
      v.muted = true
      setMuted(true)
      v.play().catch(() => {})
    })
  }, [src])

  const unmute = (e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    v.muted = false
    setMuted(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'black',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: leaving ? 0 : 1,
      transition: `opacity ${FADE_MS}ms ease`,
      animation: 'motionIn 0.6s ease both',
    }}>
      {!failed ? (
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="auto"
          onEnded={finish}
          onError={() => { console.warn('[MotionPlayer] 영상을 불러오지 못했어요:', src); setFailed(true) }}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <div onClick={finish} style={{ color: 'white', fontFamily: 'var(--font-body)', fontSize: '15px', opacity: 0.8, cursor: 'pointer', textAlign: 'center', lineHeight: 1.8 }}>
          The video could not be loaded.<br />Click to continue ▶
        </div>
      )}

      {muted && !failed && (
        <button onClick={unmute} style={btnStyle({ left: '32px' })}>🔊 Sound on</button>
      )}
      {allowSkip && !failed && (
        <button onClick={(e) => { e.stopPropagation(); finish() }} style={btnStyle({ right: '32px' })}>Skip ▶</button>
      )}

      <style>{`@keyframes motionIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  )
}

const btnStyle = (side) => ({
  position: 'absolute', bottom: '32px', ...side,
  padding: '10px 20px', borderRadius: '20px',
  background: 'rgba(0,0,0,0.55)', color: 'white',
  border: '1px solid rgba(255,255,255,0.35)',
  fontFamily: 'var(--font-body)', fontSize: '14px',
  cursor: 'pointer',
})
