import React, { Suspense, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Html, Billboard } from '@react-three/drei'
import { EffectComposer, Outline, Selection, Select } from '@react-three/postprocessing'
import * as THREE from 'three'

// 3D 모델 imports
import Palace from './components/3D/models/Palace'
import Structure from './components/3D/models/Structure'

// Stage 정의
const STAGES = {
  INTRO_COMIC: 'intro_comic',
  CHAPTER_1_DIALOGUE: 'chapter_1_dialogue',
  CHAPTER_1_VIDEO: 'chapter_1_video',
  CHAPTER_2_DIALOGUE: 'chapter_2_dialogue',
  CHAPTER_2_VIDEO: 'chapter_2_video',
  CHAPTER_3_DIALOGUE: 'chapter_3_dialogue',
  CHAPTER_3_VIDEO: 'chapter_3_video',
  NAME_CHOICE: 'name_choice',
  RETRY_DIALOGUE: 'retry_dialogue',
  ENDING_COMIC: 'ending_comic',
  CREDITS: 'credits'
}

// Flower Billboard 컴포넌트 추가 (디버깅 버전)
function FlowerBillboard({ position = [0, 5, 0] }) {
  const [texture, setTexture] = React.useState(null)
  const [error, setError] = React.useState(null)
  
  React.useEffect(() => {
    console.log('🌸 FlowerBillboard: 이미지 로딩 시작')
    const loader = new THREE.TextureLoader()
    
    loader.load(
      '/images/flower.png',
      (loadedTexture) => {
        console.log('✅ FlowerBillboard: 이미지 로딩 성공!', loadedTexture)
        setTexture(loadedTexture)
      },
      (progress) => {
        console.log('⏳ FlowerBillboard: 로딩 중...', progress)
      },
      (err) => {
        console.error('❌ FlowerBillboard: 이미지 로딩 실패', err)
        setError(err)
      }
    )
  }, [])
  
  return (
    <Billboard
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
      position={position}
    >
      {/* 실제 이미지 - 크기를 10x10으로 증가, 밝기 조정 */}
      <mesh>
        <planeGeometry args={[35 , 35]} />
        {texture ? (
          <meshBasicMaterial 
            map={texture} 
            transparent={true}
            side={THREE.DoubleSide}
            opacity={1}
            toneMapped={false}
            color="#ffffff"
          />
        ) : (
          <meshBasicMaterial 
            color="lime"
            side={THREE.DoubleSide}
            opacity={0.8}
            transparent={true}
          />
        )}
      </mesh>
    </Billboard>
  )
}

// Standing Icon Billboard 컴포넌트 (클릭 가능)
function StandingIconBillboard({ position = [0, 5, 0], imagePath, onClick }) {
  const [texture, setTexture] = React.useState(null)
  const [hovered, setHovered] = React.useState(false)
  const meshRef = React.useRef()
  
  React.useEffect(() => {
    console.log('👤 StandingIcon: 이미지 로딩 시작', imagePath)
    const loader = new THREE.TextureLoader()
    
    loader.load(
      imagePath,
      (loadedTexture) => {
        console.log('✅ StandingIcon: 이미지 로딩 성공!')
        setTexture(loadedTexture)
      },
      undefined,
      (err) => {
        console.error('❌ StandingIcon: 이미지 로딩 실패', err)
      }
    )
  }, [imagePath])
  
  return (
    <Billboard
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
      position={position}
    >
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          onClick && onClick()
        }}
      >
        <planeGeometry args={[40, 40]} />
        {texture ? (
          <meshBasicMaterial 
            map={texture} 
            transparent={true}
            side={THREE.DoubleSide}
            opacity={1}
            toneMapped={false}
            color="#ffffff"
          />
        ) : (
          <meshBasicMaterial 
            color="yellow"
            side={THREE.DoubleSide}
            opacity={0.8}
            transparent={true}
          />
        )}
      </mesh>
      {/* 클릭 가능 표시 - hover 시에만 표시 */}
      {hovered && (
        <Html position={[0, -17, 0]} center>
          <div style={{
            color: 'white',
            fontSize: '16px',
            background: 'rgba(0,0,0,0.7)',
            padding: '10px 20px',
            borderRadius: '20px',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            whiteSpace: 'nowrap'
          }}>
            Click to start the conversation
          </div>
        </Html>
      )}
    </Billboard>
  )
}

