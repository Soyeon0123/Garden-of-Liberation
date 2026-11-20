// Scene3D.jsx — 3D 공간 전체 (Canvas, 카메라, 모델, 꽃, 꽃잎, 효과)
//
// App.jsx 에서 React.lazy 로 불러와요. 그래서 three.js 관련 코드와 모델 파일은
// 앱을 처음 열 때가 아니라 관람객이 웹툰을 보기 시작할 즈음(Scene3DPrep) 또는
// 3D 공간에 들어갈 때 처음으로 내려받아집니다.
import { DefaultLoadingManager } from 'three'
import { trackLoadingManager } from '../../flow/assetProgress'
trackLoadingManager(DefaultLoadingManager)   // 로딩 화면(LoadingScreen)이 받는 파일 수를 셀 수 있게 연결
import React, { Suspense, useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Html, Billboard, useTexture, Preload } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, HueSaturation, BrightnessContrast, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'

import PalaceV1, { PalaceV1InkWarmup, preloadPalaceV1 } from './models/PalaceV1'
import PalaceV2, { PalaceV2InkWarmup, preloadPalaceV2} from './models/PalaceV2'
import PalaceV3, { PalaceV3InkWarmup, preloadPalaceV3 } from './models/PalaceV3'
import PalaceV4, { PalaceV4InkWarmup, preloadPalaceV4} from './models/PalaceV4'
import PalaceV5, { PalaceV5InkWarmup, preloadPalaceV5} from './models/PalaceV5'
import StructureV2, { StructureV2InkWarmup, preloadStructureV2 } from './models/StructureV2'
import FlowerField, { FLOWER_TEXTURE } from './FlowerField'
import GardenProps from './GardenProps'
import ImperialFlag from './ImperialFlag'

const BASE = import.meta.env.BASE_URL

// ── 꽃 배치 모드 ─────────────────────────────────────────────
// true 로 바꾸면 3D 화면에서 성/땅을 클릭할 때마다 클릭한 지점의 좌표가
// 콘솔에 FlowerField.jsx 의 FLOWER_CLUSTERS 형식 그대로 찍혀요. 배치가 끝나면 false 로!
const FLOWER_PLACEMENT_MODE = false

function logFlowerPlacement(e) {
  if (!FLOWER_PLACEMENT_MODE) return
  const { x, y, z } = e.point
  const r = (v) => Math.round(v * 10) / 10
  console.log(`{ x: ${r(x)}, y: ${r(y)}, z: ${r(z)}, count: 5, radius: 12 },`)
}


// ─────────────────────────────────────────────────────────────
// Scene3DPrep — 3D 공간에 들어가기 전에 미리 준비 (화면에는 안 보임)
//   App.jsx 가 웹툰을 보는 동안 이 컴포넌트를 띄우면:
//   ① three.js 코드 다운로드  ② 모델·꽃 텍스처 다운로드  ③ 외곽선 계산(Worker)
// ─────────────────────────────────────────────────────────────
export function Scene3DPrep() {
  useEffect(() => {
    preloadPalaceV1()
    preloadPalaceV2()
    preloadPalaceV3()
    preloadPalaceV4()
    preloadPalaceV5()
    preloadStructureV2()
    useTexture.preload(FLOWER_TEXTURE)
    GardenProps.preload()
    ImperialFlag.preload()
  }, [])
  return (
    <>
      <Suspense fallback={null}><PalaceV1InkWarmup /></Suspense>
      <Suspense fallback={null}><PalaceV2InkWarmup /></Suspense>
      <Suspense fallback={null}><PalaceV3InkWarmup /></Suspense>
      <Suspense fallback={null}><PalaceV4InkWarmup /></Suspense>
      <Suspense fallback={null}><PalaceV5InkWarmup /></Suspense>
      <Suspense fallback={null}><StructureV2InkWarmup /></Suspense>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// FlowerBillboard
// ─────────────────────────────────────────────────────────────
// 원하는 위치에 꽃 하나를 직접 배치할 때 사용 (FlowerField 와 같은 텍스처를 공유)
function FlowerBillboard({ position = [0, 5, 0], size = 35 }) {
  const texture = useTexture(FLOWER_TEXTURE)
  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false} position={position}>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} opacity={1} toneMapped={false} color="#ffffff" />
      </mesh>
    </Billboard>
  )
}

