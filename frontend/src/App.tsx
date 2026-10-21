import React, { useState } from 'react';
import type { NavTab } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { LiveCallPage } from './pages/LiveCallPage';
import { CallHistoryPage } from './pages/CallHistoryPage';
import { CallDetailPage } from './pages/CallDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProductConfigPage } from './pages/ProductConfigPage';
import { SettingsPage } from './pages/SettingsPage';
import { useVoiceCall } from './hooks/useVoiceCall';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global live voice session hook
  const voiceCall = useVoiceCall();
  const isCallActive = voiceCall.status === 'connected';

  const handleSelectCall = (callId: string) => {
    setSelectedCallId(callId);
  };

  const handleStartCallClick = () => {
    setCurrentTab('live-call');
  };

  const renderContent = () => {
    // If a specific call is selected to view details
    if (selectedCallId) {
      return (
        <CallDetailPage
          callId={selectedCallId}
          onBack={() => setSelectedCallId(null)}
        />
      );
    }

    switch (currentTab) {
      case 'overview':
        return (
          <OverviewPage
            onStartCall={() => setCurrentTab('live-call')}
            onSelectCall={handleSelectCall}
            onNavigateHistory={() => setCurrentTab('history')}
          />
        );
      case 'live-call':
        return (
          <LiveCallPage
            voiceCall={voiceCall}
            onViewCallDetails={(id) => {
              setSelectedCallId(id);
            }}
          />
        );
      case 'history':
        return <CallHistoryPage onSelectCall={handleSelectCall} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'product':
        return <ProductConfigPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <OverviewPage
            onStartCall={() => setCurrentTab('live-call')}
            onSelectCall={handleSelectCall}
            onNavigateHistory={() => setCurrentTab('history')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#FAF9FF] overflow-hidden font-sans">
      {/* White & Lavender Sidebar with Mobile Drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedCallId(null);
          setCurrentTab(tab);
        }}
        isCallActive={isCallActive}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9FF]">
        <Header
          currentTab={currentTab}
          onStartCallClick={handleStartCallClick}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        <main className="flex-1 overflow-y-auto bg-[#FAF9FF]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
