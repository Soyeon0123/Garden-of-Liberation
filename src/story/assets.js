// ─────────────────────────────────────────────────────────────
// story/assets.js — 내러티브에 쓰이는 모든 에셋 경로를 모아 둔 곳
//
//   ▸ 파일을 옮기거나 이름을 바꾸면 이 파일만 고치면 돼요.
//   ▸ 다른 코드에서는 경로를 직접 쓰지 말고 여기서 가져다 써요.
//       import { CUTSCENES, ITEMS } from './story/assets'
//       <img src={CUTSCENES.floraPage} />
//
//   ▸ 개발 중 확인: 브라우저 콘솔에 checkAssets() 를 입력하면
//     아래 파일이 전부 실제로 있는지 검사해서 없는 파일만 알려줘요.
// ─────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL

// ── ① 폴더 위치 ── public/ 안에서의 실제 폴더 이름과 다르면 여기만 고치세요
const FOLDERS = {
  env:       `${BASE}3D_Env_Assets/`,
  cutscene:  `${BASE}Cutscene/`,
  ending:    `${BASE}EndingCutscene/`,
  inventory: `${BASE}InventoryIllust/`,
  video:     `${BASE}video/`,
  figure:    `${BASE}UI/figure_illust/`,
}

// ── ② 3D 공간에 놓이는 이미지 (png, Billboard 로 띄움) ──
export const ENV = {
  miseonNamu: `${FOLDERS.env}miseon_namu_icon.png`,   // 시작부터 연못 중앙
  nameTag:    `${FOLDERS.env}name_tag_icon.png`,      // 시작부터 연못 앞
  flag:       `${FOLDERS.env}flag_icon.png`,          // 1장 후반, 분위기 전환 때 등장
}

// ── ③ 컷신 (jpg, 내러티브 디자인 V4 등장 순서) ──
//   ※ 번호와 장면 짝은 문서 순서로 추정한 거예요. 실제 그림과 다르면 번호만 바꿔 주세요.
const cut = (n) => `${FOLDERS.cutscene}${String(n).padStart(2, '0')}.jpg`

export const CUTSCENES = {
  // 정원 도착
  nameplateBlank:      cut(1),    // 미선나무 아래 빈 이름표
  nakaiAppears:        cut(2),    // 표본을 든 나카이 등장
  // 1장 — The Eye of Empire
  uchiwaMeaning:       cut(3),    // Uchiwa = 부채, ki = 나무
  floraPage:           cut(4),    // Flora Sylvatica Koreana 페이지
  linnaeusCongress:    cut(5),    // 린네 초상 & 비엔나 식물학회의
  herbarium:           cut(6),    // 나카이의 표본
  // 2장 — The Voice of Local
  hyungdooAppears:     cut(7),    // 흙 묻은 손, 채집 도구를 든 장형두 등장
  hyangmyeongjipPage:  cut(8),    // 조선식물향명집 페이지
  collectingTools:     cut(9),    // 채집 도구, 야장, 일기
  notebookSketches:    cut(10),   // 노트 속 식물 스케치
  forcedJapanese:      cut(11),   // 일본어 사용을 강요당한 시기
  koreanScenery:       cut(12),   // 한국의 아름다운 풍경
  // 이름이 새겨지는 장면 (선택한 이름별)
  plaqueUchiwa:        cut(13),
  plaqueScientific:    cut(14),
  plaqueEnglish:       cut(15),
  plaqueMiseon:        cut(16),
}

// ── ④ 엔딩 컷신 (jpg) ── true 는 클릭할 때마다 1 → 2 → 3
export const ENDINGS = {
  uchiwa:     [`${FOLDERS.ending}uchiwa.jpg`],
  scientific: [`${FOLDERS.ending}scientific.jpg`],
  english:    [`${FOLDERS.ending}english.jpg`],
  true:       [1, 2, 3].map((n) => `${FOLDERS.ending}true_${n}.jpg`),
}

// 이름 선택지 id → 엔딩 / 이름표 컷신
export const CHOICE_TO_ENDING = {
  japanese:   { ending: 'uchiwa',     plaque: 'plaqueUchiwa' },
  scientific: { ending: 'scientific', plaque: 'plaqueScientific' },
  english:    { ending: 'english',    plaque: 'plaqueEnglish' },
  korean:     { ending: 'true',       plaque: 'plaqueMiseon' },
}

// ── ⑤ 인벤토리 (png) ── 챕터별 3개, 책 두 권은 펼친 페이지가 따로 있음
const inv = (name) => `${FOLDERS.inventory}${name}.png`

