# 🎯 Panduan Training Model Wayang Classification

Aplikasi sudah terintegrasi dengan **Hugging Face Vision Transformer**. Untuk mendapatkan akurasi maksimal (85-95%), Anda perlu **fine-tune model** dengan dataset wayang.

## 📋 Prerequisites

```bash
pip install transformers datasets torch torchvision pillow huggingface_hub
```

## 🗂️ Persiapan Dataset

### Struktur Folder Dataset:
```
wayang_dataset/
├── train/
│   ├── Abimanyu/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   ├── Antasena/
│   ├── Arjuna/
│   ├── Bagong/
│   ├── Bima/
│   ├── Cepot/
│   ├── Gareng/
│   ├── Gatot Kaca/
│   ├── Hanoman/
│   ├── Kresna/
│   ├── Nakula/
│   ├── Petruk/
│   ├── Semar/
│   └── Yudhistira/
└── val/
    ├── Abimanyu/
    ├── Antasena/
    └── ...
```

### Rekomendasi Dataset:
- **Minimal**: 50 gambar per kelas (700 total)
- **Ideal**: 200+ gambar per kelas (2800+ total)
- **Format**: JPG/PNG, berbagai angle dan lighting
- **Resolusi**: 224x224 atau lebih tinggi

## 🚀 Script Training

### 1. Fine-tune Vision Transformer

```python
from transformers import ViTForImageClassification, ViTImageProcessor
from transformers import TrainingArguments, Trainer
from datasets import load_dataset
import torch

# Load dataset
dataset = load_dataset('imagefolder', data_dir='./wayang_dataset')

# Load pre-trained model
model_name = "google/vit-base-patch16-224"
processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(
    model_name,
    num_labels=14,
    ignore_mismatched_sizes=True
)

# Preprocessing
def transform(examples):
    inputs = processor(examples['image'], return_tensors='pt')
    inputs['labels'] = examples['label']
    return inputs

dataset = dataset.with_transform(transform)

# Training arguments
training_args = TrainingArguments(
    output_dir="./wayang-vit-model",
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=20,
    learning_rate=2e-5,
    save_strategy="epoch",
    evaluation_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    logging_dir='./logs',
    remove_unused_columns=False,
)

# Define metrics
from sklearn.metrics import accuracy_score
import numpy as np

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    return {'accuracy': accuracy_score(labels, predictions)}

# Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset['train'],
    eval_dataset=dataset['validation'],
    compute_metrics=compute_metrics,
)

trainer.train()

# Save model
model.save_pretrained("./wayang-vit-finetuned")
processor.save_pretrained("./wayang-vit-finetuned")
```

### 2. Alternative: Fine-tune MobileNetV3

```python
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Load base model
base_model = MobileNetV3Large(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

# Freeze base layers
base_model.trainable = False

# Add custom layers
model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(256, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(14, activation='softmax')
])

# Compile
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Data augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2
)

val_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    'wayang_dataset/train',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

val_generator = val_datagen.flow_from_directory(
    'wayang_dataset/val',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

# Train
history = model.fit(
    train_generator,
    epochs=20,
    validation_data=val_generator,
    callbacks=[
        tf.keras.callbacks.ModelCheckpoint(
            'best_wayang_model.h5',
            save_best_only=True,
            monitor='val_accuracy'
        ),
        tf.keras.callbacks.EarlyStopping(
            patience=5,
            monitor='val_accuracy'
        )
    ]
)

# Save
model.save('wayang_mobilenet_final.h5')
```

## 📤 Upload Model ke Hugging Face

### 1. Login ke Hugging Face
```bash
huggingface-cli login
```

### 2. Upload Model
```python
from huggingface_hub import HfApi

api = HfApi()

# Upload model
api.upload_folder(
    folder_path="./wayang-vit-finetuned",
    repo_id="your-username/wayang-classifier",
    repo_type="model",
)

print("Model uploaded to: https://huggingface.co/your-username/wayang-classifier")
```

### 3. Update Edge Function

Setelah upload, update edge function dengan model ID Anda:

```typescript
const response = await fetch(
  'https://api-inference.huggingface.co/models/your-username/wayang-classifier',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBytes,
  }
);
```

## 🔑 Setup Hugging Face Token

1. Buat akun di [huggingface.co](https://huggingface.co)
2. Buat token di [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Set sebagai secret di Supabase:

```bash
# Di Supabase Dashboard:
# Settings > Edge Functions > Secrets
# Tambahkan: HUGGINGFACE_TOKEN = hf_xxxxxxxxxxxxx
```

Atau via CLI:
```bash
supabase secrets set HUGGINGFACE_TOKEN=hf_xxxxxxxxxxxxx
```

## 🎨 Alternative: Dataset dari Kaggle/Roboflow

### Kaggle Dataset
1. Cari "wayang dataset" di kaggle.com
2. Download dan ekstrak
3. Gunakan script training di atas

### Roboflow
1. Upload gambar ke [roboflow.com](https://roboflow.com)
2. Annotate dan augment
3. Export sebagai "Folder" format
4. Train dengan script di atas

## 📊 Evaluasi Model

```python
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# Predict on test set
predictions = model.predict(test_generator)
y_pred = np.argmax(predictions, axis=1)
y_true = test_generator.classes

# Classification report
print(classification_report(y_true, y_pred, target_names=WAYANG_CLASSES))

# Confusion matrix
cm = confusion_matrix(y_true, y_pred)
print(cm)
```

## 🚀 Deploy Options

### Option 1: Hugging Face (Recommended)
- ✅ Gratis dengan rate limit
- ✅ Auto-scaling
- ✅ Easy integration
- ❌ Rate limit ~1000 requests/day

### Option 2: Replicate
```bash
# Install Cog
pip install cog

# Create predict.py
# Deploy to replicate.com
```

### Option 3: AWS Lambda + S3
- Upload model ke S3
- Create Lambda dengan inference code
- Update edge function untuk call Lambda

### Option 4: Self-host dengan FastAPI
```python
from fastapi import FastAPI, File, UploadFile
from transformers import pipeline

app = FastAPI()
classifier = pipeline("image-classification", model="./wayang-model")

@app.post("/classify")
async def classify(file: UploadFile):
    image = await file.read()
    result = classifier(image)
    return result
```

## 📈 Expected Results

Dengan dataset yang baik dan training proper:

| Metode | Akurasi | Training Time |
|--------|---------|---------------|
| ViT Base | 85-92% | 2-3 jam (GPU) |
| MobileNetV3 | 82-88% | 1-2 jam (GPU) |
| EfficientNetV2 | 88-95% | 3-4 jam (GPU) |

## 🔥 Tips untuk Akurasi Maksimal

1. **Data Augmentation**: Rotate, flip, zoom, brightness
2. **Class Balancing**: Sama jumlah gambar per kelas
3. **Mixed Resolution**: Training dengan berbagai resolusi
4. **Ensemble**: Combine multiple models
5. **Test-Time Augmentation**: Predict multiple augmented versions
6. **Transfer Learning**: Start dari model pre-trained

## 📞 Support

Jika Anda:
- ✅ Punya dataset → Saya bantu setup training
- ✅ Sudah train model → Saya bantu integrasi
- ✅ Butuh HF token → Ikuti guide di atas

Model Vision Transformer sudah terintegrasi, tinggal tambahkan HUGGINGFACE_TOKEN dan model akan otomatis digunakan! 🎉
