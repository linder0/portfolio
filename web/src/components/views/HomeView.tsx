"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import FeaturedCard from "@/components/FeaturedCard";
import { projects } from "@/data/projects";
import { fadeUp, ease } from "@/lib/motion";
import { useIsDesktop } from "@/hooks/useMediaQuery";

const MediaPipeCanvas = dynamic(
  () => import("@/components/MediaPipeCanvas"),
  { ssr: false },
);

export default function HomeView() {
  const [hasDragged, setHasDragged] = useState(false);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const dragStartRef = useRef({ x: 0, position: 0 });
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isDesktop = useIsDesktop();

  const marqueeProjects = isDesktop ? [...projects, ...projects] : projects;

  // Animate marquee with JavaScript for smooth speed changes (desktop only)
  useEffect(() => {
    if (!isDesktop) return;

    const marquee = marqueeRef.current;
    if (!marquee) return;

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const speed = isHoveredRef.current || isDraggingRef.current ? 0 : 30;
      positionRef.current += (speed * deltaTime) / 1000;

      const halfWidth = marquee.scrollWidth / 2;

      if (positionRef.current >= halfWidth) {
        positionRef.current = positionRef.current - halfWidth;
      }
      if (positionRef.current < 0) {
        positionRef.current = positionRef.current + halfWidth;
      }

      marquee.style.transform = `translateX(-${positionRef.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDesktop]);

  // Non-passive wheel listener to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isDesktop) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      positionRef.current += delta * 0.5;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [isDesktop]);

  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    setHasDragged(false);
    dragStartRef.current = { x: clientX, position: positionRef.current };
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const delta = dragStartRef.current.x - clientX;
    if (Math.abs(delta) > 5) {
      setHasDragged(true);
    }
    positionRef.current = dragStartRef.current.position + delta;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    setTimeout(() => setHasDragged(false), 0);
  };

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => {
    handleDragEnd();
    isHoveredRef.current = false;
  };

  const onTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  return (
    <main className="pb-4 bg-theme lg:h-screen lg:pb-0 lg:flex lg:flex-col lg:overflow-hidden">
      {/* Hero Section - MediaPipe Webcam */}
      <section className="mb-4 lg:mb-0 lg:flex-1 lg:min-h-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease }}
          className="h-full"
        >
          <MediaPipeCanvas className="lg:h-full" />
        </motion.div>
      </section>

      {/* Projects - Stacked on mobile/tablet, Marquee on desktop */}
      <section className="px-4 lg:px-0 lg:flex-shrink-0 lg:py-3 lg:overflow-hidden">
        <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.2, ease }}>
          {/* Mobile/tablet: stacked vertical layout */}
          <div className="flex flex-col gap-4 lg:hidden">
            {projects.map((project, index) => (
              <FeaturedCard key={project.id} project={project} index={index} />
            ))}
          </div>

          {/* Desktop: horizontal marquee with drag support */}
          <div
            ref={containerRef}
            className="hidden lg:flex cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={marqueeRef}
              className="flex gap-3 px-3"
              style={{ pointerEvents: hasDragged ? "none" : "auto" }}
            >
              {marqueeProjects.map((project, index) => (
                <FeaturedCard
                  key={`${project.id}-${index}`}
                  project={project}
                  index={0}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
