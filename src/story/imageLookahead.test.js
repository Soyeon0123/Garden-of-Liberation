import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sceneImageLookahead } from './imageLookahead.js'

const assets = {
  cutscenes: { first: 'cut.jpg' },
  items: { book: { image: 'book.png' } },
  getFigure: (character, expression) => character ? `${character}:${expression ?? 'default'}` : null,
}

test('looks ahead through dialogue without preloading the entire segment', () => {
  const lines = [
    { leftChar: 'a', rightChar: 'b', side: 'left', expression: 'one' },
    { leftChar: 'a', rightChar: 'b', side: 'right', expression: 'two' },
    { leftChar: 'a', rightChar: 'b', side: 'left', expression: 'three' },
    { leftChar: 'a', rightChar: 'b', side: 'left', expression: 'later' },
  ]
  const segments = [{ type: 'dialogue', lines }, { type: 'cutscene', id: 'first' }]
  assert.deepEqual(sceneImageLookahead(segments, 0, 0, assets), [
    'a:default', 'b:two', 'a:three', 'b:default',
  ])
  assert.deepEqual(sceneImageLookahead(segments, 0, 2, assets), [
    'a:later', 'b:default', 'cut.jpg',
  ])
})

test('skips cues and resolves upcoming cutscene and inventory assets', () => {
  const segments = [
    { type: 'cutscene', id: 'current' },
    { type: 'cue' },
    { type: 'cutscene', id: 'first' },
    { type: 'inventory', id: 'book' },
    { type: 'cutscene', id: 'unused' },
  ]
  assert.deepEqual(sceneImageLookahead(segments, 0, 0, assets), ['cut.jpg', 'book.png'])
})

test('uses the first lines of a following dialogue and tolerates missing IDs', () => {
  const segments = [
    { type: 'inventory', id: 'current' },
    { type: 'cutscene', id: 'missing' },
    { type: 'dialogue', lines: [{ leftChar: 'a', side: 'left', expression: null }] },
  ]
  assert.deepEqual(sceneImageLookahead(segments, 0, 0, assets), ['a:default'])
})
