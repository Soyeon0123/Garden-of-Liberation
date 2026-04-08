

import React from 'react'
import { useGLTF } from '@react-three/drei'

const BASE = import.meta.env.BASE_URL

export function Palace04(props) {
  const { scene } = useGLTF(`${BASE}models/compressed/palace_draco_04.glb`)
  return <primitive object={scene} {...props} />
}

useGLTF.preload(`${BASE}models/compressed/palace_draco_04.glb`)
export default Palace04