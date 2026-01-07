import { Line } from '@react-three/drei'
import { getCategoryColor, GOLDEN_COLOR } from '../../utils/graphLayout'

/**
 * CategoryEdge - 3D line connecting nodes in the network
 *
 * Color behavior:
 * - "all" filter: Subtle theme-aware gray
 * - "featured" filter: Gold
 * - Category filter: That category's color
 */

export default function CategoryEdge({
  start,
  end,
  opacity,
  isGoldenThread,
  activeCategory,
  isDarkTheme
}) {
  const themeColor = isDarkTheme ? '#4A4A4A' : '#F0F0F0'

  let color
  if (activeCategory === 'all') {
    color = themeColor
  } else if (activeCategory === 'featured') {
    color = GOLDEN_COLOR
  } else {
    color = getCategoryColor(activeCategory)
  }

  const lineWidth = isGoldenThread ? 2 : 1.5

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
  )
}
