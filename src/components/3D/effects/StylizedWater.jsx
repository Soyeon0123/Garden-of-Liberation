import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────
// 손그림 스타일에 어울리는 가벼운 물 셰이더 (v2: 불규칙한 물결)
// - sin 파동 대신 노이즈(fbm)를 겹치고 서로 비틀어서(domain warp)
//   반복 패턴 없이 자연스럽게 일렁이도록
// - 텍스처 없음, 반사 렌더링 없음 → 성능 부담 거의 없음
// ─────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3  uDeep;
  uniform vec3  uShallow;
  uniform vec3  uHighlight;
  uniform float uOpacity;
  uniform float uScale;
  uniform float uSpeed;
  uniform float uLineStrength;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  // ── 노이즈 함수들 ──
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // 크기가 다른 노이즈를 여러 겹 쌓기 (겹마다 회전시켜 방향성 제거)
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p = rot * p * 2.0 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vWorldPos.xz * uScale;
    float t = uTime * uSpeed;

    // 노이즈로 좌표 자체를 비틀어서(domain warp) 흐르는 듯한 불규칙함
    vec2 q = vec2(
      fbm(p + vec2(0.0, t * 0.3)),
      fbm(p + vec2(5.2, 1.3) - t * 0.25)
    );
    float w = fbm(p + 2.0 * q + t * 0.15);

    // 불규칙한 얇은 물결 하이라이트
    float band = smoothstep(0.58, 0.68, w) - smoothstep(0.68, 0.8, w);

    // 가장자리는 얕은 색, 안쪽은 깊은 색
    vec2 e = min(vUv, 1.0 - vUv);
    float edge = smoothstep(0.0, 0.15, min(e.x, e.y));

    vec3 col = mix(uShallow, uDeep, clamp(edge * 0.75 + (w - 0.5) * 0.6, 0.0, 1.0));
    col = mix(col, uHighlight, band * uLineStrength);

    gl_FragColor = vec4(col, uOpacity * mix(0.55, 1.0, edge));
    #include <colorspace_fragment>
  }
`

// ─────────────────────────────────────────────────────────────
// width, depth: 수면 크기 / position: 수면 위치
// deep, shallow, highlight: 깊은 물색, 얕은 물색, 반짝임 색
// opacity: 투명도 / scale: 물결 촘촘함 (클수록 잘게)
// speed: 물결 속도 / lineStrength: 하얀 물결선 진하기 (0 = 없음)
// ─────────────────────────────────────────────────────────────
export default function StylizedWater({
  width = 10,
  depth = 10,
  position = [0, 0, 0],
  deep = '#7fa7a3',
  shallow = '#c7ddd3',
  highlight = '#ffffff',
  opacity = 0.85,
  scale = 0.8,
  speed = 10,
  lineStrength = 0.25,
}) {
  const uniforms = useMemo(() => ({
    uTime:         { value: 0 },
    uDeep:         { value: new THREE.Color(deep) },
    uShallow:      { value: new THREE.Color(shallow) },
    uHighlight:    { value: new THREE.Color(highlight) },
    uOpacity:      { value: opacity },
    uScale:        { value: scale },
    uSpeed:        { value: speed },
    uLineStrength: { value: lineStrength },
  }), [])

  useEffect(() => {
    uniforms.uDeep.value.set(deep)
    uniforms.uShallow.value.set(shallow)
    uniforms.uHighlight.value.set(highlight)
    uniforms.uOpacity.value = opacity
    uniforms.uScale.value = scale
    uniforms.uSpeed.value = speed
    uniforms.uLineStrength.value = lineStrength
  }, [uniforms, deep, shallow, highlight, opacity, scale, speed, lineStrength])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
