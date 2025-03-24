# Python 3.9 Slim 기반 컨테이너 사용
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# 서비스 계정 키 복사 (Google Cloud 인증)
COPY service-account-key.json /app/service-account-key.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json

# 필수 패키지 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 📌 모델 파일 복사 (✅ 추가된 부분)
COPY blurrcleardistinguishmodelreal.pth /app/blurrcleardistinguishmodelreal.pth

# 앱 코드 복사
COPY . .

# Flask 실행 포트 설정
ENV PORT=8080

# 🚀 Gunicorn 실행 시 worker 개수를 1개로 설정 + timeout 증가
CMD ["gunicorn", "--workers", "1", "--timeout", "300", "--bind", "0.0.0.0:8080", "main:app"]
