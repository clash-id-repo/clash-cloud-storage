'use client';

import { FileDetails } from '@/components/FileDetails';
import { DownloadProgress } from '@/components/DownloadProgress';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

interface FileResponse {
  data: {
    itemInfo: {
      name: string;
      size: number;
      type: string;
      ctime: number;
      url: string;
      item_id: string;
    };
  };
}

interface Download {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
}

export default function FilePage({ params }: { params: { id: string } }) {
  const [fileData, setFileData] = useState<FileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<Download[]>([]);

  useEffect(() => {
    async function fetchFileDetails() {
      try {
        const response = await fetch(`/api/file/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch file details');
        }
        const data = await response.json();
        setFileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch file details');
      }
    }

    fetchFileDetails();
  }, [params.id]);

  const handleDownload = () => {
    if (!fileData?.data.itemInfo.url) {
      console.error('No URL available for download');
      return;
    }

    const newDownload = {
      id: Math.random().toString(36).substring(7),
      url: fileData.data.itemInfo.url,
      fileName: fileData.data.itemInfo.name,
      fileSize: fileData.data.itemInfo.size
    };

    setDownloads(prev => [...prev, newDownload]);
  };

  const handleCloseDownload = (id: string) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="max-w-2xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const file = {
    name: fileData.data.itemInfo.name,
    size: fileData.data.itemInfo.size,
    type: fileData.data.itemInfo.type,
    ctime: fileData.data.itemInfo.ctime
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <FileDetails 
        file={file}
        onDownload={handleDownload}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: file.name,
              text: `Check out this file: ${file.name}`,
              url: window.location.href
            });
          }
        }}
      />

      <AnimatePresence>
        {downloads.map((download, index) => (
          <DownloadProgress
            key={download.id}
            url={download.url}
            fileName={download.fileName}
            fileSize={download.fileSize}
            onClose={() => handleCloseDownload(download.id)}
            index={index}
            totalDownloads={downloads.length}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}