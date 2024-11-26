import React from 'react';
import { FiUpload, FiFolder, FiTrash2, FiRefreshCw } from 'react-icons/fi';

interface ToolbarProps {
  onUpload: () => void;
  onNewFolder: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export function Toolbar({ onUpload, onNewFolder, onDelete, onRefresh }: ToolbarProps) {
  return (
    <div className="flex items-center space-x-2 p-4 bg-white border-b">
      <button
        onClick={onUpload}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <FiUpload className="mr-2" />
        Upload
      </button>
      <button
        onClick={onNewFolder}
        className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <FiFolder className="mr-2" />
        New Folder
      </button>
      <button
        onClick={onDelete}
        className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <FiTrash2 className="mr-2" />
        Delete
      </button>
      <button
        onClick={onRefresh}
        className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <FiRefreshCw className="mr-2" />
        Refresh
      </button>
    </div>
  );
}