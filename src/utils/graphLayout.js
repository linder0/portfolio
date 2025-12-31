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
  const categoryGroups = {}
  projects.forEach((project, index) => {
    if (!categoryGroups[project.category]) {
      categoryGroups[project.category] = []
    }
    categoryGroups[project.category].push(index)
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
  const featuredNodes = nodes.filter(node => node.featured)
  for (let i = 0; i < featuredNodes.length; i++) {
    for (let j = i + 1; j < featuredNodes.length; j++) {
      edges.push({
        source: featuredNodes[i].position,
        target: featuredNodes[j].position,
        sourceId: featuredNodes[i].id,
        targetId: featuredNodes[j].id,
        category: 'featured',
        isGoldenThread: true,
      })
    }
  }

  return { nodes, edges }
}

/**
 * Design tokens for the gallery
 */

// Category colors
export const categoryColors = {
  web: '#4F46E5',      // Indigo
  digital: '#EC4899',  // Pink
  music: '#8B5CF6',    // Purple
  video: '#F59E0B',    // Amber
}

// Special colors
export const GOLDEN_COLOR = '#D4AF37'  // Gold for featured items

// Node sizes for 3D network
export const NODE_SIZES = {
  featured: 0.7,
  regular: 0.4,
}

// Ring proportions for hover state
export const RING_SCALE = {
  inner: 1.15,
  outer: 1.35,
}

export function getCategoryColor(category) {
  return categoryColors[category] || '#6B7280'
}
