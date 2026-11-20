import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createImagePreloadQueue } from './imagePreloadQueue.js'

function setup() {
  const started = []
  const pending = new Map()
  const errors = []
  const queue = createImagePreloadQueue({
    load(url, done) { started.push(url); pending.set(url, done) },
    onError(...args) { errors.push(args) },
  })
  return {
    queue, started, errors,
    finish(url, error) {
      const done = pending.get(url)
      assert.ok(done, `not loading: ${url}`)
      pending.delete(url)
      done(error)
    },
  }
}

test('limits concurrency, deduplicates URLs, and favors the nearest queued work', () => {
  const { queue, started, finish } = setup()
  queue.set('later', ['a', 'b', 'c'], { priority: 1 })
  queue.set('near', ['b', 'd'], { priority: 0 })
  assert.deepEqual(started, ['a', 'b'])
  finish('a')
  assert.deepEqual(started, ['a', 'b', 'd'])
  finish('b')
  assert.deepEqual(started, ['a', 'b', 'd', 'c'])
})

test('drops obsolete queued work but lets in-flight requests finish', () => {
  const { queue, started, finish } = setup()
  let ready = false
  queue.set('comic', ['a', 'b', 'old'], { onReady: () => { ready = true } })
  queue.clear('comic')
  queue.set('ending', ['new'])
  finish('a')
  finish('b')
  assert.deepEqual(started, ['a', 'b', 'new'])
  assert.equal(ready, false)
  finish('new')
  assert.equal(queue.isBusy(), false)
})

test('reports failures and signals completion without retrying indefinitely', () => {
  const { queue, errors, finish } = setup()
  let ready = 0
  queue.set('scene', ['missing'], { onReady: () => { ready++ } })
  finish('missing', new Error('failed'))
  assert.equal(errors.length, 1)
  assert.equal(ready, 1)
  assert.equal(queue.isBusy(), false)
})

test('reuses recent successful work without keeping image objects', () => {
  const { queue, started, finish } = setup()
  queue.set('first', ['same'])
  finish('same')
  queue.clear('first')
  let ready = false
  queue.set('second', ['same'], { onReady: () => { ready = true } })
  assert.deepEqual(started, ['same'])
  assert.equal(ready, true)
})
