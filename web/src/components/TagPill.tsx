import type { ReactNode } from "react";

interface TagPillProps {
  children: ReactNode;
  variant?: "default" | "badge";
  className?: string;
}

export default function TagPill({
  children,
  variant = "default",
  className = "",
}: TagPillProps) {
  const baseClasses =
    "label px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider";

  const variantClasses: Record<string, string> = {
    default: "bg-theme/30 opacity-70",
    badge: "border border-current opacity-60",
  };

  return (
    <span
      className={`${baseClasses} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
