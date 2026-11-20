// ─────────────────────────────────────────────────────────────
// story/script.js — 대본 파일(story/chapters/*.js)을 화면용 데이터로 바꿔 주는 도우미
//
//   대본은 문서 순서대로 "비트(beat)" 를 나열해요.
//     ['Soyeon', 'curious', '대사']             ← 대사 한 줄  [누가, 표정(없으면 null), 대사]
//     { cutscene: 'nameplateBlank' }            ← 컷신 (assets.js 의 CUTSCENES 이름)
//     { cutscene: '…', narration: { who: 'Nakai', lines: ['…', '…'] } }
//                                               ← 컷신 위로 흐르는 내레이션 (클릭마다 한 줄)
//     { inventory: 'floraSylvatica' }           ← 인벤토리 획득 (assets.js 의 ITEMS 이름)
//     { effect: 'imperial' }                    ← 분위기 전환 (다음 effect 가 올 때까지 유지)
//     { camera: 'pushToTree' }                  ← 3D 카메라 연출       ┐ 아직 준비 중
//     { fx: 'nameplateGlow' }                   ← 3D 일회성 연출       ┘ (지금은 바로 넘어감)
//
//   대화창 왼쪽/오른쪽 인물은 자동으로 정해져요.
//     - 손님(guest: 'nakai' / 'hyungdoo')이 있으면 손님은 왼쪽,
//       소연·엄마 중 마지막으로 말한 사람이 오른쪽
//     - 손님이 둘이면 guest: ['nakai', 'hyungdoo'] → 왼쪽엔 마지막으로 말한 손님
//     - 손님이 없으면 엄마 왼쪽, 소연 오른쪽
//     - 미선나무는 내레이션 칸
// ─────────────────────────────────────────────────────────────

// 대본에 쓰는 이름 → 일러스트 파일 이름 / 대화창에 표시되는 이름
export const CAST = {
  Soyeon:   { file: 'soyeon',   label: 'Soyeon' },
  Mother:   { file: 'minjung',  label: 'Mother' },
  Nakai:    { file: 'nakai',    label: 'Nakai' },
  Hyungdoo: { file: 'hyungdoo', label: 'Hyungdoo' },
  Miseon:   { file: null,       label: 'miseon namu' },
}

const FAMILY = ['soyeon', 'minjung']

// 대사 비트들 → DialogueOverlay 가 읽는 형식
function toLines(lineBeats, guest) {
  const guests = Array.isArray(guest) ? guest : guest ? [guest] : []
  let lastFamily = 'soyeon'
  let lastGuest  = guests[0]
  return lineBeats.map(([who, face, text]) => {
    const cast = CAST[who]
    if (!cast) console.warn(`[script] 대본에 모르는 인물 이름이 있어요: "${who}" (Soyeon / Mother / Nakai / Hyungdoo / Miseon 중 하나)`)
    const file = cast?.file ?? null
    if (FAMILY.includes(file)) lastFamily = file
    if (guests.includes(file)) lastGuest = file

    let leftChar, rightChar, side
    if (guests.length) {
      leftChar  = lastGuest
      rightChar = lastFamily
      side      = guests.includes(file) ? 'left' : 'right'
    } else {
      leftChar  = 'minjung'
      rightChar = 'soyeon'
      side      = file === 'minjung' ? 'left' : 'right'
    }
    if (who === 'Miseon') side = 'narration'

    return { character: cast?.label ?? who, expression: face ?? null, text, side, leftChar, rightChar }
  })
}

// 대본 → 순서대로 보여줄 구간들
//   [{ type: 'dialogue', lines }, { type: 'cutscene', id, narration }, { type: 'inventory', id },
//    { type: 'cue', kind: 'camera' | 'effect' | 'fx', name }, ...]
//   여러 장면을 이어서 재생하려면 배열로: buildSegments([sceneA, sceneB])
//
//   ※ 대사와 대사 사이의 카메라·분위기·연출 신호는 대사창을 끊지 않아요.
//     다음 대사 줄에 붙여 두었다가(line.cues) 그 대사가 나오는 순간 보내요.
//     (대사창이 사라졌다 다시 생기면 스탠딩 일러스트가 번쩍이며 튀어 보여서)
//     다음이 컷신·인벤토리이거나 장면의 끝이면 따로 한 단계로 보내요.
export function buildSegments(scene) {
  if (Array.isArray(scene)) return joinScenes(scene.map((sc) => buildSegments(sc)))

  const segments = []
  let lineBeats = []       // 아직 대사창으로 묶지 않은 대사들
  let lineCues  = []       // lineBeats[i] 에 붙일 신호들
  let waiting   = []       // 다음 대사에 붙일 신호들

  const flushLines = () => {
    if (lineBeats.length) {
      const lines = toLines(lineBeats, scene.guest)
      lines.forEach((l, i) => { if (lineCues[i]?.length) l.cues = lineCues[i] })
      segments.push({ type: 'dialogue', lines })
    }
    lineBeats = []
    lineCues  = []
  }
  const flushWaiting = () => {
    waiting.forEach((c) => segments.push({ type: 'cue', ...c }))
    waiting = []
  }

  for (const beat of scene.beats) {
    // 대사: 기다리던 신호가 있으면 이 대사에 붙임
    if (Array.isArray(beat)) {
      lineCues[lineBeats.length] = waiting
      lineBeats.push(beat)
      waiting = []
      continue
    }

    // 신호: 다음이 대사인지 알 때까지 기다림
    const cue =
      beat.camera ? { kind: 'camera', name: beat.camera } :
      beat.effect ? { kind: 'effect', name: beat.effect } :
      beat.fx     ? { kind: 'fx',     name: beat.fx }     : null
    if (cue) { waiting.push(cue); continue }

    // 컷신·인벤토리: 대사창을 닫고, 기다리던 신호를 먼저 보낸 뒤 보여줌
    flushLines()
    flushWaiting()
    if (beat.cutscene) {
      const n = beat.narration
      segments.push({
        type: 'cutscene',
        id: beat.cutscene,
        narration: n ? { who: CAST[n.who]?.label ?? n.who, lines: n.lines } : null,
      })
    }
    else if (beat.inventory) segments.push({ type: 'inventory', id: beat.inventory })
  }
  flushLines()
  flushWaiting()
  return segments
}

// 여러 장면을 이어 붙일 때: 앞 장면이 대사로 끝나고 다음 장면이 대사로 시작하면
// 대사창을 끊지 않고 하나로 이어요. 그 사이의 신호는 다음 장면 첫 대사에 붙여요.
//   (예: 2장 영상 뒤 장면 → 정원이 밝아짐(bloom) → 3장 장면)
function joinScenes(sceneSegments) {
  const out = []
  let held = []   // 대사와 대사 사이에서 기다리는 신호들
  const last = () => out[out.length - 1]

  for (const segs of sceneSegments) {
    for (const seg of segs) {
      if (seg.type === 'cue' && last()?.type === 'dialogue') { held.push({ kind: seg.kind, name: seg.name }); continue }
      if (seg.type === 'dialogue' && last()?.type === 'dialogue') {
        const [first, ...rest] = seg.lines
        const merged = held.length ? { ...first, cues: [...held, ...(first.cues ?? [])] } : first
        out[out.length - 1] = { ...last(), lines: [...last().lines, merged, ...rest] }
        held = []
        continue
      }
      held.forEach((c) => out.push({ type: 'cue', ...c }))
      held = []
      out.push(seg)
    }
  }
  held.forEach((c) => out.push({ type: 'cue', ...c }))
  return out
}
