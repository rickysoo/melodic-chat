import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { HeaderProps } from "@/types";
import { Menu } from "lucide-react";

export default function Header({ onToggleMusic, isMusicEnabled }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-500 p-2 rounded-lg">
          <i className="ri-message-3-line text-white text-xl"></i>
        </div>
        <h1 className="font-heading font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500">
          Melodic Chat
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          className={`text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors`}
          onClick={onToggleMusic}
        >
          <i className={`${isMusicEnabled ? 'ri-volume-up-line' : 'ri-volume-mute-line'} text-xl`}></i>
        </button>
        
        <button 
          className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <i className="ri-settings-4-line text-xl"></i>
        </button>
        
        <button 
          className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
          onClick={() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
          }}
        >
          {theme === 'dark' ? (
            <i className="ri-moon-line text-xl"></i>
          ) : (
            <i className="ri-sun-line text-xl"></i>
          )}
        </button>
      </div>
    </header>
  );
}
