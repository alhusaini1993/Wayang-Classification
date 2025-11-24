import streamlit as st
import numpy as np
from PIL import Image
import cv2
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, WebRtcMode
import av

import os
os.environ["KERAS_BACKEND"] = "keras"

import tensorflow as tf
import keras
import torch
import timm
import torchvision.transforms as T

classes = ["Abimanyu", "Antasena", "Arjuna", "Bagong", "Bima", "Cepot", "Gareng",
    "Gatot Kaca", "Hanoman", "Kresna", "Nakula", "Petruk", "Semar", "Yudhistira"
]

@st.cache_resource
def load_models():
    eff_model = keras.models.load_model("models/wayang_efficientnetv2s.keras")
    mob_model = keras.models.load_model("models/wayang_mobilenetv3large.keras")

    device = "cpu"
    deit = timm.create_model("deit_small_patch16_224", pretrained=False, num_classes=len(classes))
    deit.load_state_dict(torch.load("models/wayang_deit_small.pth", map_location=device))
    deit.eval()

    return eff_model, mob_model, deit

eff_model, mob_model, deit = load_models()

def preprocess_tf(img, size=224):
    img = img.resize((size, size))
    arr = np.array(img).astype("float32") / 255.0
    return arr[np.newaxis, ...]

pt_tf = T.Compose([
    T.Resize(224), T.CenterCrop(224),
    T.ToTensor(), T.Normalize([0.5]*3, [0.5]*3)
])

def predict_pytorch(img):
    with torch.no_grad():
        out = deit(pt_tf(img).unsqueeze(0)).softmax(1)[0]
    idx = out.argmax().item()
    return classes[idx], float(out[idx])

def predict_image(img_pil, selected_model):
    results = []

    if selected_model == "EfficientNetV2S (Keras)":
        pred = eff_model.predict(preprocess_tf(img_pil), verbose=0)[0]
        label = classes[pred.argmax()]
        conf = float(pred.max())
        results.append(("EfficientNet", label, conf))

    elif selected_model == "MobileNetV3Large (Keras)":
        pred = mob_model.predict(preprocess_tf(img_pil), verbose=0)[0]
        label = classes[pred.argmax()]
        conf = float(pred.max())
        results.append(("MobileNet", label, conf))

    elif selected_model == "DeiT-Small (PyTorch)":
        label, conf = predict_pytorch(img_pil)
        results.append(("DeiT-Small", label, conf))

    return results

class WayangVideoProcessor(VideoProcessorBase):
    def __init__(self):
        self.model_name = "EfficientNetV2S (Keras)"
        self.result_text = ""
        self.confidence = 0.0

    def recv(self, frame):
        img = frame.to_ndarray(format="bgr24")

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_pil = Image.fromarray(img_rgb)

        try:
            results = predict_image(img_pil, self.model_name)
            if results:
                model, label, conf = results[0]
                self.result_text = label
                self.confidence = conf
        except Exception as e:
            self.result_text = "Error"
            self.confidence = 0.0

        cv2.putText(img, f"{self.result_text}", (10, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
        cv2.putText(img, f"Confidence: {self.confidence:.2%}", (10, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        return av.VideoFrame.from_ndarray(img, format="bgr24")

st.set_page_config(page_title="Klasifikasi Wayang", page_icon="🎭", layout="wide")

st.title("🎭 Klasifikasi Wayang - Computer Vision App")
st.markdown("Aplikasi untuk mengklasifikasikan wayang menggunakan deep learning")

tab1, tab2 = st.tabs(["📤 Upload Gambar", "📹 Scan Real-Time"])

with tab1:
    st.header("Upload Gambar Wayang")

    col1, col2 = st.columns([1, 1])

    with col1:
        uploaded = st.file_uploader("Pilih gambar wayang", type=["jpg", "png", "jpeg"])

        model_choice = st.selectbox(
            "Pilih Model",
            ["EfficientNetV2S (Keras)", "MobileNetV3Large (Keras)", "DeiT-Small (PyTorch)"]
        )

    with col2:
        if uploaded:
            img = Image.open(uploaded).convert("RGB")
            st.image(img, caption="Gambar Input", use_container_width=True)

            with st.spinner("Memproses..."):
                results = predict_image(img, model_choice)

                if results:
                    model_name, label, conf = results[0]

                    st.success(f"### Hasil Prediksi: **{label}**")
                    st.metric("Confidence", f"{conf:.2%}")

                    st.markdown("---")
                    st.markdown(f"**Model:** {model_name}")

with tab2:
    st.header("Scan Real-Time dengan Webcam")

    st.info("Arahkan kamera ke wayang untuk klasifikasi real-time")

    model_webcam = st.selectbox(
        "Pilih Model untuk Webcam",
        ["EfficientNetV2S (Keras)", "MobileNetV3Large (Keras)", "DeiT-Small (PyTorch)"],
        key="webcam_model"
    )

    ctx = webrtc_streamer(
        key="wayang-classifier",
        mode=WebRtcMode.SENDRECV,
        video_processor_factory=WayangVideoProcessor,
        media_stream_constraints={"video": True, "audio": False},
        async_processing=True,
    )

    if ctx.video_processor:
        ctx.video_processor.model_name = model_webcam

st.sidebar.title("ℹ️ Informasi")
st.sidebar.markdown("""
### Karakter Wayang:
""")

for i, character in enumerate(classes, 1):
    st.sidebar.markdown(f"{i}. {character}")

st.sidebar.markdown("---")
st.sidebar.markdown("**Model yang tersedia:**")
st.sidebar.markdown("- EfficientNetV2S")
st.sidebar.markdown("- MobileNetV3Large")
st.sidebar.markdown("- DeiT-Small")
