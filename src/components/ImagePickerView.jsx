import { useState, useRef } from 'react';
import { classifyImage, saveClassification } from '../lib/supabase';
import './ImagePickerView.css';

export default function ImagePickerView() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target.result;
      setImage(imageDataUrl);
      setResult(null);
      setError(null);
      await processImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageDataUrl) => {
    try {
      setIsProcessing(true);
      const base64 = imageDataUrl.split(',')[1];

      const classificationResult = await classifyImage(base64);

      await saveClassification(
        imageDataUrl,
        classificationResult.predicted_class,
        classificationResult.confidence,
        classificationResult.model_used
      );

      setResult(classificationResult);
    } catch (err) {
      console.error('Classification error:', err);
      setError('Gagal mengklasifikasi gambar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-picker-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {!image && (
        <div className="welcome-section">
          <div className="welcome-icon">🎭</div>
          <h2>Klasifikasi Wayang</h2>
          <p>Upload foto wayang untuk mengetahui nama dan informasi karakternya</p>
        </div>
      )}

      <button onClick={triggerFileSelect} disabled={isProcessing} className="upload-button">
        {image ? '📷 Pilih Gambar Lain' : '📤 Upload Gambar Wayang'}
      </button>

      {image && (
        <div className="image-preview">
          <img src={image} alt="Selected" />
        </div>
      )}

      {isProcessing && (
        <div className="loading-container">
          <div className="spinner" />
          <p>Mengklasifikasi...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {result && !isProcessing && (
        <div className="result-container">
          <div className="result-header">
            <div className="result-badge">✨</div>
            <h2>Hasil Klasifikasi</h2>
          </div>

          <div className="main-result">
            <div className="character-info">
              <h3 className="character-name">{result.predicted_class}</h3>
              {result.description && (
                <p className="character-description">{result.description}</p>
              )}
            </div>
            <div className="confidence-badge">
              <span className="confidence-value">{(result.confidence * 100).toFixed(1)}%</span>
              <span className="confidence-label">Akurasi</span>
            </div>
          </div>

          {result.all_predictions && result.all_predictions.length > 0 && (
            <div className="all-predictions">
              <h4>Kemungkinan Lainnya:</h4>
              {result.all_predictions.slice(0, 5).map((pred, index) => (
                <div key={index} className="prediction-row">
                  <div className="prediction-info">
                    <span className="prediction-class">{pred.class}</span>
                    {pred.description && (
                      <span className="prediction-desc">{pred.description}</span>
                    )}
                  </div>
                  <div className="prediction-right">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <span className="prediction-confidence">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
