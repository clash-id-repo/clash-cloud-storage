'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface FolderPath {
  id: string;
  name: string;
}

interface BreadcrumbProps {
  path: FolderPath[];
  onNavigate: (index: number) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-gray-500 px-4 py-3 mb-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
        {path.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" />
            )}
            <button
              onClick={() => onNavigate(index)}
              className={`px-2 py-1 rounded-md text-sm whitespace-nowrap transition-colors ${
                index === path.length - 1
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              {item.name}
            </button>
          </motion.div>
        ))}
      </div>
    </nav>
  );
}