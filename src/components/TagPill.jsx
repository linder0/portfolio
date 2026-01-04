/**
 * TagPill - Reusable tag/label component
 *
 * Variants:
 * - featured: More prominent styling for featured badge
 * - default: Standard muted tag styling
 * - badge: Bordered badge style for filterable items
 */

export default function TagPill({
  children,
  variant = 'default',
  className = ''
}) {
  const baseClasses = 'label px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider'

  const variantClasses = {
    featured: 'bg-theme/50',
    default: 'bg-theme/30 opacity-70',
    subtle: 'opacity-50',
    badge: 'border border-current opacity-60',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  )
}
