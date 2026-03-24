import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, File, Lock } from 'lucide-react';
import { fileService } from '../../services/fileService';
import { UploadProgress } from '../../types/file';
import ProgressBar from '../UI/ProgressBar';
import LoadingSpinner from '../UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress({ progress: 0, status: 'idle' });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      console.log('Starting upload for file:', selectedFile.name);
      setUploadProgress({ progress: 0, status: 'uploading' });

      const result = await fileService.uploadFile(selectedFile, (progress) => {
        console.log('Upload progress:', progress);
        setUploadProgress({ progress, status: 'uploading' });
      });

      console.log('Upload result:', result);
      setUploadProgress({ progress: 100, status: 'encrypting' });

      // Simulate encryption delay
      setTimeout(() => {
        setUploadProgress({ progress: 100, status: 'complete' });
        toast.success('File uploaded and encrypted successfully!');
        setSelectedFile(null);
        onUploadComplete?.();
        
        // Reset after a delay
        setTimeout(() => {
          setUploadProgress({ progress: 0, status: 'idle' });
        }, 2000);
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.error?.message || error.message || 'Upload failed';
      setUploadProgress({ progress: 0, status: 'error', error: message });
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress({ progress: 0, status: 'idle' });
  };

  const getStatusIcon = () => {
    switch (uploadProgress.status) {
      case 'uploading':
        return <LoadingSpinner size="sm" />;
      case 'encrypting':
        return <Lock className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (uploadProgress.status) {
      case 'uploading':
        return `Uploading... ${uploadProgress.progress}%`;
      case 'encrypting':
        return 'Encrypting with AES-256...';
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return uploadProgress.error || 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Files</h2>
        <p className="text-gray-600">
          Securely upload your files with AES-256 encryption
        </p>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-3">
              <File className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {fileService.formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          ) : (
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
          )}

          <div>
            {selectedFile ? (
              <p className="text-lg font-medium text-green-700">File selected</p>
            ) : isDragActive ? (
              <p className="text-lg font-medium text-primary-700">Drop the file here</p>
            ) : (
              <p className="text-lg font-medium text-gray-700">
                Drag & drop a file here, or click to select
              </p>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              Supports: Images, PDFs, Documents, Spreadsheets (Max 100MB)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.status !== 'idle' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium text-gray-900">{getStatusText()}</span>
            </div>
            
            {uploadProgress.status === 'error' && (
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {(uploadProgress.status === 'uploading' || uploadProgress.status === 'encrypting') && (
            <ProgressBar 
              progress={uploadProgress.progress}
              color={uploadProgress.status === 'encrypting' ? 'yellow' : 'primary'}
              animated={true}
            />
          )}

          {uploadProgress.status === 'encrypting' && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Your file is being encrypted for maximum security</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && uploadProgress.status === 'idle' && (
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload & Encrypt
          </button>
          <button
            onClick={handleCancel}
            className="btn-secondary px-6"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Security Features</p>
            <ul className="mt-1 text-blue-700 space-y-1">
              <li>• Files are encrypted with AES-256-GCM before storage</li>
              <li>• Each file gets a unique encryption key</li>
              <li>• Only you can decrypt and access your files</li>
              <li>• Future: IPFS and blockchain integration planned</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;