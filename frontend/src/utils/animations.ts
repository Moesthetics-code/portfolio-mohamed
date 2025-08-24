// Custom types for animations
export type AnimationTiming = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

// Interface for animation options
export interface AnimationOptions {
  duration?: number;
  delay?: number;
  timing?: AnimationTiming;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  iterations?: number | 'infinite';
}

// Default animation options
const defaultOptions: AnimationOptions = {
  duration: 300,
  delay: 0,
  timing: 'ease',
  direction: 'normal',
  iterations: 1,
};

/**
 * Utility function to generate CSS transition values
 */
export const createTransition = (
  properties: string[] = ['all'],
  options: Partial<AnimationOptions> = {}
): string => {
  const { duration, delay, timing } = { ...defaultOptions, ...options };
  const durationInSec = duration ? duration / 1000 : 0;
  const delayInSec = delay ? delay / 1000 : 0;
  
  return properties
    .map((prop) => `${prop} ${durationInSec}s ${timing} ${delayInSec}s`)
    .join(', ');
};

/**
 * Function to handle scroll-triggered animations
 */
export const setupScrollAnimation = (
  element: HTMLElement,
  animationClass: string,
  options: { threshold?: number; rootMargin?: string } = {}
): IntersectionObserver => {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
        }
      });
    },
    { threshold, rootMargin }
  );
  
  observer.observe(element);
  return observer;
};

/**
 * Function to create a staggered animation for multiple elements
 */
export const createStaggeredAnimation = (
  elements: HTMLElement[],
  animationClass: string,
  staggerDelay: number = 100
): void => {
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add(animationClass);
    }, index * staggerDelay);
  });
};

/**
 * Utilities for cursor effects
 */
export const cursorEffects = {
  magneticEffect: (element: HTMLElement, intensity: number = 0.3): (() => void) => {
    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const distanceX = (e.clientX - centerX) * intensity;
      const distanceY = (e.clientY - centerY) * intensity;
      
      element.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
    };
    
    const handleMouseLeave = () => {
      element.style.transform = '';
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  },
  
  // Add more custom cursor effects as needed
};

export default {
  createTransition,
  setupScrollAnimation,
  createStaggeredAnimation,
  cursorEffects,
};