# 🚀 Quick Start - Wayang Classifier

## Opsi 1: Gunakan Hugging Face API (Akurasi Lebih Tinggi)

### Step 1: Dapatkan Hugging Face Token
1. Buat akun gratis di [huggingface.co](https://huggingface.co/join)
2. Pergi ke [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Klik "New token" → Pilih "Read" → Copy token

### Step 2: Set Token di Supabase
Via Dashboard Supabase:
1. Buka project di [supabase.com](https://supabase.com)
2. Pergi ke **Settings > Edge Functions**
3. Klik **Add Secret**
4. Name: `HUGGINGFACE_TOKEN`
5. Value: `hf_xxxxxxxxxxxxx` (paste token Anda)
6. Save

Atau via CLI:
```bash
supabase secrets set HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
```

### Step 3: Deploy & Test
```bash
npm run build
```

Aplikasi sekarang akan menggunakan **Vision Transformer** dari Hugging Face!

**Akurasi yang diharapkan**: 70-85% (dengan pre-trained model)

---

## Opsi 2: Tanpa Hugging Face (Cepat tapi Akurasi Rendah)

Aplikasi akan otomatis menggunakan **fallback algorithm** jika tidak ada HF token.

**Akurasi**: ~40-60% (heuristik-based)

---

## Opsi 3: Fine-tune Model Custom (Akurasi Maksimal 90%+)

Untuk akurasi terbaik, Anda perlu fine-tune model dengan dataset wayang sendiri.

### Quick Steps:

1. **Kumpulkan Dataset**
   - Minimal 50 gambar per kelas (14 kelas = 700 gambar)
   - Ideal: 200+ gambar per kelas
   - Format: JPG/PNG dengan berbagai angle

2. **Train Model**
   ```bash
   pip install transformers datasets torch
   ```

   Gunakan script di [TRAINING_GUIDE.md](./TRAINING_GUIDE.md)

3. **Upload ke Hugging Face**
   ```bash
   huggingface-cli login
   huggingface-cli upload your-username/wayang-model ./model
   ```

4. **Update Edge Function**
   Edit `supabase/functions/classify-wayang/index.ts`:
   ```typescript
   const response = await fetch(
     'https://api-inference.huggingface.co/models/your-username/wayang-model',
     // ...
   );
   ```

5. **Deploy**
   ```bash
   npm run build
   ```

**Akurasi yang diharapkan**: 85-95%

---

## Dataset Resources

### Dimana Cari Dataset Wayang?

1. **Google Images**
   - Search: "wayang kulit [nama karakter]"
   - Gunakan browser extension untuk batch download

2. **Kaggle**
   - Cari "wayang dataset" atau "puppet dataset"

3. **Instagram/Pinterest**
   - Hashtag: #wayangkulit #wayangorang
   - Gunakan tools seperti instaloader

4. **Manual Photography**
   - Foto sendiri wayang dari museum/sanggar
   - Berbagai angle dan lighting

### Dataset Quality Tips:
- ✅ High resolution (min 224x224)
- ✅ Clear subject (wayang sebagai fokus utama)
- ✅ Varied backgrounds
- ✅ Different lighting conditions
- ✅ Multiple angles
- ❌ Blurry images
- ❌ Heavily edited/filtered
- ❌ Multiple characters in one image

---

## Testing Your Model

### Test Locally
```bash
npm run dev
```

### Test Images
Coba dengan berbagai gambar:
- ✅ Close-up wayang
- ✅ Full body wayang
- ✅ Different backgrounds
- ✅ Different lighting

### Expected Results

**Dengan Hugging Face (pre-trained)**:
- Punakawan (Semar, Bagong, dll): 60-75%
- Ksatria (Arjuna, Bima, dll): 65-80%
- Special characters (Hanoman): 70-85%

**Dengan Fine-tuned Model**:
- Semua karakter: 85-95%
- Top-5 accuracy: 95-99%

---

## Troubleshooting

### "Model is loading" error
- Tunggu 30-60 detik, model sedang warm up
- Retry request

### Low accuracy
- ❌ Tidak ada HF token → Set token (Opsi 1)
- ❌ Pre-trained model → Fine-tune (Opsi 3)
- ❌ Poor image quality → Gunakan gambar berkualitas tinggi
- ❌ Wrong character → Periksa dataset training

### Rate limit error
- Hugging Face free tier: ~1000 requests/hari
- Upgrade ke Pro atau host model sendiri

---

## Production Deployment

### Hosting Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm run build
   # Upload dist/ folder ke Netlify
   ```

3. **Supabase Hosting**
   ```bash
   supabase storage upload public dist/
   ```

### Performance Tips
- ✅ Enable gzip compression
- ✅ Use CDN untuk assets
- ✅ Lazy load components
- ✅ Cache API responses
- ✅ Optimize images before upload

---

## Next Steps

1. ✅ Set up Hugging Face token (5 menit)
2. ✅ Test aplikasi dengan gambar wayang
3. 📊 Collect feedback tentang akurasi
4. 🎯 Jika perlu akurasi lebih tinggi → Fine-tune model
5. 🚀 Deploy ke production

---

## Support & Resources

- 📖 [Training Guide](./TRAINING_GUIDE.md) - Detailed training tutorial
- 📖 [Model Info](./MODEL_INFO.md) - Model architecture details
- 🤗 [Hugging Face Docs](https://huggingface.co/docs)
- 📚 [Transformers Library](https://huggingface.co/docs/transformers)

**Good luck! 🎭**