export const ITEMS = {
  floraSylvatica:  { chapter: 1, name: 'Flora Sylvatica Koreana',             image: inv('chp1_1'), page: inv('chp1_1_2') },
  botanicalCongress:{ chapter: 1, name: 'The Picture of Botanical Congress',  image: inv('chp1_2') },
  herbarium:       { chapter: 1, name: 'Herbarium Specimens',                 image: inv('chp1_3') },
  hyangmyeongjip:  { chapter: 2, name: 'Joseon Singmul Hyangmyeongjip',       image: inv('chp2_1'), page: inv('chp2_1_2') },
  collectingTool:  { chapter: 2, name: 'Collecting Tool',                     image: inv('chp2_2') },
  fieldJournal:    { chapter: 2, name: 'Field Journal & Botanical Notebook',  image: inv('chp2_3') },
  seed:            { chapter: 3, name: 'Seed',                                image: inv('chp3_1') },
  fruit:           { chapter: 3, name: 'Fruit',                               image: inv('chp3_2') },
  flower:          { chapter: 3, name: 'Flower',                              image: inv('chp3_3') },
}

// ── ⑥ 챕터 영상 ── 아직 1장만 있음 (확장자가 다르면 여기서 바꾸기)
export const MOTION = {
  ch1: `${FOLDERS.video}chp1.mp4`,
  // ch2: `${FOLDERS.video}chp2.mp4`,
  // ch3: `${FOLDERS.video}chp3.mp4`,
}

// ── ⑦ 캐릭터 일러스트 ──
export const CHARACTERS = ['soyeon', 'minjung', 'nakai', 'hyungdoo']
export const getFigure = (who, face) =>
  who ? `${FOLDERS.figure}${who}${face ? `_${face}` : ''}.png` : null

// ─────────────────────────────────────────────────────────────
// 챕터별 묶음 — 한 챕터 앞서 미리 받아 둘 때 사용
// ─────────────────────────────────────────────────────────────
const itemFiles = (ch) =>
  Object.values(ITEMS).filter((it) => it.chapter === ch).flatMap((it) => [it.image, it.page].filter(Boolean))

export const CHAPTER_IMAGES = {
  arrival: [ENV.miseonNamu, ENV.nameTag, CUTSCENES.nameplateBlank, CUTSCENES.nakaiAppears],
  ch1: [ENV.flag, CUTSCENES.uchiwaMeaning, CUTSCENES.floraPage, CUTSCENES.linnaeusCongress, CUTSCENES.herbarium, ...itemFiles(1)],
  ch2: [CUTSCENES.hyungdooAppears, CUTSCENES.hyangmyeongjipPage, CUTSCENES.collectingTools,
        CUTSCENES.notebookSketches, CUTSCENES.forcedJapanese, CUTSCENES.koreanScenery, ...itemFiles(2)],
  ch3: [...itemFiles(3)],
  endings: [CUTSCENES.plaqueUchiwa, CUTSCENES.plaqueScientific, CUTSCENES.plaqueEnglish, CUTSCENES.plaqueMiseon,
            ...Object.values(ENDINGS).flat()],
}

// ─────────────────────────────────────────────────────────────
// 개발용: 콘솔에서 checkAssets() → 없는 파일 목록
// ─────────────────────────────────────────────────────────────
const FACES = {
  soyeon:   ['', 'curious', 'smile', 'surprised', 'disappointed'],
  minjung:  ['', 'smile', 'surprised', 'disappointed'],
  nakai:    ['', 'smile', 'annoying', 'exciting', 'disappointed'],
  hyungdoo: ['', 'smile', 'trueSmile', 'disappointed'],
}

export async function checkAssets() {
  const images = [
    ...Object.values(CHAPTER_IMAGES).flat(),
    ...Object.entries(FACES).flatMap(([who, faces]) => faces.map((f) => getFigure(who, f))),
  ]
  const imageOk = (src) => new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
  // Vite 개발 서버는 없는 파일에도 index.html(200)을 돌려줄 수 있어서, 영상은 형식까지 확인
  const videoOk = async (src) => {
    try {
      const res = await fetch(src, { method: 'HEAD' })
      return res.ok && (res.headers.get('content-type') || '').startsWith('video')
    } catch { return false }
  }

  const unique = [...new Set(images)]
  const results = await Promise.all([
    ...unique.map(async (src) => ({ src, ok: await imageOk(src) })),
    ...Object.values(MOTION).map(async (src) => ({ src, ok: await videoOk(src) })),
  ])
  const missing = results.filter((r) => !r.ok).map((r) => r.src)
  console.log(`[checkAssets] ${results.length - missing.length} / ${results.length} 개 확인됨`)
  if (missing.length) console.warn('[checkAssets] 찾을 수 없는 파일:', missing)
  else console.log('[checkAssets] 모든 파일이 제자리에 있어요 ✓')
  return missing
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.checkAssets = checkAssets
}
