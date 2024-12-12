import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { XMarkIcon, DocumentIcon, CloudArrowDownIcon, ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { FileItem } from '@/types/file';
import { formatBytes, formatDate } from '@/utils/format';
import { DownloadProgress } from './DownloadProgress';
import { MediaPlayer } from './MediaPlayer';

interface FileInfoModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

interface Download {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  itemId?: string;
}

export function FileInfoModal({ file, isOpen, onClose, onDownload }: FileInfoModalProps) {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleDownload = () => {
    if (!file) {
      console.error('No file available for download');
      return;
    }
    onDownload(file);
  };

  const handleCloseDownload = (id: string) => {
    setDownloads(prev => prev.filter(download => download.id !== id));
  };

  const handleCopyShareLink = async () => {
    const shareUrl = `${window.location.origin}/file/${file.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  const isMediaFile = file.type === 'video' || file.type === 'audio';
  const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={onClose}
                      className="rounded-full p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <DocumentIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {fileExtension}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {file.name}
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Media Player */}
                  {isMediaFile && file.url && (
                    <div className="mb-6">
                      <MediaPlayer
                        url={file.url}
                        type={file.type as 'video' | 'audio'}
                        fileName={file.name}
                      />
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Extension', value: fileExtension },
                        { label: 'Size', value: formatBytes(file.size) },
                        { label: 'Created', value: formatDate(file.ctime) },
                        { label: 'Modified', value: formatDate(file.utime) }
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 transition-colors"
                        >
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {item.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Share Link Section */}
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Share Link
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                          {`${window.location.origin}/file/${file.id}`}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopyShareLink}
                          className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                        >
                          {copied ? (
                            <CheckIcon className="h-5 w-5" />
                          ) : (
                            <ShareIcon className="h-5 w-5" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownload}
                      className="w-full mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200"
                    >
                      <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                      Download File
                    </motion.button>
                  </motion.div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <AnimatePresence>
        {downloads.map((download, index) => (
          <DownloadProgress
            key={download.id}
            url={download.url}
            fileName={download.fileName}
            fileSize={download.fileSize}
            itemId={download.itemId}
            onClose={() => handleCloseDownload(download.id)}
            index={index}
            totalDownloads={downloads.length}
          />
        ))}
      </AnimatePresence>
    </>
  );
}