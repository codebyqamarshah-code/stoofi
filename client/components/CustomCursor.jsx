"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on non-touch pointer devices
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    setIsEnabled(true);

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering interactive element
      const target = e.target;
      const interactive = target && (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("select") ||
        target.closest("textarea") ||
        target.closest("[role='button']") ||
        target.closest(".cursor-pointer") ||
        target.closest(".card-premium") ||
        target.closest(".sidebar-item") ||
        target.closest(".sidebar-subitem")
      );
      setIsHovering(!!interactive);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Smooth lerp loop for outer ring
    let animationFrameId;
    const render = () => {
      // Lerp smoothing factor
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isEnabled) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[99999] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Outer Smooth Follower Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform -ml-[18px] -mt-[18px]"
      >
        <div
          className={`w-9 h-9 rounded-full border border-[#009966] transition-all duration-200 ease-out flex items-center justify-center ${
            isHovering
              ? "scale-150 bg-[#009966]/15 border-[#009966] shadow-[0_0_15px_rgba(0,153,102,0.3)]"
              : isClicking
              ? "scale-90 border-[#009966] bg-[#009966]/25"
              : "scale-100 border-[#009966]/70 bg-transparent"
          }`}
        />
      </div>

      {/* Center Precise Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform -ml-[3px] -mt-[3px]"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full bg-[#009966] transition-transform duration-150 ease-out shadow-[0_0_8px_rgba(0,153,102,0.6)] ${
            isHovering ? "scale-75 bg-[#009966]" : isClicking ? "scale-125 bg-emerald-400" : "scale-100"
          }`}
        />
      </div>
    </div>
  );
}
