// inkWorker.js — 외곽선용 모서리 계산을 화면과 분리된 별도 작업 공간(Web Worker)에서 처리
// 이 계산이 화면 쪽에서 돌면 웹툰 클릭이 버벅이므로, 여기로 옮겨서 화면은 항상 부드럽게 유지
import { BufferGeometry, BufferAttribute } from 'three'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

self.onmessage = (e) => {
  const { id, position, index, angle } = e.data
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(position, 3))
  if (index) geometry.setIndex(new BufferAttribute(index, 1))

  const result = toCreasedNormals(geometry, angle)
  const pos = result.attributes.position.array
  const nor = result.attributes.normal.array
  self.postMessage({ id, position: pos, normal: nor }, [pos.buffer, nor.buffer])
}
