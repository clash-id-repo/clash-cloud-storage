'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentIcon, 
  ClockIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { formatBytes, formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';

interface FileDetailsProps {
  file: {
    name: string;
    size: number;
    type: string;
    ctime: number;
    url?: string;
  };
  onDownload?: () => void;
  onShare?: () => void;
}

export function FileDetails({ file, onDownload, onShare }: FileDetailsProps) {
  const router = useRouter();
  const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 max-w-[calc(100%-4rem)]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
              >
                <DocumentIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div className="min-w-0">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate"
                >
                  {file.name}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {formatBytes(file.size)} • {fileExtension} File
                </motion.p>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-blue-400/20 dark:hover:to-purple-400/20 transition-all duration-200"
            >
              <HomeIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100 dark:border-gray-700">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDownload}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200"
          >
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Download</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onShare}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200"
          >
            <ShareIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigator.clipboard.writeText(file.name)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200"
          >
            <DocumentDuplicateIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copy Name</span>
          </motion.button>
        </div>

        {/* URL Display */}
        {file.url && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={file.url} 
                readOnly 
                className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
              />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigator.clipboard.writeText(file.url || '')}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-200"
              >
                <DocumentDuplicateIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Copy URL</span>
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* File details */}
        <div className="p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5 rounded-xl p-4 space-y-1"
              >
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="text-xs">Created</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(file.ctime)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5 rounded-xl p-4 space-y-1"
              >
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  <span className="text-xs">Size</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatBytes(file.size)}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}