// Chapter 1 전용 인터랙션 오버레이 (nakai ↔ soyeon 교차 대화)
function Chapter1InteractionOverlay({ onComplete }) {
  const [dialogueIndex, setDialogueIndex] = useState(0)
  
  // Nakai와 Soyeon이 교차하는 대화
  const dialogues = [
    { character: "Nakai", text: "Wait… who are you, miss?", side: "left" },
    { character: "Soyeon", text: "Huh… where am I? I was just at Changdeokgung a moment ago…", side: "right" },
    { character: "Nakai", text: "This is the 1900s—back when I was studying plants in Joseon.", side: "left" },
    { character: "Soyeon", text: "But… it's 2025 right now.", side: "right" },
    { character: "Nakai", text: "So you're… not Japanese, then.", side: "left" },
    { character: "Soyeon", text: "Who is this man…?", side: "right" },
  ]

  const currentDialogue = dialogues[dialogueIndex]

  // 캐릭터 이미지 import 경로
  const characterImages = {
    nakai: '/src/components/UI/figure_illust/nakai.png',
    soyeon: '/src/components/UI/figure_illust/soyeon.png'
  }

  const handleClick = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      // 모든 대사 완료
      onComplete()
    }
  }

  // 현재 말하는 캐릭터
  const currentCharacter = currentDialogue.character.toLowerCase()

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      {/* Nakai 일러스트 (좌측) */}
      <div style={{
        position: 'absolute',
        bottom: '250px',
        left: '10%',
        pointerEvents: 'none',
        opacity: currentCharacter === 'nakai' ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        animation: currentCharacter === 'nakai' ? 'fadeIn 0.5s ease-in-out' : 'none'
      }}>
        <img 
          src={characterImages.nakai}
          alt="Nakai"
          style={{
            height: '600px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))',
          }}
        />
      </div>

      {/* Soyeon 일러스트 (우측) */}
      <div style={{
        position: 'absolute',
        bottom: '250px',
        right: '10%',
        pointerEvents: 'none',
        opacity: currentCharacter === 'soyeon' ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        animation: currentCharacter === 'soyeon' ? 'fadeIn 0.5s ease-in-out' : 'none'
      }}>
        <img 
          src={characterImages.soyeon}
          alt="Soyeon"
          style={{
            height: '600px',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))',
          }}
        />
      </div>

      {/* 대사 UI */}
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '220px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.85))',
          color: 'white',
          padding: '30px 50px',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'auto',
          borderTop: '3px solid #ff69b4',
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        <div style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#ff69b4',
          marginBottom: '15px',
          textShadow: '0 0 10px #ff69b4'
        }}>
          {currentDialogue.character}
        </div>
        <div style={{
          fontSize: '18px',
          lineHeight: '1.8',
          maxWidth: '900px'
        }}>
          {currentDialogue.text}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25px',
          right: '50px',
          fontSize: '14px',
          opacity: 0.8,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {dialogueIndex < dialogues.length - 1 ? 'Click to continue ▼' : 'Click for next scene ▼'}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25px',
          left: '50px',
          fontSize: '12px',
          opacity: 0.6
        }}>
          {dialogueIndex + 1} / {dialogues.length}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// 인트로 웹코믹 컴포넌트 (3컷 가로 배치)