// ─────────────────────────────────────────────────────────────
// StandingIconBillboard
// ─────────────────────────────────────────────────────────────
function StandingIconBillboard({ position = [0, 5, 0], imagePath, onClick }) {
  const [texture, setTexture] = React.useState(null)
  const [hovered, setHovered] = React.useState(false)
  React.useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(imagePath, (t) => setTexture(t))
  }, [imagePath])
  if (!texture) return null
  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false} position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick?.() }}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} opacity={1} toneMapped={false} color="#ffffff" />
      </mesh>
      {hovered && (
        <Html position={[0, -17, 0]} center>
          <div style={{ color: 'white', fontSize: '16px', background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '20px', pointerEvents: 'none', whiteSpace: 'nowrap', border: '1px solid var(--color-accent-gold)', fontFamily: 'var(--font-body)' }}>
            Click to start the conversation
          </div>
        </Html>
      )}
    </Billboard>
  )
}

// ─────────────────────────────────────────────────────────────
// FallingPetals
// ─────────────────────────────────────────────────────────────
function usePetalTexture() {
  const [texture, setTexture] = useState(null)
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(`${BASE}images/petal.png`, (t) => setTexture(t))
  }, [])
  return texture
}

function FallingPetals({ count = 140, area = { x: 190, y: 55, z: 110 }, minY = -3 }) {
  const meshRef = useRef()
  const texture = usePetalTexture()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const petals = useMemo(() => (
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * area.x * 2,
      y: Math.random() * area.y + 10,
      z: (Math.random() - 0.5) * area.z * 2,
      fallSpeed: 1.0 + Math.random() * 1.6,
      swaySpeed: 0.3 + Math.random() * 0.6,
      swayAmount: 2 + Math.random() * 4,
      rotSpeed: (Math.random() - 0.5) * 1.4,
      rot: Math.random() * Math.PI * 2,
      scale: 0.6 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
    }))
  ), [count, area.x, area.y, area.z])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    petals.forEach((p, i) => {
      p.y -= p.fallSpeed * delta
      p.rot += p.rotSpeed * delta
      if (p.y < minY) {
        p.y = area.y + 10
        p.x = (Math.random() - 0.5) * area.x * 2
        p.z = (Math.random() - 0.5) * area.z * 2
      }
      const sway = Math.sin(t * p.swaySpeed + p.phase) * p.swayAmount
      dummy.position.set(p.x + sway, p.y, p.z)
      dummy.rotation.set(p.rot * 0.6, p.rot, p.rot * 0.3)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!texture) return null

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <planeGeometry args={[1.4, 1.8]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} depthWrite={false} opacity={0.85} />
    </instancedMesh>
  )
}

function SceneEffects({ composerRef }) {
  return (
    <EffectComposer ref={composerRef}>
      <Bloom intensity={0.4} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
      <HueSaturation hue={0} saturation={-0.1} />
      <BrightnessContrast brightness={0.01} contrast={-0.05} />
      <Vignette offset={0.35} darkness={0.75} />
    </EffectComposer>
  )
}
// ─────────────────────────────────────────────────────────────
// HiResCapture — 배경 캡처 모드(?bg) 전용
//   PNG 를 저장하는 순간에만 3D 를 목표 해상도(FHD/2K) 이상으로 다시 그려요.
//   그래서 1080p 모니터에서도 2560×1440 을 선명하게 뽑을 수 있어요.
//   (후처리 효과 Bloom·Vignette 등도 같은 해상도로 함께 다시 계산)
// ─────────────────────────────────────────────────────────────
const MAX_CAPTURE_PIXEL_RATIO = 4   // 그래픽 카드 부담 방지용 상한

function nextFrame() {
  return new Promise((r) => requestAnimationFrame(() => r()))
}

