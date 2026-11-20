// ─────────────────────────────────────────────────────────────
// MoodOverlay — 3D 정원 위에 씌우는 분위기 막
//   imperial : 1장 — 정원이 어두워지고 가장자리부터 붉은 빛이 번짐
//   local    : 2장 — 부드러운 푸른 톤
//   bloom    : 3장 전환 — 밝고 따뜻한 빛
//
//   3D 화면(z 1)과 배경 이미지(z 0) 위, 대화창(z 100)·컷신 아래(z 2)에 놓여요.
//   blend
//     multiply : 아래 화면을 "물들이며" 어둡게 (imperial, local)
//     screen   : 아래 화면을 "비추며" 밝게 (bloom)
//   진하기는 rgba(…, 숫자) 의 마지막 숫자 — 줄이면 은은해져요.
// ─────────────────────────────────────────────────────────────

const MOODS = {
  imperial: {
    background:
      'radial-gradient(ellipse at 50% 45%, rgba(170, 40, 30, 0.35) 0%, rgba(110, 10, 10, 0.75) 60%, rgba(40, 0, 0, 0.92) 100%)',
    blend: 'multiply',
    fadeIn: 2.5,   // 초
  },
  local: {
    background:
      'radial-gradient(ellipse at 50% 40%, rgba(200, 220, 250, 0.35) 0%, rgba(150, 180, 230, 0.6) 65%, rgba(90, 120, 180, 0.75) 100%)',
    blend: 'multiply',
    fadeIn: 2.5,
  },
  bloom: {
    background:
      'radial-gradient(ellipse at 50% 40%, rgba(255, 240, 210, 0.35) 0%, rgba(255, 220, 180, 0.18) 60%, rgba(255, 210, 170, 0.05) 100%)',
    blend: 'screen',
    fadeIn: 3,
  },
}

export default function MoodOverlay({ mood }) {
  return (
    <>
      {Object.entries(MOODS).map(([name, m]) => (
        <div
          key={name}
          style={{
            position: 'fixed', inset: 0, zIndex: 2,
            pointerEvents: 'none',
            background: m.background,
            mixBlendMode: m.blend,
            opacity: mood === name ? 1 : 0,
            transition: `opacity ${m.fadeIn}s ease`,
          }}
        />
      ))}
    </>
  )
}
