/**
 * 將用戶輸入的情境描述轉換成完整的 Gemini prompt。
 * 使用 Identity-Locked Prompting 技巧，將角色特徵作為不可變的身分錨點。
 */

// 身分錨點 (Identity Anchor) — 不可修改的角色定義
const IDENTITY_ANCHOR = `[IDENTITY ANCHOR — DO NOT MODIFY]
Use the attached reference images as the sole identity anchor for the character "Jon-Ji (囧雞)".
Preserve ALL of the following identity traits exactly as shown in the reference images — no morphing, no deviation:
- Species: a small, round yellow chick
- Body color: solid flat yellow (#FFD700), no shading, no gradients
- Head comb: red three-petal comb on top of head, exactly as in reference
- Face/Eyes: MUST be the "囧" (Jiong) expression — two downward-drooping arcs as eyes, small open mouth below, conveying a perpetually dejected/exasperated look. NO other eye style permitted (no dot eyes, no round eyes, no happy eyes, no closed eyes, no sparkling eyes, no anime eyes). The facial expression does NOT change regardless of the scenario.
- Outline: bold black outlines throughout
- Style: flat color blocks, 2D simplified illustration, no gradients, no 3D, no realistic rendering`;

// 場景指令 — 只允許改變動作/姿勢/場景/道具
const SCENE_INSTRUCTION = `[SCENE — only change action, pose, props, and background]`;

// 風格與限制
const STYLE_CONSTRAINTS = `[STYLE CONSTRAINTS]
- White background only (no transparency)
- Flat design, bold black outlines, solid color blocks
- No gradients, no shadows, no 3D effects
- Absolutely no text, no letters, no words, no watermarks, no captions
- Style is secondary to identity; do not sacrifice character likeness for artistic effect
- The face expression must remain "囧" in ALL scenarios — the character's signature look never changes`;

export function buildPrompt(userScenario: string): string {
  const scenario = userScenario.trim();
  return `${IDENTITY_ANCHOR}

${SCENE_INSTRUCTION}
Jon-Ji (囧雞) is: ${scenario}
(Only the action, pose, props, and background change. The character's face, body shape, color, and art style remain identical to the reference images.)

${STYLE_CONSTRAINTS}`;
}
