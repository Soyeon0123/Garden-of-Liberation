// ─────────────────────────────────────────────────────────────
// 정원 도착 (Arrival at the Garden) — Narrative Design V4
//
//   대사 : ['인물', '표정', '대사']
//          인물 = Soyeon / Mother / Nakai / Hyungdoo / Miseon
//          표정 = 일러스트 파일 이름 뒤쪽 (curious, smile, surprised, disappointed …), 기본 표정은 null
//   컷신 : { cutscene: 'assets.js 의 CUTSCENES 이름' }
//   카메라 : { camera: '연출 이름' }  ← 아직 준비 중 (지금은 건너뜀)
//
//   ※ 문서의 지문 (startled), (relieved) 등은 있는 표정 일러스트 중 가장 가까운 것으로 골랐어요.
// ─────────────────────────────────────────────────────────────

export default {
  guest: null,   // 이 장면엔 나카이·장형두가 없음 → 엄마 왼쪽, 소연 오른쪽

  beats: [
    ['Soyeon', 'surprised',    "Where are we...? Mom! Where are you?!"],                                   // (startled)
    ['Mother', 'smile',        "I'm here, Soyeon! But... where is this place? We were just at Changdeokgung Palace..."], // (relieved)
    ['Soyeon', 'disappointed', "Thank goodness you're okay... But how are we supposed to get back home?"],   // (anxiously)

    // 소연이 정원 한가운데 홀로 선 나무와, 그 아래 빈 이름표를 발견
    { camera: 'pushToTree' },          // 카메라가 미선나무 쪽으로 천천히 다가감
    { cutscene: 'nameplateBlank' },    // 01 — 미선나무 아래 빈 이름표

    ['Soyeon', 'curious',      "The nameplate... It's blank."],
    ['Mother', null,           "You're right. And somehow... this place feels strangely familiar."],
    ['Soyeon', 'curious',      "Mom, didn't you tell me this tree's name earlier? What was it again?"],
    ['Mother', 'surprised',    "That's odd... I know I knew it just a moment ago... But now I can't remember."], // (confused)

    { cutscene: 'nakaiAppears' },      // 02 — 표본을 든 정장 차림의 나카이 등장

    ['Soyeon', 'curious',      "Maybe we should ask him."],
    ['Mother', 'smile',        "Good idea. He might know the name of that tree."],                          // (nods)
  ],
}
