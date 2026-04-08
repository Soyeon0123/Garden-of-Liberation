import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Palace04(props) {
  const { scene } = useGLTF('/models/compressed/palace_draco_04.glb')
  return <primitive object={scene} {...props} />
}

useGLTF.preload('/models/compressed/palace_draco_04.glb')
export default Palace04