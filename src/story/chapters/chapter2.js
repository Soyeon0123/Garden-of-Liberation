// ─────────────────────────────────────────────────────────────
// Chapter 2 — The Voice of Local (장형두 아이콘을 클릭한 뒤 ~ 애니메이션 전)
//
//   대사 : ['인물', '표정', '대사']   인물 = Soyeon / Mother / Nakai / Hyungdoo / Miseon
//   컷신 : { cutscene: '이름' }  /  내레이션이 흐르는 컷신 : { cutscene, narration: { who, lines } }
//   인벤토리 : { inventory: '이름' }   (assets.js 의 ITEMS)
//
//   ※ 문서의 지문은 있는 표정 중 가장 가까운 것으로 골랐어요. (뒤에 주석으로 원래 지문)
//     장형두 표정: smile / trueSmile / disappointed
// ─────────────────────────────────────────────────────────────

export default {
  guest: 'hyungdoo',   // 장형두 왼쪽, 소연·엄마 중 마지막으로 말한 사람 오른쪽

  beats: [
    ['Soyeon',   null,      "Excuse me!"],
    ['Hyungdoo', null,      "Oh... Who are you?"],                                                                    // (slightly startled)
    ['Soyeon',   'curious', "I'm sorry for startling you. We're trying to find the name of the tree in the center of the garden."],
    ['Mother',   null,      "My daughter has been searching for its name."],
    ['Hyungdoo', null,      "Hmm.... Give me a moment."],                                                             // (gazing quietly toward the tree)

    { cutscene: 'hyangmyeongjipPage',            // 08 — 조선식물향명집 페이지 (학명, 우치와노키, 미선나무)
      narration: { who: 'Hyungdoo', lines: [
        "That tree was recorded in the Joseon Singmul Hyangmyeongjip, published by the Joseon Natural History Research Society.",
        "It was first discovered in 1917 by Dr. Nakai Takenoshin and Professor Chung, Tae Hyun.",
      ] } },
    { inventory: 'hyangmyeongjip' },

    ['Mother',   null,      "Then... what do you call this tree?"],
    ['Hyungdoo', 'smile',   "We call it the Miseon namu. It's a truly remarkable species. It grows naturally only in Korea."], // (smiles gently)
    ['Hyungdoo', 'smile',   "Nowhere else in the world."],
    ['Soyeon',   'curious', "May I ask who you are?"],
    ['Hyungdoo', null,      "Of course. My name is Chang, Hyung Doo. I'm a botanist studying the plants of Joseon."],
    ['Soyeon',   'curious', "You carry quite a lot with you."],                                                      // (looking at his equipment)
    ['Hyungdoo', 'smile',   "Ah... These are my collecting tools. I just returned from the mountains. I spent the day gathering plant specimens."], // (smiles)

    { cutscene: 'collectingTools' },             // 09 — 채집 도구, 야장, 일기
    { inventory: 'collectingTool' },

    ['Mother',   null,      "That's incredible. Do you spend your days collecting plants like this?"],
    ['Hyungdoo', null,      "Thank you. To us... this was more than research."],
    ['Hyungdoo', null,      "It was something that had to be done by Korean hands."],

    { inventory: 'fieldJournal' },

    ['Soyeon',   'curious', "Could I see your notebook? I think I caught a glimpse of some beautiful botanical drawings."],

    { cutscene: 'notebookSketches' },            // 10 — 흙 묻은 손, 노트 속 식물 스케치

    ['Mother',   'smile',   "These illustrations are beautiful."],                                                    // (impressed)
    ['Soyeon',   'curious', "Do botanists usually draw this well?"],
    ['Hyungdoo', 'smile',   "Thank you. I drew these after today's fieldwork."],                                      // (laughs softly)
    ['Hyungdoo', 'smile',   "My hope is to compile an illustrated flora of the plants of Joseon someday."],
    ['Mother',   null,      "That must have been incredibly difficult... especially during those times."],
    ['Hyungdoo', 'smile',   "I wasn't alone. Many Korean scholars devoted themselves to the study of our native plants."], // (smiled)
    ['Soyeon',   'disappointed', "There must have been so many restrictions during the colonial period."],

    { cutscene: 'forcedJapanese' },              // 11 — 일본어 사용을 강요당한 시기

    ['Hyungdoo', null,      "There certainly were."],                                                                 // (nodding quietly)
    ['Hyungdoo', null,      "Even during those difficult times, we established the Joseon Natural History Research Society, an organization made up entirely of Korean scholars."],
    ['Hyungdoo', null,      "Together, we carried out many important projects."],
    ['Hyungdoo', null,      "But among them, one task stood above all the others — giving Korean names, written in Hangul, to the plants of Joseon that had been known only by their Japanese names."],
    ['Mother',   null,      "I see... So that's how this tree came to be called the Miseon namu."],
    ['Soyeon',   'curious', "Then... Why not simply keep the Japanese name?"],
    ['Hyungdoo', null,      "Because..."],                                                                            // (after a thoughtful pause)
    ['Hyungdoo', null,      "I firmly believed that the plants of Joseon should also be seen through the eyes of the Korean people."],
    ['Hyungdoo', null,      "I believed that the nature of Joseon should be studied by Korean hands, and that the flora of Joseon should ultimately be understood by Koreans themselves."],

    { cutscene: 'koreanScenery',                 // 12 — 한국의 아름다운 풍경 (장형두 목소리가 이어짐)
      narration: { who: 'Hyungdoo', lines: [
        "I wanted to give the countless plants that grow across this land the most beautiful names we could.",
        "Even if our work was less complete than Nakai's, it was knowledge created directly by Koreans — through the mountains, fields, and forests of our own homeland.",
        "A botany rooted in local tradition — one that remains deeply connected to the landscapes, culture, and history of the place we call home.",
      ] } },
  ],
}
