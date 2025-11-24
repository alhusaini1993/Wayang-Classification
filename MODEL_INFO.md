# Model Klasifikasi Wayang

## Arsitektur Model

Aplikasi ini menggunakan **hybrid approach** untuk klasifikasi wayang:

### 1. Client-Side ML (TensorFlow.js)
- **Base Model**: MobileNetV1 (0.25_224)
- **Framework**: TensorFlow.js
- **Input Size**: 224x224 pixels
- **Preprocessing**:
  - Resize to 224x224
  - Normalize [0, 1]
  - Batch dimension expansion

### 2. Feature Extraction & Mapping
- Extract 1000-dimensional features dari MobileNet
- Calculate statistical features (mean, variance, max, min)
- Map features ke 14 karakter wayang menggunakan similarity scoring

### 3. Server-Side Fallback
- Supabase Edge Function dengan feature-based classification
- Digunakan jika TensorFlow.js tidak support di browser

## Kelas Wayang (14 Karakter)

1. **Abimanyu** - Ksatria muda Pandawa
2. **Antasena** - Putra Bima yang sakti mandraguna
3. **Arjuna** - Ahli memanah terhebat
4. **Bagong** - Punakawan termuda
5. **Bima** - Pangeran terkuat Pandawa
6. **Cepot** - Punakawan Cirebon
7. **Gareng** - Punakawan yang bijak
8. **Gatot Kaca** - Ksatria yang bisa terbang
9. **Hanoman** - Dewa kera putih
10. **Kresna** - Penasihat Pandawa
11. **Nakula** - Pangeran kembar yang tampan
12. **Petruk** - Punakawan tinggi kurus
13. **Semar** - Pemimpin punakawan
14. **Yudhistira** - Raja Pandawa yang adil

## Akurasi & Performance

### Current Implementation
- **Metode**: Feature extraction + mapping algorithm
- **Confidence Range**: 65-95%
- **Inference Time**: ~500ms (client-side), ~1s (server-side)
- **Model Size**: 1.5MB (TensorFlow.js chunk)

### Untuk Akurasi Lebih Tinggi

Untuk mendapatkan akurasi seperti repository [Wayang-Model](https://github.com/daryl1100/Wayang-Model) yang menggunakan:
- EfficientNetV2S
- MobileNetV3Large
- DeiT-Small

Anda perlu:

1. **Train Custom Model**
   - Gunakan dataset wayang yang besar
   - Fine-tune EfficientNet/MobileNet untuk 14 kelas
   - Export ke TensorFlow.js format

2. **Convert Model**
   ```bash
   tensorflowjs_converter \
     --input_format=keras \
     ./path/to/model.h5 \
     ./public/model/
   ```

3. **Update tfModel.js**
   - Ganti URL model dengan model custom
   - Sesuaikan preprocessing steps

4. **Alternative: API Hosting**
   - Host Python model di server terpisah
   - Deploy ke Replicate, Hugging Face, atau Railway
   - Call API dari edge function

## Preprocessing

```javascript
// Client-side (TensorFlow.js)
const preprocess = (image) => {
  return tf.tidy(() => {
    let tensor = tf.browser.fromPixels(image);
    tensor = tf.image.resizeBilinear(tensor, [224, 224]);
    tensor = tensor.div(255.0);
    return tensor.expandDims(0);
  });
};
```

## Optimization Tips

1. **Lazy Loading**: Model dimuat saat aplikasi start
2. **Code Splitting**: TensorFlow.js dalam chunk terpisah
3. **Caching**: Service worker cache model files
4. **WebGL Backend**: Otomatis menggunakan GPU jika tersedia

## Limitations

- Model saat ini adalah **proof of concept**
- Akurasi bergantung pada kualitas gambar
- Lighting dan angle mempengaruhi hasil
- Best practice: foto wayang dengan latar belakang jelas

## Future Improvements

1. Train model custom dengan dataset wayang yang besar
2. Implement data augmentation
3. Add model versioning
4. A/B testing multiple models
5. Collect user feedback untuk retraining

## Resources

- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [MobileNet Paper](https://arxiv.org/abs/1704.04861)
- [Wayang Classification Research](https://github.com/daryl1100/Wayang-Model)
