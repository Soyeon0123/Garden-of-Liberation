export function dialogueImages(line, getFigure) {
  if (!line) return []
  return [
    getFigure(line.leftChar, line.side === 'left' ? line.expression : null),
    getFigure(line.rightChar, line.side === 'right' ? line.expression : null),
  ].filter(Boolean)
}

export function sceneImageLookahead(segments, step, dialogueIndex, { cutscenes, items, getFigure }) {
  const images = []
  const current = segments[step]
  if (current?.type === 'dialogue') {
    current.lines.slice(dialogueIndex + 1, dialogueIndex + 3)
      .forEach((line) => images.push(...dialogueImages(line, getFigure)))
    if (dialogueIndex + 3 < current.lines.length) return [...new Set(images)]
  }

  let upcoming = 0
  for (const segment of segments.slice(step + 1)) {
    if (segment.type === 'cue') continue
    if (segment.type === 'cutscene') images.push(cutscenes[segment.id])
    else if (segment.type === 'inventory') images.push(items[segment.id]?.image)
    else if (segment.type === 'dialogue') {
      segment.lines.slice(0, 2).forEach((line) => images.push(...dialogueImages(line, getFigure)))
    } else continue
    if (++upcoming === 2 || segment.type === 'dialogue') break
  }
  return [...new Set(images.filter(Boolean))]
}
