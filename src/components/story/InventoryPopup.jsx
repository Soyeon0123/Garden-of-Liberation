import { useState } from 'react'
import { ITEMS } from '../../story/assets'

// ─────────────────────────────────────────────────────────────
// InventoryPopup — "Inventory Updated" 카드
//   아이템 그림 + 이름 + "is added into your inventory!" → 클릭하면 onComplete()
//   (인벤토리 페이지는 나중 단계에서 — 지금은 획득 알림만)
// ─────────────────────────────────────────────────────────────

const FADE_MS = 400

export default function InventoryPopup({ id, onComplete }) {
  const [leaving, setLeaving] = useState(false)
  const item = ITEMS[id]

  if (!item) console.warn(`[InventoryPopup] assets.js 의 ITEMS 에 "${id}" 가 없어요`)

  const next = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => onComplete?.(), FADE_MS)
  }

  return (
    <div
      onClick={next}
      style={{
        position: 'fixed', inset: 0, zIndex: 160,
        background: 'rgba(10, 8, 6, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        animation: 'invFade 0.4s ease both',
      }}
    >
      <div style={{
        position: 'relative',
        width: 'min(520px, 86vw)',
        padding: '28px 36px 30px',
        backgroundImage: 'var(--paper-tex-bg-2)', backgroundSize: 'cover', backgroundColor: 'var(--bg-color)',
        border: '2px solid var(--corner-color)', borderRadius: 'var(--border-radius-md)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
        textAlign: 'center',
        animation: 'invPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: 'var(--corner-size)', height: 'var(--corner-size)', borderTop: '3px solid var(--corner-color)', borderLeft: '3px solid var(--corner-color)' }} />

        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-sm, 14px)', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '16px' }}>
          Inventory Updated
        </div>

        {item?.image && (
          <img src={item.image} alt={item.name} style={{ display: 'block', margin: '0 auto 18px', maxWidth: '100%', maxHeight: '260px', objectFit: 'contain' }} />
        )}

        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-xl-bold)', fontSize: 'var(--font-size-xl)', color: 'var(--color-text)', fontStyle: 'italic' }}>
          {item?.name ?? id}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-md, 16px)', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          is added into your inventory!
        </div>
      </div>

      <style>{`
        @keyframes invFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes invPop  { from { opacity: 0; transform: scale(0.9) translateY(10px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  )
}
