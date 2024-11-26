'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FileList } from '@/components/FileList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Pagination } from '@/components/Pagination';
import { FileListSkeleton } from '@/components/FileListSkeleton';
import { FileInfoModal } from '@/components/FileInfoModal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StorageDisplay } from '@/components/StorageDisplay';
import { HeaderDropdown } from '@/components/HeaderDropdown';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { FileItem } from '@/types/file';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTokenStore } from '@/store/useTokenStore';
import { DownloadProgress } from '@/components/DownloadProgress';

interface StorageInfo {
  total: number;
  used: number;
  drives: Record<string, {
    used: number;
    total: number;
    nickname: string;
  }>;
}

interface FolderPath {
  id: string;
  name: string;
  driveToken?: string;
}

interface Download {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  itemId?: string;
}

const ITEMS_PER_PAGE = 50;

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageLoading, setStorageLoading] = useState(false);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPath, setCurrentPath] = useState<FolderPath[]>([{ id: '0', name: 'Home' }]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  
  const { tokens, setToken } = useTokenStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchFiles(currentPath[currentPath.length - 1].id);
    fetchStorage();
  }, []);

  // Extract numeric ID from combined ID (e.g., "Cloud Drive 1-52720379" -> "52720379")
  const extractNumericId = (combinedId: string): string => {
    const match = combinedId.match(/\d+$/);
    return match ? match[0] : '0';
  };
  const fetchFiles = async (pid: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Extract just the numeric ID from the combined ID
      const numericPid = extractNumericId(pid);
      const params = new URLSearchParams({
        search: searchQuery,
        pid: numericPid // Use only the numeric ID
      });
      const response = await fetch(`/api/files?${params}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch files');
      }
      setFiles(data.data.list);
      
      // Store tokens for each drive
      if (data.data.tokens) {
        Object.entries(data.data.tokens).forEach(([driveName, token]) => {
          setToken(driveName, token as any);
        });
      }
      
      setStorage({
        total: data.data.storage.total,
        used: data.data.storage.used,
        drives: data.data.storage.drives
      });
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const fetchStorage = async () => {
    try {
      setStorageLoading(true);
      setError('');
      const response = await fetch('/api/storage');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch storage info');
      }
      setStorage(data.data);
    } catch (err) {
      console.error('Error fetching storage:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch storage info');
    } finally {
      setStorageLoading(false);
    }
  };

  const handleFileClick = async (file: FileItem) => {
    if (file.type === 'dir') {
      // Clear files first to prevent showing old files
      setFiles([]);
      setLoading(true);
      
      // Update path
      setCurrentPath(prev => [...prev, { 
        id: file.id.toString(), 
        name: file.name,
        driveToken: file.driveToken 
      }]);
      
      // Fetch new files
      await fetchFiles(file.id.toString());
    } else {
      setSelectedFile(file);
      setIsModalOpen(true);
    }
  };

  const handleNavigate = async (index: number) => {
    // Clear files first to prevent showing old files
    setFiles([]);
    setLoading(true);
    
    // Update path
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    
    // Fetch new files
    await fetchFiles(newPath[newPath.length - 1].id);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDownload = (file: FileItem) => {
    const newDownload = {
      id: Math.random().toString(36).substring(7),
      url: file.url || '',
      fileName: file.name,
      fileSize: file.size,
      itemId: file.item_id
    };
    setDownloads(prev => [...prev, newDownload]);
  };

  const handleCloseDownload = (id: string) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2 py-3 sm:px-0 sm:py-6 transition-all duration-300"
        >
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 p-4 sm:p-6 rounded-2xl glass-effect">
            <div className="w-full sm:w-auto">
              <HeaderDropdown />
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base pl-1">
                Personal Cloud Storage
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStorage(!showStorage)}
                className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-blue-400/20 dark:hover:to-purple-400/20 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
              >
                <ChartBarIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </motion.button>
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                onOpenChange={setIsSearchOpen}
                files={files}
                onFileClick={handleFileClick}
              />
              <ThemeToggle />
            </div>
          </div>

          <AnimatePresence>
            {showStorage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 sm:mb-6 overflow-hidden"
              >
                {storageLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">
                      Loading storage information...
                    </span>
                  </div>
                ) : (
                  <StorageDisplay
                    used={storage?.used || 0}
                    total={storage?.total || 0}
                    drives={storage?.drives || {}}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Breadcrumb path={currentPath} onNavigate={handleNavigate} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-effect shadow-lg rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="overflow-x-auto">
              {loading ? (
                <FileListSkeleton />
              ) : (
                <>
                  <FileList 
                    files={paginatedFiles} 
                    onFileClick={handleFileClick}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredFiles.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <FileInfoModal
        file={selectedFile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownload={handleDownload}
      />
      <AnimatePresence>
        {downloads.map((download, index) => (
          <DownloadProgress
            key={download.id}
            {...download}
            onClose={() => handleCloseDownload(download.id)}
            index={index}
            totalDownloads={downloads.length}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}