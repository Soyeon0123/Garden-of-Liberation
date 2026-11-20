import { useEffect, useMemo, useState } from 'react'
import { buildSegments } from '../../story/script'
import CutScene from './CutScene'
import InventoryPopup from './InventoryPopup'

// ─────────────────────────────────────────────────────────────
// ScenePlayer — 대본(story/chapters/*.js)을 처음부터 순서대로 재생
//   대사 묶음 → Dialogue (App.jsx 의 DialogueOverlay 를 넘겨받아 사용)
//   컷신      → CutScene (내레이션 자막 포함)
//   인벤토리  → InventoryPopup, 그리고 onItem(id) 로 알려줌 (나중에 인벤토리 페이지용)
//   카메라·분위기 → onCue(kind, name) 로 알려줌
//                  대사 사이의 신호는 대사창을 끊지 않고, 그 다음 대사가 나올 때 Dialogue 가 보냄
//   끝까지 가면 onComplete()
// ─────────────────────────────────────────────────────────────

export default function ScenePlayer({ scene, Dialogue, onComplete, onItem, onCue }) {
  // 여러 장면 배열([a, b])로 받아도 화면이 다시 그려질 때마다 새로 만들지 않도록 장면 자체를 기준으로 기억
  //   (새로 만들면 대사 목소리가 다시 재생될 수 있어요)
  const sceneList = Array.isArray(scene) ? scene : [scene]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const segments = useMemo(() => buildSegments(scene), sceneList)
  const [step, setStep] = useState(0)
  const seg = segments[step]

  // 카메라·분위기·연출 신호 보내기 (대사 줄에 붙은 신호도 이걸로)
  const sendCue = (kind, name) => {
    if (onCue) onCue(kind, name)
    else if (import.meta.env.DEV) console.info(`[ScenePlayer] ${kind} "${name}" 자리 (3D 연출은 아직 준비 중)`)
  }

  const next = () => {
    if (step < segments.length - 1) setStep(step + 1)
    else onComplete?.()
  }

  // 카메라·분위기 신호: 알려주고 바로 다음으로
  useEffect(() => {
    if (seg?.type !== 'cue') return
    sendCue(seg.kind, seg.name)
    next()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // 인벤토리 획득 기록
  useEffect(() => {
    if (seg?.type === 'inventory') onItem?.(seg.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  if (!seg) return null
  if (seg.type === 'dialogue')  return <Dialogue key={step} dialogues={seg.lines} onCue={sendCue} onComplete={next} />
  if (seg.type === 'cutscene')  return <CutScene key={step} id={seg.id} narration={seg.narration} onComplete={next} />
  if (seg.type === 'inventory') return <InventoryPopup key={step} id={seg.id} onComplete={next} />
  return null
}
