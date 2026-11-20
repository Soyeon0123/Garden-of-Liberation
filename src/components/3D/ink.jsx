// ink.jsx — 만화풍 잉크 외곽선 (모든 3D 모델이 공통으로 사용)
//
// ▶ 전체 켜기/끄기: 아래 INK.enabled 하나만 바꾸면 됩니다.
//   false 면 외곽선 계산·렌더링이 전부 사라져서 성능 부담이 0이 돼요.
//
// ▶ 새 모델에 외곽선을 넣는 법: 메쉬 안에 <InkOutline geometry={...} /> 한 줄 추가
//   <mesh geometry={nodes.X.geometry} material={...}>
//     <InkOutline geometry={nodes.X.geometry} />
//   </mesh>
//
// ▶ 메쉬마다 다르게 하고 싶을 때 (지정하지 않으면 아래 INK 기본값 사용)
//   <InkOutline geometry={...} thickness={1} angle={Math.PI / 3} />
//   · thickness: 가는 기둥·난간처럼 얇은 부분이 많으면 작게
//   · angle    : Math.PI = 모든 모서리를 둥글게 이어 선이 끊기지 않음 (둥근 형태에 적합)
//                Math.PI / 3 (60°) 정도 = 각진 모서리는 각지게 유지 (건축물에 적합, 대신 모서리에서 선이 살짝 벌어질 수 있음)
//
// ▶ 동작 방식
//   자연스러운 외곽선에 필요한 무거운 모서리 계산을 Web Worker(별도 작업 공간)에서 처리해서
//   웹툰이나 3D 화면이 멈추지 않아요. 한 번 계산한 결과는 저장해 두어 Restart 때는 다시 계산하지 않아요.
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const INK = {
  enabled: true,        // ← 외곽선 전체 On/Off
  thickness: 0.1,         // 선 두께 (화면 기준, 멀어져도 일정)
  color: '#2b1d14',     // 잉크 색
  angle: Math.PI,       // 모서리 선을 매끄럽게 잇는 정도
}

const promiseCache = new Map()   // 'uuid:angle' → Promise<외곽선용 geometry>
const readyCache = new Map()     // 'uuid:angle' → 계산 완료된 geometry (바로 꺼내 쓰기용)
const keyOf = (geometry, angle) => `${geometry.uuid}:${angle}`

// ── Worker 준비 (지원하지 않는 환경이면 화면 쪽에서 계산하는 방식으로 자동 대체) ──
let worker = null
let workerFailed = false
let seq = 0
const pending = new Map()
const fallbackQueue = new Set()   // Worker 실패 시 넘겨줄 대기 목록

function getWorker() {
  if (worker || workerFailed) return worker
  try {
    worker = new Worker(new URL('./inkWorker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (e) => {
      const { id, position, normal } = e.data
      const done = pending.get(id)
      pending.delete(id)
      done?.(position, normal)
    }
    worker.onerror = () => {
      // Worker 를 쓸 수 없는 환경이면, 기다리던 계산들을 화면 쪽 계산으로 넘김
      workerFailed = true
      worker = null
      const waiting = [...fallbackQueue]
      fallbackQueue.clear()
      waiting.forEach(({ geometry, angle, resolve }) => computeOnMainThread(geometry, angle).then(resolve))
    }
  } catch {
    workerFailed = true
    worker = null
  }
  return worker
}

function buildGeometry(position, normal) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(position, 3))
  g.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
  g.computeBoundingSphere()
  return g
}

// 모델의 좌표를 일반 숫자 배열로 꺼내기 (Worker 로 보내기 위해)
// 대부분은 이미 Float32 배열이라 통째로 빠르게 복사하고, 압축·묶음 형식일 때만 하나씩 꺼냄
function extractPositions(geometry) {
  const attr = geometry.attributes.position
  if (!attr.isInterleavedBufferAttribute && !attr.normalized && attr.array instanceof Float32Array && attr.itemSize === 3) {
    return attr.array.slice()
  }
  const out = new Float32Array(attr.count * 3)
  for (let i = 0; i < attr.count; i++) {
    out[i * 3]     = attr.getX(i)
    out[i * 3 + 1] = attr.getY(i)
    out[i * 3 + 2] = attr.getZ(i)
  }
  return out
}

function computeOnMainThread(geometry, angle = INK.angle) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const r = toCreasedNormals(geometry, angle)
      resolve(buildGeometry(r.attributes.position.array, r.attributes.normal.array))
    }, 0)
  })
}

export function requestInkGeometry(geometry, angle = INK.angle) {
  const key = keyOf(geometry, angle)
  if (promiseCache.has(key)) return promiseCache.get(key)

  const w = getWorker()
  const promise = !w
    ? computeOnMainThread(geometry, angle)
    : new Promise((resolve) => {
        const id = ++seq
        const position = extractPositions(geometry)
        const index = geometry.index ? new Uint32Array(geometry.index.array) : null
        const entry = { geometry, angle, resolve }
        fallbackQueue.add(entry)
        pending.set(id, (pos, nor) => { fallbackQueue.delete(entry); resolve(buildGeometry(pos, nor)) })
        const transfer = [position.buffer]
        if (index) transfer.push(index.buffer)
        w.postMessage({ id, position, index, angle }, transfer)
      })

  promise.then((g) => readyCache.set(key, g))
  promiseCache.set(key, promise)
  return promise
}

// 미리 계산해 두기 (하나씩 순서대로 → 메모리가 한꺼번에 튀지 않게)
// 항목은 geometry 그대로, 또는 { geometry, angle } 형태로 넣을 수 있어요
export function warmUpInk(items) {
  if (!INK.enabled) return
  items
    .filter(Boolean)
    .map((it) => (it.isBufferGeometry ? { geometry: it, angle: INK.angle } : { angle: INK.angle, ...it }))
    .filter((it) => it.geometry)
    .reduce((chain, it) => chain.then(() => requestInkGeometry(it.geometry, it.angle)), Promise.resolve())
}

// 외곽선만 그리기 위한 투명 껍데기 재질 (화면에는 아무것도 그리지 않음)
const hullMaterial = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })

export function InkOutline({ geometry, thickness = INK.thickness, angle = INK.angle, color = INK.color }) {
  const key = keyOf(geometry, angle)
  const [inkGeometry, setInkGeometry] = useState(() => readyCache.get(key) ?? null)

  useEffect(() => {
    if (!INK.enabled) return
    const ready = readyCache.get(key)
    if (ready) { setInkGeometry(ready); return }
    let alive = true
    requestInkGeometry(geometry, angle).then((g) => { if (alive) setInkGeometry(g) })
    return () => { alive = false }
  }, [geometry, angle, key])

  if (!INK.enabled || !inkGeometry) return null
  return (
    <mesh geometry={inkGeometry} material={hullMaterial}>
      {/* angle={0}: 이미 계산된 모양을 쓰므로 drei 가 다시 계산하지 않음 */}
      <Outlines thickness={thickness} color={color} angle={0} screenspace />
    </mesh>
  )
}