function HiResCapture({ captureRef, composerRef }) {
  const { gl, size } = useThree()

  useEffect(() => {
    if (!captureRef) return
    captureRef.current = async (target, draw) => {
      const prevRatio = gl.getPixelRatio()
      // 16:9 로 잘라도 목표 크기 이상이 되도록 배율 계산
      const ratio = Math.min(
        MAX_CAPTURE_PIXEL_RATIO,
        Math.max(prevRatio, target.w / size.width, target.h / size.height),
      )
      const resize = () => {
        if (composerRef?.current) composerRef.current.setSize(size.width, size.height)
        else gl.setSize(size.width, size.height, false)
      }

      gl.setPixelRatio(ratio)
      resize()
      await nextFrame()       // 새 해상도로 한 프레임이 완전히 그려질 때까지 대기
      await nextFrame()
      try {
        draw(gl.domElement)   // 이 순간의 3D 화면을 받아서 PNG 로 합치기
      } finally {
        gl.setPixelRatio(prevRatio)
        resize()
      }
    }
    return () => { captureRef.current = null }
  }, [gl, size, captureRef, composerRef])

  return null
}

// ─────────────────────────────────────────────────────────────
// CameraRig
// ─────────────────────────────────────────────────────────────

const CAMERA_DEFAULT        = { position: [167.3, 18.5, -34.3], target: [0, 10, 0] }
const CAMERA_ICON_PUNCH     = { position: [52.4, 25.8, 14.9], target: [14, 17, 8] }
const CAMERA_CONVO_PULLBACK = { position: [73.7, 28.1, 8.1], target: [14, 17, 8] } // punch보다 살짝 뒤로

const PUNCH_IN_DURATION = 0.9   // 줌인 속도
const HOLD_DURATION     = 1.2   // 줌인 후 "딱 붙어서 유지"하는 시간 — 이 값을 늘리면 인물 클로즈업이 더 오래 유지됨
const ZOOM_OUT_DURATION = 1.5   // 줌아웃 속도

