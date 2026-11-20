import { useRef } from 'react'
import { Billboard, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ENV } from '../../story/assets'

// ─────────────────────────────────────────────────────────────
// ImperialFlag — 1장 분위기 전환 때 정원에 나타나는 일장기 (flag_icon.png)
//   GardenProps 와 같은 방식: 항상 카메라를 바라보는 2D 이미지
//   visible 이 true 가 되면 땅에서 천천히 솟아오르며 나타나고, false 면 가라앉으며 사라짐
//
//   ▸ position : 이미지 "가운데"의 위치 [x, y, z]  ← ?place 로 찾은 좌표를 넣어 맞추기
//   ▸ size     : 세로 크기 (가로는 이미지 비율대로 자동)
// ─────────────────────────────────────────────────────────────

const FLAG = { position: [-40, 30, -1], size: 30 }

const APPEAR_SPEED = 1.2    // 나타나는 속도 (클수록 빠름)
const RISE         = 0.5    // 솟아오르는 거리 (세로 크기의 몇 배 아래에서 시작하는지)
const SWAY         = 0.01   // 바람에 흔들리는 정도 (라디안, 0 이면 안 흔들림)
const ALPHA_CUT    = 0.4    // GardenProps 와 같은 투명막 방지 값

export default function ImperialFlag({ visible = false }) {
  const texture = useTexture(ENV.flag)
  texture.colorSpace = THREE.SRGBColorSpace
  const aspect = texture.image ? texture.image.width / texture.image.height : 1

  const meshRef = useRef()
  const matRef  = useRef()
  const amount  = useRef(0)   // 0 = 숨김, 1 = 완전히 나타남

  useFrame((state, delta) => {
    const target = visible ? 1 : 0
    amount.current = THREE.MathUtils.damp(amount.current, target, APPEAR_SPEED * 2, delta)
    const a = amount.current
    if (!meshRef.current || !matRef.current) return

    meshRef.current.visible  = a > 0.01
    matRef.current.opacity   = a
    meshRef.current.position.y = -FLAG.size * RISE * (1 - a)                       // 아래에서 솟아오름
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.3) * SWAY * a // 살랑살랑
  })

  return (
    <Billboard follow position={FLAG.position}>
      <mesh ref={meshRef} visible={false}>
        <planeGeometry args={[FLAG.size * aspect, FLAG.size]} />
        <meshBasicMaterial
          ref={matRef}
          map={texture}
          transparent
          opacity={0}
          alphaTest={ALPHA_CUT}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  )
}

// Scene3DPrep 에서 미리 받아 두기용
ImperialFlag.preload = () => useTexture.preload(ENV.flag)
