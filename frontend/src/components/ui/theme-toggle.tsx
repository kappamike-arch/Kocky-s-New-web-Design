'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-800", className)}>
        <div className="w-5 h-5" />
      </button>
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Laptop, label: 'System' },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
          className
        )}
        aria-label="Toggle theme"
      >
        <motion.div
          key={currentTheme}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 30, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-36 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-40"
            >
              <div className="p-1">
                {themes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        setTheme(item.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors",
                        theme === item.value
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
