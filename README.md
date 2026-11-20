# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Production image optimization

`npm run build` automatically compresses PNG and JPEG files copied from `public/`
into `dist/`. Original files, URLs, formats, and dimensions are unchanged by
default. The build reports the total image size before and after optimization.
This also runs in the GitHub Pages deployment; `npm run dev` does not compress
images. SVGs, other media, images imported from source code, and images embedded
in 3D models are not processed.

Edit [image-optimization.config.js](./image-optimization.config.js) before
building:

- `enabled`: set to `false` to disable optimization.
- `png.palette`: `false` keeps PNG compression lossless; `true` enables lossy
  palette quantization. `png.quality` controls palette quality from 1 to 100
  (default 85); `png.compressionLevel` controls lossless encoding effort from
  0 to 9 (default 9).
- `jpeg.quality`: JPEG encoding quality from 1 to 100 (default 85). JPEG
  recompression is lossy.
- `maxWidth` and `maxHeight`: maximum pixel dimensions, or `null` for no
  limit. Resizing preserves aspect ratio and never enlarges images. Dimensions
  refer to the encoded image before any EXIF orientation is applied.
- `exclude`: exact file or directory paths relative to `public/`, separated by
  `/`, for example `['images/Paper_tex_2.png', 'comics/intro']`. Wildcards are
  not supported.

Transparency and image metadata are retained. For images that are not resized,
the original is kept if the optimized file would be larger. A resized result is
kept even if larger, to honor the configured limits. Invalid configuration,
unsupported symbolic links in `public/`, or image processing errors fail the
build rather than silently deploying an unexpected result. Review representative
images after adjusting quality, especially when enabling lossy PNG compression.

Run the focused checks with `node --test test/image-optimization.test.js`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
