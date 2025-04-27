import { Variants } from 'framer-motion';

// Fade in animation
export const fadeIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

// Scale animation
export const popIn: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

// Slide in animation
export const slideIn: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

// Staggered children animation
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Typing indicator animation
export const typingVariants: Variants = {
  initial: { y: 0 },
  animate: { 
    y: [0, -5, 0],
    transition: {
      repeat: Infinity,
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

// Music visualizer bar animation
export const visualizerBarVariants: Variants = {
  initial: { scaleY: 0.2 },
  animate: (custom: number) => ({
    scaleY: [0.2, custom, 0.2],
    transition: {
      repeat: Infinity,
      duration: 1 + Math.random(),
      ease: "easeInOut"
    }
  })
};
