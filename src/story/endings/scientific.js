// ─────────────────────────────────────────────────────────────
// Ending (2) — "Universal Authority"  (Abeliophyllum distichum 선택)
//   끝나면 엔딩 컷신(EndingCutscene) → 크레딧
// ─────────────────────────────────────────────────────────────

export default {
  guest: ['nakai', 'hyungdoo'],

  beats: [
    ['Nakai',    'exciting',     "Just as I expected. You, too, recognize the brilliance of the Linnaean system. There is no finer way to classify plants."], // (smiling proudly)
    ['Hyungdoo', null,           "Latin... It may no longer be a spoken language. Yet it still carries great authority."],
    ['Mother',   'disappointed', "A scientific name... But somehow... it feels a little distant from what makes this tree uniquely ours."],

    { cutscene: 'plaqueScientific' },   // 14 — "Abeliophyllum distichum Nakai" 이름표

    ['Hyungdoo', 'disappointed', "... Professor Nakai's name, preserved through the principle of priority, still remains."],                               // (softly)
    ['Soyeon',   'disappointed', "... Maybe I chose too quickly."],                                                                                         // (tilting her head)
  ],
}
