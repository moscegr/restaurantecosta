import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedor horizontal optimizado para Mouse (rueda vertical -> scroll horizontal + flechas),
 * Tablet y Smartphone (swipe táctil nativo).
 */
export const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  children,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    window.addEventListener('resize', checkScroll);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, children]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const scrollByAmount = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center group">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-240)}
          className="hidden sm:flex absolute left-0 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-slate-300 shadow-md text-slate-700 hover:bg-[#0B3954] hover:text-white touch-press"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        className={`flex items-center overflow-x-auto scroll-smooth pb-1.5 ${className}`}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(240)}
          className="hidden sm:flex absolute right-0 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/95 border border-slate-300 shadow-md text-slate-700 hover:bg-[#0B3954] hover:text-white touch-press"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
