import { lstat, readdir, readFile, realpath, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const IMAGE = /\.(png|jpe?g)$/i

function validateOptions(options) {
  const integer = (value, name, min, max) => {
    if (!Number.isInteger(value) || value < min || value > max) {
      throw new Error(`Image optimization: ${name} must be an integer from ${min} to ${max}`)
    }
  }
  if (typeof options.enabled !== 'boolean' || typeof options.png?.palette !== 'boolean') {
    throw new Error('Image optimization: enabled and png.palette must be booleans')
  }
  integer(options.png.quality, 'png.quality', 1, 100)
  integer(options.png.compressionLevel, 'png.compressionLevel', 0, 9)
  integer(options.jpeg?.quality, 'jpeg.quality', 1, 100)
  for (const name of ['maxWidth', 'maxHeight']) {
    if (options[name] !== null) integer(options[name], name, 1, 100000)
  }
  if (!Array.isArray(options.exclude) || options.exclude.some((item) =>
    typeof item !== 'string' || !item || item.includes('\\') ||
    item.startsWith('/') || item.split('/').some((part) => !part || part === '.' || part === '..')
  )) {
    throw new Error('Image optimization: exclude must contain relative public paths separated by /')
  }
}

function contains(parent, child) {
  const relative = path.relative(parent, child)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

async function* images(dir, relative = '') {
  for (const entry of await readdir(path.join(dir, relative), { withFileTypes: true })) {
    const name = path.join(relative, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`Image optimization: symbolic links are not supported in public/: ${name}`)
    }
    if (entry.isDirectory()) yield* images(dir, name)
    else if (entry.isFile() && IMAGE.test(entry.name)) yield name
  }
}

async function assertRegularOutput(outDir, relative) {
  let current = outDir
  const parts = relative.split(path.sep)
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part)
    const info = await lstat(current)
    if (info.isSymbolicLink() || (index < parts.length - 1 ? !info.isDirectory() : !info.isFile())) {
      throw new Error(`Expected a regular output file without symbolic links: ${current}`)
    }
  }
}

export async function optimizePublicImages({ publicDir, outDir, options, logger }) {
  validateOptions(options)
  if (!options.enabled) return

  const source = await realpath(publicDir)
  const output = await realpath(outDir)
  if (contains(source, output) || contains(output, source)) {
    throw new Error('Image optimization: publicDir and outDir must be separate directories')
  }

  let count = 0
  let before = 0
  let after = 0
  for await (const relative of images(source)) {
    const publicPath = relative.split(path.sep).join('/')
    if (options.exclude.some((item) => publicPath === item || publicPath.startsWith(`${item}/`))) continue

    const file = path.join(output, relative)
    try {
      await assertRegularOutput(output, relative)
      const input = await readFile(file)
      const image = sharp(input)
      const metadata = await image.metadata()
      const expectedFormat = /\.png$/i.test(relative) ? 'png' : 'jpeg'
      if (metadata.format !== expectedFormat || (metadata.pages ?? 1) > 1) {
        throw new Error(`Expected a single-page ${expectedFormat} image`)
      }
      if (expectedFormat === 'png' && !options.png.palette) {
        image.pipelineColourspace(metadata.space).toColourspace(metadata.space)
      }
      if (options.maxWidth !== null || options.maxHeight !== null) {
        image.resize({
          width: options.maxWidth ?? undefined,
          height: options.maxHeight ?? undefined,
          fit: 'inside',
          withoutEnlargement: true,
        })
      }
      image.keepMetadata()
      if (expectedFormat === 'png') {
        image.png({
          palette: options.png.palette,
          ...(options.png.palette ? { quality: options.png.quality } : {}),
          compressionLevel: options.png.compressionLevel,
        })
      } else {
        image.jpeg({ quality: options.jpeg.quality })
      }
      const { data, info } = await image.toBuffer({ resolveWithObject: true })
      const resized = info.width !== metadata.width || info.height !== metadata.height
      const result = resized || data.length < input.length ? data : input
      if (result !== input) await writeFile(file, result)
      count++
      before += input.length
      after += result.length
    } catch (error) {
      throw new Error(`Image optimization failed for ${publicPath}: ${error.message}`, { cause: error })
    }
  }
  logger.info(`Image optimization: ${count} images, ${(before / 1048576).toFixed(2)} MiB -> ${(after / 1048576).toFixed(2)} MiB`)
}

export default function imageOptimization(options) {
  let config
  return {
    name: 'public-image-optimization',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
      validateOptions(options)
      if (options.enabled && config.publicDir && config.build.copyPublicDir) {
        const outDir = path.resolve(config.root, config.build.outDir)
        if (contains(config.publicDir, outDir) || contains(outDir, config.publicDir)) {
          throw new Error('Image optimization: publicDir and outDir must be separate directories')
        }
      }
    },
    async writeBundle(outputOptions) {
      if (!options.enabled || !config.publicDir || !config.build.copyPublicDir) return
      try {
        await stat(config.publicDir)
      } catch (error) {
        if (error.code === 'ENOENT') return
        throw error
      }
      await optimizePublicImages({
        publicDir: config.publicDir,
        outDir: path.resolve(config.root, outputOptions.dir || config.build.outDir),
        options,
        logger: config.logger,
      })
    },
  }
}