function IntroComic({ onComplete }) {
  const comicPanels = [
    '/comics/intro/panel1.png',
    '/comics/intro/panel2.png',
    '/comics/intro/panel3.png',
  ]

  const [visiblePanels, setVisiblePanels] = useState(1)

  const handleClick = () => {
    if (visiblePanels < comicPanels.length) {
      setVisiblePanels(visiblePanels + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        cursor: 'pointer',
        zIndex: 9999,
        gap: '20px',
        padding: '40px'
      }}
    >
      {comicPanels.slice(0, visiblePanels).map((panel, index) => (
        <img
          key={index}
          src={panel}
          alt={`Intro panel ${index + 1}`}
          style={{
            height: '65vh',
            width: 'auto',
            objectFit: 'contain',
            userSelect: 'none',
            opacity: 0,
            animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s forwards`
          }}
        />
      ))}
      
      <div style={{
        position: 'absolute',
        bottom: '40px',
        color: 'white',
        fontSize: '14px',
        opacity: 0.7,
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {visiblePanels < comicPanels.length ? '클릭하여 계속' : '클릭하여 시작'}
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

// 3D 공간의 모델들
function SceneModels({ selectedObject, setSelectedObject, showStandingIcon, onStandingIconClick }) {
  return (
    <>
      <Select enabled={selectedObject === 'palace'}>
        <group
          position={[-3, 0, 0]}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedObject('palace')
          }}
        >
          <Palace />
        </group>
      </Select>

      <Select enabled={selectedObject === 'structure'}>
        <group
          position={[3, 0, 0]}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedObject('structure')
          }}
        >
          <Structure />
        </group>
      </Select>

      {/* Flower Billboard 10개 추가 - 다양한 위치에 배치 */}
      <FlowerBillboard position={[0, 20, -30]} />
      <FlowerBillboard position={[-150, 40, -30]} />
      <FlowerBillboard position={[-135, 40, 30]} />
      <FlowerBillboard position={[80, 15, 90]} />
      <FlowerBillboard position={[80, 15, -90]} />
      <FlowerBillboard position={[60, 15, -80]} />
      <FlowerBillboard position={[-5, 15, 80]} />
      <FlowerBillboard position={[0, 15, -90]} />
      <FlowerBillboard position={[-120, 40, 50]} />
      <FlowerBillboard position={[120, 15, 20]} />

      {/* Chapter 1 전용: Standing Icon (클릭 가능) */}
      {showStandingIcon && (
        <StandingIconBillboard 
          position={[14, 17, 10]}
          imagePath="/src/components/UI/standing_icon/nakai_standing.png"
          onClick={onStandingIconClick}
        />
      )}
    </>
  )
}

// 일본어 선택 시 Retry 대사 UI
function RetryDialogueOverlay({ onComplete }) {
  const [dialogueIndex, setDialogueIndex] = useState(0)
  
  const dialogues = [
    { character: '안내자', text: 'You selected Japanese name...' },
    { character: '안내자', text: 'However, you can make another choice.' },
    { character: '안내자', text: 'Rethink about the meaning of a name.' },
  ]

  const currentDialogue = dialogues[dialogueIndex]

  const handleClick = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      onComplete()
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      {/* 캐릭터 플레이스홀더 */}
      <div style={{
        position: 'absolute',
        bottom: '250px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '200px',
          height: '350px',
          background: 'linear-gradient(135deg, #f5576c, rgba(255,255,255,0.1))',
          borderRadius: '100px 100px 20px 20px',
          border: '3px solid #f5576c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
          position: 'relative',
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          👤
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '18px',
            background: 'rgba(0,0,0,0.7)',
            padding: '5px 10px',
            borderRadius: '20px',
            color: 'white'
          }}>
            RETRY
          </div>
        </div>
      </div>

      {/* 대사 UI */}
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '220px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.85))',
          color: 'white',
          padding: '30px 50px',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'auto',
          borderTop: '3px solid #f5576c',
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#f5576c',
          marginBottom: '15px',
          textShadow: '0 0 10px #f5576c'
        }}>
          {currentDialogue.character}
        </div>
        <div style={{
          fontSize: '18px',
          lineHeight: '1.8',
          maxWidth: '900px'
        }}>
          {currentDialogue.text}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25px',
          right: '50px',
          fontSize: '14px',
          opacity: 0.8,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {dialogueIndex < dialogues.length - 1 ? '클릭하여 계속 ▼' : '클릭하여 다시 선택 ▼'}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25px',
          left: '50px',
          fontSize: '12px',
          opacity: 0.6
        }}>
          {dialogueIndex + 1} / {dialogues.length}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function ChapterDialogueOverlay({ chapterNumber, onComplete }) {
  const [dialogueIndex, setDialogueIndex] = useState(0)
  
  const dialogues = {
    1: [
      { character: 'Chapter 1 - The Empire\'s eye', text: '제국의 눈에 대한 첫 번째 대사입니다.' },
      { character: 'Chapter 1 - The Empire\'s eye', text: '제국의 눈에 대한 두 번째 대사입니다.' },
      { character: 'Chapter 1 - The Empire\'s eye', text: '제국의 눈에 대한 세 번째 대사입니다.' },
    ],
    2: [
      { character: 'Chapter 2 - The Voice in Local', text: '지역의 목소리에 대한 첫 번째 대사입니다.' },
      { character: 'Chapter 2 - The Voice in Local', text: '지역의 목소리에 대한 두 번째 대사입니다.' },
      { character: 'Chapter 2 - The Voice in Local', text: '지역의 목소리에 대한 세 번째 대사입니다.' },
    ],
    3: [
      { character: 'Chapter 3 - The meaning of Name', text: '이름의 의미에 대한 첫 번째 대사입니다.' },
      { character: 'Chapter 3 - The meaning of Name', text: '이름의 의미에 대한 두 번째 대사입니다.' },
      { character: 'Chapter 3 - The meaning of Name', text: '이름의 의미에 대한 세 번째 대사입니다.' },
    ]
  }

  const currentDialogues = dialogues[chapterNumber]
  const currentDialogue = currentDialogues[dialogueIndex]

  const handleClick = () => {
    if (dialogueIndex < currentDialogues.length - 1) {
      setDialogueIndex(dialogueIndex + 1)
    } else {
      onComplete()
    }
  }

  const chapterColors = {
    1: '#ff69b4',
    2: '#00ffff', 
    3: '#90ee90'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 100
    }}>
      {/* 캐릭터 플레이스홀더 */}
      <div style={{
        position: 'absolute',
        bottom: '250px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '200px',
          height: '350px',
          background: `linear-gradient(135deg, ${chapterColors[chapterNumber]}, rgba(255,255,255,0.1))`,
          borderRadius: '100px 100px 20px 20px',
          border: `3px solid ${chapterColors[chapterNumber]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80px',
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
          position: 'relative'
        }}>
          🎭
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '18px',
            background: 'rgba(0,0,0,0.7)',
            padding: '5px 10px',
            borderRadius: '20px',
            color: 'white'
          }}>
            CH{chapterNumber}
          </div>
        </div>
      </div>

      {/* 대사 UI */}
      <div
        onClick={handleClick}
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '220px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.85))',
          color: 'white',
          padding: '30px 50px',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'auto',
          borderTop: `3px solid ${chapterColors[chapterNumber]}`
        }}
      >
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: chapterColors[chapterNumber],
          marginBottom: '15px',
          textShadow: `0 0 10px ${chapterColors[chapterNumber]}`
        }}>
          {currentDialogue.character}
        </div>
        <div style={{
          fontSize: '18px',
          lineHeight: '1.8',
          maxWidth: '900px'
        }}>
          {currentDialogue.text}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25px',
          right: '50px',
          fontSize: '14px',
          opacity: 0.8,
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {dialogueIndex < currentDialogues.length - 1 ? '클릭하여 계속 ▼' : '클릭하여 다음 장면 ▼'}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '25px',
          left: '50px',
          fontSize: '12px',
          opacity: 0.6
        }}>
          {dialogueIndex + 1} / {currentDialogues.length}
        </div>
      </div>
    </div>
  )
}

