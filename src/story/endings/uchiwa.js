// ─────────────────────────────────────────────────────────────
// Ending (1) — "The Objectified Name"  (Uchiwa-noki 선택)
//   끝나면 엔딩 컷신(EndingCutscene) → 크레딧
// ─────────────────────────────────────────────────────────────

export default {
  guest: ['nakai', 'hyungdoo'],   // 왼쪽엔 마지막으로 말한 사람 (나카이 / 장형두)

  beats: [
    ['Nakai',    'smile',        "In the end, you've come to recognize, just as so many people of Joseon once did, the greatness of Japanese scholarship and the Empire that made it possible."], // (smiling)
    ['Hyungdoo', 'disappointed', "... If only you had understood what a name truly leaves behind... perhaps your choice might have been different."],                                            // (with quiet sadness)

    { cutscene: 'plaqueUchiwa' },   // 13 — 슬퍼 보이는 미선나무, "Uchiwa-noki" 이름표

    ['Hyungdoo', 'disappointed', "Even after all this time... the colonization of Joseon — and the power it carried — still lingers in the names of our plants."],
    ['Soyeon',   'disappointed', "... If only I had thought a little more carefully..."],                                                                                                    // (lowering her head)
  ],
}
