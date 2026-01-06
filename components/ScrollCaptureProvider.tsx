"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";

interface ScrollArea {
  id: string;
  element: HTMLElement;
  priority: number;
}

interface ScrollCaptureContextType {
  registerScrollArea: (
    id: string,
    element: HTMLElement,
    priority?: number
  ) => void;
  unregisterScrollArea: (id: string) => void;
  activeScrollArea: string | null;
}

const ScrollCaptureContext = createContext<ScrollCaptureContextType | null>(
  null
);

export function useScrollCaptureContext() {
  const context = useContext(ScrollCaptureContext);
  if (!context) {
    throw new Error(
      "useScrollCaptureContext must be used within a ScrollCaptureProvider"
    );
  }
  return context;
}

interface ScrollCaptureProviderProps {
  children: ReactNode;
}

export function ScrollCaptureProvider({
  children,
}: ScrollCaptureProviderProps) {
  const [scrollAreas, setScrollAreas] = useState<Map<string, ScrollArea>>(
    new Map()
  );
  const [activeScrollArea, setActiveScrollArea] = useState<string | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle wheel events with intelligent targeting
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Find the scroll area under the mouse cursor
      let targetArea: ScrollArea | null = null;
      let highestPriority = -1;

      for (const area of scrollAreas.values()) {
        const rect = area.element.getBoundingClientRect();
        if (
          mousePositionRef.current.x >= rect.left &&
          mousePositionRef.current.x <= rect.right &&
          mousePositionRef.current.y >= rect.top &&
          mousePositionRef.current.y <= rect.bottom
        ) {
          if (area.priority > highestPriority) {
            targetArea = area;
            highestPriority = area.priority;
          }
        }
      }

      if (targetArea) {
        const container = targetArea.element;
        const isAtTop = container.scrollTop === 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        // If at bounds, allow page scroll to continue
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          setActiveScrollArea(null);
          return;
        }

        // Otherwise, capture scroll for this area
        e.preventDefault();
        e.stopPropagation();
        container.scrollTop += e.deltaY;
        setActiveScrollArea(targetArea.id);
      } else {
        setActiveScrollArea(null);
      }
    };

    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    return () => document.removeEventListener("wheel", handleWheel, true);
  }, [scrollAreas]);

  const registerScrollArea = (
    id: string,
    element: HTMLElement,
    priority = 0
  ) => {
    setScrollAreas((prev) => new Map(prev.set(id, { id, element, priority })));
  };

  const unregisterScrollArea = (id: string) => {
    setScrollAreas((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    if (activeScrollArea === id) {
      setActiveScrollArea(null);
    }
  };

  return (
    <ScrollCaptureContext.Provider
      value={{
        registerScrollArea,
        unregisterScrollArea,
        activeScrollArea,
      }}
    >
      {children}
    </ScrollCaptureContext.Provider>
  );
}

// Hook for components to register as scroll areas
export function useGlobalScrollCapture(id: string, priority = 0) {
  const context = useScrollCaptureContext();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current && context) {
      context.registerScrollArea(id, elementRef.current, priority);
      return () => context.unregisterScrollArea(id);
    }
  }, [id, priority, context]);

  return elementRef;
}
