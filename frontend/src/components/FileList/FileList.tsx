import React, { useState, useEffect } from 'react';
import { Download, Trash2, Calendar, HardDrive, RefreshCw, Search, Lock } from 'lucide-react';
import { FileItem } from '../../types/file';
import { fileService } from '../../services/fileService';
import LoadingSpinner from '../UI/LoadingSpinner';
import EmptyState from '../UI/EmptyState';
import toast from 'react-hot-toast';

interface FileListProps {
  refreshTrigger?: number;
}

const FileList: React.FC<FileListProps> = ({ refreshTrigger }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles();
      setFiles(response.data.files);
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to load files';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const handleDownload = async (file: FileItem) => {
    setSelectedFile(file);
    setShowPasswordDialog(true);
  };

  const handleDownloadWithPassword = async () => {
    if (!selectedFile) return;

    try {
      const downloadPassword = password || 'blockchain-secure-2024'; // Use default if empty
      await fileService.downloadFile(selectedFile.id, selectedFile.original_name, downloadPassword);
      toast.success('File downloaded successfully');
      setShowPasswordDialog(false);
      setPassword('');
      setSelectedFile(null);
    } catch (error: any) {
      if (error.response?.data?.error?.code === 'INVALID_PASSWORD') {
        toast.error('Invalid password! Please try again.');
      } else {
        const message = error.response?.data?.error?.message || 'Download failed';
        toast.error(message);
      }
    }
  };

  const handleDownloadEncrypted = async (file: FileItem) => {
    try {
      await fileService.downloadEncryptedFile(file.id, file.original_name);
      toast.success('Encrypted file downloaded successfully');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Download failed';
      toast.error(message);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!window.confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      toast.success('File deleted successfully');
      loadFiles(); // Refresh the list
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Delete failed';
      toast.error(message);
    }
  };

  const filteredAndSortedFiles = files
    .filter(file => 
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.original_name.localeCompare(b.original_name);
          break;
        case 'date':
          comparison = new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime();
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 animate-fade-in">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading files...</span>
      </div>
    );
  }

  return (
    <>
      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enter Password to Decrypt
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              File: <span className="font-medium">{selectedFile?.original_name}</span>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              💡 Leave empty to use default password: <code className="bg-gray-100 px-1 rounded">blockchain-secure-2024</code>
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (or leave empty for default)"
              className="input-field mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleDownloadWithPassword()}
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                  setSelectedFile(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadWithPassword}
                className="btn-primary"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Files</h2>
          <p className="text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} stored securely
          </p>
        </div>
        
        <button
          onClick={loadFiles}
          className="btn-secondary flex items-center"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-secondary px-3"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* File List */}
      {filteredAndSortedFiles.length === 0 ? (
        <EmptyState
          icon={searchTerm ? Search : HardDrive}
          title={searchTerm ? 'No files found' : 'No files uploaded yet'}
          description={searchTerm 
            ? 'Try adjusting your search terms to find what you\'re looking for'
            : 'Upload your first file to get started with secure, encrypted storage'
          }
          action={!searchTerm ? {
            label: 'Upload File',
            onClick: () => window.dispatchEvent(new CustomEvent('switchToUpload'))
          } : undefined}
        />
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">File</th>
                  <th className="table-header">Size</th>
                  <th className="table-header">Upload Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedFiles.map((file, index) => (
                  <tr 
                    key={file.id} 
                    className="hover:bg-gray-50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="table-cell">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3 animate-pulse-slow">
                          {fileService.getFileIcon(file.mime_type)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.original_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {file.mime_type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {fileService.formatFileSize(file.file_size)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="hidden sm:inline">{formatDate(file.upload_date)}</span>
                        <span className="sm:hidden">{new Date(file.upload_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="status-badge status-badge-success">
                        🔒 Encrypted
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded transition-colors"
                          title="Download (Decrypted)"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadEncrypted(file)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                          title="Download Encrypted (AES-256)"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default FileList;