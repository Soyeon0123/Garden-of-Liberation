import { useEffect, useState } from 'react'
import { CUTSCENES } from '../../story/assets'
import { playVoice } from '../../story/voice'

// ─────────────────────────────────────────────────────────────
// CutScene — 컷신 일러스트 한 장을 전체화면으로 보여줌
//   천천히 나타남 → 클릭하면 사라지고 onComplete()
//   narration 이 있으면 그림 아래 자막으로 한 줄씩 → 마지막 줄 다음 클릭에 끝
//     narration = { who: 'Nakai', lines: ['…', '…'] }
// ─────────────────────────────────────────────────────────────

const FADE_MS = 500

export default function CutScene({ id, narration, onComplete }) {
  const [leaving, setLeaving] = useState(false)
  const [loaded,  setLoaded]  = useState(false)
  const [line,    setLine]    = useState(0)
  const src = CUTSCENES[id]
  const lines = narration?.lines ?? []

  if (!src) console.warn(`[CutScene] assets.js 의 CUTSCENES 에 "${id}" 가 없어요`)

  // 내레이션 한 줄마다 그 인물의 목소리
  useEffect(() => {
    if (lines.length) playVoice(narration.who, `${id}:${line}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line])

  const next = () => {
    if (leaving) return
    if (line < lines.length - 1) { setLine(line + 1); return }
    setLeaving(true)
    setTimeout(() => onComplete?.(), FADE_MS)
  }

  return (
    <div
      onClick={next}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        background: 'rgba(10, 8, 6, 0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px',
        cursor: 'pointer',
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        animation: 'cutsceneIn 0.6s ease both',
      }}
    >
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoaded(true)}
          style={{
            maxWidth: '86vw', maxHeight: lines.length ? '64vh' : '82vh', objectFit: 'contain',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'scale(1)' : 'scale(0.98)',
            transition: 'opacity 0.6s ease, transform 0.8s ease',
          }}
        />
      )}

      {/* 내레이션 자막 */}
      {lines.length > 0 && (
        <div style={{ width: 'min(900px, 84vw)', textAlign: 'center', color: 'var(--bg-color, #f3eadb)' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-md, 18px)', color: 'var(--color-accent-gold, #d9a441)', marginBottom: '8px', letterSpacing: '0.05em' }}>
            {narration.who}
          </div>
          <div key={line} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-lg, 20px)', lineHeight: 1.7, fontStyle: 'italic', animation: 'cutsceneLine 0.5s ease both' }}>
            {lines[line]}
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: '28px', left: 0, right: 0, textAlign: 'center',
        fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm, 14px)',
        color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em',
        animation: 'cutsceneHint 2.4s ease-in-out infinite',
      }}>
        {lines.length > 1 ? `${line + 1} / ${lines.length} · Click to continue` : 'Click to continue'}
      </div>

      <style>{`
        @keyframes cutsceneIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cutsceneLine { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
        @keyframes cutsceneHint { 0%,100% { opacity: .35 } 50% { opacity: .8 } }
      `}</style>
    </div>
  )
}
