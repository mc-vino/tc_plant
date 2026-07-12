import type { CSSProperties, ReactNode } from "react";

/**
 * CSS-only reveal: fades/slides content up on first paint.
 * Resting state is fully visible, so it degrades gracefully without JS
 * and collapses to static under prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal${className ? ` ${className}` : ""}`}
      style={{ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
