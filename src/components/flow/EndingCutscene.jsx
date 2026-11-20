// 엔딩 컷씬 (이미지 버전)
// 이미지 경로는 src/story/assets.js 의 ENDINGS 에서 가져와요. (public/EndingCutscene/ 폴더)
//   이름 선택(type)        → 엔딩 이미지
//   japanese   (Uchiwa-noki)       → uchiwa.jpg
//   scientific (Abeliophyllum …)   → scientific.jpg
//   english    (White Forsythia)   → english.jpg
//   korean     (Miseon namu)       → true_1.jpg → true_2.jpg → true_3.jpg (클릭할 때마다 다음 장)
// 이미지를 못 찾으면 자리표시 화면이 나오고, 클릭하면 다음 단계로 진행돼요.
import { useState } from 'react'
import { ENDINGS, CHOICE_TO_ENDING } from '../../story/assets'
import { useImagePreload } from '../../flow/imagePreload'

export default function EndingCutscene({ type, onComplete }) {
  const endingId = CHOICE_TO_ENDING[type]?.ending
  const images = ENDINGS[endingId] ?? []
  const [index, setIndex] = useState(0)
  const [missing, setMissing] = useState(false)
  useImagePreload(images.slice(index + 1, index + 2))

  const isLast = index >= images.length - 1

  const handleClick = () => {
    if (isLast) { onComplete(); return }
    setIndex(i => i + 1)
    setMissing(false)
  }

  const handleError = () => {
    setMissing(true)
    console.warn(`[EndingCutscene] 이미지를 찾을 수 없어요: ${images[index]}`)
  }

  return (
    <div onClick={handleClick} style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'black', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {images.length === 0 || missing ? (
        <p style={{ color: 'white', opacity: 0.7, fontFamily: 'var(--font-body)' }}>
          Ending cutscene ({endingId ?? type})
        </p>
      ) : (
        <img
          key={images[index]}
          src={images[index]}
          alt={`Ending cutscene ${index + 1}`}
          onError={handleError}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none', animation: 'cutsceneFade 0.6s ease forwards' }}
        />
      )}
      <div style={{ position: 'absolute', bottom: '40px', color: 'white', fontSize: '14px', opacity: 0.7 }}>
        {isLast ? 'click to continue' : `${index + 1} / ${images.length}`}
      </div>
      <style>{`@keyframes cutsceneFade { from{opacity:0} to{opacity:1} }`}</style>
    </div>
  )
}
