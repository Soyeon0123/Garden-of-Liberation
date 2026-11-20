export function createImagePreloadQueue({ load, limit = 2, onError = console.warn }) {
  const scopes = new Map()
  const active = new Map()
  const recent = new Set()

  const notifyReady = () => {
    for (const scope of scopes.values()) {
      if (!scope.notified && scope.urls.every((url) => scope.settled.has(url))) {
        scope.notified = true
        scope.onReady?.()
      }
    }
  }

  const drain = () => {
    const ordered = [...scopes.values()].sort((a, b) => a.priority - b.priority)
    while (active.size < limit) {
      let next
      for (const scope of ordered) {
        next = scope.urls.find((url) => !scope.settled.has(url) && !active.has(url))
        if (next) break
      }
      if (!next) break

      const url = next
      active.set(url, true)
      const request = load(url, (error) => {
        if (!active.has(url)) return
        active.delete(url)
        if (error) {
          onError('[image preload] Could not load:', url, error)
        } else {
          recent.delete(url)
          recent.add(url)
          if (recent.size > 48) recent.delete(recent.values().next().value)
        }
        for (const scope of scopes.values()) {
          if (scope.urls.includes(url)) scope.settled.add(url)
        }
        notifyReady()
        drain()
      })
      if (active.has(url)) active.set(url, request || true)
    }
    notifyReady()
  }

  return {
    set(scopeId, urls, { priority = 1, onReady } = {}) {
      const previous = scopes.get(scopeId)
      const unique = [...new Set(urls.filter(Boolean))]
      const settled = new Set(unique.filter((url) => recent.has(url) || previous?.settled.has(url)))
      scopes.set(scopeId, { urls: unique, settled, priority, onReady, notified: false })
      drain()
    },
    clear(scopeId) {
      scopes.delete(scopeId)
      drain()
    },
    isBusy: () => active.size > 0,
  }
}
