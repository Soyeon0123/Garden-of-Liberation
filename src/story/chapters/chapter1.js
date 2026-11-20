// ─────────────────────────────────────────────────────────────
// Chapter 1 — The Eye of Empire (나카이 아이콘을 클릭한 뒤 ~ 모션그래픽 전)
//
//   대사 : ['인물', '표정', '대사']   인물 = Soyeon / Mother / Nakai / Hyungdoo / Miseon
//   컷신 : { cutscene: '이름' }  /  내레이션이 흐르는 컷신 : { cutscene, narration: { who, lines } }
//   인벤토리 : { inventory: '이름' }   (assets.js 의 ITEMS)
//   분위기 전환 : { effect: '이름' }   ← 3D 연출은 다음 단계 (지금은 바로 넘어감)
//
//   ※ 문서의 지문은 있는 표정 중 가장 가까운 것으로 골랐어요. (뒤에 주석으로 원래 지문)
//     나카이 표정: smile / annoying / exciting / disappointed
// ─────────────────────────────────────────────────────────────

export default {
  guest: 'nakai',   // 나카이 왼쪽, 소연·엄마 중 마지막으로 말한 사람 오른쪽

  beats: [
    ['Nakai',  null,        "Who are you? I don't believe we've met before."],
    ['Soyeon', 'curious',   "Hello... This is our first time here. Do you happen to know the name of that tree?"],   // (hesitantly)
    ['Mother', null,        "My daughter has been wondering about it. Would you mind telling us?"],
    ['Nakai',  'annoying',  "Why are you so interested in its name?"],                                                // (slightly displeased)
    ['Soyeon', 'smile',     "Well... It's such a beautiful tree. I wanted to know what it's called."],
    ['Mother', null,        "Especially when it's standing right in the middle of the garden."],
    ['Nakai',  'smile',     "Hmph... Very well."],                                                                     // (smiles faintly)
    ['Nakai',  'smile',     "I discovered this tree in Joseon, Korea in 1917. Because its fruit resembles a traditional fan, I named it Uchiwa-noki."],

    { cutscene: 'uchiwaMeaning' },                 // 03 — Uchiwa = 부채, ki = 나무

    ['Soyeon', 'curious',   "Uchiwa-noki...? But if it was discovered in Korea... doesn't that make it a Korean tree?"], // (tilting her head)
    ['Nakai',  null,        "I was the first to publish it in the academic record."],                                 // (firmly)
    ['Nakai',  null,        "It was introduced in my book, Flora Sylvatica Koreana, published with the support of the Government-General of Korea."],
    ['Nakai',  null,        "Here. Take a closer look."],

    { cutscene: 'floraPage' },                     // 04 — Flora Sylvatica Koreana 페이지
    { inventory: 'floraSylvatica' },

    ['Soyeon', 'surprised', "Nakai... Your name is at the end of the scientific name. It feels strangely familiar..."],
    ['Nakai',  'exciting',  "You have a keen eye. I formally published this species in 1919."],                       // (proudly)
    ['Nakai',  'exciting',  "That's why my name — Nakai — became part of its scientific name."],
    ['Mother', null,        "Is publishing first really that important?"],
    ['Nakai',  null,        "Of course."],

    { cutscene: 'linnaeusCongress',                // 05 — 린네 초상 & 비엔나 식물학회의 (나카이 목소리가 이어짐)
      narration: { who: 'Nakai', lines: [
        "Let me explain.",
        "Modern botanical nomenclature follows the Linnaean system, developed by the Swedish botanist Carl Linnaeus (1707–1778).",
        "Under this system, the first scholar to formally publish a newly identified species receives the authority to name it. This is why my name appears at the end.",
        "To leave one's name behind... is a kind of immortality.",
      ] } },
    { inventory: 'botanicalCongress' },

    ['Mother', null,        "These botanical drawings are incredibly detailed."],                                     // (examining the illustration)
    ['Soyeon', null,        "They really are... Every part of the plant is recorded so carefully."],
    ['Nakai',  'smile',     "I'm pleased you noticed."],                                                              // (with satisfaction)

    { cutscene: 'herbarium' },                     // 06 — 나카이의 표본
    { inventory: 'herbarium' },

    ['Soyeon', 'disappointed', "Then... wasn't there a Korean name for this tree?"],                                  // (uneasy)
    ['Nakai',  'annoying',  "A Korean name? Japan and Joseon are already one empire. Why would it need another name?"], // (lightly chuckles)
    ['Nakai',  'annoying',  "Besides... Scientific names follow the Linnaean system — a universal language created by experts."],
    ['Nakai',  null,        "Surely that is the most objective way to understand nature."],

    // 분위기 급변: 정원이 어두워지고, 붉은 빛이 번지며 일장기가 곳곳에 나타남
    { effect: 'imperial' },

    ['Soyeon', 'surprised', "Wait... You're not from the present, are you?"],                                        // (shocked)
    ['Mother', 'surprised', "Soyeon... Look. Those flags... This is the Japanese colonial period."],                  // (looking around)
    ['Soyeon', 'surprised', "What...? Did we travel back in time? To the colonial era...?"],
    ['Nakai',  'exciting',  "During the colonial period, the Japanese Empire introduced modern scientific knowledge to Korea."], // (quiet confidence, almost amused)
    ['Nakai',  'exciting',  "We brought order where there had been none."],
    ['Nakai',  null,        "It seems... I shall have to explain the academic achievements of the Japanese Empire myself."], // (calmly)
  ],
}
