// ─────────────────────────────────────────────────────────────
// Chapter 2 — The Voice of Local (After Animation)
//   2장 영상이 끝난 뒤 → 미선나무가 처음 말을 걸고, 정원이 밝고 따뜻하게 바뀜 (3장으로 전환)
//   (예전 App.jsx 의 chapter3Reflection 자리)
// ─────────────────────────────────────────────────────────────

export default {
  guest: 'hyungdoo',   // 장형두가 아직 함께 있음

  beats: [
    ['Soyeon',   null,        "I never imagined... that behind the names of the plants we see every day were the dedication and perseverance of Korean botanists."],
    ['Mother',   null,        "It is deeply moving. At the same time... it's unfortunate that so few people know this history today."],
    ['Hyungdoo', 'trueSmile', "That's all right."],                                                                     // (smiles gently)
    ['Hyungdoo', 'trueSmile', "As long as our belief — that the plants of Joseon deserve the names of Joseon — lives on, and future generations remember why we did this, that is more than enough for me."],
    ['Soyeon',   'smile',     "Thank you... for sharing such a precious story with us."],                               // (smiles)
    ['Mother',   'smile',     "Then... perhaps we're finally ready to write its name on that empty plaque."],

    { camera: 'pushToTree' },   // 카메라가 정원 한가운데 미선나무 쪽으로 천천히 다가감 (아직 준비 중)

    ['Miseon',   null,        "So... you've found my name."],                                                          // (gentle, calm, almost like a whisper)
    ['Miseon',   null,        "Then... let me tell you my story."],

    // 장면 전환: 하얀 꽃잎이 흩날리고, 종소리가 울리며, 정원이 점점 밝고 따뜻해짐
    { effect: 'bloom' },
  ],
}
