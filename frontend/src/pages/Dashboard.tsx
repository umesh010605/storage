import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import FileUpload from '../components/FileUpload/FileUpload';
import FileList from '../components/FileList/FileList';
import StatsPanel from '../components/Stats/StatsPanel';

interface DashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab: propActiveTab, setActiveTab: propSetActiveTab }) => {
  const [internalActiveTab, setInternalActiveTab] = useState('files');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use internal state if no props provided
  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propSetActiveTab || setInternalActiveTab;

  useEffect(() => {
    // Listen for custom event to switch to upload tab
    const handleSwitchToUpload = () => {
      setActiveTab('upload');
    };

    window.addEventListener('switchToUpload', handleSwitchToUpload);
    return () => {
      window.removeEventListener('switchToUpload', handleSwitchToUpload);
    };
  }, [setActiveTab]);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('files'); // Switch to files tab after upload
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <FileUpload onUploadComplete={handleUploadComplete} />;
      case 'stats':
        return <StatsPanel />;
      case 'storage':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Storage Management</h2>
              <p className="text-gray-600">Manage your encrypted file storage</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  📦
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Storage Features</h3>
              <p className="text-gray-600 mb-4">
                Enhanced storage management features will be available in future updates.
              </p>
              <div className="text-sm text-gray-500">
                <p>• IPFS distributed storage</p>
                <p>• Blockchain file tracking</p>
                <p>• Advanced encryption options</p>
              </div>
            </div>
          </div>
        );
      case 'files':
      default:
        return <FileList refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;