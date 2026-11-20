// ─────────────────────────────────────────────────────────────
// True Ending  (Miseon namu 선택)
//   끝나면 엔딩 컷신(EndingCutscene, true_1 → 2 → 3) → 아웃트로 웹툰 → 크레딧
//
//   ※ 문서에서 장형두의 "tell them proudly…" 대사는 두 번째 [Cut Scene] 안에 있어요.
//     true_1~3 그림에 이 대사가 이미 들어 있다면, 아래 마지막 대사 3줄을 지워 주세요.
// ─────────────────────────────────────────────────────────────

export default {
  guest: 'hyungdoo',

  beats: [
    // 카메라가 미선나무로 다가가고, 연못 아래에서 반딧불이 피어올라 이름표로 모여 스며듦
    { camera: 'pushToTree' },
    { fx: 'fireflies' },

    { cutscene: 'plaqueMiseon' },   // 16 — "Miseon namu" 가 이름표에 새겨짐

    ['Soyeon',   'smile',     "Thank you... for teaching us its true name."],
    ['Hyungdoo', null,        "Wait."],
    ['Soyeon',   'curious',   "Yes?"],
    ['Hyungdoo', 'trueSmile', "If anyone ever asks you about this tree... tell them proudly."],
    ['Hyungdoo', 'trueSmile', "Miseon namu is Korea's one and only endemic species. A plant found nowhere else in the world."],
    ['Soyeon',   'smile',     "I will."],   // (A gentle breeze lifts her hair as white petals drift around her. She smiles.)
  ],
}
