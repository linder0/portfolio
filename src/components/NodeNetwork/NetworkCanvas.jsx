import { useState, useMemo, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Line, Billboard, useTexture } from '@react-three/drei'
import { AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import FocusPanel from './FocusPanel'
import { usePanelState } from '../../context/PanelContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import {
  calculateSphericalLayout,
  getCategoryColor,
  GOLDEN_COLOR,
  NODE_SIZES,
  matchesCategoryFilter,
  edgeMatchesCategoryFilter
} from '../../utils/graphLayout'

// Get the image URL from project media
function getImageUrl(project) {
  if (!project.media) return null
  if (project.media.type === 'image') return project.media.url
  if (project.media.thumbnail) return project.media.thumbnail
  return null
}

// Individual project node as glass bubble
function ProjectNode({ project, position, onClick, isFiltered, isFocused, isHovered, isDimmed, onHover, hideLabelOnMobile }) {
  const groupRef = useRef()
  const imageUrl = getImageUrl(project)

  // Featured projects are significantly larger
  const size = project.featured ? NODE_SIZES.featured : NODE_SIZES.regular
  const color = getCategoryColor(project.category)

  // Opacity logic (priority order):
  // 1. Filtered out by category → very dim
  // 2. Another node is focused (dimmed) → semi-dim
  // 3. Normal → full opacity
  const opacity = isFiltered ? 0.1 : isDimmed ? 0.3 : 1

  // Animate scale on hover/focus
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isFocused ? 1.3 : (isHovered ? 1.15 : 1)
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  return (
    <group position={position} ref={groupRef}>
      {/* Flat image - always faces camera, fills entire bubble */}
      <Billboard>
        <mesh
          onClick={(e) => {
            e.stopPropagation()
            if (!isFiltered) onClick()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = isFiltered ? 'default' : 'pointer'
            if (!isFiltered) onHover(true)
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default'
            onHover(false)
          }}
        >
          <circleGeometry args={[size, 64]} />
          {imageUrl ? (
            <Suspense fallback={<meshBasicMaterial color={color} transparent opacity={opacity} />}>
              <FlatImageMaterial url={imageUrl} opacity={opacity} />
            </Suspense>
          ) : (
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          )}
        </mesh>
      </Billboard>

      {/* Vignette effect - darkens edges */}
      <VignetteOverlay size={size} opacity={opacity} />

      {/* Glass bubble overlay - PNG overlay for 3D effect (optional) */}
      <GlassBubbleOverlay size={size} opacity={opacity} />

      {/* Colored rim/border */}
      <Billboard>
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[size * 0.99, size * 1.01, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * ((isHovered || isFocused) ? 0.7 : 0.3)}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      {/* Label on hover - hidden on mobile when panel is open */}
      {(isHovered || isFocused) && !isFiltered && !hideLabelOnMobile && (
        <Html
          position={[0, -size - 0.4, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="label bg-inverse text-inverse px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5"
            style={{ fontSize: '10px' }}
          >
            {project.featured && <span>★</span>}
            {project.title}
          </div>
        </Html>
      )}
    </group>
  )
}

// Flat image material for billboard
function FlatImageMaterial({ url, opacity }) {
  const texture = useTexture(url)

  return (
    <meshBasicMaterial
      map={texture}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  )
}

// Vignette overlay - radial gradient darkening at edges
function VignetteOverlay({ size, opacity }) {
  const vignetteTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    // Create radial gradient: transparent center → subtle gray edges
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(100, 100, 100, 0)')
    gradient.addColorStop(0.6, 'rgba(100, 100, 100, 0)')
    gradient.addColorStop(0.8, 'rgba(80, 80, 80, 0.1)')
    gradient.addColorStop(0.92, 'rgba(70, 70, 70, 0.25)')
    gradient.addColorStop(1, 'rgba(60, 60, 60, 0.4)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  return (
    <Billboard>
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial
          map={vignetteTexture}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  )
}

// Glass bubble overlay - uses PNG texture
function GlassBubbleOverlay({ size, opacity }) {
  return (
    <Billboard>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[size * 2.4, size * 2.3]} />
        <Suspense fallback={<meshBasicMaterial transparent opacity={0} />}>
          <GlassOverlayMaterial opacity={opacity} />
        </Suspense>
      </mesh>
    </Billboard>
  )
}

// Glass overlay texture loader
function GlassOverlayMaterial({ opacity }) {
  const texture = useTexture('/textures/glass-bubble-overlay.png')

  return (
    <meshBasicMaterial
      map={texture}
      transparent
      opacity={opacity * 0.8}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  )
}

// 3D line connecting nodes
function CategoryEdge({ start, end, category, opacity, isGoldenThread }) {
  // Golden threads get special gold color, others use category color
  const color = isGoldenThread ? GOLDEN_COLOR : getCategoryColor(category)
  const lineWidth = isGoldenThread ? 2 : 1.5

  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  )
}

