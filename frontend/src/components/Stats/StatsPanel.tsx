import React, { useState, useEffect } from 'react';
import { HardDrive, Files, Shield, TrendingUp } from 'lucide-react';
import { FileStats } from '../../types/file';
import { fileService } from '../../services/fileService';
import toast from 'react-hot-toast';

const StatsPanel: React.FC = () => {
  const [stats, setStats] = useState<FileStats>({ fileCount: 0, totalSize: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fileService.getUserStats();
        setStats(response.data.stats);
      } catch (error: any) {
        const message = error.response?.data?.error?.message || 'Failed to load statistics';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Files',
      value: stats.fileCount.toString(),
      icon: Files,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      title: 'Storage Used',
      value: fileService.formatFileSize(stats.totalSize),
      icon: HardDrive,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      title: 'Encryption',
      value: 'AES-256',
      icon: Shield,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      title: 'Security Level',
      value: 'Maximum',
      icon: TrendingUp,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistics</h2>
        <p className="text-gray-600">Overview of your file storage and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center">
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Features */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Features</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">AES-256-GCM Encryption</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Unique Keys Per File</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">JWT Authentication</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">IPFS Integration (Coming Soon)</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-sm text-gray-700">Blockchain Tracking (Coming Soon)</span>
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Information</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Storage Used</span>
                <span>{fileService.formatFileSize(stats.totalSize)} / 1 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${Math.min((stats.totalSize / (1024 * 1024 * 1024)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>• Current storage limit: 1 GB</p>
              <p>• Files are encrypted before storage</p>
              <p>• Automatic backup and redundancy</p>
              <p>• Future: Distributed IPFS storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Features Preview */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">IPFS Integration</h4>
            <p className="text-sm text-gray-600">
              Decentralized storage on the InterPlanetary File System for enhanced redundancy and availability.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Blockchain Tracking</h4>
            <p className="text-sm text-gray-600">
              Immutable file ownership and history tracking on the blockchain for ultimate transparency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;