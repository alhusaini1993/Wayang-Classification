import { useState, useRef, useEffect } from 'react';
import { classifyImage, saveClassification } from '../lib/supabase';
import './CameraView.css';

export default function CameraView({ onResult }) {
  const [stream, setStream] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setResult(null);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      const base64 = imageDataUrl.split(',')[1];

      const classificationResult = await classifyImage(base64);

      await saveClassification(
        imageDataUrl,
        classificationResult.predicted_class,
        classificationResult.confidence,
        classificationResult.model_used
      );

      setResult(classificationResult);
      if (onResult) {
        onResult(classificationResult);
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError('Gagal mengklasifikasi gambar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (error && !stream) {
    return (
      <div className="camera-container">
        <div className="camera-error">
          <p>{error}</p>
          <button onClick={startCamera} className="retry-button">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <div className="camera-view">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {result && (
          <div className="result-overlay">
            <div className="result-box">
              <h3>{result.predicted_class}</h3>
              <p>{(result.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="camera-controls">
        <button
          onClick={captureImage}
          disabled={isProcessing || !stream}
          className="capture-button"
        >
          {isProcessing ? (
            <div className="spinner" />
          ) : (
            <div className="capture-icon" />
          )}
        </button>
      </div>
    </div>
  );
}
