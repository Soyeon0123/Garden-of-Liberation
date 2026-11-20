// ─────────────────────────────────────────────────────────────
// Ending (3) — "A Compromised World"  (White Forsythia 선택)
//   끝나면 엔딩 컷신(EndingCutscene) → 크레딧
// ─────────────────────────────────────────────────────────────

export default {
  guest: ['nakai', 'hyungdoo'],

  beats: [
    ['Nakai',    null,           "English? An English name?"],                                                               // (slightly puzzled)
    ['Hyungdoo', null,           "Why did you choose the English name?"],                                                    // (also surprised)
    ['Mother',   null,           "Was it because... English is the language most people around the world would recognize?"],
    ['Soyeon',   'disappointed', "... Yes. I thought... perhaps more people would come to know this tree."],                 // (hesitating)

    { cutscene: 'plaqueEnglish' },   // 15 — "White Forsythia" 이름표

    ['Hyungdoo', 'smile',        "Even so... if people around the world came to know its Korean name — that would be just as meaningful."], // (gently)
    ['Soyeon',   'disappointed', "... Did I... compromise without even realizing it?"],                                     // (softly)
  ],
}
