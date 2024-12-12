import React from 'react';
import { DocumentIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { formatBytes, formatDate } from '../utils/format';
import type { FileItem } from '../types/file';
import { motion } from 'framer-motion';

interface FileListProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
}

type ViewMode = 'list' | 'grid';

export function FileList({ files, onFileClick, viewMode, onViewModeChange }: FileListProps) {
  const handleViewChange = (mode: ViewMode) => {
    onViewModeChange?.(mode);
  };

  const renderIcon = (file: FileItem, isGrid: boolean = false) => (
    <div className={`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg ${
      isGrid ? 'p-2 sm:p-3' : 'p-1 sm:p-1.5'
    } transition-transform duration-300 group-hover:scale-110`}>
      <DocumentIcon className={`${
        isGrid ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-4 w-4 sm:h-5 sm:w-5'
      } text-white`} />
    </div>
  );

  if (viewMode === 'grid') {
    return (
      <div className="p-4">
        <div className="sticky left-0 z-10 flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            My Files
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewChange('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === ('list' as ViewMode)
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-400/10 dark:hover:to-purple-400/10'
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleViewChange('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === ('grid' as ViewMode)
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-400/10 dark:hover:to-purple-400/10'
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              key={file.id}
              onClick={() => onFileClick(file)}
              className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/20 dark:hover:border-blue-400/20"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 opacity-0 group-hover:opacity-100 group-hover:from-blue-500/[0.03] group-hover:to-purple-500/[0.03] transition-all duration-300" />
              <div className="relative">
                <div className="aspect-square mb-3 rounded-lg bg-gradient-to-br from-blue-500/[0.03] via-purple-500/[0.03] to-pink-500/[0.03] group-hover:from-blue-500/[0.05] group-hover:via-purple-500/[0.05] group-hover:to-pink-500/[0.05] flex items-center justify-center transition-all duration-300">
                  {renderIcon(file, true)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatBytes(file.size)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="sticky left-0 z-10 flex justify-between items-center px-4 pt-4">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          My Files
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewChange('list')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === ('list' as ViewMode)
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-400/10 dark:hover:to-purple-400/10'
            }`}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleViewChange('grid')}
            className={`p-2 rounded-lg transition-all duration-300 ${
              viewMode === ('grid' as ViewMode)
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 dark:hover:from-blue-400/10 dark:hover:to-purple-400/10'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
        <thead>
          <tr>
            <th className="py-3 sm:py-4 pl-4 pr-3 text-left text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent sm:pl-6">Name</th>
            <th className="px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Size</th>
            <th className="px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Type</th>
            <th className="px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Modified</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
          {files.map((file, index) => (
            <motion.tr
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={file.id}
              onClick={() => onFileClick(file)}
              className="group cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-colors duration-300"
            >
              <td className="whitespace-nowrap py-3 sm:py-4 pl-4 pr-3 text-xs sm:text-sm sm:pl-6">
                <div className="flex items-center">
                  {renderIcon(file)}
                  <span className="font-medium text-gray-900 dark:text-gray-200 truncate max-w-[150px] sm:max-w-none ml-2 sm:ml-3">
                    {file.name}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {formatBytes(file.size)}
              </td>
              <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-blue-600 dark:text-purple-400 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300">
                  {file.type}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {formatDate(file.utime)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}