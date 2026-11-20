// ─────────────────────────────────────────────────────────────
// Chapter 2 — The Voice of Local (시작 ~ 장형두 아이콘이 나타나기 전)
//   App.jsx 에서 chapter1After 바로 뒤에 이어서 재생돼요.
//   이 장면이 끝나면 장형두 아이콘이 나타나고, 클릭하면 chapter2.js 가 시작돼요.
// ─────────────────────────────────────────────────────────────

export default {
  guest: null,   // 아직 장형두와 대화 전 → 엄마 왼쪽, 소연 오른쪽

  beats: [
    // 분위기가 부드러운 푸른 톤으로 바뀌고, 일장기가 사라짐 (종소리는 사운드 단계에서)
    { effect: 'local' },

    ['Soyeon', 'curious',   "The atmosphere changed..."],               // (looking around)
    ['Mother', 'surprised', "It really did. Who is that?"],             // (surprised)

    { camera: 'zoomToHyungdoo' },   // 카메라가 장형두 쪽으로 천천히 다가감 (아직 준비 중)

    ['Soyeon', 'curious',   "Maybe... he's the one who knows this tree's real name."],
    ['Mother', null,        "Let's ask him."],
  ],
}