// ── 흔들림(sway) 튜닝값 ──
// amplitude: 라디안 단위, 클수록 좌우로 크게 움직임 (0.12 ≈ ±7도, 0.2 ≈ ±11도)
// speed: 클수록 빨리 흔들림 (0.2~0.5 사이가 "살짝살짝" 느낌)
const IDLE_SWAY_AMPLITUDE  = 0.05   // 3D 공간 처음 진입했을 때 (대기 상태) — 더 은은하게
const IDLE_SWAY_SPEED      = 0.2
const CONVO_SWAY_AMPLITUDE = 0.12   // 대화 중 (줌인/줌아웃 이후) — 좀 더 뚜렷하게
const CONVO_SWAY_SPEED     = 0.4

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function CameraRig({ showNakaiIcon, showHyungdooIcon, controlsEnabled, disableSway = false }) {
  const { camera } = useThree()
  const orbitRef = useRef()

  // phase: 'idleSway' | 'punchIn' | 'hold' | 'zoomOut' | 'convoSway'
  const seq = useRef({ phase: 'idleSway', t0: performance.now() / 1000, from: CAMERA_DEFAULT, to: CAMERA_DEFAULT })
  const prevIconVisible = useRef(false)
  const swayBaseTheta = useRef(null)
  const isUserInteracting = useRef(false)

  // PunchIn
    useEffect(() => {
      const iconVisible = showNakaiIcon || showHyungdooIcon
      const now = performance.now() / 1000
      const current = { position: camera.position.toArray(), target: orbitRef.current.target.toArray() }

      if (iconVisible && !prevIconVisible.current) {
        seq.current = { phase: 'punchIn', t0: now, from: current, to: CAMERA_ICON_PUNCH }
      }
      if (!iconVisible && prevIconVisible.current) {
        seq.current = { phase: 'zoomOut', t0: now, from: current, to: CAMERA_CONVO_PULLBACK }
      }
      prevIconVisible.current = iconVisible
    }, [showNakaiIcon, showHyungdooIcon])
    

  // 현재 카메라 위치 기준으로 sway baseline을 다시 잡는 헬퍼 (스냅 방지의 핵심)
  const resyncSwayBase = (now) => {
    const rel = new THREE.Vector3().subVectors(camera.position, orbitRef.current.target)
    const sph = new THREE.Spherical().setFromVector3(rel)
    swayBaseTheta.current = sph.theta
    seq.current.t0 = now // sin(0) = 0 이 되도록 시간 기준도 리셋 → 튀지 않음
  }

  useFrame(() => {
    const now = performance.now() / 1000
    const s = seq.current

    // ── 전환 애니메이션 (punchIn / hold / zoomOut) ──
    if (s.phase === 'punchIn' || s.phase === 'zoomOut') {
      const duration = s.phase === 'punchIn' ? PUNCH_IN_DURATION : ZOOM_OUT_DURATION
      const t = Math.min((now - s.t0) / duration, 1)
      const blend = easeOutCubic(t)
      camera.position.lerpVectors(new THREE.Vector3(...s.from.position), new THREE.Vector3(...s.to.position), blend)
      orbitRef.current.target.lerpVectors(new THREE.Vector3(...s.from.target), new THREE.Vector3(...s.to.target), blend)
      orbitRef.current.update()

      if (t >= 1) {
        if (s.phase === 'punchIn') {
          // 줌인 끝 → 바로 줌아웃 아님, 먼저 hold
          seq.current = { phase: 'hold', t0: now, from: s.to, to: s.to }
        } else {
          resyncSwayBase(now)
          seq.current.phase = 'convoSway'
        }
      }
      return
    }

    if (s.phase === 'hold') {
      // CloseUp - hold
      return
    }

    // ── 흔들림 (idle 대기 상태 / 대화 중 상태 공통 로직) ──
    // 캡처 모드에서는 앵글이 흔들리지 않도록 sway 끔
    if (!disableSway && (s.phase === 'idleSway' || s.phase === 'convoSway') && !isUserInteracting.current) {
      if (swayBaseTheta.current === null) resyncSwayBase(now)
      const amplitude = s.phase === 'idleSway' ? IDLE_SWAY_AMPLITUDE : CONVO_SWAY_AMPLITUDE
      const speed      = s.phase === 'idleSway' ? IDLE_SWAY_SPEED      : CONVO_SWAY_SPEED

      const rel = new THREE.Vector3().subVectors(camera.position, orbitRef.current.target)
      const sph = new THREE.Spherical().setFromVector3(rel)
      sph.theta = swayBaseTheta.current + Math.sin((now - s.t0) * speed) * amplitude
      sph.makeSafe()
      const newPos = new THREE.Vector3().setFromSpherical(sph).add(orbitRef.current.target)
      camera.position.copy(newPos)
      orbitRef.current.update()
    }
  })

  // 사용자가 직접 드래그 → sway 잠깐 멈춤 / 손 떼면 현재 위치 기준으로 baseline 재동기화 (스냅 방지)
  useEffect(() => {
    const controls = orbitRef.current
    if (!controls) return
    const onStart = () => { isUserInteracting.current = true }
    const onEnd = () => {
      isUserInteracting.current = false
      resyncSwayBase(performance.now() / 1000) // ← 여기가 "충돌/튐" 문제의 핵심 수정 지점
      console.log('position:', camera.position.toArray().map(v => +v.toFixed(1)),
              'target:', orbitRef.current.target.toArray().map(v => +v.toFixed(1)))
    }
    controls.addEventListener('start', onStart)
    controls.addEventListener('end', onEnd)
    return () => {
      controls.removeEventListener('start', onStart)
      controls.removeEventListener('end', onEnd)
    }
  }, [])

  return (
    <OrbitControls
      ref={orbitRef}
      enabled={controlsEnabled}
      enablePan={false} 
      enableZoom enableRotate
      dampingFactor={0.05}
      enableDamping
      maxDistance={180}
      minDistance={40}
      maxPolarAngle={Math.PI * 0.5 - 0.05}
      minPolarAngle={0.05}
      // 정면 180도 제한 — 필요하면 주석 해제 (씬 좌표계 보면서 값 맞추기)
      // minAzimuthAngle={-Math.PI / 2}
      // maxAzimuthAngle={Math.PI / 2}
      target={CAMERA_DEFAULT.target}
    />
  )
}