// Camera controller to animate focus on nodes
function CameraController({ focusedNode, focusedProject }) {
  const controlsRef = useRef()
  const { camera } = useThree()
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 14))
  const shouldAnimateCamera = useRef(false)

  // When focused node changes, calculate the target camera position
  useEffect(() => {
    if (focusedNode) {
      // Calculate camera position: along the line from center through the node, but further out
      const nodeVec = new THREE.Vector3(...focusedNode)
      const direction = nodeVec.clone().normalize()

      // Get the "right" vector relative to this direction (for offsetting the view)
      const up = new THREE.Vector3(0, 1, 0)
      const right = new THREE.Vector3().crossVectors(up, direction).normalize()

      // If the direction is nearly parallel to up, use a different reference
      if (right.length() < 0.1) {
        right.set(1, 0, 0)
      }

      // Position camera: in the direction of the node, offset to the right to center the orb
      // The offset shifts the camera right, which shifts the orb left in view
      // Panel takes ~1/3 of screen, so we need to shift orb to center of remaining 2/3
      const cameraDirection = direction.clone().multiplyScalar(12)
      const rightOffset = right.multiplyScalar(3) // Positive moves camera right, shifts orb left in view
      targetCameraPos.current = cameraDirection.add(rightOffset)

      shouldAnimateCamera.current = true
    } else {
      // When unfocusing, zoom out slightly while keeping the same viewing angle
      const pullBackDirection = camera.position.clone().normalize()
      targetCameraPos.current = pullBackDirection.multiplyScalar(14)
      shouldAnimateCamera.current = true
    }
  }, [focusedNode, camera])

  useFrame(() => {
    if (controlsRef.current && shouldAnimateCamera.current) {
      // Smoothly move camera to target position
      camera.position.lerp(targetCameraPos.current, 0.05)

      // Always look at center
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05)
      controlsRef.current.update()

      // Stop animating once close enough to target
      const distance = camera.position.distanceTo(targetCameraPos.current)
      if (distance < 0.1) {
        shouldAnimateCamera.current = false
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      zoomSpeed={0.5}
      rotateSpeed={0.5}
      minDistance={6}
      maxDistance={18}
      autoRotate={!focusedProject}
      autoRotateSpeed={0.2}
    />
  )
}

// Scene content
function Scene({ projects, nodes, edges, activeCategory, focusedProject, setFocusedProject, focusedNode, setFocusedNode, isMobile }) {
  const [hoveredProject, setHoveredProject] = useState(null)

  const handleNodeClick = (project, position) => {
    if (focusedProject?.id === project.id) {
      setFocusedProject(null)
      setFocusedNode(null)
    } else {
      setFocusedProject(project)
      setFocusedNode(position)
    }
  }

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Orbit controls with camera animation */}
      <CameraController focusedNode={focusedNode} focusedProject={focusedProject} />

      {/* Edges */}
      {edges.map((edge, index) => {
        // Hide edges that don't match filter
        if (!edgeMatchesCategoryFilter(edge, activeCategory)) return null

        // Opacity: dimmer when something is focused, brighter for golden threads
        const baseOpacity = edge.isGoldenThread ? 0.6 : 0.4
        const edgeOpacity = focusedProject ? baseOpacity * 0.3 : baseOpacity

        return (
          <CategoryEdge
            key={index}
            start={edge.source}
            end={edge.target}
            category={edge.category}
            opacity={edgeOpacity}
            isGoldenThread={edge.isGoldenThread}
          />
        )
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const project = projects.find(p => p.id === node.id)
        if (!project) return null

        // Node visibility: isFiltered (doesn't match filter), isDimmed (other focused), isFocused
        const isFiltered = !matchesCategoryFilter(project, activeCategory)
        const isFocused = focusedProject?.id === node.id
        const isDimmed = focusedProject && !isFocused
        const isHovered = hoveredProject === node.id

        return (
          <ProjectNode
            key={node.id}
            project={project}
            position={node.position}
            onClick={() => handleNodeClick(project, node.position)}
            isFiltered={isFiltered}
            isFocused={isFocused}
            isDimmed={isDimmed}
            isHovered={isHovered}
            onHover={(hovered) => setHoveredProject(hovered ? node.id : null)}
            hideLabelOnMobile={isMobile && !!focusedProject}
          />
        )
      })}
    </>
  )
}

