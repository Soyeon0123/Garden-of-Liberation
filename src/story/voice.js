// ─────────────────────────────────────────────────────────────
// story/voice.js — 대사 목소리 (보이스오버)
//
//   대사가 나올 때마다(클릭할 때마다) 그 인물 폴더의 녹음 중 하나를 무작위로 재생해요.
//   (바로 앞에 나온 녹음은 연달아 나오지 않게 피함)
//
//   ▸ 녹음 위치 : public/audio/voice/<번호_역할>/ 안에 아무 이름으로나 넣으면 돼요 (mp3·wav·m4a·ogg)
//       01_soyeon   02_mother   03_chang   04_nakai   05_miseon
//       06_foreign : 인트로 웹툰의 외국인 커플
//     파일 목록은 vite-voice-list.js 플러그인이 폴더를 읽어서 자동으로 만들어요.
//     (녹음을 넣거나 빼도 코드를 고칠 필요 없음)
//   ▸ 폴더 이름 앞의 번호는 무시하고, 뒤쪽 이름으로 인물을 찾아요 → FOLDER_TO_VOICE
//
//   ▸ 목소리 크기 : VOICE_VOLUME
//   ▸ 목소리가 나오는 동안 배경음악 크기 : BgmPlayer.jsx 의 DUCK
//   ▸ 개발 중 소리 끄기 : 주소 끝에 ?mute (배경음악·목소리 모두)
// ─────────────────────────────────────────────────────────────
import voiceFiles from 'virtual:voice-list'

const BASE = import.meta.env.BASE_URL
const VOICE_FOLDER = `${BASE}audio/voice/`

export const VOICE_VOLUME = 1.0

// 폴더 이름(번호 뺀 부분) → 목소리 이름
//   대화창 인물은 대화창에 표시되는 이름과 같게, 웹툰 말풍선은 bubble.voice 에 쓰는 이름
const FOLDER_TO_VOICE = {
  soyeon:    'Soyeon',
  mother:    'Mother',
  nakai:     'Nakai',
  chang:     'Hyungdoo',
  miseon:    'miseon namu',
  foreign:   'foreign',     // 인트로 웹툰 외국인 커플
}

// 목소리 이름 → 녹음 주소들
export const VOICES = {}
for (const [folder, files] of Object.entries(voiceFiles)) {
  const role = folder.replace(/^\d+_/, '')
  const name = FOLDER_TO_VOICE[role]
  if (!name) { console.warn(`[voice] "${folder}" 폴더가 어느 인물인지 몰라요 → story/voice.js 의 FOLDER_TO_VOICE 에 추가해 주세요`); continue }
  VOICES[name] = files.map((f) => `${VOICE_FOLDER}${encodeURIComponent(folder)}/${encodeURIComponent(f)}`)
}
if (import.meta.env.DEV) {
  console.log('[voice] 녹음 목록:', Object.fromEntries(Object.entries(VOICES).map(([k, v]) => [k, `${v.length}개`])))
}

const MUTED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mute')

// ── 재생 ──
const cache = new Map()        // 파일 → Audio
const lastPicked = new Map()   // 인물 → 마지막으로 고른 파일
const warned = new Set()
let current = null             // 지금 나오는 Audio
let lastKey = null             // 같은 대사로 두 번 불리는 것 방지 (개발 모드 StrictMode)
let lastKeyAt = 0

// 목소리 시작/끝 알림 (배경음악이 잠깐 작아지도록)
const listeners = new Set()
export const onVoiceActive = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const notify = (active) => listeners.forEach((fn) => fn(active))

function pick(character) {
  const list = VOICES[character]
  if (!list || list.length === 0) return null
  if (list.length === 1) return list[0]
  const last = lastPicked.get(character)
  let src
  do { src = list[Math.floor(Math.random() * list.length)] } while (src === last)
  lastPicked.set(character, src)
  return src
}

export function stopVoice() {
  if (!current) return
  current.pause()
  current.currentTime = 0
  current = null
  notify(false)
}

// 여러 명이 차례로 말할 때 (웹툰 말풍선 두 개 등): 앞 목소리가 끝나면 다음 목소리
let queueToken = 0
export function playVoices(characters, key) {
  const token = ++queueToken
  const list = characters.filter(Boolean)
  const next = (i) => {
    if (token !== queueToken || i >= list.length) return
    const audio = playVoice(list[i], i === 0 ? key : `${String(key)}:${i}`, { fromQueue: true })
    if (audio) audio.addEventListener('ended', () => next(i + 1), { once: true })
    else next(i + 1)
  }
  next(0)
}

// character : 대화창의 이름 (d.character)
// key       : 대사를 구분하는 값 (같은 대사로 연달아 불리면 무시)
export function playVoice(character, key, { fromQueue = false } = {}) {
  if (MUTED) return null
  if (!fromQueue) queueToken++
  const now = performance.now()
  if (key !== undefined && key === lastKey && now - lastKeyAt < 300) return null
  lastKey = key
  lastKeyAt = now

  stopVoice()
  const src = pick(character)
  if (!src) return null

  let audio = cache.get(src)
  if (!audio) {
    audio = new Audio(src)
    audio.preload = 'auto'
    audio.addEventListener('error', () => {
      if (warned.has(src)) return
      warned.add(src)
      console.warn(`[voice] 목소리 파일을 찾을 수 없어요: ${src}  (story/voice.js 의 VOICES 확인)`)
    })
    audio.addEventListener('ended', () => { if (current === audio) { current = null; notify(false) } })
    cache.set(src, audio)
  }
  audio.volume = VOICE_VOLUME
  audio.currentTime = 0
  current = audio
  notify(true)
  audio.play().catch(() => { if (current === audio) { current = null; notify(false) } })
  return audio
}
