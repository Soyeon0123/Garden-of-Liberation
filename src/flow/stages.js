// 전체 진행 단계 정의 (값은 소문자, 비교할 때도 소문자로)
export const STAGES = {
  ONBOARDING:         'onboarding',
  INTRO_COMIC:        'intro_comic',
  GARDEN_ARRIVAL:     'garden_arrival',
  CHAPTER_1_DIALOGUE: 'chapter_1_dialogue',
  CHAPTER_1_VIDEO:    'chapter_1_video',
  CHAPTER_2_DIALOGUE: 'chapter_2_dialogue',
  CHAPTER_2_VIDEO:    'chapter_2_video',
  CHAPTER_3_DIALOGUE: 'chapter_3_dialogue',
  CHAPTER_3_VIDEO:    'chapter_3_video',
  CHAPTER_3_FINAL:    'chapter_3_final',
  NAME_CHOICE:        'name_choice',
  ENDING_2_DIALOGUE:  'ending_2_dialogue',
  ENDING_3_DIALOGUE:  'ending_3_dialogue',
  ENDING_4_DIALOGUE:  'ending_4_dialogue',
  ENDING_CUTSCENE:    'ending_cutscene',
  OUTRO_COMIC:        'outro_comic',
  CREDITS:            'credits',
  TIMELINE:           'timeline',
}

// "Skip to the choice" 버튼이 보이는 3D 챕터 구간
export const CHAPTER_STAGES = [
  STAGES.GARDEN_ARRIVAL,
  STAGES.CHAPTER_1_DIALOGUE, STAGES.CHAPTER_1_VIDEO,
  STAGES.CHAPTER_2_DIALOGUE, STAGES.CHAPTER_2_VIDEO,
  STAGES.CHAPTER_3_DIALOGUE, STAGES.CHAPTER_3_VIDEO,
  STAGES.CHAPTER_3_FINAL,
]

// 3D 공간을 띄우지 않는 전체화면 단계
export const FULLSCREEN_STAGES = [
  STAGES.ONBOARDING, STAGES.INTRO_COMIC, STAGES.ENDING_CUTSCENE,
  STAGES.OUTRO_COMIC, STAGES.CREDITS, STAGES.TIMELINE,
]
