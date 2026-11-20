# Copilot instructions

## Commands

- Install dependencies: `npm ci` (CI uses Node.js 20).
- Start the dev server: `npm run dev`.
- Build for GitHub Pages: `npm run build`.
- Preview a production build: `npm run preview`.
- Lint the project: `npm run lint`.
- Lint one file: `npx eslint src/path/to/file.jsx`.
- There is no configured test runner or test script, so there is no single-test command.

## Architecture

- `src/main.jsx` chooses the lightweight mobile page or lazy-loads the desktop experience. The mobile page intentionally avoids loading the Three.js scene; keep heavy 3D imports behind the desktop `App` boundary.
- `src/App.jsx` orchestrates the experience as a sequence of values defined in `src/flow/stages.js`. It coordinates story scenes, interactions, ending choices, and audio; stage-to-music selection lives in `src/story/bgm.js`.
- Chapter and ending content is data in `src/story/chapters/` and `src/story/endings/`. `src/story/script.js` converts its beats into segments, and `src/components/story/ScenePlayer.jsx` presents dialogue, cutscenes, inventory, and cues.
- The interactive garden is a React Three Fiber scene in `src/components/3D/Scene3D.jsx`, with environment elements and models in neighboring modules. It is loaded separately from the story/flow components.
- `public/` holds runtime media and 3D models. Vite builds with `/Garden-of-Liberation/` as the production base path for GitHub Pages; the Pages workflow builds `dist` on pushes to `main`.

## Repository conventions

- Add or change story content in the chapter/ending data modules, not in presentation components. A scene exports `{ guest, beats }`; dialogue beats are `[speaker, expression, text]`, and cutscene, inventory, effect, camera, or FX beats use their existing object forms. Speaker names and asset IDs must match the registries in `src/story/script.js` and `src/story/assets.js`.
- Keep public media paths in `src/story/assets.js` (and music paths in `src/story/bgm.js`) rather than scattering URLs through components. Build paths from `import.meta.env.BASE_URL` so assets resolve under the GitHub Pages subpath.
- To add voice recordings, place supported audio files in a role folder under `public/audio/voice/`. `vite-voice-list.js` discovers files automatically; add the folder's role-to-character mapping in `src/story/voice.js` when introducing a new role.
- Keep stage identifiers in `src/flow/stages.js` and update the related stage consumers when adding a stage, including `pickBgm` if it needs music.
- Shared design variables live in `src/styles/tokens.css`, imported by `src/main.jsx`; the desktop experience also imports `src/styles/comic.css`. Prefer the existing CSS custom properties for shared colors and typography.
