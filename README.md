# 🎭 Wayang Classifier Mobile App

Aplikasi mobile untuk klasifikasi wayang menggunakan Computer Vision dan Deep Learning.

## Fitur Utama

- **📹 Real-Time Scanning**: Scan wayang langsung menggunakan kamera
- **📤 Upload Gambar**: Upload foto wayang dari galeri
- **📋 History**: Lihat riwayat klasifikasi
- **🎯 14 Karakter**: Mengenali 14 karakter wayang
- **☁️ Cloud Storage**: History tersimpan di Supabase

## Karakter Wayang yang Didukung

1. Abimanyu
2. Antasena
3. Arjuna
4. Bagong
5. Bima
6. Cepot
7. Gareng
8. Gatot Kaca
9. Hanoman
10. Kresna
11. Nakula
12. Petruk
13. Semar
14. Yudhistira

## Teknologi

- **React Native + Expo**: Framework mobile
- **Supabase**: Database dan Edge Functions
- **Expo Camera**: Real-time scanning
- **Expo Image Picker**: Upload gambar
- **TypeScript**: Type safety

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan aplikasi:
```bash
npm start
```

3. Scan QR code dengan Expo Go app (iOS/Android)

## Cara Menggunakan

### Real-Time Scanning
1. Buka tab "Scan"
2. Arahkan kamera ke wayang
3. Tekan tombol capture
4. Lihat hasil klasifikasi

### Upload Gambar
1. Buka tab "Upload"
2. Pilih gambar dari galeri
3. Tunggu proses klasifikasi
4. Lihat hasil dan top 5 prediksi

### History
1. Buka tab "History"
2. Lihat semua klasifikasi sebelumnya
3. Pull to refresh untuk update

## Struktur Project

```
.
├── App.tsx                      # Main app component
├── components/
│   ├── CameraView.tsx          # Real-time scanning
│   ├── ImagePickerView.tsx     # Upload gambar
│   └── HistoryView.tsx         # History klasifikasi
├── lib/
│   └── supabase.ts             # Supabase client & functions
├── supabase/
│   └── functions/
│       └── classify-wayang/    # Edge function untuk API
├── package.json
└── app.json
```

## API

Edge Function tersedia di:
```
https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/classify-wayang
```

Request:
```json
{
  "image": "base64_encoded_image"
}
```

Response:
```json
{
  "predicted_class": "Arjuna",
  "confidence": 0.95,
  "all_predictions": [...],
  "model_used": "mobile-api-v1"
}
```

## Development

- Edit `App.tsx` untuk mengubah struktur app
- Edit components di folder `components/`
- Modifikasi Edge Function di `supabase/functions/classify-wayang/`

## License

MIT
