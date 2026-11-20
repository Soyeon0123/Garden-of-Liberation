import { useEffect, useRef } from 'react'
import { createImagePreloadQueue } from './imagePreloadQueue'

const queue = createImagePreloadQueue({
  load(src, done) {
    const image = new Image()
    let settled = false
    const finish = (error) => {
      if (settled) return
      settled = true
      done(error)
    }
    image.fetchPriority = 'low'
    image.onload = () => {
      if (!image.decode) {
        finish()
        return
      }
      try {
        image.decode().then(() => finish(), finish)
      } catch (error) {
        finish(error)
      }
    }
    image.onerror = () => finish(new Error('Image request failed'))
    image.src = src
    return image
  },
})

export function useImagePreload(urls, { priority = 1, onReady } = {}) {
  const scope = useRef(Symbol('image-preload'))
  const onReadyRef = useRef(onReady)
  useEffect(() => { onReadyRef.current = onReady }, [onReady])
  const key = JSON.stringify(urls.filter(Boolean))

  useEffect(() => {
    const id = scope.current
    queue.set(id, JSON.parse(key), { priority, onReady: () => onReadyRef.current?.() })
    return () => queue.clear(id)
  }, [key, priority])
}
