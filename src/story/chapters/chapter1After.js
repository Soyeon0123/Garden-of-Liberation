// ─────────────────────────────────────────────────────────────
// Chapter 1 — The Eye of Empire (After Motion Graphic)
//   1장 영상이 끝난 뒤 → 이 장면이 끝나면 장형두 아이콘이 나타남
//   (예전 App.jsx 의 chapter2Reflection 자리)
// ─────────────────────────────────────────────────────────────

export default {
  guest: 'nakai',   // 나카이가 아직 함께 있음

  beats: [
    ['Soyeon', null,           "I had no idea... that something as ordinary as a plant's name could carry the legacy of imperialism within the scientific naming system."], // (thoughtfully)
    ['Mother', null,           "Neither did I. What's even more surprising is that Japan adopted the Western scientific system and expanded it during the colonial period."],
    ['Soyeon', 'disappointed', "Somehow... the tree doesn't look the same anymore. It feels... almost lonely."],     // (looking toward the Miseon namu)
    ['Mother', null,           "I know what you mean. But somehow... I don't think that's the name we've been searching for."],
    ['Nakai',  'annoying',     "Curious people... Even after learning about the remarkable scientific achievements of the Japanese Empire, you still seem unconvinced."], // (slightly displeased)
    ['Soyeon', 'disappointed', "I feel like... there's still something missing."],
    ['Soyeon', 'disappointed', "But how else could we ask?"],                                                          // (She sighs.)

    { cutscene: 'hyungdooAppears' },   // 07 — 흙 묻은 손, 채집 도구를 든 장형두 등장
  ],
}
