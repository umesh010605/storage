import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab: propActiveTab, 
  setActiveTab: propSetActiveTab 
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState('files');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use props if provided, otherwise use internal state
  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propSetActiveTab || setInternalActiveTab;

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {React.cloneElement(children as React.ReactElement, { activeTab, setActiveTab })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;