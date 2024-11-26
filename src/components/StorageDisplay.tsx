'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes } from '@/utils/format';
import { CloudIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface DriveInfo {
  used: number;
  total: number;
  nickname: string;
}

interface StorageDisplayProps {
  used: number;
  total: number;
  drives: Record<string, DriveInfo>;
}

export function StorageDisplay({ used, total, drives }: StorageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [combinedStorage, setCombinedStorage] = useState({
    totalStorage: 0,
    usedStorage: 0,
    freeStorage: 0,
    percentage: 0
  });

  useEffect(() => {
    // Process storage data when drives prop changes
    const driveEntries = Object.entries(drives);
    
    if (driveEntries.length > 0) {
      const totalStorage = Object.values(drives).reduce((acc, drive) => acc + drive.total, 0);
      const usedStorage = Object.values(drives).reduce((acc, drive) => acc + drive.used, 0);
      const freeStorage = totalStorage - usedStorage;
      const percentage = totalStorage > 0 ? Math.min((usedStorage / totalStorage) * 100, 100) : 0;

      setCombinedStorage({
        totalStorage,
        usedStorage,
        freeStorage,
        percentage
      });
      setIsLoading(false);
    }
  }, [drives]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl p-4 glass-effect"
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const isNearCapacity = combinedStorage.percentage > 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl p-3 sm:p-4 glass-effect"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
          >
            Cloud Storage
          </motion.h3>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-2 sm:ml-3"
          >
            {isNearCapacity ? 'Running out of space!' : `${Math.round(combinedStorage.percentage)}% used`}
          </motion.span>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10"
        >
          <CloudIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3 sm:space-y-4"
      >
        <div className="relative h-2 sm:h-3 bg-white/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${combinedStorage.percentage}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`absolute inset-y-0 left-0 ${
              isNearCapacity
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}
          >
            <motion.div 
              animate={{
                x: ["0%", "100%"],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Used', value: combinedStorage.usedStorage },
            { label: 'Free', value: combinedStorage.freeStorage },
            { label: 'Total', value: combinedStorage.totalStorage }
          ].map((item, index) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2"
            >
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatBytes(item.value)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Individual Drives</p>
          <div className="grid gap-2">
            {Object.entries(drives).map(([driveName, drive], index) => {
              const drivePercentage = (drive.used / drive.total) * 100;
              return (
                <motion.div
                  key={driveName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="bg-white/30 dark:bg-gray-800/30 rounded-lg p-2"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {driveName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(drivePercentage)}%
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${drivePercentage}%` }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {formatBytes(drive.used)}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {formatBytes(drive.total)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}