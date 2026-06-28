"use client";

import { useMemo, useRef, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Project } from "@/data/projects";
import { getCategoryColor, NODE_SIZES, type Vec3 } from "@/lib/graphLayout";
import { getMediaThumbnail } from "@/lib/media";

// Flat image material for billboard
function FlatImageMaterial({ url, opacity }: { url: string; opacity: number }) {
  const texture = useTexture(url);

  useMemo(() => {
    const image = texture.image as { width: number; height: number } | undefined;
    if (image) {
      const imageAspect = image.width / image.height;
      texture.center.set(0.5, 0.5);

      if (imageAspect > 1) {
        texture.repeat.set(1 / imageAspect, 1);
      } else {
        texture.repeat.set(1, imageAspect);
      }
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <meshBasicMaterial
      map={texture}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

// Shared vignette texture - created once and reused across all nodes
let sharedVignetteTexture: THREE.CanvasTexture | null = null;
function getVignetteTexture(): THREE.CanvasTexture {
  if (sharedVignetteTexture) return sharedVignetteTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, "rgba(100, 100, 100, 0)");
  gradient.addColorStop(0.6, "rgba(100, 100, 100, 0)");
  gradient.addColorStop(0.8, "rgba(80, 80, 80, 0.1)");
  gradient.addColorStop(0.92, "rgba(70, 70, 70, 0.25)");
  gradient.addColorStop(1, "rgba(60, 60, 60, 0.4)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  sharedVignetteTexture = new THREE.CanvasTexture(canvas);
  return sharedVignetteTexture;
}

function VignetteOverlay({ size, opacity }: { size: number; opacity: number }) {
  const vignetteTexture = useMemo(() => getVignetteTexture(), []);

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
  );
}

function GlassOverlayMaterial({ opacity }: { opacity: number }) {
  const texture = useTexture("/textures/glass-bubble-overlay.png");

  return (
    <meshBasicMaterial
      map={texture}
      transparent
      opacity={opacity * 0.8}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );
}

function GlassBubbleOverlay({ size, opacity }: { size: number; opacity: number }) {
  return (
    <Billboard>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[size * 2.4, size * 2.3]} />
        <Suspense fallback={<meshBasicMaterial transparent opacity={0} />}>
          <GlassOverlayMaterial opacity={opacity} />
        </Suspense>
      </mesh>
    </Billboard>
  );
}

interface ProjectNodeProps {
  project: Project;
  position: Vec3;
  onClick: () => void;
  isFiltered: boolean;
  isFocused: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: (hovered: boolean) => void;
  hideLabelOnMobile: boolean;
}

export default function ProjectNode({
  project,
  position,
  onClick,
  isFiltered,
  isFocused,
  isHovered,
  isDimmed,
  onHover,
  hideLabelOnMobile,
}: ProjectNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const imageUrl = getMediaThumbnail(project.media);

  const size = project.featured ? NODE_SIZES.featured : NODE_SIZES.regular;
  const color = getCategoryColor(project.category);
  const opacity = isFiltered ? 0.1 : isDimmed ? 0.3 : 1;

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isFocused ? 1.3 : isHovered ? 1.15 : 1;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1,
      );
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Main image circle */}
      <Billboard>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            if (!isFiltered) onClick();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = isFiltered ? "default" : "pointer";
            if (!isFiltered) onHover(true);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
            onHover(false);
          }}
        >
          <circleGeometry args={[size, 64]} />
          {imageUrl ? (
            <Suspense
              fallback={
                <meshBasicMaterial color={color} transparent opacity={opacity} />
              }
            >
              <FlatImageMaterial url={imageUrl} opacity={opacity} />
            </Suspense>
          ) : (
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          )}
        </mesh>
      </Billboard>

      {/* Visual effects */}
      <VignetteOverlay size={size} opacity={opacity} />
      <GlassBubbleOverlay size={size} opacity={opacity} />

      {/* Colored rim */}
      <Billboard>
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[size * 0.99, size * 1.01, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * (isHovered || isFocused ? 0.7 : 0.3)}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>

      {/* Label tooltip */}
      {(isHovered || isFocused) && !isFiltered && !hideLabelOnMobile && (
        <Html
          position={[0, -size - 0.4, 0]}
          center
          style={{ pointerEvents: "none" }}
          zIndexRange={[1000, 0]}
        >
          <div
            className="label bg-inverse text-inverse px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5"
            style={{ fontSize: "10px" }}
          >
            {project.featured && <span>★</span>}
            {project.title}
          </div>
        </Html>
      )}
    </group>
  );
}