// Hook to calculate camera distance based on viewport size
function useResponsiveCameraZ() {
  const [cameraZ, setCameraZ] = useState(() => {
    if (typeof window !== 'undefined') {
      // Use the smaller dimension to ensure the graph fits
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      // Reference: 800px = z of 14 (base desktop), scale proportionally
      // Smaller screens get closer camera (smaller z)
      const baseZ = 14
      const referenceSize = 800
      return Math.max(8, Math.min(16, (minDimension / referenceSize) * baseZ))
    }
    return 14
  })

  useEffect(() => {
    const updateCameraZ = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight)
      const baseZ = 14
      const referenceSize = 800
      setCameraZ(Math.max(8, Math.min(16, (minDimension / referenceSize) * baseZ)))
    }
    window.addEventListener('resize', updateCameraZ)
    return () => window.removeEventListener('resize', updateCameraZ)
  }, [])

  return cameraZ
}

export default function NetworkCanvas({ projects, activeCategory = 'all', initialFocusId = null }) {
  const [focusedProject, setFocusedProject] = useState(null)
  const [focusedNode, setFocusedNode] = useState(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const { setIsPanelOpen } = usePanelState()
  const isMobile = useIsMobile()

  // Camera distance: scales with viewport size
  const cameraZ = useResponsiveCameraZ()

  // Sync panel open state with context
  useEffect(() => {
    setIsPanelOpen(!!focusedProject)
  }, [focusedProject, setIsPanelOpen])

  // Reset panel state on unmount (e.g., navigating away)
  useEffect(() => {
    return () => setIsPanelOpen(false)
  }, [setIsPanelOpen])

  // Clear focus when category filter changes and focused project doesn't match
  useEffect(() => {
    if (focusedProject && !matchesCategoryFilter(focusedProject, activeCategory)) {
      setFocusedProject(null)
      setFocusedNode(null)
    }
  }, [activeCategory, focusedProject])

  // Calculate spherical layout
  const { nodes, edges } = useMemo(() => {
    return calculateSphericalLayout(projects, 4)
  }, [projects])

  // Auto-focus on initial project from URL (once)
  useEffect(() => {
    if (initialFocusId && !hasInitialized && nodes.length > 0) {
      // Parse ID as number since URL params are strings but project IDs are numbers
      const numericId = parseInt(initialFocusId, 10)
      const project = projects.find(p => p.id === numericId)
      const node = nodes.find(n => n.id === numericId)
      if (project && node) {
        setFocusedProject(project)
        setFocusedNode(node.position)
      }
      setHasInitialized(true)
    }
  }, [initialFocusId, projects, nodes, hasInitialized])

  const handleClearFocus = () => {
    setFocusedProject(null)
    setFocusedNode(null)
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        style={{ background: 'var(--bg)' }}
        raycaster={{ params: { Line: { threshold: 0.1 } } }}
        onPointerMissed={handleClearFocus}
      >
        <Scene
          projects={projects}
          nodes={nodes}
          edges={edges}
          activeCategory={activeCategory}
          focusedProject={focusedProject}
          setFocusedProject={setFocusedProject}
          focusedNode={focusedNode}
          setFocusedNode={setFocusedNode}
          isMobile={isMobile}
        />
      </Canvas>

      {/* Focus panel overlay */}
      <AnimatePresence>
        {focusedProject && (
          <FocusPanel
            project={focusedProject}
            onClose={handleClearFocus}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
