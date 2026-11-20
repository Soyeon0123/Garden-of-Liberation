// FlowerField — 미선나무 꽃이 정원 곳곳에 피어나는 효과
//  · 꽃 무리(cluster)의 중심점만 정하면, 그 주변에 꽃이 자연스럽게 흩어져 핌
//  · 꽃 아래쪽 끝이 땅(y)에 닿도록 배치 → 공중에 뜨지 않음, 땅에서 자라나듯 피어남
//  · useTexture 로 이미지를 한 번만 불러와 모든 꽃이 공유 (그래픽 메모리 1장)
//  · instancedMesh 로 한 번에 그림 (draw call 1회), 항상 카메라를 바라봄 (빌보드)
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const BASE = import.meta.env.BASE_URL

// ── 용량 비교 테스트용 ──
// export const FLOWER_TEXTURE = `${BASE}images/mison_namu.png`
export const FLOWER_TEXTURE = `${BASE}images/mison_namu_half.png`

// ── 꽃 무리 위치 ──
// x, y, z : 무리의 중심 (y = 땅 높이). App.jsx 의 FLOWER_PLACEMENT_MODE 를 켜고
//           3D 화면을 클릭하면 콘솔에 이 형식 그대로 좌표가 찍혀요. 복사해서 붙여 넣으세요.
// count   : 이 무리에 필 꽃 개수
// radius  : 중심에서 꽃이 퍼지는 반경 (작을수록 촘촘)
// 아래 값은 기존에 직접 배치하셨던 꽃 위치를 바탕으로 한 시작점이에요.
export const FLOWER_CLUSTERS = [
  { x: -150, y: -2,   z: -120, count: 5, radius: 12 },
  { x: -20,  y: -2,   z: 100,  count: 5, radius: 12 },
  { x: -67.4, y: 0, z: -120.4, count: 5, radius: 12 },
  { x: -100, y: -2,   z: -90,  count: 5, radius: 12 },
  { x: 20,   y: -2,   z: 130,  count: 5, radius: 12 },
  { x: -100, y: -2,   z: -130, count: 5, radius: 12 },
  { x: -130, y: 22.5, z: 60,   count: 4, radius: 8  },
  { x: 177.5, y: 0, z: 121.8, count: 10, radius: 30 },
  { x: 50,   y: -2,   z: -80,  count: 5, radius: 12 },
  { x: 176.5, y: 0, z: 40.3, count: 10, radius: 30 },
  { x: 172.2, y: 0, z: -124.4, count: 5, radius: 25 },
  { x: 30,   y: -2,   z: 85,   count: 5, radius: 12 },
  { x: 30,   y: -2,   z: 85,   count: 5, radius: 12 },
]

// 매번 같은 배치가 나오도록 하는 난수 (seed 를 바꾸면 무리 안의 배치가 다시 섞임)
function seededRandom(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function FlowerField({
  clusters = FLOWER_CLUSTERS,
  sizeMin = 22, sizeMax = 38,
  bloomDuration = 1.6,    // 꽃 하나가 피어나는 시간(초)
  bloomSpread = 2.5,      // 전체 꽃이 피어나는 시간차(초)
  seed = 7,
}) {
  const texture = useTexture(FLOWER_TEXTURE)
  const meshRef = useRef()
  const startTime = useRef(null)
  const { camera } = useThree()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 기준점을 꽃 아래쪽 끝으로 옮긴 판 → 크기가 커져도 땅에 붙어 있음
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.translate(0, 0.5, 0)
    return g
  }, [])

  const aspect = texture.image ? texture.image.width / texture.image.height : 1

  const flowers = useMemo(() => {
    const rand = seededRandom(seed)
    const list = []
    clusters.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const angle = rand() * Math.PI * 2
        const r = Math.sqrt(rand()) * c.radius
        list.push({
          x: c.x + Math.cos(angle) * r,
          y: c.y,
          z: c.z + Math.sin(angle) * r,
          size: sizeMin + rand() * (sizeMax - sizeMin),
          delay: rand() * bloomSpread,
          phase: rand() * Math.PI * 2,
        })
      }
    })
    return list
  }, [clusters, sizeMin, sizeMax, bloomSpread, seed])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    if (startTime.current === null) startTime.current = t
    const elapsed = t - startTime.current

    flowers.forEach((f, i) => {
      const p = Math.min(Math.max((elapsed - f.delay) / bloomDuration, 0), 1)
      const bloom = 1 - Math.pow(1 - p, 3)                 // 땅에서 부드럽게 자라남
      const s = Math.max(f.size * bloom, 0.0001)
      const sway = Math.sin(t * 0.6 + f.phase) * 0.6      // 살랑살랑
      dummy.position.set(f.x + sway, f.y, f.z)
      dummy.quaternion.copy(camera.quaternion)
      dummy.scale.set(s * aspect, s, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  if (flowers.length === 0) return null

  return (
    <instancedMesh key={flowers.length} ref={meshRef} args={[geometry, undefined, flowers.length]} frustumCulled={false}>
      <meshBasicMaterial map={texture} transparent alphaTest={0.4} side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  )
}

useTexture.preload(FLOWER_TEXTURE)
