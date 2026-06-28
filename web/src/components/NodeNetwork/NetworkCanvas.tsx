"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import FocusPanel from "./FocusPanel";
import ProjectNode from "./ProjectNode";
import CategoryEdge from "./CategoryEdge";
import { usePanelState } from "@/lib/panel-context";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useTheme } from "@/lib/theme-context";
import {
  calculateSphericalLayout,
  matchesCategoryFilter,
  type Vec3,
} from "@/lib/graphLayout";
import { getMediaThumbnail } from "@/lib/media";
import type { Project } from "@/data/projects";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Camera controller to animate focus on nodes
function CameraController({
  focusedNode,
  focusedProject,
}: {
  focusedNode: Vec3 | null;
  focusedProject: Project | null;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 14));
  const shouldAnimateCamera = useRef(false);
  const isUserInteractingRef = useRef(false);
  const interactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (focusedNode) {
      const nodeVec = new THREE.Vector3(...focusedNode);
      const direction = nodeVec.clone().normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(up, direction).normalize();

      if (right.length() < 0.1) {
        right.set(1, 0, 0);
      }

      const cameraDirection = direction.clone().multiplyScalar(12);
      const rightOffset = right.multiplyScalar(3);
      targetCameraPos.current = cameraDirection.add(rightOffset);

      shouldAnimateCamera.current = true;
    } else {
      const pullBackDirection = camera.position.clone().normalize();
      targetCameraPos.current = pullBackDirection.multiplyScalar(14);
      shouldAnimateCamera.current = true;
    }
  }, [focusedNode, camera]);

  const handleInteractionStart = () => {
    isUserInteractingRef.current = true;
    if (!focusedProject) {
      shouldAnimateCamera.current = false;
    }
    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }
  };

  const handleInteractionEnd = () => {
    interactionTimeout.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 3000);
  };

  useFrame(() => {
    if (!controlsRef.current) return;

    if (shouldAnimateCamera.current) {
      camera.position.lerp(targetCameraPos.current, 0.05);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);

      const distance = camera.position.distanceTo(targetCameraPos.current);
      if (distance < 0.1) {
        shouldAnimateCamera.current = false;
      }
    }

    if (
      !focusedProject &&
      !isUserInteractingRef.current &&
      !shouldAnimateCamera.current
    ) {
      const angle = 0.001;
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(angle) - z * Math.sin(angle);
      camera.position.z = x * Math.sin(angle) + z * Math.cos(angle);
    }

    controlsRef.current.update();
  });

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
  );
}

interface SceneProps {
  projects: Project[];
  nodes: ReturnType<typeof calculateSphericalLayout>["nodes"];
  edges: ReturnType<typeof calculateSphericalLayout>["edges"];
  activeCategory: string;
  focusedProject: Project | null;
  setFocusedProject: (p: Project | null) => void;
  focusedNode: Vec3 | null;
  setFocusedNode: (n: Vec3 | null) => void;
  isMobile: boolean;
  isDarkTheme: boolean;
}

function Scene({
  projects,
  nodes,
  edges,
  activeCategory,
  focusedProject,
  setFocusedProject,
  focusedNode,
  setFocusedNode,
  isMobile,
  isDarkTheme,
}: SceneProps) {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const projectById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );

  const handleNodeClick = (project: Project, position: Vec3) => {
    if (focusedProject?.id === project.id) {
      setFocusedProject(null);
      setFocusedNode(null);
    } else {
      setFocusedProject(project);
      setFocusedNode(position);
    }
  };

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
        const sourceProject = projectById.get(edge.sourceId);
        const targetProject = projectById.get(edge.targetId);

        if (!sourceProject || !targetProject) return null;

        const sourceMatches = matchesCategoryFilter(
          sourceProject,
          activeCategory,
        );
        const targetMatches = matchesCategoryFilter(
          targetProject,
          activeCategory,
        );

        if (!sourceMatches || !targetMatches) return null;

        const baseOpacity = edge.isGoldenThread ? 0.6 : 0.4;
        const edgeOpacity = focusedProject ? baseOpacity * 0.3 : baseOpacity;

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
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const project = projectById.get(node.id);
        if (!project) return null;

        const isFiltered = !matchesCategoryFilter(project, activeCategory);
        const isFocused = focusedProject?.id === node.id;
        const isDimmed = !!focusedProject && !isFocused;
        const isHovered = hoveredProject === node.id;

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
        );
      })}
    </>
  );
}

