import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBytes, formatDate } from '@/utils/format';
import type { FileItem } from '@/types/file';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
}

export function SearchBar({ value, onChange, onOpenChange, files, onFileClick }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!value.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search: value,
          pid: '0'
        });
        const response = await fetch(`/api/files?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.data.list);
        } else {
          console.error('Search failed:', data.error);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const openSearch = () => {
    setIsOpen(true);
    onOpenChange(true);
  };

  const closeSearch = () => {
    setIsOpen(false);
    onChange('');
    onOpenChange(false);
  };

  const handleFileClick = (file: FileItem) => {
    onFileClick(file);
    closeSearch();
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openSearch}
        className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-blue-400/20 dark:hover:to-purple-400/20 transition-all duration-200"
      >
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 left-0 top-0 w-screen h-screen bg-gray-900/80 backdrop-blur-sm z-[9998]"
              onClick={closeSearch}
              style={{ margin: 0 }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
              style={{ margin: 0 }}
            >
              <div className="w-full max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search files..."
                    className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-gray-900/5 text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <button
                    onClick={closeSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden max-h-[60vh] overflow-y-auto"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : value ? (
                    searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {searchResults.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                            onClick={() => handleFileClick(file)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-2">
                                <DocumentIcon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatBytes(file.size)}
                                  </p>
                                  <span className="text-gray-300 dark:text-gray-600">•</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(file.utime)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No files found
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      Start typing to search files...
                    </div>
                  )}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                    <span>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">ESC</kbd> to close</span>
                    <span>{searchResults.length} results</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}