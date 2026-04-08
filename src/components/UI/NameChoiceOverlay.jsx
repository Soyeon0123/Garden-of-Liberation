import { useState } from 'react'

export default function NameChoiceOverlay({ onChoice }) {
  const [hovered, setHovered] = useState(null)   // 'korean' | 'japanese' | null

  return (
    <div className="choice-overlay">

      <h1 className="choice-overlay__title">Choose your name</h1>

      <div className="choice-overlay__options">

        {/* 한글 이름 */}
        <div
          className={`choice-card ${hovered === 'korean' ? 'choice-card--hovered' : ''}`}
          onClick={() => onChoice('korean')}
          onMouseEnter={() => setHovered('korean')}
          onMouseLeave={() => setHovered(null)}
        >
          <img src="/typo/mison_namu.svg" alt="한글 이름" />
        </div>

        {/* 일본어 이름 */}
        <div
          className={`choice-card ${hovered === 'japanese' ? 'choice-card--hovered' : ''}`}
          onClick={() => onChoice('japanese')}
          onMouseEnter={() => setHovered('japanese')}
          onMouseLeave={() => setHovered(null)}
        >
          <img src="/typo/Uchiwa-noki.svg" alt="일본어 이름" />
        </div>

      </div>
    </div>
  )
}
