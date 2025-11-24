import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { classifyImage, saveClassification } from '../lib/supabase';

export default function ImagePickerView() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Error', 'Akses galeri diperlukan');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const selectedImage = result.assets[0];
      setImage(selectedImage.uri);
      setResult(null);
      await processImage(selectedImage.uri, selectedImage.base64);
    }
  };

  const processImage = async (uri: string, base64?: string) => {
    try {
      setIsProcessing(true);

      let imageBase64 = base64;
      if (!imageBase64) {
        imageBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const classificationResult = await classifyImage(imageBase64);

      await saveClassification(
        uri,
        classificationResult.predicted_class,
        classificationResult.confidence,
        classificationResult.model_used
      );

      setResult(classificationResult);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Gagal mengklasifikasi gambar');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={isProcessing}>
        <Text style={styles.buttonText}>
          {image ? '📷 Pilih Gambar Lain' : '📤 Upload Gambar Wayang'}
        </Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

      {isProcessing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Mengklasifikasi...</Text>
        </View>
      )}

      {result && !isProcessing && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Hasil Klasifikasi</Text>
          <View style={styles.mainResult}>
            <Text style={styles.className}>{result.predicted_class}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {(result.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          {result.all_predictions && (
            <View style={styles.allPredictions}>
              <Text style={styles.predictionsTitle}>Top 5 Prediksi:</Text>
              {result.all_predictions.map((pred: any, index: number) => (
                <View key={index} style={styles.predictionRow}>
                  <Text style={styles.predictionClass}>{pred.class}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pred.confidence * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.predictionConfidence}>
                    {(pred.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  className: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  allPredictions: {
    marginTop: 10,
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  predictionClass: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  predictionConfidence: {
    width: 50,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
});
