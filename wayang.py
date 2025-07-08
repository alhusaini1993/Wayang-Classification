import streamlit as st
import numpy as np
from PIL import Image

# ------- load TF/Keras models --------
import tensorflow as tf
import keras
keras_backend = "keras"             # pakai stand-alone Keras 3
import os; os.environ["KERAS_BACKEND"] = keras_backend
eff_model = keras.models.load_model("models/wayang_efficientnetv2s.keras")
mob_model = keras.models.load_model("models/wayang_mobilenetv3large.keras")

# ------- load PyTorch model ----------
import torch, timm
device = "cpu"
#classes = eff_model.classes_ if hasattr(eff_model, "classes_") else \
          #[d.name for d in eff_model.layers[-1].weights[0]]#  # fallback

classes=["Abimanyu", "Antasena", "Arjuna", "Bagong", "Bima", "Cepot", "Gareng",
    "Gatot Kaca", "Hanoman", "Kresna", "Nakula", "Petruk", "Semar", "Yudhistira"
]

deit = timm.create_model("deit_small_patch16_224", pretrained=False,
                         num_classes=len(classes))
deit.load_state_dict(torch.load("models/wayang_deit_small.pth", map_location=device))
deit.eval()

# ------- helper for TF models --------
def preprocess_tf(img, size=224):
    img = img.resize((size, size))
    arr = np.array(img).astype("float32") / 255.0
    return arr[np.newaxis, ...]

# ------- helper for PyTorch ----------
import torchvision.transforms as T
pt_tf = T.Compose([
    T.Resize(224), T.CenterCrop(224),
    T.ToTensor(),  T.Normalize([0.5]*3,[0.5]*3)
])

def predict_pytorch(img):
    with torch.no_grad():
        out = deit(pt_tf(img).unsqueeze(0)).softmax(1)[0]
    idx = out.argmax().item()
    return classes[idx], float(out[idx])

# ---------------- Streamlit UI ----------------
st.title("Klasifikasi Wayang – Multi-Model Demo")

uploaded = st.file_uploader("Upload gambar wayang", type=["jpg","png","jpeg"])
model_choice = st.multiselect(
    "Pilih model yang mau dijalankan",
    ["EfficientNetV2S (Keras)", "MobileNetV3Large (Keras)", "DeiT-Small (PyTorch)"],
    default=["EfficientNetV2S (Keras)"]
)

if uploaded:
    img = Image.open(uploaded).convert("RGB")
    st.image(img, caption="Gambar input", use_column_width=True)

    if "EfficientNetV2S (Keras)" in model_choice:
        pred = eff_model.predict(preprocess_tf(img))[0]
        st.write("**EfficientNet** →", classes[pred.argmax()], f"({pred.max():.2f})")

    if "MobileNetV3Large (Keras)" in model_choice:
        pred = mob_model.predict(preprocess_tf(img))[0]
        st.write("**MobileNet** →", classes[pred.argmax()], f"({pred.max():.2f})")

    if "DeiT-Small (PyTorch)" in model_choice:
        label, conf = predict_pytorch(img)
        st.write("**DeiT-Small** →", label, f"({conf:.2f})")
