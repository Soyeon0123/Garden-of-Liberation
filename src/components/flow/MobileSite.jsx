// 모바일 전용 페이지 — 전시장 QR로 들어온 관람객의 첫 화면
// 3D 리소스를 불러오지 않고, 소개 + "컴퓨터에서 이어보기" + 타임라인을 보여줌
import { useState } from 'react'
import { TimelineContent } from './TimelinePage'

const SITE_URL = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''

function ContinueOnDesktop() {
  const [status, setStatus] = useState('')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL)
      setStatus('Link copied')
    } catch {
      setStatus('Copy failed. Select the link above and copy it.')
    }
  }

  const handleShare = async () => {
    // 휴대폰 공유창(카카오톡, 메일, 메모 등)으로 링크를 자신에게 보냄
    if (navigator.share) {
      try {
        await navigator.share({ title: 'The Garden of Liberation', text: 'Open this link on a computer to play.', url: SITE_URL })
      } catch { /* 사용자가 공유를 취소한 경우 */ }
      return
    }
    handleCopy() // 공유 기능이 없는 브라우저는 링크 복사로 대체
  }

  const btn = {
    fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-md)',
    color: 'var(--bg-color)', background: 'transparent',
    border: '1px solid var(--color-accent-gold)', borderRadius: '24px',
    padding: '12px 24px', cursor: 'pointer',
  }

  return (
    <section style={{ maxWidth: '760px', margin: '0 auto 56px', padding: '24px', border: '1px solid var(--color-accent-gold)', borderRadius: 'var(--border-radius-md)' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)', margin: '0 0 12px' }}>
        Play the full story on a computer
      </h2>
      <p style={{ lineHeight: 1.8, margin: '0 0 16px', opacity: 0.9 }}>
        The interactive 3D garden runs in a desktop browser. Send this link to yourself and open it later.
      </p>
      <p style={{ wordBreak: 'break-all', userSelect: 'all', margin: '0 0 20px', opacity: 0.8 }}>
        {SITE_URL}
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button type="button" style={btn} onClick={handleShare}>Send link to myself</button>
        <button type="button" style={btn} onClick={handleCopy}>Copy link</button>
      </div>
      <p role="status" style={{ minHeight: '1.5em', margin: '12px 0 0', opacity: 0.8 }}>{status}</p>
    </section>
  )
}

export default function MobileSite() {
  return (
    <main style={{ minHeight: '100dvh', padding: '48px 24px', background: 'var(--primary-color)', color: 'var(--bg-color)', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}>
      <header style={{ maxWidth: '760px', margin: '0 auto 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-accent-gold)', margin: '0 0 16px' }}>
          The Garden of Liberation
        </h1>
        <p style={{ lineHeight: 1.8, margin: 0 }}>
          {/* TODO: 작품 소개 문구 */}
          Project introduction goes here.
        </p>
      </header>
      <ContinueOnDesktop />
      <TimelineContent />
    </main>
  )
}
