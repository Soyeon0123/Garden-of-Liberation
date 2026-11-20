// ─────────────────────────────────────────────────────────────
// Chapter 3 — The Meaning of a Name (After Motion Graphic)
//   3장 영상 뒤 → 씨앗·열매·꽃 획득 → 이름표가 빛나고 → "What... will you call me?" → 이름 선택
//   (예전 App.jsx 의 chapter3Final 자리)
// ─────────────────────────────────────────────────────────────

export default {
  guest: null,

  beats: [
    ['Soyeon', null,    "There were so many stories hidden within a single name."],
    ['Mother', null,    "I never imagined... that a plant's name could carry so much meaning."],
    ['Miseon', null,    "A name... carries far more than words alone."],
    ['Miseon', null,    "A name is not simply recorded. It is... remembered."],
    ['Mother', 'smile', "That's truly a relief. It would be heartbreaking if such a beautiful flowering tree — one that grows naturally only in Korea — were to disappear forever."], // (smiling gently)
    ['Soyeon', 'smile', "I agree. You grow in rocky, unforgiving places... Yet despite your delicate appearance, you possess remarkable resilience and strength."],              // (nodding)

    { inventory: 'seed' },

    ['Miseon', null,    "You're right. I was formally introduced to the academic world in 1919, during the period of Japanese colonial rule."],                                  // (gently)
    ['Miseon', null,    "Since then... I have remained with you, through every generation, all the way to the present."],
    ['Miseon', null,    "I was first recorded through the work of a Japanese botanist. Later, I was pushed to the brink of extinction."],
    ['Miseon', null,    "Somehow... don't you think my journey resembles the spirit of the Korean people?"],
    ['Miseon', null,    "Just as Korean scholars continued to preserve Korean plant names — choosing the names that ordinary Koreans truly used — and recording them with unwavering determination,"],
    ['Miseon', null,    "I too endured through time, never letting go of my roots."],

    { inventory: 'fruit' },

    ['Soyeon', 'smile', "I understand now... You were never just a single plant."],                                                                                            // (deeply moved)
    ['Soyeon', 'smile', "Your very existence has become a memory."],
    ['Soyeon', 'smile', "From the colonial period to the present day, you have remained with Korea."],
    ['Soyeon', 'smile', "You have become a living symbol of our history, our resilience, and our memory."],
    ['Miseon', null,    "Thank you... for seeing me that way."],
    ['Miseon', null,    "My flower symbolizes \"May all sorrow fade away.\""],
    ['Miseon', null,    "Just as my flowers bloom, I hope our painful history, our memories, and our stories may one day find healing."],

    { inventory: 'flower' },

    // (A gentle breeze passes through the garden.)
    ['Miseon', null,    "And we... will never truly be forgotten."],
    ['Miseon', null,    "As long as you remember my name... and continue to call it."],
    ['Miseon', null,    "Because every time you speak a name with remembrance... You allow us to live on."],

    { fx: 'nameplateGlow' },   // 빈 이름표가 은은하게 빛남 (3D 연출은 다음 단계)

    ['Miseon', null,    "So then... What... will you call me?"],
  ],
}
