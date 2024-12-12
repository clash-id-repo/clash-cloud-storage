import React, { useState } from 'react';
import { FileList } from './components/FileList';
import { Breadcrumb } from './components/Breadcrumb';
import { Toolbar } from './components/Toolbar';
import { FileItem } from './types/file';

interface FolderPath {
  id: string;
  name: string;
}

function App() {
  const [currentPath, setCurrentPath] = useState<FolderPath[]>([{ id: '0', name: 'Home' }]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [files] = useState<FileItem[]>([
    { 
      id: '1',
      name: 'Documents', 
      type: 'folder', 
      size: 0,
      ctime: Date.now(),
      utime: Date.now(),
      pid: 0,
      url: '/documents'
    },
    { 
      id: '2',
      name: 'Images', 
      type: 'folder', 
      size: 0,
      ctime: Date.now(),
      utime: Date.now(),
      pid: 0,
      url: '/images'
    },
    { 
      id: '3',
      name: 'report.pdf', 
      type: 'file', 
      size: 2.5 * 1024 * 1024,
      ctime: Date.now(),
      utime: Date.now(),
      pid: 0,
      url: '/report.pdf'
    },
    { 
      id: '4',
      name: 'presentation.pptx', 
      type: 'file', 
      size: 5.1 * 1024 * 1024,
      ctime: Date.now(),
      utime: Date.now(),
      pid: 0,
      url: '/presentation.pptx'
    }
  ]);

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentPath([...currentPath, { id: file.id, name: file.name }]);
    }
  };

  const handleNavigate = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleUpload = () => {
    // Implement file upload logic
    console.log('Upload clicked');
  };

  const handleNewFolder = () => {
    // Implement new folder creation logic
    console.log('New folder clicked');
  };

  const handleDelete = () => {
    // Implement delete logic
    console.log('Delete clicked');
  };

  const handleRefresh = () => {
    // Implement refresh logic
    console.log('Refresh clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900">File Manager</h1>
          </div>
        </header>

        <main className="bg-white shadow mt-6 rounded-lg">
          <Toolbar
            onUpload={handleUpload}
            onNewFolder={handleNewFolder}
            onDelete={handleDelete}
            onRefresh={handleRefresh}
          />
          <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
          <FileList 
            files={files} 
            onFileClick={handleFileClick} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </main>
      </div>
    </div>
  );
}

export default App;