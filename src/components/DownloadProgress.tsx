'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, StopIcon } from '@heroicons/react/24/outline';
import { ChunkDownloader } from '@/utils/download';
import { formatBytes } from '@/utils/format';

interface DownloadProgressProps {
  url: string;
  fileName: string;
  fileSize: number;
  itemId?: string;
  onClose: () => void;
  index: number;
  totalDownloads: number;
}

export function DownloadProgress({ 
  url, 
  fileName, 
  fileSize, 
  itemId, 
  onClose, 
  index, 
  totalDownloads 
}: DownloadProgressProps) {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [downloading, setDownloading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const downloaderRef = useRef<ChunkDownloader | null>(null);

  const cleanup = useCallback(() => {
    if (downloaderRef.current) {
      downloaderRef.current.stop();
      downloaderRef.current = null;
    }
  }, []);

  const startFallbackDownload = async () => {
    if (!itemId) {
      setError('Fallback download failed: No item ID available');
      setDownloading(false);
      return;
    }

    try {
      setUsingFallback(true);
      setProgress(0);
      const response = await fetch(`/api/file/${itemId}/download`);
      
      if (!response.ok) {
        throw new Error('Fallback download failed');
      }

      const reader = response.body?.getReader();
      const contentLength = parseInt(response.headers.get('content-length') || '0');

      if (!reader || !contentLength) {
        throw new Error('Failed to initialize download');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;
        const newProgress = (receivedLength / contentLength) * 100;
        setProgress(newProgress);
        setSpeed(value.length); // Bytes per chunk
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloading(false);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Fallback download error:', error);
      setError('Both primary and fallback downloads failed');
      setDownloading(false);
    }
  };

  const startDownload = useCallback(() => {
    cleanup();

    const newDownloader = new ChunkDownloader(
      url,
      (progress) => setProgress(progress),
      (speed) => setSpeed(speed),
      (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloading(false);
        setTimeout(onClose, 2000);
      },
      async (error) => {
        console.error('Primary download failed:', error);
        await startFallbackDownload();
      }
    );

    downloaderRef.current = newDownloader;
    newDownloader.start();
  }, [url, fileName, onClose, cleanup]);

  useEffect(() => {
    startDownload();
    return cleanup;
  }, [startDownload, cleanup]);

  const handleStop = () => {
    cleanup();
    setError('Download stopped');
    setDownloading(false);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const timeRemaining = speed > 0 
    ? Math.ceil(((fileSize * (100 - progress) / 100) / speed))
    : 0;

  const bottomPosition = 16 + (index * (totalDownloads > 1 ? 160 : 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, right: 16 }}
      animate={{ opacity: 1, y: 0, right: 16, bottom: bottomPosition }}
      exit={{ opacity: 0, y: 50 }}
      style={{ position: 'fixed', width: '340px', zIndex: 50 - index }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">
            {fileName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatBytes(fileSize)}
            {usingFallback && ' (Using fallback)'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {downloading && (
            <button
              onClick={handleStop}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              <StopIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
            {downloading ? `${Math.round(progress)}% completed` : error || 'Download complete'}
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100 flex-shrink-0">
            {formatBytes(Math.round((progress / 100) * fileSize))}
          </span>
        </div>
        
        {downloading && speed > 0 && !usingFallback && (
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{formatBytes(speed)}/s</span>
            <span>{timeRemaining}s remaining</span>
          </div>
        )}
        
        <div className="w-full h-px bg-gray-100 dark:bg-gray-700" />
        <div className="flex justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Total: {formatBytes(fileSize)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}