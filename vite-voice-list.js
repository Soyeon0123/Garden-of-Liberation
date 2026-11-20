// ─────────────────────────────────────────────────────────────
// vite-voice-list.js — public/audio/voice 안의 녹음 파일 목록을 자동으로 만들어 주는 Vite 플러그인
//
//   폴더에 녹음을 넣기만 하면 코드가 알아서 목록에 넣어요. (파일 이름을 코드에 적을 필요 없음)
//   개발 중(npm run dev)에 파일을 넣거나 지우면 화면이 자동으로 새로고침돼요.
//
//   코드에서는 이렇게 읽어요:
//     import voiceFiles from 'virtual:voice-list'
//     // → { "02_mother": ["take1.mp3", "take2.mp3"], "07_soyeon": [...], ... }
//
//   vite.config.js 에 연결:
//     import voiceList from './vite-voice-list.js'
//     plugins: [react(), voiceList()]
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs'
import path from 'node:path'

const AUDIO = /\.(mp3|wav|m4a|ogg)$/i

export default function voiceList({ dir = 'public/audio/voice' } = {}) {
  const ID = 'virtual:voice-list'
  const RESOLVED = '\0' + ID
  let base = ''

  const scan = () => {
    const out = {}
    if (!fs.existsSync(base)) return out
    const folders = fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    for (const folder of folders) {
      out[folder] = fs.readdirSync(path.join(base, folder)).filter((f) => AUDIO.test(f)).sort()
    }
    return out
  }

  return {
    name: 'voice-list',
    configResolved(config) { base = path.resolve(config.root, dir) },
    resolveId(id) { if (id === ID) return RESOLVED },
    load(id) { if (id === RESOLVED) return `export default ${JSON.stringify(scan())}` },

    // 개발 중: 녹음 파일이 추가·삭제되면 목록을 다시 만들고 새로고침
    configureServer(server) {
      server.watcher.add(base)
      const refresh = (file) => {
        if (!path.resolve(file).startsWith(base)) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}
