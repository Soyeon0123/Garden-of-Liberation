import React, { Suspense, lazy, useState, useRef, useEffect, useCallback } from 'react'
import './styles/tokens.css'
import './styles/comic.css'

// ─── 진행 흐름 (새로 추가) ─────────────────────────────────────
import { STAGES, CHAPTER_STAGES, FULLSCREEN_STAGES } from './flow/stages'
import { getCompletedRuns, addCompletedRun } from './flow/runCount'
import SkipButton     from './components/flow/SkipButton'
import Onboarding     from './components/flow/Onboarding'
import EndingCutscene from './components/flow/EndingCutscene'
import CreditsScreen  from './components/flow/CreditsScreen'
import TimelinePage   from './components/flow/TimelinePage'
import LoadingScreen, { SceneMountedSignal } from './components/flow/LoadingScreen'

// ─── 에셋 경로 모음 (개발 중엔 콘솔에서 checkAssets() 로 빠진 파일 확인) ───
import { CHOICE_TO_ENDING, ENDINGS, MOTION, getFigure } from './story/assets'
import { useImagePreload } from './flow/imagePreload'
import MotionPlayer from './components/story/MotionPlayer'
import ScenePlayer from './components/story/ScenePlayer'
import MoodOverlay from './components/story/MoodOverlay'
import BgmPlayer from './components/story/BgmPlayer'
import { playVoice, playVoices } from './story/voice'
import { pickBgm } from './story/bgm'

// ─── 대본 (Narrative Design V4) — 장면별 파일은 src/story/chapters/ ───
import arrivalScene from './story/chapters/arrival'
import chapter1Scene from './story/chapters/chapter1'
import chapter1AfterScene from './story/chapters/chapter1After'
import chapter2IntroScene from './story/chapters/chapter2Intro'
import chapter2Scene from './story/chapters/chapter2'
import chapter2AfterScene from './story/chapters/chapter2After'
import chapter3Scene from './story/chapters/chapter3'
import chapter3AfterScene from './story/chapters/chapter3After'
import endingUchiwaScene from './story/endings/uchiwa'
import endingScientificScene from './story/endings/scientific'
import endingEnglishScene from './story/endings/english'
import endingTrueScene from './story/endings/true'

// 이름 선택 → 엔딩 대본
const ENDING_SCENES = {
  japanese:   endingUchiwaScene,       // Ending (1) The Objectified Name
  scientific: endingScientificScene,   // Ending (2) Universal Authority
  english:    endingEnglishScene,      // Ending (3) A Compromised World
  korean:     endingTrueScene,         // True Ending
}

// ─── 3D 배경 캡처 모드 (?bg) ─────────────────────────────────
import BackgroundCapture, { CAPTURE_MODE } from './capture/BackgroundCapture'

const BASE = import.meta.env.BASE_URL

// ─── 3D 공간 (따로 내려받기) ──────────────────────────────────
// three.js·모델·꽃 등 3D 관련 코드는 components/3D/Scene3D.jsx 로 옮겼어요.
const Scene3D     = lazy(() => import('./components/3D/Scene3D'))
const Scene3DPrep = lazy(() => import('./components/3D/Scene3D').then((m) => ({ default: m.Scene3DPrep })))

// ※ STAGES 정의는 ./flow/stages.js 로 이동했습니다.

const ACTIVE_OUTLINE = `
  drop-shadow(2px 0px 0px #ffffff)
  drop-shadow(-2px 0px 0px #ffffff)
  drop-shadow(0px 2px 0px #ffffff)
  drop-shadow(0px -2px 0px #ffffff)
`

const BOX_MARGIN = 50

// ─────────────────────────────────────────────────────────────
// 대사 데이터 → 모두 src/story/ 로 옮김 (Narrative Design V4)
//   정원 도착·1~3장 : src/story/chapters/   엔딩 4개 : src/story/endings/
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 인트로 컷 데이터  ─ cut_01 ~ cut_27, 3컷씩 9페이지
// ─────────────────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2, '0')

const PANEL_WIDTH = 'calc((100vw - 120px) / 3)'