// 이미지 슬라이드쇼 컴포넌트 (비디오 대체)
function ImageSlideshow({ images, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const handleClick = () => {
    if (currentIndex < images.length - 1) {
      setFadeOut(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setFadeOut(false)
      }, 300)
    } else {
      setFadeOut(true)
      setTimeout(() => {
        onComplete()
      }, 500)
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 200
      }}
    >
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          userSelect: 'none'
        }}
      />
      
      {/* 진행 표시 */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '40px',
        color: 'white',
        fontSize: '16px',
        opacity: 0.7,
        background: 'rgba(0,0,0,0.5)',
        padding: '10px 20px',
        borderRadius: '20px'
      }}>
        {currentIndex + 1} / {images.length}
      </div>

      {/* 클릭 안내 */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        color: 'white',
        fontSize: '14px',
        opacity: 0.7,
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        {currentIndex < images.length - 1 ? 'Click to continue ▼' : 'Click for next scene ▼'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

// 이름 선택 (Canvas 밖에서 오버레이) - SVG 이미지 버전
function NameChoiceOverlay({ onChoice }) {
  const [hoveredChoice, setHoveredChoice] = useState(null)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '60px',
      zIndex: 200
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '48px',
        marginBottom: '40px',
        fontWeight: 'bold',
        textShadow: '0 0 20px rgba(255,255,255,0.3)'
      }}>
        Choose your name
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* 한글 선택 - mison_namu.svg 사용 */}
        <div
          onClick={() => onChoice('korean')}
          onMouseEnter={() => setHoveredChoice('korean')}
          onMouseLeave={() => setHoveredChoice(null)}
          style={{
            width: '700px',
            height: '350px',
            background: hoveredChoice === 'korean' 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 0.08)',
            border: hoveredChoice === 'korean' 
              ? '2px solid rgba(255, 255, 255, 0.4)' 
              : '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: hoveredChoice === 'korean' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: hoveredChoice === 'korean' 
              ? '0 8px 32px rgba(255, 255, 255, 0.2)' 
              : '0 4px 16px rgba(0, 0, 0, 0.3)',
            padding: '40px'
          }}
        >
          <img 
            src="/typo/mison_namu.svg" 
            alt="한글 이름"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: hoveredChoice === 'korean' ? 'brightness(1.1)' : 'brightness(1)',
              transition: 'filter 0.3s ease'
            }}
          />
        </div>

        {/* 일본어 선택 - Uchiwa-noki.svg 사용 */}
        <div
          onClick={() => onChoice('japanese')}
          onMouseEnter={() => setHoveredChoice('japanese')}
          onMouseLeave={() => setHoveredChoice(null)}
          style={{
            width: '700px',
            height: '350px',
            background: hoveredChoice === 'japanese' 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 0.08)',
            border: hoveredChoice === 'japanese' 
              ? '2px solid rgba(255, 255, 255, 0.4)' 
              : '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: hoveredChoice === 'japanese' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: hoveredChoice === 'japanese' 
              ? '0 8px 32px rgba(255, 255, 255, 0.2)' 
              : '0 4px 16px rgba(0, 0, 0, 0.3)',
            padding: '40px'
          }}
        >
          <img 
            src="/typo/Uchiwa-noki.svg" 
            alt="일본어 이름"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: hoveredChoice === 'japanese' ? 'brightness(1.1)' : 'brightness(1)',
              transition: 'filter 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// 엔딩 컨텐츠
