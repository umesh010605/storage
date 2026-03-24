import api from './api';
import { FileItem, FileStats } from '../types/file';
import { ErrorHandler } from '../utils/errorHandler';

export const fileService = {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{ data: { file: FileItem } }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      ErrorHandler.handleFileUploadError(error);
      throw error;
    }
  },

  async getFiles(): Promise<{ data: { files: FileItem[] } }> {
    try {
      const response = await api.get('/files');
      return response.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  async downloadFile(fileId: string, filename: string, password?: string): Promise<void> {
    try {
      const url = password 
        ? `/files/${fileId}/download?password=${encodeURIComponent(password)}`
        : `/files/${fileId}/download`;
        
      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Create blob link to download
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  async downloadEncryptedFile(fileId: string, filename: string): Promise<void> {
    try {
      const response = await api.get(`/files/${fileId}/download-encrypted`, {
        responseType: 'blob',
      });

      // Create blob link to download encrypted file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename + '.encrypted');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  async deleteFile(fileId: string): Promise<void> {
    try {
      await api.delete(`/files/${fileId}`);
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  async getFileInfo(fileId: string): Promise<{ data: { file: FileItem } }> {
    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  async getUserStats(): Promise<{ data: { stats: FileStats } }> {
    try {
      const response = await api.get('/files/stats');
      return response.data;
    } catch (error) {
      ErrorHandler.handleApiError(error);
      throw error;
    }
  },

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📁';
  }
};