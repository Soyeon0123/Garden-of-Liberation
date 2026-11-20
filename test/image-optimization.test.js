import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import defaults from '../image-optimization.config.js'
import { optimizePublicImages } from '../vite-image-optimization.js'

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'garden-images-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const publicDir = path.join(root, 'public')
  const outDir = path.join(root, 'dist')
  await mkdir(publicDir)
  await mkdir(outDir)
  const add = async (name, data) => {
    for (const dir of [publicDir, outDir]) {
      await mkdir(path.dirname(path.join(dir, name)), { recursive: true })
      await writeFile(path.join(dir, name), data)
    }
  }
  const run = (changes = {}) => optimizePublicImages({
    publicDir,
    outDir,
    options: { ...defaults, ...changes },
    logger: { info() {} },
  })
  return { publicDir, outDir, add, run }
}

test('compresses PNG losslessly and JPEG while preserving transparency, orientation and sources', async (t) => {
  const f = await fixture(t)
  const raw = Buffer.alloc(128 * 128 * 4)
  for (let i = 0; i < raw.length; i += 4) {
    raw[i] = (i / 4) % 256
    raw[i + 1] = Math.floor(i / 1024)
    raw[i + 2] = (i / 4 * 13) % 256
    raw[i + 3] = (i / 4) % 256
  }
  const png = await sharp(raw, { raw: { width: 128, height: 128, channels: 4 } }).png({ compressionLevel: 0 }).toBuffer()
  const jpeg = await sharp({ create: { width: 128, height: 64, channels: 3, background: '#aabbcc' } })
    .jpeg({ quality: 100 }).withMetadata({ orientation: 6 }).toBuffer()
  await f.add('nested/a.png', png)
  await f.add('photo.JPG', jpeg)
  await f.run()

  const pngOutput = await readFile(path.join(f.outDir, 'nested/a.png'))
  assert.equal((await sharp(pngOutput).metadata()).paletteBitDepth, undefined)
  const pngPixels = await sharp(pngOutput).ensureAlpha().raw().toBuffer()
  assert.deepEqual(pngPixels, raw)
  assert.ok(pngOutput.length < png.length)
  const jpegOutput = await readFile(path.join(f.outDir, 'photo.JPG'))
  const jpegMetadata = await sharp(jpegOutput).metadata()
  assert.equal(jpegMetadata.orientation, 6)
  assert.equal(jpegMetadata.width, 128)
  assert.equal(jpegMetadata.height, 64)
  assert.deepEqual(await readFile(path.join(f.publicDir, 'nested/a.png')), png)
  assert.deepEqual(await readFile(path.join(f.publicDir, 'photo.JPG')), jpeg)
})

test('resizes within limits, preserves aspect ratio, and respects exclusions', async (t) => {
  const f = await fixture(t)
  const png = await sharp({ create: { width: 100, height: 50, channels: 4, background: '#ff000080' } }).png().toBuffer()
  await f.add('keep/a.png', png)
  await f.add('resize.png', png)
  await f.run({ maxWidth: 40, maxHeight: 40, exclude: ['keep'] })
  assert.deepEqual(await readFile(path.join(f.outDir, 'keep/a.png')), png)
  const metadata = await sharp(path.join(f.outDir, 'resize.png')).metadata()
  assert.equal(metadata.width, 40)
  assert.equal(metadata.height, 20)
  assert.equal(metadata.hasAlpha, true)
  assert.deepEqual(await readFile(path.join(f.publicDir, 'resize.png')), png)
})

test('does not upscale and keeps the original when recompression is larger', async (t) => {
  const f = await fixture(t)
  const pixels = Buffer.alloc(64 * 64 * 3)
  for (let i = 0; i < pixels.length; i++) pixels[i] = (i * 37 + Math.floor(i / 11)) % 256
  const jpeg = await sharp(pixels, { raw: { width: 64, height: 64, channels: 3 } }).jpeg({ quality: 15 }).toBuffer()
  await f.add('small.jpg', jpeg)
  await f.run({ jpeg: { quality: 100 }, maxWidth: 1000 })
  assert.deepEqual(await readFile(path.join(f.outDir, 'small.jpg')), jpeg)
})

test('allows lossy PNG palette output', async (t) => {
  const f = await fixture(t)
  const png = await sharp({ create: { width: 32, height: 32, channels: 4, background: '#ff000080' } })
    .png({ compressionLevel: 0 }).toBuffer()
  await f.add('palette.png', png)
  await f.run({ png: { ...defaults.png, palette: true } })
  const metadata = await sharp(path.join(f.outDir, 'palette.png')).metadata()
  assert.ok(metadata.paletteBitDepth > 0)
  assert.equal(metadata.hasAlpha, true)
})

test('preserves 16-bit PNG depth and pixels in lossless mode', async (t) => {
  const f = await fixture(t)
  const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#816293' } })
    .toColourspace('rgb16').png({ compressionLevel: 0 }).toBuffer()
  await f.add('16bit.png', png)
  await f.run()
  const output = await readFile(path.join(f.outDir, '16bit.png'))
  assert.equal((await sharp(output).metadata()).depth, 'ushort')
  const pixels = (data) => sharp(data).pipelineColourspace('rgb16').toColourspace('rgb16').raw({ depth: 'ushort' }).toBuffer()
  assert.deepEqual(await pixels(output), await pixels(png))
  assert.ok(output.length < png.length)
})

test('rejects invalid settings and fails with the path for corrupt images', async (t) => {
  const f = await fixture(t)
  await assert.rejects(f.run({ jpeg: { quality: 101 } }), /jpeg\.quality/)
  await assert.rejects(f.run({ exclude: ['../outside'] }), /exclude/)
  await f.add('bad.png', Buffer.from('not an image'))
  await assert.rejects(f.run(), /Image optimization failed for bad\.png/)
  assert.deepEqual(await readFile(path.join(f.outDir, 'bad.png')), Buffer.from('not an image'))
})

test('rejects overlapping public and output directories', async (t) => {
  const f = await fixture(t)
  await assert.rejects(optimizePublicImages({
    publicDir: f.publicDir,
    outDir: f.publicDir,
    options: defaults,
    logger: { info() {} },
  }), /must be separate/)
})

test('rejects output symlinks without modifying their targets', async (t) => {
  const f = await fixture(t)
  const original = Buffer.from('outside output')
  const target = path.join(path.dirname(f.outDir), 'target')
  await writeFile(target, original)
  await writeFile(path.join(f.publicDir, 'image.png'), original)
  await symlink(target, path.join(f.outDir, 'image.png'))
  await assert.rejects(f.run(), /image\.png.*without symbolic links/)
  assert.deepEqual(await readFile(target), original)
})

test('can disable processing', async (t) => {
  const f = await fixture(t)
  const invalid = Buffer.from('not an image')
  await f.add('image.png', invalid)
  await f.run({ enabled: false })
  assert.deepEqual(await readFile(path.join(f.outDir, 'image.png')), invalid)
})