function EndingContent({ onComplete }) {
  const endingType = 'images'
  
  const comicPanels = [
    '/comics/ending/panel1.png',
    '/comics/ending/panel2.png',
    '/comics/ending/panel3.png',
  ]
  
  const endingVideo = '/videos/ending.mp4'

  const [currentPanel, setCurrentPanel] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const handleClick = () => {
    if (currentPanel < comicPanels.length - 1) {
      setFadeOut(true)
      setTimeout(() => {
        setCurrentPanel(currentPanel + 1)
        setFadeOut(false)
      }, 300)
    } else {
      setFadeOut(true)
      setTimeout(() => {
        onComplete()
      }, 500)
    }
  }

  const handleVideoEnd = () => {
    onComplete()
  }

  if (endingType === 'video') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <video
          src={endingVideo}
          autoPlay
          onEnded={handleVideoEnd}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          controls
        />
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        cursor: 'pointer',
        zIndex: 9999
      }}
    >
      <img
        src={comicPanels[currentPanel]}
        alt={`Ending panel ${currentPanel + 1}`}
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          userSelect: 'none'
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: '40px',
        color: 'white',
        fontSize: '14px',
        opacity: 0.7,
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        클릭하여 계속
      </div>
    </div>
  )
}

// 크레딧
function Credits({ onComplete }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 8000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'black',
      color: 'white',
      overflowY: 'auto',
      padding: '60px',
      fontFamily: 'system-ui, sans-serif',
      zIndex: 9999
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '56px', marginBottom: '80px', color: '#00ffff' }}>
          The Garden of Liberation
        </h1>

        <div style={{ marginBottom: '100px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Timeline & Infographic</h2>
          <img 
            src="/infographic.png" 
            alt="Infographic"
            style={{ maxWidth: '100%', marginBottom: '40px', borderRadius: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '100px', textAlign: 'left' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '30px', textAlign: 'center' }}>
            참고 문헌 & 사료
          </h2>
          <ul style={{ lineHeight: '2.2', fontSize: '16px', opacity: 0.9 }}>
            <li>참고문헌 1: 제목, 저자, 출판사</li>
            <li>참고문헌 2: 제목, 저자, 출판사</li>
            <li>참고문헌 3: 제목, 저자, 출판사</li>
            <li>사료 1: 출처 및 설명</li>
            <li>사료 2: 출처 및 설명</li>
          </ul>
        </div>

        <div style={{ marginTop: '120px', fontSize: '14px', opacity: 0.6 }}>
          <p style={{ marginBottom: '20px' }}>잠시 후 처음으로 돌아갑니다...</p>
          <div style={{
            width: '0',
            height: '3px',
            background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
            margin: '0 auto',
            animation: 'loading 8s linear forwards'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0; }
          100% { width: 400px; }
        }
      `}</style>
    </div>
  )
}

// 메인 App
function App() {
  const [currentStage, setCurrentStage] = useState(STAGES.INTRO_COMIC)
  const [selectedObject, setSelectedObject] = useState(null)
  const [showChapter1Interaction, setShowChapter1Interaction] = useState(false)

  // 챕터별 이미지 배열 정의
  const chapterImages = {
    1: [
      '/video/chp_01_01.jpg',
      '/video/chp_01_02.jpg',
      '/video/chp_01_03.jpg'
    ],
    2: [
      '/video/chp_02_01.jpg',
      '/video/chp_02_02.jpg',
      '/video/chp_02_03.jpg'
    ],
    3: [
      '/video/chp_03_01.jpg',
      '/video/chp_03_02.jpg',
      '/video/chp_03_03.jpg'
    ]
  }

  const handleStageComplete = (nextStage) => {
    setCurrentStage(nextStage)
    setShowChapter1Interaction(false)
  }

  const handleStandingIconClick = () => {
    console.log('Standing icon clicked!')
    setShowChapter1Interaction(true)
  }

  const isIn3DSpace = ![STAGES.INTRO_COMIC, STAGES.ENDING_COMIC, STAGES.CREDITS].includes(currentStage)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      {currentStage === STAGES.INTRO_COMIC && (
        <IntroComic onComplete={() => handleStageComplete(STAGES.CHAPTER_1_DIALOGUE)} />
      )}

      {currentStage === STAGES.ENDING_COMIC && (
        <EndingContent onComplete={() => handleStageComplete(STAGES.CREDITS)} />
      )}

      {currentStage === STAGES.CREDITS && (
        <Credits onComplete={() => handleStageComplete(STAGES.INTRO_COMIC)} />
      )}

      {isIn3DSpace && (
        <>
          {/* Chapter 1 전용 인터랙션 */}
          {currentStage === STAGES.CHAPTER_1_DIALOGUE && showChapter1Interaction && (
            <Chapter1InteractionOverlay 
              onComplete={() => handleStageComplete(STAGES.CHAPTER_1_VIDEO)}
            />
          )}
          
          {/* 챕터 대사 UI - Chapter 2와 3만 */}
          {currentStage === STAGES.CHAPTER_2_DIALOGUE && (
            <ChapterDialogueOverlay 
              chapterNumber={2}
              onComplete={() => handleStageComplete(STAGES.CHAPTER_2_VIDEO)}
            />
          )}
          
          {currentStage === STAGES.CHAPTER_3_DIALOGUE && (
            <ChapterDialogueOverlay 
              chapterNumber={3}
              onComplete={() => handleStageComplete(STAGES.CHAPTER_3_VIDEO)}
            />
          )}

          {/* 이미지 슬라이드쇼 - 각 챕터별로 */}
          {currentStage === STAGES.CHAPTER_1_VIDEO && (
            <ImageSlideshow 
              images={chapterImages[1]}
              onComplete={() => handleStageComplete(STAGES.CHAPTER_2_DIALOGUE)}
            />
          )}

          {currentStage === STAGES.CHAPTER_2_VIDEO && (
            <ImageSlideshow 
              images={chapterImages[2]}
              onComplete={() => handleStageComplete(STAGES.CHAPTER_3_DIALOGUE)}
            />
          )}

          {currentStage === STAGES.CHAPTER_3_VIDEO && (
            <ImageSlideshow 
              images={chapterImages[3]}
              onComplete={() => handleStageComplete(STAGES.NAME_CHOICE)}
            />
          )}

          {/* 이름 선택 - Canvas 밖에서 렌더링 */}
          {currentStage === STAGES.NAME_CHOICE && (
            <NameChoiceOverlay 
              onChoice={(choice) => {
                if (choice === 'japanese') {
                  handleStageComplete(STAGES.RETRY_DIALOGUE)
                } else {
                  handleStageComplete(STAGES.ENDING_COMIC)
                }
              }}
            />
          )}

          {/* Retry 대사 - 일본어 선택 시 */}
          {currentStage === STAGES.RETRY_DIALOGUE && (
            <RetryDialogueOverlay 
              onComplete={() => handleStageComplete(STAGES.NAME_CHOICE)}
            />
          )}

          <Canvas
            style={{
              backgroundImage: 'url(/images/bg_02.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            camera={{ position: [0, 20, 50], fov: 65 }}
            shadows
            gl={{ 
              antialias: true, 
              powerPreference: "high-performance"
            }}
            onClick={() => setSelectedObject(null)}
          >
            <Suspense fallback={null}>
              <Selection>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.8} color="#0066ff" />
                <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

                <Environment preset="night" />
                
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
                  <planeGeometry args={[30, 30]} />
                  <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
                </mesh>

                <SceneModels 
                  selectedObject={selectedObject} 
                  setSelectedObject={setSelectedObject}
                  showStandingIcon={currentStage === STAGES.CHAPTER_1_DIALOGUE && !showChapter1Interaction}
                  onStandingIconClick={handleStandingIconClick}
                />

                <EffectComposer>
                  <Outline
                    blur={false}
                    visibleEdgeColor={0x00ffff}
                    hiddenEdgeColor={0xff00ff}
                    edgeStrength={5}
                    width={1024}
                    height={1024}
                  />
                </EffectComposer>
              </Selection>

              {!currentStage.includes('VIDEO') && currentStage !== STAGES.NAME_CHOICE && (
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  dampingFactor={0.02}
                  enableDamping                 
                  maxDistance={220}
                  minDistance={5}
                  maxPolarAngle={Math.PI}
                  minPolarAngle={0}
                  target={[0, 10, 0]}
                />
              )}
            </Suspense>
          </Canvas>
        </>
      )}
    </div>
  )
}

export default App
