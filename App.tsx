import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import CameraView from './components/CameraView';
import ImagePickerView from './components/ImagePickerView';
import HistoryView from './components/HistoryView';

type TabType = 'camera' | 'upload' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎭 Klasifikasi Wayang</Text>
        <Text style={styles.headerSubtitle}>Computer Vision App</Text>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'camera' && styles.tabButtonActive]}
          onPress={() => setActiveTab('camera')}
        >
          <Text style={[styles.tabIcon, activeTab === 'camera' && styles.tabIconActive]}>
            📹
          </Text>
          <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>
            Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'upload' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabIcon, activeTab === 'upload' && styles.tabIconActive]}>
            📤
          </Text>
          <Text style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}>
            Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabIcon, activeTab === 'history' && styles.tabIconActive]}>
            📋
          </Text>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