// Hook to calculate camera distance based on viewport size
function useResponsiveCameraZ() {
  const [cameraZ, setCameraZ] = useState(() => {
    if (typeof window !== "undefined") {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      const baseZ = 14;
      const referenceSize = 800;
      return Math.max(8, Math.min(16, (minDimension / referenceSize) * baseZ));
    }
    return 14;
  });

  useEffect(() => {
    const updateCameraZ = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      const baseZ = 14;
      const referenceSize = 800;
      setCameraZ(
        Math.max(8, Math.min(16, (minDimension / referenceSize) * baseZ)),
      );
    };
    window.addEventListener("resize", updateCameraZ);
    return () => window.removeEventListener("resize", updateCameraZ);
  }, []);

  return cameraZ;
}

// Preload all project thumbnails
function preloadThumbnails(projects: Project[]) {
  const urls = projects
    .map((p) => getMediaThumbnail(p.media))
    .filter((url): url is string => Boolean(url));
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );
}

interface NetworkCanvasProps {
  projects: Project[];
  activeCategory?: string;
  initialFocusId?: string | null;
  onReady?: () => void;
}

export default function NetworkCanvas({
  projects,
  activeCategory = "all",
  initialFocusId = null,
  onReady,
}: NetworkCanvasProps) {
  const [focusedProject, setFocusedProject] = useState<Project | null>(null);
  const [focusedNode, setFocusedNode] = useState<Vec3 | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    preloadThumbnails(projects).then(() => {
      setTimeout(() => onReady?.(), 200);
    });
  }, [projects, onReady]);

  const { setIsPanelOpen } = usePanelState();
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const cameraZ = useResponsiveCameraZ();

  useEffect(() => {
    setIsPanelOpen(!!focusedProject);
  }, [focusedProject, setIsPanelOpen]);

  useEffect(() => {
    return () => setIsPanelOpen(false);
  }, [setIsPanelOpen]);

  useEffect(() => {
    if (focusedProject && !matchesCategoryFilter(focusedProject, activeCategory)) {
      setFocusedProject(null);
      setFocusedNode(null);
    }
  }, [activeCategory, focusedProject]);

  const { nodes, edges } = useMemo(() => {
    return calculateSphericalLayout(projects, 4);
  }, [projects]);

  useEffect(() => {
    if (initialFocusId && !hasInitialized && nodes.length > 0) {
      const numericId = parseInt(initialFocusId, 10);
      const project = projects.find((p) => p.id === numericId);
      const node = nodes.find((n) => n.id === numericId);
      if (project && node) {
        setFocusedProject(project);
        setFocusedNode(node.position);
      }
      setHasInitialized(true);
    }
  }, [initialFocusId, projects, nodes, hasInitialized]);

  const handleClearFocus = () => {
    setFocusedProject(null);
    setFocusedNode(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        key={theme}
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        style={{
          background: "var(--bg)",
          transition: "background var(--transition-theme)",
        }}
        raycaster={{ params: { Line: { threshold: 0.1 } } as any }}
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
          isDarkTheme={theme === "dark"}
        />
      </Canvas>

      {/* Focus panel overlay */}
      <AnimatePresence>
        {focusedProject && (
          <FocusPanel project={focusedProject} onClose={handleClearFocus} />
        )}
      </AnimatePresence>
    </div>
  );
}
