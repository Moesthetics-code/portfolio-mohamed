import React, { useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const handlePointerDetection = () => {
      const hoveredElement = document.elementFromPoint(position.x, position.y);
      const computedStyle = hoveredElement 
        ? window.getComputedStyle(hoveredElement).cursor 
        : 'default';
      
      setIsPointer(
        computedStyle === 'pointer' || 
        hoveredElement?.tagName === 'A' || 
        hoveredElement?.tagName === 'BUTTON'
      );
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mousemove', handlePointerDetection);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mousemove', handlePointerDetection);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [position.x, position.y]);

  // Only show custom cursor on devices with a mouse
  const [hasPointer, setHasPointer] = useState(false);
  
  useEffect(() => {
    // Check if the device likely has a mouse
    const detectPointer = () => {
      // If a matching media query for hover exists and matches
      setHasPointer(window.matchMedia('(hover: hover)').matches);
    };
    
    detectPointer();
    window.addEventListener('resize', detectPointer);
    
    return () => {
      window.removeEventListener('resize', detectPointer);
    };
  }, []);

  if (!hasPointer) return null;

  return (
    <>
      {/* Main dot cursor */}
      <div 
        className={`fixed w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-400 transition-opacity duration-300 pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 ${
          isHidden ? 'opacity-0' : 'opacity-100'
        } ${isClicking ? 'scale-50' : 'scale-100'}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: 'transform 0.1s ease, width 0.2s ease, height 0.2s ease, background 0.2s ease',
        }}
      />
      
      {/* Outer ring cursor */}
      <div 
        className={`fixed rounded-full pointer-events-none z-[9998] transform -translate-x-1/2 -translate-y-1/2 ${
          isHidden ? 'opacity-0' : 'opacity-100'
        } ${isPointer ? 'w-8 h-8 border-2 border-blue-600 dark:border-blue-400 bg-transparent' : 'w-5 h-5 bg-blue-600/10 dark:bg-blue-400/10'} ${
          isClicking ? 'scale-150' : 'scale-100'
        }`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: 'transform 0.15s ease-out, width 0.3s ease, height 0.3s ease, opacity 0.3s ease, background 0.3s ease',
        }}
      />
    </>
  );
};

export default CustomCursor;