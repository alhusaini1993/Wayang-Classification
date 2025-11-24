import { useState } from 'react';
import CameraView from './components/CameraView';
import ImagePickerView from './components/ImagePickerView';
import HistoryView from './components/HistoryView';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  const renderContent = () => {
    switch (activeTab) {
      case 'camera':
        return <CameraView />;
      case 'upload':
        return <ImagePickerView />;
      case 'history':
        return <HistoryView />;
      default:
        return <ImagePickerView />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <span className="logo">🎭</span>
          </div>
          <div className="header-text">
            <h1>Klasifikasi Wayang</h1>
            <p>Kenali Tokoh Wayang dengan AI</p>
          </div>
        </div>
      </header>

      <main className="app-content">
        {renderContent()}
      </main>

      <nav className="tab-bar">
        <button
          className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          <span className="tab-icon">📹</span>
          <span className="tab-text">Scan</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <span className="tab-icon">📤</span>
          <span className="tab-text">Upload</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-text">History</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