// 말풍선에 voice: '이름' 을 적으면 말풍선이 나올 때 그 목소리가 재생돼요 (story/voice.js)
//   외국인 커플 : 'foreign'   /   소연·엄마도 넣으려면 'Soyeon', 'Mother'
//   한 컷에 말풍선이 여러 개면 순서대로 차례로 말해요
const INTRO_PANELS = [
  {
    image: `${BASE}comics/intro/01.png`,
    bubbles: [
      { type: 'narration', text: 'Changdeokgung in spring is always covered with bright blossoms. From late March to early April, many flowers begin to bloom.', style: { top: '-20px', left: '0', right: '0' } },
    ],
  },
  {
    image: `${BASE}comics/intro/02.png`,
    bubbles: [
      { type: 'narration', text: 'My mom and I often visit the palace like this when the weather is nice.', style: { bottom: '-20px', left: '0', right: '0' } },
    ],
  },
  {
    image: `${BASE}comics/intro/03.png`,
    bubbles: [
      { type: 'speech', text: 'Wow… it\'s so beautiful!', style: { bottom: '80%', left: '-10%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/04.png`,
    bubbles: [
      { type: 'speech', text: 'See? I told you it was a good idea to come.', style: { top: '-15%', left: '5%', right: '25%' } },
      { type: 'speech', text: 'Yeah, totally!', style: { top: '-5%', right: '5%', left: '50%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/05.png`,
    bubbles: [
      { type: 'speech', text: 'Look at that tree! It\'s so beautiful. What\'s it called?', style: { top: '5%', left: '5%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/06.png`,
    bubbles: [
      { type: 'speech', text: 'Hmm… that\'s called the miseon namu. It\'s a species found only in Korea.', style: { top: '-15%', left: '-5%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/07.png`,
    bubbles: [
      { type: 'speech', text: 'Really? But why is it called Miseon?', style: { top: ' 75%', left: '35%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/08.png`,
    bubbles: [
      { type: 'speech', text: 'The shape of its seeds looks like a Miseon fan. In old stories, royal attendants carried fans called Miseon.', style: { top: '65%', left: '2%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/09.png`,
    bubbles: [
      { type: 'speech', text: 'Hmm…', style: { top: '-10%', left: '25%', right: '30%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/10.png`,
    bubbles: [
      { type: 'speech', text: 'Let me check if you\'re right, Mom.', style: { top: '-10%', left: '5%', right: '25%' } },
      { type: 'speech', text: 'Hey! You don\'t trust me?', style: { top: '-20%', right: '-30%', left: '50%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/11.png`,
    bubbles: [
      { type: 'speech', text: 'Oh…', style: { top: '5%', left: '5%', right: '60%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/12.png`,
    bubbles: [
      { type: 'speech', voice: 'foreign',   text: 'What a beautiful flowering tree!', style: { top: '-15%', left: '-5%', right: '10%' } },
      { type: 'speech', voice: 'foreign',   text: 'It\'s stunning!', style: { top: '5%', right: '15%', left: '50%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/13.png`,
    bubbles: [
      { type: 'speech', voice: 'foreign',   text: 'Excuse me, do you happen to know the name of this tree?', style: { top: '-10%', left: '45%', right: '-5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/14.png`,
    bubbles: [
      { type: 'speech', text: 'Just a moment… I\'ll look up the English name.', style: { bottom: '-5%', left: '-5%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/15.png`,
    bubbles: [
      { type: 'speech', text: '...Huh?', style: { top: '10%', left: '5%', right: '50%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/16.png`,
    bubbles: [
      { type: 'speech', text: 'Nakai…?', style: { top: '-10%', left: '5%', right: '40%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/17.png`,
    bubbles: [
      { type: 'speech', text: 'Why would a Korean plant have a Japanese name in its scientific name...?', style: { top: '10%', left: '-20%', right: '60%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/18.png`,
    bubbles: [
      { type: 'speech', text: 'What happened to you...?', style: { top: '10%', left: '5%', right: '60%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/19.png`,
    bubbles: [],
  },
  {
    image: `${BASE}comics/intro/20.png`,
    bubbles: [
      { type: 'speech', text: 'Wait—?!', style: { top: '-10%', left: '5%', right: '50%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/21.png`,
    bubbles: [
      { type: 'speech', text: 'Soyeon!!!', style: { top: '-10%', left: '5%', right: '50%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/22.png`,
    bubbles: [
      { type: 'speech', text: 'Ah?!', style: { top: '-10%', left: '35%', right: '35%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/23.png`,
    bubbles: [
      { type: 'speech', text: 'Oh my God! What\'s happening?!', style: { top: '-5%', left: '60%', right: '5%' } },
    ],
  },
  {
    image: `${BASE}comics/intro/24.png`,
    bubbles: [
      { type: 'narration', text: 'After that… I remember nothing.', style: { bottom: '50px', left: '0', right: '0' } },
    ],
  },
  {
    image: `${BASE}comics/intro/25.png`,
    bubbles: [
      { type: 'narration', text: 'The only thing I remember…', style: { top: '20px', left: '0', right: '0' } },
    ],
  },
  {
    image: `${BASE}comics/intro/26.png`,
    bubbles: [
      { type: 'narration', text: 'Was the unusually strong—', style: { bottom: '70px', left: '0', right: '0' } },
    ],
  },
  {
    image: `${BASE}comics/intro/27.png`,
    bubbles: [
      { type: 'narration', text: '—fragrance of the Miseon blossoms.', style: { bottom: '150px', left: '0', right: '0' } },
    ],
  },
]

const INTRO_PAGES = []
for (let i = 0; i < INTRO_PANELS.length; i += 3) {
  INTRO_PAGES.push(INTRO_PANELS.slice(i, i + 3))
}

// ─────────────────────────────────────────────────────────────
// 아웃트로 컷 데이터  ─ out_cut_01 ~ out_cut_19, 3컷씩
// ─────────────────────────────────────────────────────────────
const makeOutroCut = (n, solo = false, bubbles = []) => ({
  image: `${BASE}comics/outro/${pad2(n)}.png`,
  bubbles,
  solo,
})

const OUTRO_PAGES = [
  [
    makeOutroCut(1, false, [
      { type: 'speech', text: "We're back!", style: { top: '-10%', left: '25%', right: '10%' } },
    ]),
    makeOutroCut(2, false, [
      { type: 'speech', text: 'Excuse me, do you know the name of that tree?', style: { top: '5%', left: '50%', right: '5%' } },
    ]),
    makeOutroCut(3, false, [
      { type: 'speech', text: 'The name of that tree is…', style: { bottom: '10%', left: '25%', right: '5%' } },
    ]),
  ],
  [
    makeOutroCut(4, false, [
      { type: 'speech', text: 'Tell them proudly…', style: { top: '5%', left: '5%', right: '5%' } },
    ]),
    makeOutroCut(5, false, [
      { type: 'speech', text: "It's a species found only in Korea…", style: { top: '-15%', left: '-5%', right: '5%' } },
    ]),
    makeOutroCut(6, false, [
      { type: 'speech', text: 'The name is…', style: { bottom: '10%', left: '5%', right: '5%' } },
    ]),
  ],
  [
    makeOutroCut(7, true, [
      { type: 'speech', text: 'miseon namu.', style: { top: '10%', left: '30%', right: '40%' } },
    ]),
  ],
  [
    makeOutroCut(8, false, [
      { type: 'speech', text: 'Thank you!', style: { top: '5%', left: '55%', right: '5%' } },
    ]),
    makeOutroCut(9, false, [
      { type: 'speech', text: 'Shall we move on?', style: { top: '-10%', left: '5%', right: '5%' } },
    ]),
    makeOutroCut(10, false, []),
  ],
  [
    makeOutroCut(11, false, []),
    makeOutroCut(12, false, [
      { type: 'speech', text: 'The miseon namu… A tree found only in Korea…', style: { bottom: '5%', left: '45%', right: '-5%' } },
    ]),
    makeOutroCut(13, false, [
      { type: 'speech', text: 'It reminds me of… Chang, Hyung Doo.', style: { top: '-10%', left: '5%', right: '5%' } },
    ]),
  ],
  [
    makeOutroCut(14, false, [
      { type: 'speech', text: 'I think so too.', style: { top: '-10%', left: '5%', right: '5%' } },
    ]),
    makeOutroCut(15, false, []),
    makeOutroCut(16, false, [
      { type: 'narration', text: 'I never imagined so many stories could exist in a single name.', style: { bottom: '-20px', left: '0', right: '0' } },
    ]),
  ],
  [
    makeOutroCut(17, false, [
      { type: 'narration', text: 'Who gives the name…', style: { top: '-20px', left: '0', right: '0' } },
    ]),
    makeOutroCut(18, false, [
      { type: 'narration', text: 'And what that name leaves behind…', style: { bottom: '-20px', left: '0', right: '0' } },
    ]),
  ],
  [
    makeOutroCut(19, true, [
      { type: 'speech', text: 'I never knew so much history was hidden in this tree.', style: { top: '5%', left: '45%', right: '35%' } },
      { type: 'speech', text: 'Me neither.', style: { top: '22%', right: '30%', left: '60%' } },
    ]),
  ],
]

// ─────────────────────────────────────────────────────────────
// IntroComic
// ─────────────────────────────────────────────────────────────
function IntroComic({ onComplete }) {
  const [pageIdx, setPageIdx] = useState(0)
  const [step,    setStep]    = useState(1)

  const panels     = INTRO_PAGES[pageIdx]
  const totalSteps = panels.length * 2
  useImagePreload(INTRO_PAGES.slice(pageIdx, pageIdx + 2).flatMap((page) => page.map((panel) => panel.image)), { priority: 0 })

  const handleClick = () => {
    if (step < totalSteps) {
      setStep(s => s + 1)
    } else if (pageIdx < INTRO_PAGES.length - 1) {
      setPageIdx(p => p + 1)
      setStep(1)
    } else {
      onComplete()
    }
  }

  const isPanelVisible  = (i) => step >= i * 2 + 1
  const isBubbleVisible = (i) => step >= i * 2 + 2

  // 말풍선이 나타나는 순간 (step 이 짝수) → 그 컷 말풍선들의 목소리를 차례로
  useEffect(() => {
    if (step % 2 !== 0) return
    const panel = panels[step / 2 - 1]
    const voices = panel?.bubbles.map((b) => b.voice).filter(Boolean) ?? []
    if (voices.length) playVoices(voices, panel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIdx, step])

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'black',
        cursor: 'pointer',
        zIndex: 9999,
        gap: '20px',
        padding: '40px',
        boxSizing: 'border-box',
      }}
    >
      {panels.map((panel, i) => (
        <div
          key={panel.image}
          style={{
            width: PANEL_WIDTH,
            maxHeight: '65vh',
            flexShrink: 0,
            visibility: isPanelVisible(i) ? 'visible' : 'hidden',
            opacity:    isPanelVisible(i) ? undefined  : 0,
          }}
        >
          {isPanelVisible(i) && (
            <div
              className="comic-panel"
              style={{
                position: 'relative',
                width: '100%',
                opacity: 0,
                animation: 'fadeIn 0.5s ease-in-out forwards',
              }}
            >
              <img
                src={panel.image}
                alt={`intro cut`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  display: 'block',
                  userSelect: 'none',
                }}
              />

              {isBubbleVisible(i) && panel.bubbles.map((bubble, j) => (
                <div
                  key={j}
                  className={bubble.type === 'narration' ? 'b-narration' : 'b-speech'}
                  style={{
                    ...bubble.style,
                    animationDelay: `${j * 0.1}s`,
                    opacity: 0,
                    animationFillMode: 'forwards',
                  }}
                >
                  {bubble.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{
        position: 'absolute', bottom: '40px',
        color: 'white', fontSize: '14px', opacity: 0.7,
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        {(step < totalSteps || pageIdx < INTRO_PAGES.length - 1) ? 'click to continue' : 'click to start'}
      </div>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fadeIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EndingContent (아웃트로 웹툰)
// ─────────────────────────────────────────────────────────────
function EndingContent({ onComplete }) {
  const [pageIdx, setPageIdx] = useState(0)
  const [step,    setStep]    = useState(1)

  const panels     = OUTRO_PAGES[pageIdx]
  const isSoloPage = panels[0].solo === true
  const totalSteps = panels.length * 2
  useImagePreload(OUTRO_PAGES.slice(pageIdx, pageIdx + 2).flatMap((page) => page.map((panel) => panel.image)), { priority: 0 })

  const handleClick = () => {
    if (step < totalSteps) {
      setStep(s => s + 1)
    } else if (pageIdx < OUTRO_PAGES.length - 1) {
      setPageIdx(p => p + 1)
      setStep(1)
    } else {
      onComplete()
    }
  }

  const isPanelVisible  = (i) => step >= i * 2 + 1
  const isBubbleVisible = (i) => step >= i * 2 + 2
  const hintText = (step < totalSteps || pageIdx < OUTRO_PAGES.length - 1) ? 'click to continue' : 'click to finish'

  if (isSoloPage) {
    return (
      <div onClick={handleClick} style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'black', cursor: 'pointer', zIndex: 9999,
        padding: '20px', boxSizing: 'border-box',
      }}>
        {isPanelVisible(0) && (
          <div className="comic-panel" style={{ position: 'relative', maxHeight: '90vh', opacity: 0, animation: 'fadeIn 0.5s ease-in-out forwards' }}>
            <img src={panels[0].image} alt="outro solo" style={{ height: 'auto', maxHeight: '90vh', maxWidth: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }} />
            {isBubbleVisible(0) && panels[0].bubbles.map((bubble, j) => (
              <div key={j} className={bubble.type === 'narration' ? 'b-narration' : 'b-speech'} style={{ ...bubble.style, opacity: 0, animationFillMode: 'forwards', animationDelay: `${j * 0.1}s` }}>
                {bubble.text}
              </div>
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '40px', color: 'white', fontSize: '14px', opacity: 0.7, animation: 'pulse 2s ease-in-out infinite' }}>
          {hintText}
        </div>
        <style>{`
          @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.9} }
          @keyframes fadeIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        `}</style>
      </div>
    )
  }

  return (
    <div onClick={handleClick} style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'black', cursor: 'pointer', zIndex: 9999,
      gap: '20px', padding: '40px', boxSizing: 'border-box',
    }}>
      {panels.map((panel, i) => (
        <div key={panel.image} style={{
          width: PANEL_WIDTH, maxHeight: '65vh', flexShrink: 0,
          visibility: isPanelVisible(i) ? 'visible' : 'hidden',
          opacity:    isPanelVisible(i) ? undefined  : 0,
        }}>
          {isPanelVisible(i) && (
            <div className="comic-panel" style={{ position: 'relative', width: '100%', opacity: 0, animation: 'fadeIn 0.5s ease-in-out forwards' }}>
              <img src={panel.image} alt="outro cut" style={{ width: '100%', height: 'auto', maxHeight: '65vh', objectFit: 'contain', display: 'block', userSelect: 'none' }} />
              {isBubbleVisible(i) && panel.bubbles.map((bubble, j) => (
                <div key={j} className={bubble.type === 'narration' ? 'b-narration' : 'b-speech'} style={{ ...bubble.style, opacity: 0, animationFillMode: 'forwards', animationDelay: `${j * 0.1}s` }}>
                  {bubble.text}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: '40px', color: 'white', fontSize: '14px', opacity: 0.7, animation: 'pulse 2s ease-in-out infinite' }}>
        {hintText}
      </div>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fadeIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ImageSlideshow
// ─────────────────────────────────────────────────────────────
function ImageSlideshow({ images, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  useImagePreload(images.slice(currentIndex + 1, currentIndex + 2))
  const handleClick = () => {
    if (currentIndex < images.length - 1) {
      setFadeOut(true)
      setTimeout(() => { setCurrentIndex(currentIndex + 1); setFadeOut(false) }, 300)
    } else {
      setFadeOut(true)
      setTimeout(() => onComplete(), 500)
    }
  }
  return (
    <div onClick={handleClick} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', zIndex: 200,
    }}>
      <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} style={{
        maxWidth: '90%', maxHeight: '90%', objectFit: 'contain',
        opacity: fadeOut ? 0 : 1, transition: 'opacity 0.3s ease-in-out', userSelect: 'none',
      }} />
      <div style={{ position: 'absolute', top: '40px', right: '40px', color: 'white', fontSize: '16px', opacity: 0.7, background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '20px' }}>
        {currentIndex + 1} / {images.length}
      </div>
      <div style={{ position: 'absolute', bottom: '40px', color: 'white', fontSize: '14px', opacity: 0.7, animation: 'pulse 2s ease-in-out infinite' }}>
        {currentIndex < images.length - 1 ? 'Click to continue ▼' : 'Click for next scene ▼'}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DialogueOverlay
// ─────────────────────────────────────────────────────────────
function DialogueOverlay({ dialogues, onComplete, onCue, onPositionChange }) {
  const [idx, setIdx] = useState(0)
  const d = dialogues[idx]
  const isLeftActive  = d.side === 'left'
  const isRightActive = d.side === 'right'
  const isNarration   = d.side === 'narration'
  const leftImg  = getFigure(d.leftChar,  isLeftActive  ? d.expression : null)
  const rightImg = getFigure(d.rightChar, isRightActive ? d.expression : null)
  const DIALOGUE_BOX_H = 220
  const CHAR_HEIGHT     = '90vh'
  const handleClick = () => {
    if (idx < dialogues.length - 1) {
      setIdx(idx + 1)
      onPositionChange?.(idx + 1)
    } else onComplete()
  }

  // 대사가 바뀔 때마다: 그 인물의 목소리 (story/voice.js)
  //   + 이 대사에 붙은 카메라·분위기 신호 (대사창을 끊지 않고 보내서 스탠딩 일러스트가 튀지 않음)
  const cuesSent = useRef(null)
  useEffect(() => {
    playVoice(d.character, d)
    if (cuesSent.current === d) return          // 개발 모드에서 두 번 불려도 한 번만
    cuesSent.current = d
    d.cues?.forEach((c) => onCue?.(c.kind, c.name))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 100 }}>
      {leftImg && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 101, pointerEvents: 'none' }}>
          <img src={leftImg} alt={d.leftChar} style={{ height: CHAR_HEIGHT, width: 'auto', objectFit: 'contain', display: 'block', filter: isLeftActive ? ACTIVE_OUTLINE : 'none', transition: 'filter 0.3s ease' }} />
        </div>
      )}
      {rightImg && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 101, pointerEvents: 'none' }}>
          <img src={rightImg} alt={d.rightChar} style={{ height: CHAR_HEIGHT, width: 'auto', objectFit: 'contain', display: 'block', filter: isRightActive ? ACTIVE_OUTLINE : 'none', transition: 'filter 0.3s ease' }} />
        </div>
      )}
      <div onClick={handleClick} style={{ position: 'absolute', bottom: '20px', left: `${BOX_MARGIN}px`, right: `${BOX_MARGIN}px`, minHeight: `${DIALOGUE_BOX_H}px`, zIndex: 102, backgroundImage: 'var(--paper-tex-bg-3)', backgroundSize: 'cover', backgroundColor: 'var(--bg-color)', borderTop: 'var(--border-thickness-medium) solid var(--corner-color)', border: '2px solid var(--corner-color)', borderRadius: 'var(--border-radius-sm)', padding: '24px 60px 36px', cursor: 'pointer', pointerEvents: 'auto', boxSizing: 'border-box' }}>
        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: 'var(--corner-size)', height: 'var(--corner-size)', borderTop: '3px solid var(--corner-color)', borderLeft: '3px solid var(--corner-color)' }} />
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-xl-bold)', fontSize: 'var(--font-size-xl)', color: isNarration ? 'var(--color-accent-gold)' : isLeftActive ? 'var(--color-accent)' : 'var(--color-accent-secondary)', marginBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--secondary-color)', paddingBottom: 'var(--spacing-xs)', display: 'inline-block' }}>
          {d.character}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', lineHeight: 1.8, marginTop: 'var(--spacing-sm)', fontStyle: isNarration ? 'italic' : 'normal' }}>
          {d.text}
          <span style={{ display: 'inline-block', width: '32px', height: '22px', backgroundImage: 'var(--basic-arrow)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', verticalAlign: 'middle', marginLeft: '10px', animation: 'arrowPulse 1.4s ease-in-out infinite' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '14px', left: '60px', fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {idx + 1} / {dialogues.length}
        </div>
      </div>
      <style>{`@keyframes arrowPulse { 0%,100%{transform:translateX(0);opacity:.55} 50%{transform:translateX(5px);opacity:1} }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ChoiceImage / NameChoiceOverlay
// ─────────────────────────────────────────────────────────────
function ChoiceImage({ src, label }) {
  const [status, setStatus] = React.useState('loading')
  if (!src || status === 'fail') return <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-xl)', color: 'var(--color-text)', textAlign: 'center', lineHeight: 1.4 }}>{label}</div>
  return <img src={src} alt={label} onLoad={() => setStatus('ok')} onError={() => setStatus('fail')} style={{ maxWidth: '92%', maxHeight: '210px', width: 'auto', height: 'auto', objectFit: 'contain', opacity: status === 'ok' ? 1 : 0, transition: 'opacity 0.2s ease' }} />
}

// 순서는 Narrative Design V4 의 선택지 순서 (label 은 이미지를 못 불러올 때 대신 보이는 글자)
const NAME_CHOICES = [
  { id: 'japanese',   label: 'Uchiwa-noki',             img: `${BASE}typo/Uchiwa_noki_typo.svg` },
  { id: 'korean',     label: 'Miseon namu',             img: `${BASE}typo/mison_namu_typo.svg`  },
  { id: 'scientific', label: 'Abeliophyllum distichum', img: `${BASE}typo/Abeliophyllum_distichum_typo.svg` },
  { id: 'english',    label: 'White Forsythia',         img: `${BASE}typo/white_forsythia_typo.svg` },
]

function NameChoiceOverlay({ onChoice }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', zIndex: 200 }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--bg-color)', letterSpacing: '0.1em' }}>Choose your name</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {NAME_CHOICES.map((choice) => (
          <div key={choice.id} onClick={() => onChoice(choice.id)} onMouseEnter={() => setHovered(choice.id)} onMouseLeave={() => setHovered(null)}
            style={{ width: '480px', height: '270px', backgroundImage: 'var(--paper-tex-bg-2)', backgroundSize: 'cover', backgroundColor: 'var(--bg-color)', border: hovered === choice.id ? 'var(--border-thickness-medium) solid var(--secondary-color)' : 'var(--border-thickness-thin) solid var(--color-text-muted)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '20px', position: 'relative', transition: 'all 0.3s ease', transform: hovered === choice.id ? 'scale(1.03)' : 'scale(1)', boxShadow: hovered === choice.id ? '0 8px 24px rgba(88,60,43,0.15)' : 'none' }}>
            {hovered === choice.id && <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: 'var(--corner-size)', height: 'var(--corner-size)', borderTop: 'var(--corner-weight) solid var(--corner-color)', borderLeft: 'var(--corner-weight) solid var(--corner-color)' }} />}
            <ChoiceImage src={choice.img} label={choice.label} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ※ 기존 Credits 컴포넌트는 components/flow/CreditsScreen.jsx 로 대체되었습니다.
//   (타임라인/인포그래픽은 components/flow/TimelinePage.jsx 로 이동)

// 챕터 영상 — 영상이 있는 챕터는 영상, 아직 없는 챕터는 아래 슬라이드(chapterImages)를 보여줌
const CHAPTER_MOTION = { 1: MOTION.ch1, 2: MOTION.ch2, 3: MOTION.ch3 }

const chapterImages = {
  1: [
    `${BASE}video/chp1_01.png`, `${BASE}video/chp1_02.jpg`, `${BASE}video/chp1_03.jpg`,
    `${BASE}video/chp1_04.jpg`, `${BASE}video/chp1_05.jpg`,
  ],
  2: [
    `${BASE}video/chp2_01.jpg`, `${BASE}video/chp2_02.jpg`, `${BASE}video/chp2_03.jpg`,
    `${BASE}video/chp2_04.jpg`, `${BASE}video/chp2_05.jpg`,
  ],
  3: [
    `${BASE}video/chp3_01.jpg`, `${BASE}video/chp3_02.jpg`, `${BASE}video/chp3_03.jpg`,
    `${BASE}video/chp3_04.jpg`, `${BASE}video/chp3_05.jpg`,
  ],
}


// 챕터 영상 자리: 영상 파일이 등록돼 있으면 MotionPlayer, 아니면 기존 슬라이드
function ChapterMotion({ chapter, onComplete, allowSkip }) {
  const src = CHAPTER_MOTION[chapter]
  if (src) return <MotionPlayer key={src} src={src} onComplete={onComplete} allowSkip={allowSkip} />
  return <ImageSlideshow images={chapterImages[chapter]} onComplete={onComplete} />
}

// 대화를 보는 동안 다음 챕터 영상을 미리 받아 둠 (화면엔 안 보임)
function MotionPreload({ chapter }) {
  const src = CHAPTER_MOTION[chapter]
  useImagePreload(src ? [] : chapterImages[chapter]?.slice(0, 1) ?? [])
  return src ? <video src={src} preload="auto" muted playsInline style={{ display: 'none' }} /> : null
}

// ─────────────────────────────────────────────────────────────
// Main App (데스크톱 체험 전체 흐름)
//   온보딩 → 인트로 웹툰 → 3D 챕터 1~3 → 이름 선택
//   → (한글) 엔딩 컷씬 → 아웃트로 웹툰 → 크레딧
//   → (그 외) 엔딩 대화 → 엔딩 컷씬 → 크레딧
//   크레딧 ↔ 타임라인, Restart → 온보딩
//   한 번 크레딧까지 본 뒤부터 웹툰/챕터 건너뛰기 가능 (localStorage 저장)
// ─────────────────────────────────────────────────────────────
// 엔딩 대화 단계 — 대본은 ENDING_SCENES[endingType] 로 고름
//   진엔딩(korean)도 이제 대화가 있어서 ENDING_2_DIALOGUE 단계를 같이 씀
const ENDING_DIALOGUE_STAGE = {
  korean:     STAGES.ENDING_2_DIALOGUE,
  japanese:   STAGES.ENDING_2_DIALOGUE,
  scientific: STAGES.ENDING_3_DIALOGUE,
  english:    STAGES.ENDING_4_DIALOGUE,
}

function MainApp() {
  const [currentStage, setCurrentStage] = useState(STAGES.ONBOARDING)
  const [introReady, setIntroReady] = useState(false)
  const [endingType, setEndingType] = useState(null)          // 'korean' | 'japanese' | 'scientific' | 'english'
  const [completedRuns, setCompletedRuns] = useState(getCompletedRuns)
  const countedThisRun = useRef(false)

  const [showChapter1Interaction,  setShowChapter1Interaction]  = useState(false)
  const [showHyungdooIcon,         setShowHyungdooIcon]         = useState(false)
  const [showChapter2Interaction,  setShowChapter2Interaction]  = useState(false)
  const [showChapter3Misun,        setShowChapter3Misun]        = useState(false)
  const [showChapter3New,          setShowChapter3New]          = useState(false)

  // ── 분위기 전환 (대본의 { effect: '…' }) ──
  //   imperial : 1장 — 정원이 붉게 어두워지고 일장기가 나타남
  //   local    : 2장 — 푸른 톤, 일장기 사라짐
  //   bloom    : 3장 전환 — 밝고 따뜻한 빛
  //   다음 effect 가 올 때까지 유지, 이름 선택·처음으로 돌아가면 해제
  const [mood, setMood] = useState(null)
  const handleCue = useCallback((kind, name) => {
    if (kind === 'effect') setMood(name)
    else if (import.meta.env.DEV) console.info(`[ScenePlayer] ${kind} "${name}" 자리 (3D 연출은 아직 준비 중)`)
  }, [])

  // ── 3D 로딩 화면 ──
  //   sceneMounted : Scene3D 가 (코드 + 모델까지) 준비되어 화면에 붙었는지
  //   loaderDone   : 로딩 화면이 사라졌는지 — 한 번 끝나면 다시 띄우지 않음 (모델은 캐시에 남아 있음)
  const [sceneMounted, setSceneMounted] = useState(false)
  const [loaderDone,   setLoaderDone]   = useState(false)
  const markSceneMounted = useCallback(() => setSceneMounted(true), [])
  const finishLoader     = useCallback(() => setLoaderDone(true), [])
  const markIntroReady = useCallback(() => setIntroReady(true), [])

  const preparingIntro = currentStage === STAGES.ONBOARDING || currentStage === STAGES.INTRO_COMIC
  useImagePreload(preparingIntro && !introReady ? INTRO_PAGES[0].map((panel) => panel.image) : [], {
    priority: 0, onReady: preparingIntro && !introReady ? markIntroReady : undefined,
  })
  const chosenEnding = CHOICE_TO_ENDING[endingType]?.ending
  const preparingEnding = Object.values(ENDING_DIALOGUE_STAGE).includes(currentStage)
  useImagePreload(preparingEnding && chosenEnding ? ENDINGS[chosenEnding].slice(0, 1) : [])
  useImagePreload(
    endingType === 'korean' && (preparingEnding || currentStage === STAGES.ENDING_CUTSCENE)
      ? OUTRO_PAGES[0].map((panel) => panel.image) : [],
  )

  const canSkip = completedRuns >= 1
  const allowMotionSkip = canSkip || import.meta.env.DEV   // 영상 건너뛰기: 2회차부터 (개발 중엔 항상)

  const goTo = (nextStage) => {
    setCurrentStage(nextStage)
    if (nextStage === STAGES.NAME_CHOICE || nextStage === STAGES.ONBOARDING) setMood(null)
    setShowChapter1Interaction(false)
    setShowHyungdooIcon(false)
    setShowChapter2Interaction(false)
    setShowChapter3Misun(false)
    setShowChapter3New(false)
  }

  // 크레딧에 처음 도달한 순간 = 한 회차 완주로 기록 (회차당 한 번만)
  useEffect(() => {
    if (currentStage === STAGES.CREDITS && !countedThisRun.current) {
      countedThisRun.current = true
      setCompletedRuns(addCompletedRun())
    }
  }, [currentStage])

  const handleNameChoice = (choice) => {
    setEndingType(choice)
    goTo(ENDING_DIALOGUE_STAGE[choice])
  }
  const handleCutsceneEnd = () => goTo(endingType === 'korean' ? STAGES.OUTRO_COMIC : STAGES.CREDITS)
  const handleRestart = () => {
    countedThisRun.current = false
    setIntroReady(false)
    setEndingType(null)
    setMood(null)
    goTo(STAGES.ONBOARDING)
  }

  const isIn3DSpace           = !FULLSCREEN_STAGES.includes(currentStage)
  const isNakaiIconVisible    = currentStage === STAGES.CHAPTER_1_DIALOGUE && !showChapter1Interaction
  const isHyungdooIconVisible = currentStage === STAGES.CHAPTER_2_DIALOGUE && showHyungdooIcon && !showChapter2Interaction
  const isControlsEnabled     = !currentStage.includes('video') && currentStage !== STAGES.NAME_CHOICE
  const isImperial            = mood === 'imperial'
  const bgmTrack              = pickBgm({ stage: currentStage, mood, endingType })   // 구간별 배경음악 (story/bgm.js)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1410' }}>

      {/* ── 배경음악: 구간이 바뀌면 크로스페이드, 같은 곡이면 계속 ── */}
      <BgmPlayer track={bgmTrack} />

      {/* ── 전체화면 단계 ── */}
      {currentStage === STAGES.ONBOARDING      && <Onboarding     onStart={() => goTo(STAGES.INTRO_COMIC)} />}
      {currentStage === STAGES.INTRO_COMIC     && <IntroComic     onComplete={() => goTo(STAGES.GARDEN_ARRIVAL)} />}
      {currentStage === STAGES.ENDING_CUTSCENE && <EndingCutscene type={endingType} onComplete={handleCutsceneEnd} />}
      {currentStage === STAGES.OUTRO_COMIC     && <EndingContent  onComplete={() => goTo(STAGES.CREDITS)} />}
      {currentStage === STAGES.CREDITS         && <CreditsScreen  onTimeline={() => goTo(STAGES.TIMELINE)} onRestart={handleRestart} />}
      {currentStage === STAGES.TIMELINE        && <TimelinePage   onBack={() => goTo(STAGES.CREDITS)} />}

      {/* ── 첫 웹툰 페이지가 준비된 뒤 인트로를 보는 동안 3D 공간 준비 ── */}
      {introReady && currentStage === STAGES.INTRO_COMIC && (
        <Suspense fallback={null}><Scene3DPrep /></Suspense>
      )}

      {/* ── 2회차부터 건너뛰기 ── */}
      {canSkip && currentStage === STAGES.INTRO_COMIC && (
        <SkipButton label="Skip comic" onClick={() => goTo(STAGES.GARDEN_ARRIVAL)} />
      )}
      {canSkip && CHAPTER_STAGES.includes(currentStage) && (
        <SkipButton label="Skip to the choice" onClick={() => goTo(STAGES.NAME_CHOICE)} />
      )}

      {isIn3DSpace && (
        <>
          <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${BASE}images/Nakai_bg.png)`,backgroundSize:'cover',backgroundPosition:'center',opacity:(currentStage===STAGES.GARDEN_ARRIVAL||currentStage.includes('chapter_1')||currentStage.includes('ending_'))?1:0,transition:'opacity 0.5s ease',pointerEvents:'none' }} />
          <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${BASE}images/Jang_bg.png)`,backgroundSize:'cover',backgroundPosition:'center',opacity:currentStage.includes('chapter_2')?1:0,transition:'opacity 0.5s ease',pointerEvents:'none' }} />
          <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${BASE}images/Paper_tex_2.png)`,backgroundSize:'cover',backgroundPosition:'center',opacity:(currentStage.includes('chapter_3')||currentStage===STAGES.NAME_CHOICE)?1:0,transition:'opacity 0.5s ease',pointerEvents:'none' }} />

          {/* 분위기 막 (1장 붉은 정원 등) — 3D 위, 대화창 아래 */}
          <MoodOverlay mood={mood} />

          {/* GARDEN ARRIVAL */}
          {currentStage === STAGES.GARDEN_ARRIVAL && (
            <ScenePlayer scene={arrivalScene} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => goTo(STAGES.CHAPTER_1_DIALOGUE)} />
          )}

          {/* CHAPTER 1: 나카이 아이콘 → 대본(chapter1) → 영상 */}
          {currentStage === STAGES.CHAPTER_1_DIALOGUE && <MotionPreload chapter={1} />}
          {currentStage === STAGES.CHAPTER_2_DIALOGUE && <MotionPreload chapter={2} />}
          {currentStage === STAGES.CHAPTER_3_DIALOGUE && <MotionPreload chapter={3} />}
          {currentStage === STAGES.CHAPTER_1_DIALOGUE && showChapter1Interaction && (
            <ScenePlayer scene={chapter1Scene} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => goTo(STAGES.CHAPTER_1_VIDEO)} />
          )}
          {currentStage === STAGES.CHAPTER_1_VIDEO && (
            <ChapterMotion chapter={1} allowSkip={allowMotionSkip} onComplete={() => goTo(STAGES.CHAPTER_2_DIALOGUE)} />
          )}

          {/* CHAPTER 2: 1장 영상 뒤(chapter1After) + 2장 시작(chapter2Intro) → 장형두 아이콘 → 대본(chapter2) → 영상 */}
          {currentStage === STAGES.CHAPTER_2_DIALOGUE && !showHyungdooIcon && !showChapter2Interaction && (
            <ScenePlayer scene={[chapter1AfterScene, chapter2IntroScene]} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => setShowHyungdooIcon(true)} />
          )}
          {currentStage === STAGES.CHAPTER_2_DIALOGUE && showChapter2Interaction && (
            <ScenePlayer scene={chapter2Scene} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => goTo(STAGES.CHAPTER_2_VIDEO)} />
          )}
          {currentStage === STAGES.CHAPTER_2_VIDEO && (
            <ChapterMotion chapter={2} allowSkip={allowMotionSkip} onComplete={() => goTo(STAGES.CHAPTER_3_DIALOGUE)} />
          )}

          {/* CHAPTER 3: 2장 영상 뒤(chapter2After) → 대본(chapter3) → 영상 → 영상 뒤(chapter3After) → 이름 선택 */}
          {/* 2장 영상 뒤 장면과 3장 장면을 한 번에 이어서 재생 → 사이에서 대사창이 끊기지 않음 */}
          {currentStage === STAGES.CHAPTER_3_DIALOGUE && (
            <ScenePlayer scene={[chapter2AfterScene, chapter3Scene]} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => goTo(STAGES.CHAPTER_3_VIDEO)} />
          )}
          {currentStage === STAGES.CHAPTER_3_VIDEO && (
            <ChapterMotion chapter={3} allowSkip={allowMotionSkip} onComplete={() => goTo(STAGES.CHAPTER_3_FINAL)} />
          )}
          {currentStage === STAGES.CHAPTER_3_FINAL && (
            <ScenePlayer scene={chapter3AfterScene} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => goTo(STAGES.NAME_CHOICE)} />
          )}

          {/* NAME CHOICE → 엔딩 분기 */}
          {currentStage === STAGES.NAME_CHOICE && <NameChoiceOverlay onChoice={handleNameChoice} />}
          {Object.values(ENDING_DIALOGUE_STAGE).includes(currentStage) && ENDING_SCENES[endingType] && (
            <ScenePlayer key={endingType} scene={ENDING_SCENES[endingType]} Dialogue={DialogueOverlay} onCue={handleCue} onComplete={() => goTo(STAGES.ENDING_CUTSCENE)} />
          )}

          {/* 3D 공간 — three.js 코드와 모델은 이 컴포넌트가 처음 필요할 때 따로 내려받아요 */}
          <Suspense fallback={null}>
            <Scene3D
              showNakaiIcon={isNakaiIconVisible}
              onNakaiIconClick={() => setShowChapter1Interaction(true)}
              showHyungdooIcon={isHyungdooIconVisible}
              onHyungdooIconClick={() => setShowChapter2Interaction(true)}
              controlsEnabled={isControlsEnabled}
              showFlag={isImperial}
            />
            {/* Scene3D 와 같은 Suspense 안 → Scene3D 가 다 준비된 뒤에 신호가 와요 */}
            <SceneMountedSignal onMounted={markSceneMounted} />
          </Suspense>
        </>
      )}

      {/* ── 3D 로딩 화면: 3D 공간에 처음 들어갈 때, 모델이 다 준비될 때까지 덮어 둠 ── */}
      {isIn3DSpace && !loaderDone && (
        <LoadingScreen sceneMounted={sceneMounted} onFinished={finishLoader} />
      )}
    </div>
  )
}

// 주소에 ?bg 가 있으면 3D 공간만 보여주는 캡처 모드, 아니면 평소 체험
function App() {
  return CAPTURE_MODE ? <BackgroundCapture /> : <MainApp />
}

export default App