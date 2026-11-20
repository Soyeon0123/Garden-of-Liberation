import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
// PlacementPicker — 좌표 찾기 도구 (개발 중, 주소 끝에 ?place 일 때만 켜짐)
//   예: http://localhost:5173/?place
//   3D 공간에서 제자리 클릭 → 그 지점에 빨간 점 + 콘솔에 [x, y, z]
//   (화면을 드래그해서 돌릴 때는 찍히지 않음)
// ─────────────────────────────────────────────────────────────

const ENABLED =
  import.meta.env.DEV && typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('place')

function Picker() {
  const { gl, camera, scene } = useThree()
  const [mark, setMark] = useState(null)

  useEffect(() => {
    const el = gl.domElement
    const raycaster = new THREE.Raycaster()
    let down = null

    const onDown = (e) => { down = [e.clientX, e.clientY] }
    const onUp = (e) => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return
      const rect = el.getBoundingClientRect()
      raycaster.setFromCamera(new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      ), camera)
      const hit = raycaster.intersectObjects(scene.children, true)
        .find((h) => h.object.visible && !h.object.isInstancedMesh && !h.object.userData.noPick)
      if (!hit) return console.log('[배치] 빈 공간이에요')

      const p = hit.point.toArray().map((v) => Math.round(v * 10) / 10)
      setMark(p)
      console.log(`[배치] 클릭한 지점: [${p.join(', ')}]`)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
    }
  }, [gl, camera, scene])

  return mark ? (
    <mesh position={mark} userData={{ noPick: true }}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="red" toneMapped={false} depthTest={false} />
    </mesh>
  ) : null
}

export default function PlacementPicker() {
  return ENABLED ? <Picker /> : null
}
