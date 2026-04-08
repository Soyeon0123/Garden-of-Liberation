import { useState } from 'react'

// public/ 폴더 기준 직접 경로 — import 불필요
const nakaiImg  = '/UI/figure_illust/nakai.png'
const soyeonImg = '/UI/figure_illust/soyeon.png'

const DIALOGUES = [
  { character: 'Nakai',  text: 'Wait… who are you, miss?',                                   side: 'left'  },
  { character: 'Soyeon', text: 'Huh… where am I? I was just at Changdeokgung a moment ago…', side: 'right' },
  { character: 'Nakai',  text: 'This is the 1900s—back when I was studying plants in Joseon.',side: 'left'  },
  { character: 'Soyeon', text: 'But… it\'s 2025 right now.',                                  side: 'right' },
  { character: 'Nakai',  text: 'So you\'re… not Japanese, then.',                             side: 'left'  },
  { character: 'Soyeon', text: 'Who is this man…?',                                           side: 'right' },
]

export default function Chapter1InteractionOverlay({ onComplete }) {
  const [idx, setIdx] = useState(0)
  const current = DIALOGUES[idx]
  const speaker = current.character.toLowerCase()   // 'nakai' | 'soyeon'

  const handleClick = () => {
    if (idx < DIALOGUES.length - 1) {
      setIdx(i => i + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div className="overlay-fullscreen">

      {/* ── 왼쪽: Nakai ── */}
      <div className={`character-figure character-figure--left ${speaker === 'nakai' ? 'character-figure--active' : 'character-figure--inactive'}`}>
        <img src={nakaiImg} alt="Nakai" />
      </div>

      {/* ── 오른쪽: Soyeon ── */}
      <div className={`character-figure character-figure--right ${speaker === 'soyeon' ? 'character-figure--active' : 'character-figure--inactive'}`}>
        <img src={soyeonImg} alt="Soyeon" />
      </div>

      {/* ── 하단 대사창 ── */}
      <div className="dialogue-bar" onClick={handleClick}>

        <div className={`dialogue-bar__character dialogue-bar__character--${speaker}`}>
          {current.character}
        </div>

        <p className="dialogue-bar__text">
          {current.text}
        </p>

        <span className="dialogue-bar__next">
          {idx < DIALOGUES.length - 1 ? 'Click to continue ▶' : 'Click for next scene ▶'}
        </span>

        <span className="dialogue-bar__counter">
          {idx + 1} / {DIALOGUES.length}
        </span>

      </div>
    </div>
  )
}
