import { useState, useEffect } from 'react';
import { getClassificationHistory } from '../lib/supabase';
import './HistoryView.css';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClassificationHistory(50);
      setHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Gagal memuat history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="history-container center">
        <div className="spinner" />
        <p>Memuat history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container center">
        <p className="error-text">{error}</p>
        <button onClick={loadHistory} className="retry-button">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="history-container center">
        <p className="empty-text">Belum ada history klasifikasi</p>
        <p className="empty-subtext">
          Mulai klasifikasi wayang untuk melihat history
        </p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>History Klasifikasi</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="refresh-button"
        >
          {isRefreshing ? '↻' : '🔄'}
        </button>
      </div>

      <div className="history-list">
        {history.map((item) => {
          const date = new Date(item.created_at);
          const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={item.id} className="history-item">
              <img src={item.image_url} alt={item.predicted_class} />
              <div className="item-details">
                <h3>{item.predicted_class}</h3>
                <p className="confidence">
                  Confidence: {(item.confidence * 100).toFixed(1)}%
                </p>
                <p className="date">{formattedDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