// ─────────────────────────────────────────────────────────────
// ModelErrorBoundary ─ 모델 1개 단위로 로드/렌더 실패를 격리
// ─────────────────────────────────────────────────────────────
class ModelErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) {
    console.error(`[Model Error] "${this.props.name || 'unknown'}" 로드/렌더 실패:`, err)
  }
  render() {
    if (this.state.hasError) return null // 이 모델만 조용히 스킵, 나머지 씬은 유지
    return this.props.children
  }
}

// Suspense + ErrorBoundary를 모델 단위로 묶어주는 래퍼
function SafeModel({ name, children }) {
  return (
    <ModelErrorBoundary name={name}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </ModelErrorBoundary>
  )
}

// ─────────────────────────────────────────────────────────────
// 모델별 독립 컴포넌트 ─ 각각 별도 함수 컴포넌트로 분리해야
// 렌더 시점의 에러가 SceneModels() 실행 자체가 아니라
// 해당 컴포넌트를 렌더링하는 시점에만 발생하고, 그 시점의
// 가장 가까운 조상(SafeModel)에서만 잡히게 됩니다.
// ─────────────────────────────────────────────────────────────

function PalaceV1Wrapper({ selectedObject, setSelectedObject }) {
  return (
    <group onClick={(e) => { e.stopPropagation(); logFlowerPlacement(e); setSelectedObject('palaceV1') }}>
      <PalaceV1 />
    </group>
  )
}

function PalaceV2Wrapper({ selectedObject, setSelectedObject }) {
  return (
    <group onClick={(e) => {e.stopPropagation(); logFlowerPlacement(e); setSelectedObject('palaceV2') }}>
      <PalaceV2 />
    </group>
  )
}

function PalaceV3Wrapper({ selectedObject, setSelectedObject }) {
  return (
    <group onClick={(e) => {e.stopPropagation(); logFlowerPlacement(e); setSelectedObject('palaceV3')}}>
      <PalaceV3 />
    </group>
  )
}

function PalaceV4Wrapper({ selectedObject, setSelectedObject }) {
  return (
    <group onClick={(e) => {e.stopPropagation(); logFlowerPlacement(e); setSelectedObject('palaceV4')}}>
      <PalaceV4 />
    </group>
  )
}

function PalaceV5Wrapper({ selectedObject, setSelectedObject }) {
  return (
    <group onClick={(e) => {e.stopPropagation(); logFlowerPlacement(e); setSelectedObject('palaceV5')}}>
      <PalaceV5 />
    </group>
  )
}

