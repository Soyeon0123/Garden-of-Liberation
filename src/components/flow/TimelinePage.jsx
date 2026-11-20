// 타임라인 — 데스크톱(크레딧에서 진입)과 모바일 페이지가 같은 내용을 공유
const BASE = import.meta.env.BASE_URL

// TODO: 실제 연도와 내용으로 교체해 주세요 (사료 확인 후)
export const TIMELINE_EVENTS = [
  { year: '1917', title: 'Discovery recorded', text: 'Event description' },
  { year: 'YYYY', title: 'Scientific name published', text: 'Event description' },
  { year: 'YYYY', title: 'Korean name recorded', text: 'Event description' },
]

export function TimelineContent() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-accent-gold)', marginBottom: 'var(--spacing-xl)' }}>
        Timeline
      </h1>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {TIMELINE_EVENTS.map((e, i) => (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '24px', padding: '20px 0', borderTop: '1px solid var(--secondary-color)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)' }}>{e.year}</span>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', margin: '0 0 8px' }}>{e.title}</h2>
              <p style={{ margin: 0, lineHeight: 1.8, opacity: 0.9 }}>{e.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <img src={`${BASE}infographic.png`} alt="Infographic" style={{ maxWidth: '100%', marginTop: 'var(--spacing-xl)', borderRadius: 'var(--border-radius-md)' }} />
    </div>
  )
}

export default function TimelinePage({ onBack }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', padding: '60px', background: 'var(--primary-color)', color: 'var(--bg-color)' }}>
      <button type="button" onClick={onBack} style={{ position: 'fixed', top: '32px', left: '40px', fontFamily: 'var(--font-body)', color: 'var(--bg-color)', background: 'transparent', border: '1px solid var(--color-accent-gold)', borderRadius: '20px', padding: '8px 20px', cursor: 'pointer' }}>
        Back to credits
      </button>
      <TimelineContent />
    </div>
  )
}
