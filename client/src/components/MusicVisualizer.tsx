import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MusicVisualizerProps } from "@/types";
import { Music } from "lucide-react";

export default function MusicVisualizer({ isEnabled, isActive }: MusicVisualizerProps) {
  const barRefs = useRef<HTMLDivElement[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      if (isEnabled) {
        barRefs.current.forEach(bar => {
          if (bar) {
            const randomScale = isActive 
              ? Math.random() * 0.8 + 0.3 // More active animation
              : Math.random() * 0.5 + 0.2; // Normal animation
            bar.style.transform = `scaleY(${randomScale})`;
          }
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isEnabled, isActive]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isEnabled ? 0.8 : 0.2 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 w-full h-12 px-6 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm flex items-end justify-center space-x-1 border-b border-gray-200 dark:border-gray-700 transition-opacity duration-500"
    >
      {/* Visualizer bars */}
      <div ref={el => el && (barRefs.current[0] = el)} className="visualizer-bar w-1 h-6 bg-primary-400 rounded-t-sm" style={{ transform: 'scaleY(0.3)' }}></div>
      <div ref={el => el && (barRefs.current[1] = el)} className="visualizer-bar w-1 h-6 bg-primary-500 rounded-t-sm" style={{ transform: 'scaleY(0.5)' }}></div>
      <div ref={el => el && (barRefs.current[2] = el)} className="visualizer-bar w-1 h-6 bg-primary-600 rounded-t-sm" style={{ transform: 'scaleY(0.7)' }}></div>
      <div ref={el => el && (barRefs.current[3] = el)} className="visualizer-bar w-1 h-6 bg-secondary-500 rounded-t-sm" style={{ transform: 'scaleY(0.9)' }}></div>
      <div ref={el => el && (barRefs.current[4] = el)} className="visualizer-bar w-1 h-6 bg-secondary-600 rounded-t-sm" style={{ transform: 'scaleY(1)' }}></div>
      <div ref={el => el && (barRefs.current[5] = el)} className="visualizer-bar w-1 h-6 bg-accent-500 rounded-t-sm" style={{ transform: 'scaleY(0.8)' }}></div>
      <div ref={el => el && (barRefs.current[6] = el)} className="visualizer-bar w-1 h-6 bg-accent-600 rounded-t-sm" style={{ transform: 'scaleY(0.6)' }}></div>
      <div ref={el => el && (barRefs.current[7] = el)} className="visualizer-bar w-1 h-6 bg-primary-400 rounded-t-sm" style={{ transform: 'scaleY(0.4)' }}></div>
      <div ref={el => el && (barRefs.current[8] = el)} className="visualizer-bar w-1 h-6 bg-primary-500 rounded-t-sm" style={{ transform: 'scaleY(0.2)' }}></div>
      
      <span className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
        <Music className="h-4 w-4 mr-1" /> Musical Notes: {isEnabled ? 'On' : 'Off'}
      </span>
    </motion.div>
  );
}
