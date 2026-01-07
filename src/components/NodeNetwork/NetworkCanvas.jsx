import { useState, useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import FocusPanel from './FocusPanel'
import ProjectNode from './ProjectNode'
import CategoryEdge from './CategoryEdge'
import { usePanelState } from '../../context/PanelContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { useTheme } from '../../hooks/useTheme'
import { calculateSphericalLayout, matchesCategoryFilter } from '../../utils/graphLayout'

// Camera controller to animate focus on nodes
function CameraController({ focusedNode, focusedProject }) {
  const controlsRef = useRef()
  const { camera } = useThree()
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 14))
  const shouldAnimateCamera = useRef(false)
  const isUserInteractingRef = useRef(false)
  const interactionTimeout = useRef(null)

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

  // Handle user interaction - pause auto-rotate and camera animation during interaction
  const handleInteractionStart = () => {
    isUserInteractingRef.current = true
    // Only stop camera animation when NOT focused on a project
    // When focused, let the camera animation complete for proper positioning
    if (!focusedProject) {
      shouldAnimateCamera.current = false
    }
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current)
    }
  }

  const handleInteractionEnd = () => {
    // Resume auto-rotate after a delay
    interactionTimeout.current = setTimeout(() => {
      isUserInteractingRef.current = false
    }, 3000) // 3 second delay before resuming auto-rotate
  }

  useFrame(() => {
    if (!controlsRef.current) return

    if (shouldAnimateCamera.current) {
      // Smoothly move camera to target position
      camera.position.lerp(targetCameraPos.current, 0.05)

      // Always look at center
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05)

      // Stop animating once close enough to target
      const distance = camera.position.distanceTo(targetCameraPos.current)
      if (distance < 0.1) {
        shouldAnimateCamera.current = false
      }
    }

    // Always apply slow rotation when not focused and not interacting
    if (!focusedProject && !isUserInteractingRef.current && !shouldAnimateCamera.current) {
      const angle = 0.001 // Very slow rotation
      const x = camera.position.x
      const z = camera.position.z
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle)
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle)
    }

    controlsRef.current.update()
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
      autoRotate={false}
      autoRotateSpeed={0.2}
      onStart={handleInteractionStart}
      onEnd={handleInteractionEnd}
    />
  )
}

// Scene content
function Scene({ projects, nodes, edges, activeCategory, focusedProject, setFocusedProject, focusedNode, setFocusedNode, isMobile, isDarkTheme }) {
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
        // For proper filtering, check if BOTH connected projects match the filter
        const sourceProject = projects.find(p => p.id === edge.sourceId)
        const targetProject = projects.find(p => p.id === edge.targetId)

        if (!sourceProject || !targetProject) return null

        // Both endpoints must match the category filter
        const sourceMatches = matchesCategoryFilter(sourceProject, activeCategory)
        const targetMatches = matchesCategoryFilter(targetProject, activeCategory)

        if (!sourceMatches || !targetMatches) return null

        // Opacity: dimmer when something is focused, brighter for golden threads
        const baseOpacity = edge.isGoldenThread ? 0.6 : 0.4
        const edgeOpacity = focusedProject ? baseOpacity * 0.3 : baseOpacity

        return (
          <CategoryEdge
            key={`${index}-${isDarkTheme}`}
            start={edge.source}
            end={edge.target}
            opacity={edgeOpacity}
            isGoldenThread={edge.isGoldenThread}
            activeCategory={activeCategory}
            isDarkTheme={isDarkTheme}
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

// Helper to get thumbnail URL from project
function getThumbnailUrl(project) {
  if (!project.media) return null
  if (project.media.type === 'image') return project.media.url
  if (project.media.thumbnail) return project.media.thumbnail
  return null
}

// Preload all project thumbnails
function preloadThumbnails(projects) {
  const urls = projects.map(getThumbnailUrl).filter(Boolean)
  return Promise.all(
    urls.map(url => new Promise((resolve) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = resolve // Don't block on failed loads
      img.src = url
    }))
  )
}

export default function NetworkCanvas({ projects, activeCategory = 'all', initialFocusId = null, onReady }) {
  const [focusedProject, setFocusedProject] = useState(null)
  const [focusedNode, setFocusedNode] = useState(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Preload thumbnails then signal ready
  useEffect(() => {
    preloadThumbnails(projects).then(() => {
      // Small delay to ensure Three.js has rendered
      setTimeout(() => onReady?.(), 200)
    })
  }, [projects, onReady])
  const { setIsPanelOpen } = usePanelState()
  const isMobile = useIsMobile()
  const { theme } = useTheme()

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
        key={theme}
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        style={{ background: 'var(--bg)', transition: 'background var(--transition-theme)' }}
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
          isDarkTheme={theme === 'dark'}
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
