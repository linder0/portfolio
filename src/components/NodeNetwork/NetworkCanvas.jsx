import { useState, useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Line, Billboard } from '@react-three/drei'
import { AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import FocusPanel from './FocusPanel'
import {
  calculateSphericalLayout,
  getCategoryColor,
  GOLDEN_COLOR,
  NODE_SIZES,
  RING_SCALE
} from '../../utils/graphLayout'

// Individual project node as a 3D sphere
function ProjectNode({ project, position, onClick, isFiltered, isFocused, isHovered, onHover }) {
  const meshRef = useRef()

  // Featured projects are significantly larger
  const size = project.featured ? NODE_SIZES.featured : NODE_SIZES.regular
  const color = getCategoryColor(project.category)
  const opacity = isFiltered ? 0.15 : 1

  // Animate scale on hover/focus
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isFocused ? 1.4 : (isHovered ? 1.2 : 1)
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  return (
    <group position={position}>
      {/* Glow ring on hover/focus - always faces camera */}
      {/* Ring scales proportionally with orb size */}
      {(isHovered || isFocused) && !isFiltered && (
        <Billboard>
          <mesh>
            <ringGeometry args={[size * RING_SCALE.inner, size * RING_SCALE.outer, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isFocused ? 0.8 : 0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Billboard>
      )}

      {/* Main sphere */}
      <mesh
        ref={meshRef}
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
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={project.featured ? 0.2 : 0.4}
          metalness={project.featured ? 0.3 : 0.1}
          emissive={project.featured ? color : '#000000'}
          emissiveIntensity={project.featured && !isFiltered ? 0.15 : 0}
        />
      </mesh>

      {/* Label on hover */}
      {(isHovered || isFocused) && !isFiltered && (
        <Html
          position={[0, -size - 0.3, 0]}
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
      // When unfocusing, keep current orientation but zoom out to default distance
      const currentDirection = camera.position.clone().normalize()
      targetCameraPos.current = currentDirection.multiplyScalar(14)
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
function Scene({ projects, nodes, edges, activeCategory, focusedProject, setFocusedProject, focusedNode, setFocusedNode }) {
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
        // Golden threads are always visible (but dimmed when filtering by other category)
        // Regular edges filtered by category
        let isFiltered = false
        let edgeOpacity = focusedProject ? 0.1 : 0.4

        if (edge.isGoldenThread) {
          // Golden threads: always visible, but dimmed if filtering by non-featured category
          if (activeCategory !== 'all' && activeCategory !== 'featured') {
            edgeOpacity = 0.15
          } else {
            edgeOpacity = focusedProject ? 0.2 : 0.6 // Golden threads are more visible
          }
        } else {
          // Regular category edges
          if (activeCategory === 'featured') {
            isFiltered = true // Hide category edges when filtering by featured
          } else if (activeCategory !== 'all' && edge.category !== activeCategory) {
            isFiltered = true
          }
        }

        if (isFiltered) return null

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

        // Handle 'featured' filter
        const isFiltered = activeCategory === 'featured'
          ? !project.featured
          : activeCategory !== 'all' && node.category !== activeCategory
        const isFocused = focusedProject?.id === node.id
        const isHovered = hoveredProject === node.id

        return (
          <ProjectNode
            key={node.id}
            project={project}
            position={node.position}
            onClick={() => handleNodeClick(project, node.position)}
            isFiltered={isFiltered}
            isFocused={isFocused}
            isHovered={isHovered}
            onHover={(hovered) => setHoveredProject(hovered ? node.id : null)}
          />
        )
      })}
    </>
  )
}

export default function NetworkCanvas({ projects, activeCategory = 'all', initialFocusId = null }) {
  const [focusedProject, setFocusedProject] = useState(null)
  const [focusedNode, setFocusedNode] = useState(null)
  const [hasInitialized, setHasInitialized] = useState(false)

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
        camera={{ position: [0, 0, 14], fov: 50 }}
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
