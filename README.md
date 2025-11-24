# 🎭 Wayang Classifier - Progressive Web App

Aplikasi Progressive Web App (PWA) untuk klasifikasi wayang menggunakan Computer Vision dan Deep Learning.

## Fitur Utama

- **📹 Real-Time Camera Scanning**: Scan wayang langsung menggunakan kamera web
- **📤 Upload Gambar**: Upload foto wayang dari device
- **📋 History**: Lihat riwayat klasifikasi dengan auto-refresh
- **📱 PWA Support**: Install di device sebagai app native
- **☁️ Cloud Storage**: History tersimpan di Supabase
- **🚀 Fast & Lightweight**: Built with Vite untuk performa optimal

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

- **React 18**: UI framework
- **Vite**: Build tool & dev server
- **PWA (Workbox)**: Service worker untuk offline support
- **Supabase**: Database dan Edge Functions
- **Hugging Face**: Vision Transformer (ViT) untuk ML inference
- **Web APIs**: Camera API, File API
- **CSS3**: Modern responsive styling

## Model Machine Learning

Aplikasi ini menggunakan **Hugging Face Vision Transformer** untuk klasifikasi:

- **Base Model**: google/vit-base-patch16-224
- **Architecture**: Vision Transformer (ViT)
- **Training**: Pre-trained ImageNet + fine-tune untuk wayang
- **Inference**: Server-side via Supabase Edge Function
- **Fallback**: Heuristic algorithm jika API tidak tersedia

Untuk meningkatkan akurasi, lihat [TRAINING_GUIDE.md](./TRAINING_GUIDE.md)

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Build untuk production:
```bash
npm run build
```

## Environment Variables

Buat file `.env` dengan isi:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Hugging Face (Optional - untuk akurasi maksimal)

1. Buat akun di [huggingface.co](https://huggingface.co)
2. Generate token di Settings > Access Tokens
3. Set secret di Supabase Edge Functions:
```bash
supabase secrets set HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
```

Tanpa HF token, aplikasi akan menggunakan fallback algorithm.

Untuk fine-tune model sendiri, lihat [TRAINING_GUIDE.md](./TRAINING_GUIDE.md)

## Cara Menggunakan

### Real-Time Camera Scanning
1. Buka tab "Scan"
2. Izinkan akses kamera
3. Arahkan kamera ke wayang
4. Klik tombol capture
5. Lihat hasil klasifikasi

### Upload Gambar
1. Buka tab "Upload"
2. Klik "Upload Gambar Wayang"
3. Pilih gambar dari device
4. Lihat hasil dan top 5 prediksi

### History
1. Buka tab "History"
2. Lihat semua klasifikasi sebelumnya
3. Klik refresh untuk update

## Struktur Project

```
.
├── index.html                   # Entry point HTML
├── vite.config.js              # Vite & PWA configuration
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── CameraView.jsx      # Real-time camera scanning
│   │   ├── CameraView.css
│   │   ├── ImagePickerView.jsx # Upload gambar
│   │   ├── ImagePickerView.css
│   │   ├── HistoryView.jsx     # History klasifikasi
│   │   └── HistoryView.css
│   └── lib/
│       └── supabase.js         # Supabase client & functions
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/
│       └── classify-wayang/    # Edge function untuk API
└── package.json
```

## PWA Features

- **Installable**: Dapat diinstall sebagai app di device
- **Offline Support**: Service worker untuk caching
- **Fast Loading**: Pre-cache assets penting
- **Mobile Optimized**: Responsive design untuk semua devices

## API

Edge Function tersedia di:
```
https://[project-id].supabase.co/functions/v1/classify-wayang
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

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers dengan Camera API support

## License

MIT
