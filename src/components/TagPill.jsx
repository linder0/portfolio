/**
 * TagPill - Reusable tag/label component
 *
 * Variants:
 * - default: Standard muted tag styling
 * - badge: Bordered badge style for filterable items (e.g. tools)
 */

export default function TagPill({
  children,
  variant = 'default',
  className = ''
}) {
  const baseClasses = 'label px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider'

  const variantClasses = {
    default: 'bg-theme/30 opacity-70',
    badge: 'border border-current opacity-60',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  )
}
