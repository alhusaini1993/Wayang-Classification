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
          <h2>Hasil Klasifikasi</h2>
          <div className="main-result">
            <h3>{result.predicted_class}</h3>
            <div className="confidence-badge">
              {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {result.all_predictions && (
            <div className="all-predictions">
              <h4>Top 5 Prediksi:</h4>
              {result.all_predictions.map((pred, index) => (
                <div key={index} className="prediction-row">
                  <span className="prediction-class">{pred.class}</span>
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
