'use client';

import { motion } from 'framer-motion';

export function FileListSkeleton() {
  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
        <thead className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
          <tr>
            <th className="py-4 pl-4 pr-3 text-left text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:pl-6">Name</th>
            <th className="px-3 py-4 text-left text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Size</th>
            <th className="px-3 py-4 text-left text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Type</th>
            <th className="px-3 py-4 text-left text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Modified</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
          {[...Array(5)].map((_, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="animate-pulse"
            >
              <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 mr-3"></div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}