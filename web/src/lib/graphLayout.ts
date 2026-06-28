import type { Project } from "@/data/projects";

export type Vec3 = [number, number, number];

export interface GraphNode {
  id: number;
  position: Vec3;
  category: string | string[];
  featured?: boolean;
}

export interface GraphEdge {
  source: Vec3;
  target: Vec3;
  sourceId: number;
  targetId: number;
  category: string | string[];
  isGoldenThread: boolean;
}

/**
 * Generate spherical layout for 3D node network.
 * Nodes are evenly distributed on a sphere surface using the Fibonacci sphere
 * algorithm, and connected by category.
 */
export function calculateSphericalLayout(
  projects: Project[],
  radius = 4,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const n = projects.length;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Golden angle in radians
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  projects.forEach((project, index) => {
    // Y goes from 1 to -1 (top to bottom of sphere)
    const y = 1 - (index / (n - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;

    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;
    const yPos = y * radius;

    nodes.push({
      id: project.id,
      position: [x, yPos, z],
      category: project.category,
      featured: project.featured,
    });
  });

  // Create edges between nodes of the same category
  const categoryGroups: Record<string, number[]> = {};
  projects.forEach((project, index) => {
    const cats = Array.isArray(project.category)
      ? project.category
      : [project.category];
    cats.forEach((cat) => {
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(index);
    });
  });

  Object.entries(categoryGroups).forEach(([category, indices]) => {
    for (let i = 0; i < indices.length - 1; i++) {
      const sourceNode = nodes[indices[i]];
      const targetNode = nodes[indices[i + 1]];
      edges.push({
        source: sourceNode.position,
        target: targetNode.position,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        category,
        isGoldenThread: false,
      });
    }

    // Close the loop if more than 2 nodes
    if (indices.length > 2) {
      const sourceNode = nodes[indices[indices.length - 1]];
      const targetNode = nodes[indices[0]];
      edges.push({
        source: sourceNode.position,
        target: targetNode.position,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        category,
        isGoldenThread: false,
      });
    }
  });

  // Golden threads connecting ALL featured projects to each other
  const featuredNodes = nodes.filter((node) => node.featured);
  for (let i = 0; i < featuredNodes.length; i++) {
    for (let j = i + 1; j < featuredNodes.length; j++) {
      edges.push({
        source: featuredNodes[i].position,
        target: featuredNodes[j].position,
        sourceId: featuredNodes[i].id,
        targetId: featuredNodes[j].id,
        category: featuredNodes[i].category,
        isGoldenThread: true,
      });
    }
  }

  return { nodes, edges };
}

// Category colors (only used categories)
export const categoryColors: Record<string, string> = {
  research: "#10B981", // Emerald
  design: "#EC4899", // Pink
  software: "#3B82F6", // Blue
  hardware: "#F97316", // Orange
};

// Special colors
export const GOLDEN_COLOR = "#D4AF37"; // Gold for featured items

// Node sizes for 3D network
export const NODE_SIZES = {
  featured: 0.7,
  regular: 0.4,
};

export function getCategoryColor(category: string | string[]): string {
  const cat = Array.isArray(category) ? category[0] : category;
  return categoryColors[cat] || "#6B7280";
}

/**
 * Check if a project matches the active category filter.
 * Supports both string and array categories.
 */
export function matchesCategoryFilter(
  project: Project,
  activeCategory: string,
): boolean {
  if (activeCategory === "all") return true;
  if (activeCategory === "featured") return !!project.featured;

  if (Array.isArray(project.category)) {
    return project.category.includes(activeCategory);
  }
  return project.category === activeCategory;
}
