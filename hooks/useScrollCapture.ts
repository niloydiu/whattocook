import { useEffect, useRef, useState, useCallback } from "react";

interface ScrollCaptureOptions {
  enabled?: boolean;
  allowPageScrollAtBounds?: boolean;
}

export function useScrollCapture(options: ScrollCaptureOptions = {}) {
  const { enabled = true, allowPageScrollAtBounds = true } = options;
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleWheel = (e: WheelEvent) => {
      if (!isHovering || !containerRef.current) return;

      const container = containerRef.current;
      const isAtTop = container.scrollTop === 0;
      const isAtBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 1;

      // If at bounds and allowPageScrollAtBounds is true, allow page scroll
      if (allowPageScrollAtBounds) {
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          return; // Allow default page scroll
        }
      }

      // Otherwise, capture the scroll for this container
      e.preventDefault();
      e.stopPropagation();
      container.scrollTop += e.deltaY;
    };

    if (isHovering) {
      // Use capture phase to intercept events before they reach other handlers
      document.addEventListener("wheel", handleWheel, {
        passive: false,
        capture: true,
      });
    }

    return () => {
      document.removeEventListener("wheel", handleWheel, true);
    };
  }, [isHovering, enabled, allowPageScrollAtBounds]);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  return {
    containerRef,
    isHovering,
    scrollProps: {
      ref: containerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
