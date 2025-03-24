import os
import torch
from flask import Flask, request, jsonify
from google.cloud import storage
from transformers import ViTForImageClassification
import io
from PIL import Image
import torchvision.transforms as transforms

app = Flask(__name__)

#  GCS 버킷 및 모델 경로 설정
BUCKET_NAME = "leadimageupload"
MODEL_PATH = "/app/blurrcleardistinguishmodelreal.pth"  # Docker 컨테이너 내 모델 경로

# PyTorch 2.6 이상에서 모델 로딩 허용
torch.serialization.add_safe_globals([ViTForImageClassification])

#  모델 로드 (weights_only=False 설정)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = torch.load(MODEL_PATH, map_location=device, weights_only=False)
model.eval()  # 모델을 평가 모드로 전환

#  이미지 변환 설정
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # ViT 표준 Normalize 값
])

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # JSON 요청에서 이미지 URL 가져오기
        data = request.get_json()
        image_url = data.get("image_url")

        if not image_url:
            return jsonify({"error": "No image URL provided"}), 400

        # 📌 Google Cloud Storage에서 이미지 다운로드
        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(image_url)
        image_data = blob.download_as_bytes()
        
        # 이미지 변환
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        image = transform(image)
        image = image.unsqueeze(0).to(device)  # 배치 차원 추가 및 디바이스 이동

        # 모델 예측
        with torch.no_grad():
            outputs = model(image).logits
            predicted_class = outputs.argmax(1).item()
        
        # 결과 반환
        return jsonify({"prediction": "clear" if predicted_class == 1 else "blur"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080)

