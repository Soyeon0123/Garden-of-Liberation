// 2회차부터 보이는 건너뛰기 버튼 (만화·대화 클릭과 겹치지 않게 최상단에 배치)
export default function SkipButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      style={{
        position: 'fixed', top: '32px', right: '40px', zIndex: 10001,
        fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)',
        color: 'var(--bg-color)', background: 'rgba(0,0,0,0.55)',
        border: '1px solid var(--color-accent-gold)', borderRadius: '20px',
        padding: '10px 20px', cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
