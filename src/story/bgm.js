// ─────────────────────────────────────────────────────────────
// story/bgm.js — 배경음악 목록과 "어느 구간에 어떤 곡" 규칙
//
//   ▸ 파일 위치 : public/audio/bgm/  (다른 곳에 두셨다면 BGM_FOLDER 만 고치기)
//   ▸ 곡 추가/교체 : BGM 목록에 이름과 파일을 적고, pickBgm 에서 그 이름을 쓰기
//   ▸ 같은 곡이 이어지는 구간은 끊기지 않고 계속 재생돼요 (예: 2장 뒤 ~ 3장 ~ 이름 선택)
// ─────────────────────────────────────────────────────────────
import { STAGES } from '../flow/stages'

const BASE = import.meta.env.BASE_URL
const BGM_FOLDER = `${BASE}audio/bgm/`

export const BGM = {
  enterGarden: `${BGM_FOLDER}enter_garden.mp3`,
  chp1:        `${BGM_FOLDER}chp1.mp3`,
  chp1Video:   `${BGM_FOLDER}chp1_video.mp3`,   // 1장 애니메이션 영상에 소리가 들어가면 삭제
  chp1After:   `${BGM_FOLDER}chp1_after.mp3`,
  chp2:        `${BGM_FOLDER}chp2.mp3`,
  chp2Video:   `${BGM_FOLDER}chp2_video.mp3`,   // 2장 애니메이션 영상에 소리가 들어가면 삭제
  chp2After:   `${BGM_FOLDER}chp2_after.mp3`,
  chp3Video:   `${BGM_FOLDER}chp3_video.mp3`,   // 3장 애니메이션 영상에 소리가 들어가면 삭제
  uchiwa:      `${BGM_FOLDER}uchiwa.mp3`,
  exitGarden:  `${BGM_FOLDER}exit_garden.mp3`,
}

// 엔딩별 음악 (이름 선택 id → 곡)
const ENDING_BGM = {
  japanese:   'uchiwa',
  scientific: 'chp2After',
  english:    'chp2After',
  korean:     'exitGarden',
}

const ENDING_STAGES = [
  STAGES.ENDING_2_DIALOGUE, STAGES.ENDING_3_DIALOGUE, STAGES.ENDING_4_DIALOGUE,
  STAGES.ENDING_CUTSCENE, STAGES.OUTRO_COMIC, STAGES.CREDITS, STAGES.TIMELINE,
]

// 지금 상황에 맞는 곡 이름 (없으면 null = 음악 없음)
//   stage      : 현재 단계
//   mood       : 대본의 분위기 ('imperial' | 'local' | 'bloom' | null)
//   endingType : 고른 이름 ('korean' | 'japanese' | 'scientific' | 'english' | null)
export function pickBgm({ stage, mood, endingType }) {
  switch (stage) {
    case STAGES.GARDEN_ARRIVAL:      return 'enterGarden'
    case STAGES.CHAPTER_1_DIALOGUE:  return 'chp1'
    case STAGES.CHAPTER_1_VIDEO:     return 'chp1Video'
    // 1장 영상 뒤 대화는 chp1_after, 2장 분위기(local)로 바뀌는 순간부터 chp2
    case STAGES.CHAPTER_2_DIALOGUE:  return mood === 'local' ? 'chp2' : 'chp1After'
    case STAGES.CHAPTER_2_VIDEO:     return 'chp2Video'
    case STAGES.CHAPTER_3_DIALOGUE:  return 'chp2After'
    case STAGES.CHAPTER_3_VIDEO:     return 'chp3Video'
    case STAGES.CHAPTER_3_FINAL:     return 'chp2After'
    case STAGES.NAME_CHOICE:         return 'chp2After'
    default:
      // 엔딩 대화 → 엔딩 컷신 → (진엔딩) 아웃트로 웹툰 → 크레딧·타임라인까지 엔딩 곡 유지
      if (ENDING_STAGES.includes(stage)) return ENDING_BGM[endingType] ?? null
      return null   // 온보딩·인트로 웹툰 등은 음악 없음
  }
}
