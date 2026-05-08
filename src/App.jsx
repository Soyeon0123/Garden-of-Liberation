import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html, Billboard } from '@react-three/drei'
import { EffectComposer, Outline, Selection, Select } from '@react-three/postprocessing'
import * as THREE from 'three'
import './styles/tokens.css'
import './styles/comic.css'

const BASE = import.meta.env.BASE_URL

// ─── 3D 모델 imports ──────────────────────────────────────────
import Palace   from './components/3D/models/Palace'
import Palace02 from './components/3D/models/Palace02'
import Palace03 from './components/3D/models/Palace03'
import Palace04 from './components/3D/models/Palace04'
import Palace05 from './components/3D/models/Palace05'
import Palace06 from './components/3D/models/Palace06'
import Structure from './components/3D/models/Structure'

// ─── Stage 정의 ───────────────────────────────────────────────
const STAGES = {
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
  ENDING_COMIC:       'ending_comic',
  CREDITS:            'credits',
}

// ─── 캐릭터 이미지 헬퍼 ──────────────────────────────────────
const getCharImg = (charName, expression) => {
  if (!charName) return null
  const expr = expression ? `_${expression}` : ''
  return `${BASE}UI/figure_illust/${charName}${expr}.png`
}

const ACTIVE_OUTLINE = `
  drop-shadow(2px 0px 0px #ffffff)
  drop-shadow(-2px 0px 0px #ffffff)
  drop-shadow(0px 2px 0px #ffffff)
  drop-shadow(0px -2px 0px #ffffff)
`

const ALL_PRELOAD = [
  `${BASE}images/Nakai_bg.png`, `${BASE}images/Jang_bg.png`, `${BASE}images/Paper_tex_2.png`,
  `${BASE}images/mison_namu.png`, `${BASE}typo/mison_namu.png`, `${BASE}typo/Uchiwa-noki.svg`,
  `${BASE}UI/figure_illust/nakai.png`,       `${BASE}UI/figure_illust/nakai_smile.png`,
  `${BASE}UI/figure_illust/nakai_annoying.png`, `${BASE}UI/figure_illust/nakai_exciting.png`,
  `${BASE}UI/figure_illust/nakai_dissapointed.png`,
  `${BASE}UI/figure_illust/soyeon.png`,      `${BASE}UI/figure_illust/soyeon_curious.png`,
  `${BASE}UI/figure_illust/soyeon_smile.png`, `${BASE}UI/figure_illust/soyeon_surprised.png`,
  `${BASE}UI/figure_illust/soyeon_dissapointed.png`,
  `${BASE}UI/figure_illust/minjung.png`,     `${BASE}UI/figure_illust/minjung_smile.png`,
  `${BASE}UI/figure_illust/minjung_surprised.png`, `${BASE}UI/figure_illust/minjung_dissapointed.png`,
  `${BASE}UI/figure_illust/hyungdoo.png`,    `${BASE}UI/figure_illust/hyungdoo_smile.png`,
  `${BASE}UI/figure_illust/hyungdoo_trueSmile.png`, `${BASE}UI/figure_illust/hyungdoo_dissapointed.png`,
  `${BASE}UI/standing_icon/nakai_standing.png`, `${BASE}UI/standing_icon/hyungdoo_standing.png`,
]

function usePreloadImages() {
  React.useEffect(() => {
    ALL_PRELOAD.forEach(src => { const i = new Image(); i.src = src })
  }, [])
}

const BOX_MARGIN = 50

