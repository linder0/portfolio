/**
 * Generate spherical layout for 3D node network
 * Nodes are evenly distributed on a sphere surface using Fibonacci sphere algorithm
 * Nodes are still connected by category
 */
export function calculateSphericalLayout(projects, radius = 4) {
  const n = projects.length
  const nodes = []
  const edges = []

  // Golden angle in radians
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  // Distribute all nodes evenly on sphere surface using Fibonacci sphere
  projects.forEach((project, index) => {
    // Y goes from 1 to -1 (top to bottom of sphere)
    const y = 1 - (index / (n - 1)) * 2

    // Radius at this y level
    const radiusAtY = Math.sqrt(1 - y * y)

    // Golden angle increment
    const theta = goldenAngle * index

    // Convert to Cartesian coordinates
    const x = Math.cos(theta) * radiusAtY * radius
    const z = Math.sin(theta) * radiusAtY * radius
    const yPos = y * radius

    nodes.push({
      id: project.id,
      position: [x, yPos, z],
      category: project.category,
      featured: project.featured,
    })
  })

  // Create edges between nodes of the same category
  // Handle both string and array categories
  const categoryGroups = {}
  projects.forEach((project, index) => {
    const categories = Array.isArray(project.category) ? project.category : [project.category]
    categories.forEach(cat => {
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = []
      }
      categoryGroups[cat].push(index)
    })
  })

  Object.entries(categoryGroups).forEach(([category, indices]) => {
    // Connect each node to the next in the category
    for (let i = 0; i < indices.length - 1; i++) {
      const sourceNode = nodes[indices[i]]
      const targetNode = nodes[indices[i + 1]]
      edges.push({
        source: sourceNode.position,
        target: targetNode.position,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        category,
        isGoldenThread: false,
      })
    }

    // Close the loop if more than 2 nodes
    if (indices.length > 2) {
      const sourceNode = nodes[indices[indices.length - 1]]
      const targetNode = nodes[indices[0]]
      edges.push({
        source: sourceNode.position,
        target: targetNode.position,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        category,
        isGoldenThread: false,
      })
    }
  })

  // Create golden threads connecting ALL featured projects to each other
  // Use the first project's category for the line color
  const featuredNodes = nodes.filter(node => node.featured)
  for (let i = 0; i < featuredNodes.length; i++) {
    for (let j = i + 1; j < featuredNodes.length; j++) {
      // Use source node's category for line color
      const sourceCategory = featuredNodes[i].category
      edges.push({
        source: featuredNodes[i].position,
        target: featuredNodes[j].position,
        sourceId: featuredNodes[i].id,
        targetId: featuredNodes[j].id,
        category: sourceCategory,
        isGoldenThread: true,
      })
    }
  }

  return { nodes, edges }
}

/**
 * Design tokens for the gallery
 */

// Category colors (only used categories)
export const categoryColors = {
  research: '#10B981', // Emerald
  design: '#EC4899',   // Pink
  software: '#3B82F6', // Blue
  hardware: '#F97316', // Orange
}

// Special colors
export const GOLDEN_COLOR = '#D4AF37'  // Gold for featured items

// Node sizes for 3D network
export const NODE_SIZES = {
  featured: 0.7,
  regular: 0.4,
}

export function getCategoryColor(category) {
  // Handle array categories - use first one for color
  const cat = Array.isArray(category) ? category[0] : category
  return categoryColors[cat] || '#6B7280'
}

/**
 * Check if a project matches the active category filter
 * Supports both string and array categories
 */
export function matchesCategoryFilter(project, activeCategory) {
  if (activeCategory === 'all') return true
  if (activeCategory === 'featured') return project.featured

  // Handle array or string category
  if (Array.isArray(project.category)) {
    return project.category.includes(activeCategory)
  }
  return project.category === activeCategory
}
