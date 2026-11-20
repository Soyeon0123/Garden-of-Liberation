// 크레딧 — 자동으로 처음으로 돌아가지 않고, 타임라인 보기 / 다시 시작을 직접 선택
export default function CreditsScreen({ onTimeline, onRestart }) {
  const btn = {
    fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-md)',
    color: 'var(--bg-color)', background: 'transparent',
    border: '1px solid var(--color-accent-gold)', borderRadius: '24px',
    padding: '12px 32px', cursor: 'pointer',
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', padding: '60px', background: 'var(--primary-color)', color: 'var(--bg-color)', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-accent-gold)', marginBottom: 'var(--spacing-xl)' }}>
          The Garden of Liberation
        </h1>

        <section style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'left' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>참고 문헌 & 사료</h2>
          <ul style={{ lineHeight: 2.2, fontSize: 'var(--font-size-md)', opacity: 0.9 }}>
            <li>참고문헌 1: 제목, 저자, 출판사</li>
            <li>참고문헌 2: 제목, 저자, 출판사</li>
            <li>참고문헌 3: 제목, 저자, 출판사</li>
            <li>사료 1: 출처 및 설명</li>
            <li>사료 2: 출처 및 설명</li>
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Credits</h2>
          <p style={{ opacity: 0.9 }}>Created by —</p>
        </section>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button type="button" style={btn} onClick={onTimeline}>View timeline</button>
          <button type="button" style={btn} onClick={onRestart}>Restart</button>
        </div>
      </div>
    </div>
  )
}
