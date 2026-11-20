// 임시 온보딩 화면 — 직접 제작하실 온보딩 페이지로 이 컴포넌트만 교체하면 됩니다
const BASE = import.meta.env.BASE_URL

export default function Onboarding({ onStart }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px',
      backgroundImage: `url(${BASE}images/Paper_tex_2.png)`, backgroundSize: 'cover',
      backgroundColor: 'var(--bg-color)',
    }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)', letterSpacing: '0.08em', margin: 0 }}>
        The Garden of Liberation
      </h1>
      <button
        type="button"
        onClick={onStart}
        style={{
          fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text)', background: 'transparent',
          border: '2px solid var(--corner-color)', borderRadius: 'var(--border-radius-sm)',
          padding: '14px 56px', cursor: 'pointer',
        }}
      >
        Start
      </button>
    </div>
  )
}
