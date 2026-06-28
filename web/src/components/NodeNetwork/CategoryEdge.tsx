"use client";

import { Line } from "@react-three/drei";
import { getCategoryColor, GOLDEN_COLOR, type Vec3 } from "@/lib/graphLayout";

interface CategoryEdgeProps {
  start: Vec3;
  end: Vec3;
  opacity: number;
  isGoldenThread: boolean;
  activeCategory: string;
  isDarkTheme: boolean;
}

export default function CategoryEdge({
  start,
  end,
  opacity,
  isGoldenThread,
  activeCategory,
  isDarkTheme,
}: CategoryEdgeProps) {
  const themeColor = isDarkTheme ? "#4A4A4A" : "#F0F0F0";

  let color: string;
  if (activeCategory === "all") {
    color = themeColor;
  } else if (activeCategory === "featured") {
    color = GOLDEN_COLOR;
  } else {
    color = getCategoryColor(activeCategory);
  }

  const lineWidth = isGoldenThread ? 2 : 1.5;

  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthWrite={false}
      renderOrder={-1}
    />
  );
}