function StructureV2Wrapper({ selectedObject, setSelectedObject }) {
  return (
    <group onClick={(e) => { e.stopPropagation(); logFlowerPlacement(e); setSelectedObject('structureV2') }}>
      <StructureV2 />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// SceneModels
// ─────────────────────────────────────────────────────────────
function SceneModels({ selectedObject, setSelectedObject, showNakaiIcon, onNakaiIconClick, showHyungdooIcon, onHyungdooIconClick }) {
  return (
    <>

      <SafeModel name="palaceV1">
        <PalaceV1Wrapper selectedObject={selectedObject} setSelectedObject={setSelectedObject} />
      </SafeModel>

      <SafeModel name="palaceV2">
        <PalaceV2Wrapper selectedObject={selectedObject} setSelectedObject={setSelectedObject} />
      </SafeModel>

      <SafeModel name="palaceV3">
        <PalaceV3Wrapper selectedObject={selectedObject} setSelectedObject={setSelectedObject} />
      </SafeModel>

      <SafeModel name="palaceV4">
        <PalaceV4Wrapper selectedObject={selectedObject} setSelectedObject={setSelectedObject} />
      </SafeModel>

      <SafeModel name="palaceV5">
        <PalaceV5Wrapper selectedObject={selectedObject} setSelectedObject={setSelectedObject} />
      </SafeModel>

      <SafeModel name="structureV2">
        <StructureV2Wrapper selectedObject={selectedObject} setSelectedObject={setSelectedObject} />
      </SafeModel>

      {/* 미선나무 꽃 — 꽃 무리 위치는 FlowerField.jsx 의 FLOWER_CLUSTERS 에서 조절 */}
      <SafeModel name="flowerField">
        <FlowerField />
      </SafeModel>

      <SafeModel name="gardenProps">
        <GardenProps />
      </SafeModel>

      {/* 특정 위치에 꽃을 직접 놓고 싶다면 아래처럼 추가 (같은 텍스처를 공유하므로 메모리 추가 부담 없음) */}
      {/* <SafeModel name="flowerHero"><FlowerBillboard position={[-130,40,60]} size={45} /></SafeModel> */}
      {showNakaiIcon    && <StandingIconBillboard position={[14,17,10]} imagePath={`${BASE}UI/standing_icon/nakai_standing.png`}    onClick={onNakaiIconClick}    />}
      {showHyungdooIcon && <StandingIconBillboard position={[14,17,10]} imagePath={`${BASE}UI/standing_icon/hyungdoo_standing.png`} onClick={onHyungdooIconClick} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// ErrorBoundary ─ Canvas 전체를 위한 최상위 안전망 (그대로 유지)
// ─────────────────────────────────────────────────────────────
class CanvasErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.error('Canvas error:', err) }
  render() {
    if (this.state.hasError) return <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: '14px', zIndex: 1 }}>3D 씬 로딩 중...</div>
    return this.props.children
  }
}


// ─────────────────────────────────────────────────────────────
// Scene3D — App.jsx 에서 사용하는 3D 공간 본체
// ─────────────────────────────────────────────────────────────
export default function Scene3D({ showNakaiIcon, onNakaiIconClick, showHyungdooIcon, onHyungdooIconClick, controlsEnabled, showFlag, captureMode = false, captureRef }) {
  const [selectedObject, setSelectedObject] = useState(null)
  const composerRef = useRef(null)

  return (
    <CanvasErrorBoundary>
      <Canvas style={{ position:'fixed',inset:0,zIndex:1,background:'transparent' }} camera={{ position:CAMERA_DEFAULT.position,fov:65 }} shadows gl={{ antialias:true,powerPreference:'high-performance',alpha:true,preserveDrawingBuffer:captureMode }} onClick={() => setSelectedObject(null)}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          {/* <pointLight position={[10,10,10]} intensity={1.5} castShadow /> */}
          <pointLight position={[-10,-10,-10]} intensity={0.8} color="#0066ff" />
          <directionalLight position={[80,120,60]} intensity={2.5} castShadow />
          {/* 환경광(HDR)은 외부 서버에서 받아오므로 따로 감싸서, 받는 동안 나머지 장면이 기다리지 않게 함 */}
          <Suspense fallback={null}>
            <Environment preset="forest" />
          </Suspense>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,-2,0]} receiveShadow onClick={(e) => { e.stopPropagation(); logFlowerPlacement(e) }}>
            <planeGeometry args={[30,30]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
          </mesh>
          <SceneModels
            selectedObject={selectedObject} setSelectedObject={setSelectedObject}
            showNakaiIcon={showNakaiIcon}
            onNakaiIconClick={onNakaiIconClick}
            showHyungdooIcon={showHyungdooIcon}
            onHyungdooIconClick={onHyungdooIconClick}
          />
          <SafeModel name="imperialFlag">
            <ImperialFlag visible={showFlag} />
          </SafeModel>
          <FallingPetals />
          <CameraRig
            showNakaiIcon={showNakaiIcon}
            showHyungdooIcon={showHyungdooIcon}
            controlsEnabled={controlsEnabled}
            disableSway={captureMode}
          />
          <SceneEffects composerRef={composerRef} />
          {captureMode && <HiResCapture captureRef={captureRef} composerRef={composerRef} />}
          {/* 텍스처를 그래픽 카드에 미리 올리고 셰이더를 미리 준비 → 첫 화면 멈춤 감소 */}
          <Preload all />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  )
}
