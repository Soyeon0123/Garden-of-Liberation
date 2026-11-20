import { useEffect, useRef } from 'react'
import { BGM } from '../../story/bgm'
import { onVoiceActive } from '../../story/voice'

// ─────────────────────────────────────────────────────────────
// BgmPlayer — 배경음악 재생 (화면엔 아무것도 안 그림)
//   track 이 바뀌면 앞 곡은 서서히 작아지고, 새 곡은 서서히 커짐 (크로스페이드)
//   같은 track 이 이어지면 아무것도 안 함 → 끊기지 않고 계속
//   track 이 null 이면 서서히 꺼짐
//
//   ▸ 소리 크기 : VOLUME (0 ~ 1)
//   ▸ 목소리가 나오는 동안 : VOLUME × DUCK 로 잠깐 작아졌다가 끝나면 돌아옴
//   ▸ 바뀌는 시간 : FADE_MS
//   ▸ 개발 중 음악 끄기 : 주소 끝에 ?mute
// ─────────────────────────────────────────────────────────────

const VOLUME  = 0.7
const DUCK    = 0.65    // 목소리 나오는 동안 배경음악 비율 (0.4 = 40% 크기, 1 = 안 줄임)
const DUCK_MS = 300    // 작아지고 돌아오는 시간
const FADE_MS = 1500

const MUTED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mute')
const log = (...args) => { if (import.meta.env.DEV) console.log('[BgmPlayer]', ...args) }

// 브라우저가 알려주는 오류 번호 → 이유
const MEDIA_ERRORS = {
  1: '재생이 중단됨',
  2: '네트워크 문제',
  3: '파일을 읽다가 실패 (파일이 손상됐거나 형식이 맞지 않음)',
  4: '파일이 없거나 브라우저가 지원하지 않는 형식 (경로·이름·확장자 확인)',
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))

// 소리를 서서히 바꾸기
//   (브라우저가 주는 프레임 시각이 시작 시각보다 살짝 앞설 수 있어서, 진행률과 소리 크기를 0~1 로 묶어 둠)
function fadeTo(audio, target, ms, onDone) {
  cancelAnimationFrame(audio._fade)
  const from = audio.volume
  const start = performance.now()
  const step = (now) => {
    const t = clamp01((now - start) / ms)
    audio.volume = clamp01(from + (target - from) * t)
    if (t < 1) audio._fade = requestAnimationFrame(step)
    else onDone?.()
  }
  audio._fade = requestAnimationFrame(step)
}

export default function BgmPlayer({ track }) {
  const players = useRef(new Map())   // 곡 이름 → Audio
  const current = useRef(null)
  const level   = useRef(VOLUME)      // 지금 목표 크기 (목소리 나오면 작아짐)

  // 목소리가 나오는 동안 배경음악을 살짝 줄임
  useEffect(() => onVoiceActive((active) => {
    level.current = active ? VOLUME * DUCK : VOLUME
    const audio = current.current && players.current.get(current.current)
    if (audio && !audio.paused) fadeTo(audio, level.current, DUCK_MS)
  }), [])

  useEffect(() => {
    if (MUTED || track === current.current) return
    const prevName = current.current
    current.current = track

    // 앞 곡: 서서히 끄고 멈춤 (다시 돌아오면 처음부터)
    const prev = prevName && players.current.get(prevName)
    if (prev) fadeTo(prev, 0, FADE_MS, () => { prev.pause(); prev.currentTime = 0 })

    log(`곡 변경: ${prevName ?? '없음'} → ${track ?? '없음'}`)
    if (!track) return
    const src = BGM[track]
    if (!src) { console.warn(`[BgmPlayer] story/bgm.js 의 BGM 목록에 "${track}" 이 없어요`); return }

    // 새 곡: 처음 쓰는 곡이면 준비
    let audio = players.current.get(track)
    if (!audio) {
      audio = new Audio(src)
      audio.loop = true
      audio.preload = 'auto'
      audio.addEventListener('error', () => {
        const code = audio.error?.code
        console.warn(`[BgmPlayer] "${track}" 을 재생할 수 없어요: ${src}\n  이유: ${MEDIA_ERRORS[code] ?? '알 수 없음'} (오류 ${code})`)
      })
      players.current.set(track, audio)
    }
    audio.volume = 0
    const play = () => audio.play().then(() => { log(`▶ 재생 시작: ${track} (${src})`); fadeTo(audio, level.current, FADE_MS) })

    play().catch((err) => {
      if (err?.name === 'NotAllowedError') {
        // 브라우저가 자동 재생을 막음 → 다음 클릭 때 재생
        log(`자동 재생이 막혀서 다음 클릭 때 재생할게요: ${track}`)
        const retry = () => { if (current.current === track) play().catch(() => {}) }
        window.addEventListener('pointerdown', retry, { once: true })
      } else if (err?.name !== 'AbortError') {
        console.warn(`[BgmPlayer] "${track}" 재생 실패: ${err?.name} — ${err?.message}`)
      }
    })
  }, [track])

  // 화면을 떠날 때 모두 정지
  useEffect(() => () => players.current.forEach((a) => a.pause()), [])

  return null
}
