import { Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { ENV } from '../../story/assets'
import PlacementPicker from './PlacementPicker'

// ─────────────────────────────────────────────────────────────
// GardenProps — 연못 중앙의 미선나무 이미지, 연못 앞의 이름표 이미지
//   Scene3D 의 FlowerBillboard 와 같은 방식: 항상 카메라를 바라보는 2D 이미지
//
//   ▸ position : 이미지 "가운데"의 위치 [x, y, z]  ← 직접 찾은 좌표를 넣어 맞추기
//   ▸ size     : 세로 크기 (가로는 이미지 비율대로 자동)
// ─────────────────────────────────────────────────────────────

const PROPS = {
  miseonNamu: { position: [66, 14, -6.5],  size: 40 },
  nameTag:    { position: [110, 4, -10],    size: 10  },
}

// 투명도가 이 값보다 낮은 픽셀은 아예 그리지 않음 (0 ~ 1)
//   → 멀리서 볼 때 이미지 주위에 생기는 옅은 "투명막" 제거
//   가장자리가 너무 깎이면 낮추고(0.2), 막이 남으면 올리기(0.6)
const ALPHA_CUT = 0.4

function FacingImage({ src, position, size }) {
  const texture = useTexture(src)
  texture.colorSpace = THREE.SRGBColorSpace   // png 색이 흐리게 바래 보이지 않도록
  const aspect = texture.image ? texture.image.width / texture.image.height : 1

  return (
    <Billboard follow position={position}>
      <mesh>
        <planeGeometry args={[size * aspect, size]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={ALPHA_CUT}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  )
}

export default function GardenProps() {
  return (
    <>
      <FacingImage src={ENV.miseonNamu} {...PROPS.miseonNamu} />
      <FacingImage src={ENV.nameTag}    {...PROPS.nameTag} />
      <PlacementPicker />
    </>
  )
}

// Scene3DPrep 에서 미리 받아 두기용
GardenProps.preload = () => useTexture.preload([ENV.miseonNamu, ENV.nameTag])