// ─────────────────────────────────────────────────────────────
// 대사 데이터
// ─────────────────────────────────────────────────────────────
const DIALOGUES = {

  gardenArrival: [
    { character: 'Soyeon', expression: 'curious', text: "The nameplate... it's empty.",                                              side: 'right', leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Mother', expression: null,       text: "You're right... And somehow, this place feels familiar.",                   side: 'left',  leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Soyeon', expression: 'curious',  text: "Mom, didn't you tell me this plant's name earlier? What was it again?",    side: 'right', leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Mother', expression: null,       text: "That's strange... I definitely knew it... but I suddenly can't remember...", side: 'left', leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Soyeon', expression: 'curious',  text: "Should we ask him?",                                                        side: 'right', leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Mother', expression: 'smile',    text: "Yes... that's a good idea. Maybe he knows the name.",                       side: 'left',  leftChar: 'minjung', rightChar: 'soyeon' },
  ],

  chapter1: [
    { character: 'Nakai',  expression: null,           text: "...Who are you?",                                                                                                                      side: 'left',  leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Soyeon', expression: 'curious',      text: "Oh — hello. It's our first time here... Do you happen to know the name of that plant?",                                                side: 'right', leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Mother', expression: null,           text: "My daughter is curious about it. Would you be willing to tell us?",                                                                    side: 'right', leftChar: 'nakai', rightChar: 'minjung' },
    { character: 'Nakai',  expression: null,           text: "Why are you interested in its name?",                                                                                                  side: 'left',  leftChar: 'nakai', rightChar: 'minjung' },
    { character: 'Nakai',  expression: 'smile',        text: "I discovered this tree in Korea in 1917. I call it Uchiwa-noki.",                                                                     side: 'left',  leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Soyeon', expression: 'curious',      text: "Uchiwa-noki...? If it was discovered in Korea... Wouldn't that make it a Korean plant?",                                               side: 'right', leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Nakai',  expression: null,           text: "I was the first to publish it in academia. That's why my name — Nakai — appears in the scientific name.",                              side: 'left',  leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Mother', expression: null,           text: "Is publishing first really that important?",                                                                                            side: 'right', leftChar: 'nakai', rightChar: 'minjung' },
    { character: 'Nakai',  expression: null,           text: "Of course. The scholar who first describes a new plant receives naming rights. Leaving a name behind... is a kind of immortality.",    side: 'left',  leftChar: 'nakai', rightChar: 'minjung' },
    { character: 'Soyeon', expression: 'dissapointed', text: "Then... is there no Korean name?",                                                                                                     side: 'right', leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Nakai',  expression: 'annoying',     text: "A Korean name? Korea is part of the Japanese Empire... Why would it need a separate name?",                                            side: 'left',  leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Soyeon', expression: 'surprised',    text: "Wait... You're not from the present, are you?",                                                                                        side: 'right', leftChar: 'nakai', rightChar: 'soyeon'  },
    { character: 'Mother', expression: 'surprised',    text: "Soyeon... this looks like the Japanese colonial period.",                                                                               side: 'right', leftChar: 'nakai', rightChar: 'minjung' },
    { character: 'Nakai',  expression: 'exciting',     text: "It seems I'll have to personally demonstrate the academic contributions of the Japanese Empire.",                                        side: 'left',  leftChar: 'nakai', rightChar: 'minjung' },
  ],

  chapter2Reflection: [
    { character: 'Soyeon', expression: null,           text: "I had no idea plant names followed such a structured system...",                                 side: 'right', leftChar: null, rightChar: 'soyeon'  },
    { character: 'Mother', expression: null,           text: "Yes... and it's surprising how Western imperial science was adopted during the colonial period.",  side: 'right', leftChar: null, rightChar: 'minjung' },
    { character: 'Soyeon', expression: 'dissapointed', text: "...For some reason... the tree looks a little sad now.",                                          side: 'right', leftChar: null, rightChar: 'soyeon'  },
    { character: 'Mother', expression: null,           text: "I understand... But I don't think that's the name we were looking for.",                          side: 'right', leftChar: null, rightChar: 'minjung' },
  ],

  chapter2Main: [
    { character: 'Hyungdoo', expression: null,        text: "...Who are you?",                                                                                                                           side: 'left',  leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Soyeon',   expression: 'curious',   text: "Sorry for surprising you. We're trying to find the name of that plant in the center.",                                                       side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Mother',   expression: null,        text: "My daughter really wants to know its name.",                                                                                                 side: 'right', leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Hyungdoo', expression: 'smile',     text: "That plant was recorded in the Korean Plant Name Collection. It's called the Misun Tree.",                                                   side: 'left',  leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Soyeon',   expression: 'curious',   text: "May I ask who you are?",                                                                                                                     side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: null,        text: "My name is Chang Hyung-doo. I'm a botanist studying plants here in Korea.",                                                                  side: 'left',  leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: 'smile',     text: "We formed the Joseon Botanical Research Society. One of our most important goals was to give Korean names to plants previously known only by Japanese names.", side: 'left', leftChar: 'hyungdoo', rightChar: 'soyeon' },
    { character: 'Soyeon',   expression: 'curious',   text: "Why was it important not to use the Japanese name?",                                                                                         side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: null,        text: "I believed Korean plants should be seen through Korean eyes. I wanted to give beautiful names to the plants that grow on this land... names that belonged to us.", side: 'left', leftChar: 'hyungdoo', rightChar: 'soyeon' },
    { character: 'Soyeon',   expression: null,        text: "I never realized that so much effort and history were hidden behind the names of plants...",                                                  side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Mother',   expression: null,        text: "It's touching... and also a little sad that these stories aren't widely known.",                                                              side: 'right', leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Hyungdoo', expression: 'trueSmile', text: "It's alright. If future generations continue to use Korean names and remember their meaning... that's enough.",                               side: 'left',  leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Soyeon',   expression: 'smile',     text: "Thank you for sharing this story.",                                                                                                          side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Mother',   expression: null,        text: "Now... we can finally write the name on the sign.",                                                                                          side: 'right', leftChar: 'hyungdoo', rightChar: 'minjung' },
  ],

  // ── Chapter 3 ─────────────────────────────────────────────────
  // Phase 1: ch2 비디오 후 엄마+소연 짧은 반응 대화
  chapter3Reflection: [
    { character: 'Soyeon', expression: null,      text: "So much history... hidden behind just one name...",      side: 'right', leftChar: null, rightChar: 'soyeon'  },
    { character: 'Mother', expression: 'smile',   text: "And yet... here it still stands. Still blooming.",        side: 'right', leftChar: null, rightChar: 'minjung' },
  ],

  // Phase 2: 미선나무 첫 대사 (기존 chapter3 의 lines 1–6, 마지막 질문 제외)
  chapter3Pre: [
    { character: 'Soyeon',     expression: 'surprised', text: "Wait... it's alive? Well... I mean, of course it's alive... but...",                    side: 'right',     leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Mother',     expression: 'surprised', text: "It's... talking?",                                                                        side: 'left',      leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Misun Tree', expression: null,        text: "This is... a place where anything is possible... Even my voice... can be heard here...", side: 'narration', leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Soyeon',     expression: 'curious',   text: "We found your name. If we write it on the sign... can we go back?",                       side: 'right',     leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Mother',     expression: null,        text: "Please... send us back to where we were.",                                                side: 'left',      leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Misun Tree', expression: null,        text: "Of course... But before that... would you listen to my story?",                           side: 'narration', leftChar: 'minjung', rightChar: 'soyeon' },
  ],

  // Phase 3: ch3 비디오 후 소연·엄마의 감상 (document "After Chapter 3" 섹션)
  chapter3New: [
    { character: 'Soyeon',     expression: null, text: "There were so many stories hidden in a name...",             side: 'right', leftChar: 'minjung', rightChar: 'soyeon' },
    { character: 'Mother',     expression: null, text: "I learned so much today... It wasn't just a plant name.",    side: 'left',  leftChar: 'minjung', rightChar: 'soyeon' },
  ],

  // Phase 4: 미선나무 마지막 질문 → NAME_CHOICE
  chapter3Final: [
    { character: 'Misun Tree', expression: null, text: "A name... is more than a record... It is memory... So... what will you call me?", side: 'narration', leftChar: 'minjung', rightChar: 'soyeon' },
  ],

  // ── 엔딩 분기 ─────────────────────────────────────────────────
  ending2: [
    { character: 'Nakai',    expression: 'smile',        text: "So... like many others in Joseon, you've come to recognize the value of my work.",             side: 'left',  leftChar: 'nakai',    rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: 'dissapointed', text: "...If you understood what a name leaves behind... perhaps you might have chosen differently.",  side: 'left',  leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: null,           text: "The colonization of Joseon... even reaches the names of plants...",                              side: 'left',  leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Soyeon',   expression: 'dissapointed', text: "...Maybe... we should have thought more carefully...",                                            side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
  ],

  ending3: [
    { character: 'Nakai',    expression: 'exciting',     text: "As expected. You recognize the greatness of Western classification systems.",                     side: 'left',  leftChar: 'nakai',    rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: 'dissapointed', text: "A scientific name... But it feels distant from our own identity.",                                side: 'left',  leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Mother',   expression: null,           text: "Latin... A language no longer spoken, yet still holding authority...",                             side: 'right', leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Hyungdoo', expression: 'dissapointed', text: "...The scholar's name based on priority... stands clearly.",                                       side: 'left',  leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Soyeon',   expression: 'dissapointed', text: "...Was that too quick of a decision?",                                                             side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
  ],

  ending4: [
    { character: 'Nakai',    expression: null,           text: "English...?",                                                             side: 'left',  leftChar: 'nakai',    rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: null,           text: "Why choose an English name?",                                             side: 'left',  leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Mother',   expression: null,           text: "Did you choose English so more people could understand?",                  side: 'right', leftChar: 'hyungdoo', rightChar: 'minjung' },
    { character: 'Soyeon',   expression: null,           text: "...Yes... I thought more people could learn about it...",                  side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Hyungdoo', expression: 'dissapointed', text: "But sharing the Korean name would also be meaningful...",                  side: 'left',  leftChar: 'hyungdoo', rightChar: 'soyeon'  },
    { character: 'Soyeon',   expression: 'dissapointed', text: "...Did I compromise without realizing it?",                                side: 'right', leftChar: 'hyungdoo', rightChar: 'soyeon'  },
  ],
}

// ─────────────────────────────────────────────────────────────
// 인트로 컷 데이터  ─ cut_01 ~ cut_27, 3컷씩 9페이지
//
// bubbles 배열: { type: 'narration' | 'speech', text, style }
//   narration → .b-narration CSS 클래스 (사각형)
//   speech    → .b-speech   CSS 클래스 (말풍선)
//
// style 은 .comic-panel(position:relative) 기준 절대 좌표.
// 이미지가 width:100% 이므로 left/right 는 % 또는 px 모두 가능.
// 아래 위치값은 참고용이며 실제 이미지 레이아웃에 맞게 조정하세요.
// ─────────────────────────────────────────────────────────────
const pad2 = (n) => String(n).padStart(2, '0')

// padding 40px*2 + gap 20px*2 = 120px  (원본 동일)
const PANEL_WIDTH = 'calc((100vw - 120px) / 3)'

const INTRO_PANELS = [
  // ── Page 1: cut 01–03 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_01.png`,
    bubbles: [
      {
        type: 'narration',
        text: 'Changdeokgung in spring is always covered with bright blossoms. From late March to early April, many flowers begin to bloom.',
        style: { top: '-20px', left: '0', right: '0' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_02.png`,
    bubbles: [
      {
        type: 'narration',
        text: 'My mom and I often visit the palace like this when the weather is nice.',
        style: { bottom: '-20px', left: '0', right: '0' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_03.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Wow… it\'s so beautiful!',
        style: { bottom: '80%', left: '-10%', right: '5%' },
      },
    ],
  },

  // ── Page 2: cut 04–06 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_04.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'See? I told you it was a good idea to come.',
        style: { top: '-15%', left: '5%', right: '25%' },
      },
      {
        type: 'speech',
        text: 'Yeah, totally!',
        style: { top: '-5%', right: '5%', left: '50%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_05.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Look at that tree! It\'s so beautiful. What\'s it called?',
        style: { top: '5%', left: '5%', right: '5%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_06.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Hmm… that\'s called the Misun Tree. It\'s a species found only in Korea.',
        style: { top: '-15%', left: '-5%', right: '5%' },
      },
    ],
  },

  // ── Page 3: cut 07–09 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_07.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Really? But why is it called Misun?',
        style: { top: ' 75%', left: '35%', right: '5%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_08.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'The shape of its seeds looks like a Misun fan. In old stories, royal attendants carried fans called Misun.',
        style: { top: '65%', left: '2%', right: '5%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_09.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Hmm…',
        style: { top: '-10%', left: '25%', right: '30%' },
      },
    ],
  },

  // ── Page 4: cut 10–12 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_10.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Let me check if you\'re right, Mom.',
        style: { top: '-10%', left: '5%', right: '25%' },
      },
      {
        type: 'speech',
        text: 'Hey! You don\'t trust me?',
        style: { top: '-20%', right: '-30%', left: '50%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_11.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Oh…',
        style: { top: '5%', left: '5%', right: '60%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_12.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'What a beautiful flowering tree!',
        style: { top: '-15%', left: '-5%', right: '10%' },
      },
      {
        type: 'speech',
        text: 'It\'s stunning!',
        style: { top: '5%', right: '15%', left: '50%' },
      },
    ],
  },

  // ── Page 5: cut 13–15 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_13.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Excuse me, do you happen to know the name of this tree?',
        style: { top: '-10%', left: '45%', right: '-5%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_14.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Just a moment… I\'ll look up the English name.',
        style: { bottom: '-5%', left: '-5%', right: '5%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_15.png`,
    bubbles: [
      {
        type: 'speech',
        text: '...Huh?',
        style: { top: '10%', left: '5%', right: '50%' },
      },
    ],
  },

  // ── Page 6: cut 16–18 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_16.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Nakai…?',
        style: { top: '-10%', left: '5%', right: '40%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_17.png`,
    bubbles: [
      {
        type: 'speech',
        text: '...',
        style: { top: '10%', left: '5%', right: '60%' },
      },
    ],
  },
  {
    // Cut 18: Soyeon silently looks up — no text bubble needed
    image: `${BASE}comics/intro/cut_18.png`,
    bubbles: [],
  },

  // ── Page 7: cut 19–21 ──────────────────────────────────────
  {
    // Cut 19: She reaches toward the tree — no text bubble needed
    image: `${BASE}comics/intro/cut_19.png`,
    bubbles: [],
  },
  {
    image: `${BASE}comics/intro/cut_20.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Wait—?!',
        style: { top: '-10%', left: '5%', right: '50%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_21.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Soyeon!!!',
        style: { top: '-10%', left: '5%', right: '50%' },
      },
    ],
  },

  // ── Page 8: cut 22–24 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_22.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Ah?!',
        style: { top: '-10%', left: '35%', right: '35%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_23.png`,
    bubbles: [
      {
        type: 'speech',
        text: 'Oh my God! What\'s happening?!',
        style: { top: '-5%', left: '60%', right: '5%' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_24.png`,
    bubbles: [
      {
        type: 'narration',
        text: 'After that… I remember nothing.',
        style: { bottom: '50px', left: '0', right: '0' },
      },
    ],
  },

  // ── Page 9: cut 25–27 ──────────────────────────────────────
  {
    image: `${BASE}comics/intro/cut_25.png`,
    bubbles: [
      {
        type: 'narration',
        text: 'The only thing I remember…',
        style: { top: '20px', left: '0', right: '0' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_26.png`,
    bubbles: [
      {
        type: 'narration',
        text: 'Was the unusually strong—',
        style: { bottom: '70px', left: '0', right: '0' },
      },
    ],
  },
  {
    image: `${BASE}comics/intro/cut_27.png`,
    bubbles: [
      {
        type: 'narration',
        text: '—fragrance of the Misun blossoms.',
        style: { bottom: '150px', left: '0', right: '0' },
      },
    ],
  },
]

// INTRO_PANELS 는 3컷씩 9페이지로 그룹화 (원본 레이아웃 그대로)
const INTRO_PAGES = []
for (let i = 0; i < INTRO_PANELS.length; i += 3) {
  INTRO_PAGES.push(INTRO_PANELS.slice(i, i + 3))
}

// ─────────────────────────────────────────────────────────────
// 아웃트로 컷 데이터  ─ out_cut_01 ~ out_cut_19, 3컷씩
//   out_cut_07, out_cut_19 는 solo (단독 풀스크린)
// ─────────────────────────────────────────────────────────────
const makeOutroCut = (n, solo = false, bubbles = []) => ({
  image: `${BASE}comics/outro/out_cut_${pad2(n)}.png`,
  bubbles,
  solo,
})

// ── 아웃트로 컷 데이터 (out_cut_01 ~ out_cut_19) ──────────────
// narration → .b-narration (사각형)
// speech    → .b-speech   (말풍선)
// solo: true → 단독 풀스크린 (cut_07, cut_19)
// ─────────────────────────────────────────────────────────────
const OUTRO_PAGES = [
  // ── Page 1: cut 01–03 ──────────────────────────────────────
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

  // ── Page 2: cut 04–06 ──────────────────────────────────────
  [
    // Flashback — Chang Hyung-doo's voice
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

  // ── Page 3: cut 07 — solo ──────────────────────────────────
  [
    makeOutroCut(7, true, [
      { type: 'speech', text: 'Mison Tree.', style: { top: '10%', left: '30%', right: '40%' } },
    ]),
  ],

  // ── Page 4: cut 08–10 ──────────────────────────────────────
  [
    makeOutroCut(8, false, [
      { type: 'speech', text: 'Thank you!', style: { top: '5%', left: '55%', right: '5%' } },
    ]),
    makeOutroCut(9, false, [
      { type: 'speech', text: 'Shall we move on?', style: { top: '-10%', left: '5%', right: '5%' } },
    ]),
    // Cut 10: visual — Soyeon looks back at the tree (no text)
    makeOutroCut(10, false, []),
  ],

  // ── Page 5: cut 11–13 ──────────────────────────────────────
  [
    // Cut 11: visual — close-up of Misun tree (no text)
    makeOutroCut(11, false, []),
    makeOutroCut(12, false, [
      { type: 'speech', text: 'The Misun tree… A tree found only in Korea…', style: { bottom: '5%', left: '45%', right: '-5%' } },
    ]),
    makeOutroCut(13, false, [
      { type: 'speech', text: 'It reminds me of… Chang Hyung-doo.', style: { top: '-10%', left: '5%', right: '5%' } },
    ]),
  ],

  // ── Page 6: cut 14–16 ──────────────────────────────────────
  [
    makeOutroCut(14, false, [
      { type: 'speech', text: 'I think so too.', style: { top: '-10%', left: '5%', right: '5%' } },
    ]),
    // Cut 15: visual — Soyeon looks at the tree again (no text)
    makeOutroCut(15, false, []),
    makeOutroCut(16, false, [
      { type: 'narration', text: 'I never imagined so many stories could exist in a single name.', style: { bottom: '-20px', left: '0', right: '0' } },
    ]),
  ],

  // ── Page 7: cut 17–18 ──────────────────────────────────────
  [
    makeOutroCut(17, false, [
      { type: 'narration', text: 'Who gives the name…', style: { top: '-20px', left: '0', right: '0' } },
    ]),
    makeOutroCut(18, false, [
      { type: 'narration', text: 'And what that name leaves behind…', style: { bottom: '-20px', left: '0', right: '0' } },
    ]),
  ],

  // ── Page 8: cut 19 — solo (Final Cut) ─────────────────────
  [
    makeOutroCut(19, true, [
      { type: 'speech', text: 'I never knew so much history was hidden in this tree.', style: { top: '5%', left: '45%', right: '35%' } },
      { type: 'speech', text: 'Me neither.',                                            style: { top: '22%', right: '30%', left: '60%' } },
    ]),
  ],
]

// ─────────────────────────────────────────────────────────────
// IntroComic  ─ 원본 레이아웃(3컷 동시 표시 + 말풍선 CSS) 유지
//               9페이지로 확장 (페이지별 step 리셋)
// ─────────────────────────────────────────────────────────────
function IntroComic({ onComplete }) {
  const [pageIdx, setPageIdx] = useState(0)
  const [step,    setStep]    = useState(1)

  const panels     = INTRO_PAGES[pageIdx]
  const totalSteps = panels.length * 2

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
// EndingContent  ─ out_cut_01~19, 3컷씩 / solo 단독 풀스크린
// ─────────────────────────────────────────────────────────────
function EndingContent({ onComplete }) {
  const [pageIdx, setPageIdx] = useState(0)
  const [step,    setStep]    = useState(1)

  const panels     = OUTRO_PAGES[pageIdx]
  const isSoloPage = panels[0].solo === true
  const totalSteps = panels.length * 2

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
// ImageSlideshow  ─ 원본 코드 유지
// ─────────────────────────────────────────────────────────────
function ImageSlideshow({ images, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
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
// FlowerBillboard
// ─────────────────────────────────────────────────────────────
function FlowerBillboard({ position = [0, 5, 0] }) {
  const [texture, setTexture] = React.useState(null)
  React.useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(`${BASE}images/mison_namu.png`, (t) => setTexture(t))
  }, [])
  if (!texture) return null
  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false} position={position}>
      <mesh>
        <planeGeometry args={[35, 35]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} opacity={1} toneMapped={false} color="#ffffff" />
      </mesh>
    </Billboard>
  )
}

// ─────────────────────────────────────────────────────────────
// StandingIconBillboard
// ─────────────────────────────────────────────────────────────
function StandingIconBillboard({ position = [0, 5, 0], imagePath, onClick }) {
  const [texture, setTexture] = React.useState(null)
  const [hovered, setHovered] = React.useState(false)
  React.useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imagePath, (t) => setTexture(t))
  }, [imagePath])
  if (!texture) return null
  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false} position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} opacity={1} toneMapped={false} color="#ffffff" />
      </mesh>
      {hovered && (
        <Html position={[0, -17, 0]} center>
          <div style={{ color: 'white', fontSize: '16px', background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '20px', pointerEvents: 'none', whiteSpace: 'nowrap', border: '1px solid var(--color-accent-gold)', fontFamily: 'var(--font-body)' }}>
            Click to start the conversation
          </div>
        </Html>
      )}
    </Billboard>
  )
}

// ─────────────────────────────────────────────────────────────
// DialogueOverlay
// ─────────────────────────────────────────────────────────────
function DialogueOverlay({ dialogues, onComplete }) {
  const [idx, setIdx] = useState(0)
  const d = dialogues[idx]
  const isLeftActive  = d.side === 'left'
  const isRightActive = d.side === 'right'
  const isNarration   = d.side === 'narration'
  const leftImg  = getCharImg(d.leftChar,  isLeftActive  ? d.expression : null)
  const rightImg = getCharImg(d.rightChar, isRightActive ? d.expression : null)
  const DIALOGUE_BOX_H = 220
  const CHAR_HEIGHT     = '90vh'
  const handleClick = () => { if (idx < dialogues.length - 1) setIdx(idx + 1); else onComplete() }
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
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-lg)', color: isNarration ? 'var(--color-accent-gold)' : isLeftActive ? 'var(--color-accent)' : 'var(--color-accent-secondary)', marginBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--secondary-color)', paddingBottom: 'var(--spacing-xs)', display: 'inline-block' }}>
          {d.character}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-md)', color: 'var(--color-text)', lineHeight: 1.8, marginTop: 'var(--spacing-sm)', fontStyle: isNarration ? 'italic' : 'normal' }}>
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
  return <img src={src} alt={label} onLoad={() => setStatus('ok')} onError={() => setStatus('fail')} style={{ maxWidth: '90%', maxHeight: '180px', objectFit: 'contain', opacity: status === 'ok' ? 1 : 0, transition: 'opacity 0.2s ease' }} />
}

const NAME_CHOICES = [
  { id: 'korean',     label: 'Misun Tree',      sublabel: '미선나무',                  img: `${BASE}typo/mison_namu.svg`  },
  { id: 'japanese',   label: 'Uchiwa-noki',      sublabel: 'うちわのき',               img: `${BASE}typo/Uchiwa-noki.svg` },
  { id: 'scientific', label: 'Scientific Name',  sublabel: 'Abeliophyllum distichum', img: null },
  { id: 'english',    label: 'White Forsythia',  sublabel: 'English Name',            img: null },
]

function NameChoiceOverlay({ onChoice }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', zIndex: 200 }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--bg-color)', letterSpacing: '0.1em' }}>Choose your name</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {NAME_CHOICES.map((choice) => (
          <div key={choice.id} onClick={() => onChoice(choice.id)} onMouseEnter={() => setHovered(choice.id)} onMouseLeave={() => setHovered(null)}
            style={{ width: '480px', height: '270px', backgroundImage: 'var(--paper-tex-bg-2)', backgroundSize: 'cover', backgroundColor: 'var(--bg-color)', border: hovered === choice.id ? 'var(--border-thickness-medium) solid var(--secondary-color)' : 'var(--border-thickness-thin) solid var(--color-text-muted)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '28px', position: 'relative', transition: 'all 0.3s ease', transform: hovered === choice.id ? 'scale(1.03)' : 'scale(1)', boxShadow: hovered === choice.id ? '0 8px 24px rgba(88,60,43,0.15)' : 'none' }}>
            {hovered === choice.id && <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: 'var(--corner-size)', height: 'var(--corner-size)', borderTop: 'var(--corner-weight) solid var(--corner-color)', borderLeft: 'var(--corner-weight) solid var(--corner-color)' }} />}
            <ChoiceImage src={choice.img} label={choice.label} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '10px', textAlign: 'center' }}>{choice.sublabel}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Credits
// ─────────────────────────────────────────────────────────────
function Credits({ onComplete }) {
  React.useEffect(() => { const t = setTimeout(() => onComplete(), 8000); return () => clearTimeout(t) }, [onComplete])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'var(--primary-color)', color: 'var(--bg-color)', overflowY: 'auto', padding: '60px', fontFamily: 'var(--font-body)', zIndex: 9999 }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)', color: 'var(--color-accent-gold)', marginBottom: 'var(--spacing-xl)' }}>The Garden of Liberation</h1>
        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Timeline & Infographic</h2>
          <img src={`${BASE}infographic.png`} alt="Infographic" style={{ maxWidth: '100%', marginBottom: 'var(--spacing-lg)', borderRadius: 'var(--border-radius-md)' }} />
        </div>
        <div style={{ marginBottom: 'var(--spacing-2xl)', textAlign: 'left' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>참고 문헌 & 사료</h2>
          <ul style={{ lineHeight: '2.2', fontSize: 'var(--font-size-md)', opacity: 0.9 }}>
            <li>참고문헌 1: 제목, 저자, 출판사</li>
            <li>참고문헌 2: 제목, 저자, 출판사</li>
            <li>참고문헌 3: 제목, 저자, 출판사</li>
            <li>사료 1: 출처 및 설명</li>
            <li>사료 2: 출처 및 설명</li>
          </ul>
        </div>
        <div style={{ marginTop: 'var(--spacing-2xl)', fontSize: 'var(--font-size-sm)', opacity: 0.6 }}>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>잠시 후 처음으로 돌아갑니다...</p>
          <div style={{ width: 0, height: '3px', background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-secondary))', margin: '0 auto', animation: 'creditsLoad 8s linear forwards' }} />
        </div>
      </div>
      <style>{`@keyframes creditsLoad { 0%{width:0} 100%{width:400px} }`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SceneModels
// ─────────────────────────────────────────────────────────────
function SceneModels({ selectedObject, setSelectedObject, showNakaiIcon, onNakaiIconClick, showHyungdooIcon, onHyungdooIconClick }) {
  return (
    <>
      <Select enabled={selectedObject === 'palace'}><group position={[-3,0,0]} onClick={(e)=>{e.stopPropagation();setSelectedObject('palace')}}><Palace /></group></Select>
      <Select enabled={selectedObject === 'structure'}><group position={[3,0,0]} onClick={(e)=>{e.stopPropagation();setSelectedObject('structure')}}><Structure /></group></Select>
      <Select enabled={selectedObject === 'palace02'}><group onClick={(e)=>{e.stopPropagation();setSelectedObject('palace02')}}><Palace02 /></group></Select>
      <Select enabled={selectedObject === 'palace03'}><group position={[0,-3,0]} onClick={(e)=>{e.stopPropagation();setSelectedObject('palace03')}}><Palace03 /></group></Select>
      <Select enabled={selectedObject === 'palace04'}><group onClick={(e)=>{e.stopPropagation();setSelectedObject('palace04')}}><Palace04 /></group></Select>
      <Select enabled={selectedObject === 'palace06'}><group onClick={(e)=>{e.stopPropagation();setSelectedObject('palace06')}}><Palace06 /></group></Select>
      <FlowerBillboard position={[0,20,-30]} /><FlowerBillboard position={[-150,40,-30]} /><FlowerBillboard position={[-135,40,30]} />
      <FlowerBillboard position={[80,15,90]} /><FlowerBillboard position={[80,15,-90]} /><FlowerBillboard position={[60,15,-80]} />
      <FlowerBillboard position={[-5,15,80]} /><FlowerBillboard position={[0,15,-90]} /><FlowerBillboard position={[-120,40,50]} /><FlowerBillboard position={[120,15,20]} />
      {showNakaiIcon    && <StandingIconBillboard position={[14,17,10]} imagePath={`${BASE}UI/standing_icon/nakai_standing.png`}    onClick={onNakaiIconClick}    />}
      {showHyungdooIcon && <StandingIconBillboard position={[14,17,10]} imagePath={`${BASE}UI/standing_icon/hyungdoo_standing.png`} onClick={onHyungdooIconClick} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// ErrorBoundary
// ─────────────────────────────────────────────────────────────
class CanvasErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.error('Canvas error:', err) }
  render() {
    if (this.state.hasError) return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '14px', zIndex: 1 }}>3D 씬 로딩 중...</div>
    return this.props.children
  }
}

const chapterImages = {
  1: [`${BASE}video/chp_01_01.jpg`, `${BASE}video/chp_01_02.jpg`, `${BASE}video/chp_01_03.jpg`],
  2: [`${BASE}video/chp_02_01.jpg`, `${BASE}video/chp_02_02.jpg`, `${BASE}video/chp_02_03.jpg`],
  3: [`${BASE}video/chp_03_01.jpg`, `${BASE}video/chp_03_02.jpg`, `${BASE}video/chp_03_03.jpg`],
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
function App() {
  usePreloadImages()
  const [currentStage, setCurrentStage] = useState(STAGES.INTRO_COMIC)
  const [selectedObject, setSelectedObject] = useState(null)
  const [showChapter1Interaction,  setShowChapter1Interaction]  = useState(false)
  const [showHyungdooIcon,         setShowHyungdooIcon]         = useState(false)
  const [showChapter2Interaction,  setShowChapter2Interaction]  = useState(false)
  const [showChapter3Misun,        setShowChapter3Misun]        = useState(false)
  const [showChapter3New,          setShowChapter3New]          = useState(false)

  const handleStageComplete = (nextStage) => {
    setCurrentStage(nextStage)
    setShowChapter1Interaction(false)
    setShowHyungdooIcon(false)
    setShowChapter2Interaction(false)
    setShowChapter3Misun(false)
    setShowChapter3New(false)
  }

  const isIn3DSpace = ![STAGES.INTRO_COMIC, STAGES.ENDING_COMIC, STAGES.CREDITS].includes(currentStage)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1410' }}>

      {currentStage === STAGES.INTRO_COMIC  && <IntroComic    onComplete={() => handleStageComplete(STAGES.GARDEN_ARRIVAL)} />}
      {currentStage === STAGES.ENDING_COMIC && <EndingContent onComplete={() => handleStageComplete(STAGES.CREDITS)} />}
      {currentStage === STAGES.CREDITS      && <Credits       onComplete={() => handleStageComplete(STAGES.INTRO_COMIC)} />}

      {isIn3DSpace && (
        <>
          <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${BASE}images/Nakai_bg.png)`,backgroundSize:'cover',backgroundPosition:'center',opacity:(currentStage===STAGES.GARDEN_ARRIVAL||currentStage.includes('chapter_1')||currentStage.includes('ending_'))?1:0,transition:'opacity 0.5s ease',pointerEvents:'none' }} />
          <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${BASE}images/Jang_bg.png)`,backgroundSize:'cover',backgroundPosition:'center',opacity:currentStage.includes('chapter_2')?1:0,transition:'opacity 0.5s ease',pointerEvents:'none' }} />
          <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${BASE}images/Paper_tex_2.png)`,backgroundSize:'cover',backgroundPosition:'center',opacity:(currentStage.includes('chapter_3')||currentStage===STAGES.NAME_CHOICE)?1:0,transition:'opacity 0.5s ease',pointerEvents:'none' }} />

          {/* GARDEN ARRIVAL */}
          {currentStage === STAGES.GARDEN_ARRIVAL && (
            <DialogueOverlay dialogues={DIALOGUES.gardenArrival} onComplete={() => handleStageComplete(STAGES.CHAPTER_1_DIALOGUE)} />
          )}

          {/* CHAPTER 1: 나카이 아이콘 → 대화 → 비디오 */}
          {currentStage === STAGES.CHAPTER_1_DIALOGUE && showChapter1Interaction && (
            <DialogueOverlay dialogues={DIALOGUES.chapter1} onComplete={() => handleStageComplete(STAGES.CHAPTER_1_VIDEO)} />
          )}
          {currentStage === STAGES.CHAPTER_1_VIDEO && (
            <ImageSlideshow images={chapterImages[1]} onComplete={() => handleStageComplete(STAGES.CHAPTER_2_DIALOGUE)} />
          )}

          {/* CHAPTER 2: 반영 → 장형두 아이콘 → 대화 → 비디오 */}
          {currentStage === STAGES.CHAPTER_2_DIALOGUE && !showHyungdooIcon && !showChapter2Interaction && (
            <DialogueOverlay dialogues={DIALOGUES.chapter2Reflection} onComplete={() => setShowHyungdooIcon(true)} />
          )}
          {currentStage === STAGES.CHAPTER_2_DIALOGUE && showChapter2Interaction && (
            <DialogueOverlay dialogues={DIALOGUES.chapter2Main} onComplete={() => handleStageComplete(STAGES.CHAPTER_2_VIDEO)} />
          )}
          {currentStage === STAGES.CHAPTER_2_VIDEO && (
            <ImageSlideshow images={chapterImages[2]} onComplete={() => handleStageComplete(STAGES.CHAPTER_3_DIALOGUE)} />
          )}

          {/* CHAPTER 3: 반영 → 미선나무 첫 대사 → 새 대화 → 비디오 → 마지막 질문 */}
          {currentStage === STAGES.CHAPTER_3_DIALOGUE && !showChapter3Misun && !showChapter3New && (
            <DialogueOverlay dialogues={DIALOGUES.chapter3Reflection} onComplete={() => setShowChapter3Misun(true)} />
          )}
          {currentStage === STAGES.CHAPTER_3_DIALOGUE && showChapter3Misun && !showChapter3New && (
            <DialogueOverlay dialogues={DIALOGUES.chapter3Pre} onComplete={() => setShowChapter3New(true)} />
          )}
          {currentStage === STAGES.CHAPTER_3_DIALOGUE && showChapter3New && (
            <DialogueOverlay dialogues={DIALOGUES.chapter3New} onComplete={() => handleStageComplete(STAGES.CHAPTER_3_VIDEO)} />
          )}
          {currentStage === STAGES.CHAPTER_3_VIDEO && (
            <ImageSlideshow images={chapterImages[3]} onComplete={() => handleStageComplete(STAGES.CHAPTER_3_FINAL)} />
          )}
          {currentStage === STAGES.CHAPTER_3_FINAL && (
            <DialogueOverlay dialogues={DIALOGUES.chapter3Final} onComplete={() => handleStageComplete(STAGES.NAME_CHOICE)} />
          )}

          {/* NAME CHOICE & 엔딩 분기 */}
          {currentStage === STAGES.NAME_CHOICE && (
            <NameChoiceOverlay onChoice={(choice) => {
              if (choice === 'korean')          handleStageComplete(STAGES.ENDING_COMIC)
              else if (choice === 'japanese')   handleStageComplete(STAGES.ENDING_2_DIALOGUE)
              else if (choice === 'scientific') handleStageComplete(STAGES.ENDING_3_DIALOGUE)
              else if (choice === 'english')    handleStageComplete(STAGES.ENDING_4_DIALOGUE)
            }} />
          )}
          {currentStage === STAGES.ENDING_2_DIALOGUE && <DialogueOverlay dialogues={DIALOGUES.ending2} onComplete={() => handleStageComplete(STAGES.NAME_CHOICE)} />}
          {currentStage === STAGES.ENDING_3_DIALOGUE && <DialogueOverlay dialogues={DIALOGUES.ending3} onComplete={() => handleStageComplete(STAGES.NAME_CHOICE)} />}
          {currentStage === STAGES.ENDING_4_DIALOGUE && <DialogueOverlay dialogues={DIALOGUES.ending4} onComplete={() => handleStageComplete(STAGES.NAME_CHOICE)} />}

          {/* 3D Canvas */}
          <CanvasErrorBoundary>
            <Canvas style={{ position:'fixed',inset:0,zIndex:1,background:'transparent' }} camera={{ position:[0,20,50],fov:65 }} shadows gl={{ antialias:true,powerPreference:'high-performance',alpha:true }} onClick={() => setSelectedObject(null)}>
              <Suspense fallback={null}>
                <Selection>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10,10,10]} intensity={1.5} castShadow />
                  <pointLight position={[-10,-10,-10]} intensity={0.8} color="#0066ff" />
                  <directionalLight position={[5,10,5]} intensity={1} castShadow />
                  <Environment preset="night" />
                  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2,0]} receiveShadow>
                    <planeGeometry args={[30,30]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
                  </mesh>
                  <SceneModels
                    selectedObject={selectedObject} setSelectedObject={setSelectedObject}
                    showNakaiIcon={currentStage === STAGES.CHAPTER_1_DIALOGUE && !showChapter1Interaction}
                    onNakaiIconClick={() => setShowChapter1Interaction(true)}
                    showHyungdooIcon={currentStage === STAGES.CHAPTER_2_DIALOGUE && showHyungdooIcon && !showChapter2Interaction}
                    onHyungdooIconClick={() => setShowChapter2Interaction(true)}
                  />
                  <EffectComposer>
                    <Outline blur={false} visibleEdgeColor={0xffd700} hiddenEdgeColor={0xffd700} edgeStrength={10} edgeThickness={1} width={1024} height={1024} />
                  </EffectComposer>
                </Selection>
                {!currentStage.includes('VIDEO') && currentStage !== STAGES.NAME_CHOICE && (
                  <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.02} enableDamping maxDistance={120} minDistance={50} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} target={[0,10,0]} />
                )}
              </Suspense>
            </Canvas>
          </CanvasErrorBoundary>
        </>
      )}
    </div>
  )
}

export default App
