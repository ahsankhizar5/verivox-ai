FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV CONFIG_PATH=config/AASIST.conf
ENV MODEL_DEVICE=cpu
ENV LIME_NUM_CHUNKS=20
ENV LIME_NUM_SAMPLES=20
ENV MAX_PREDICT_WINDOWS=2
ENV PREDICT_TOP_K=3
ENV CM_SCORE_THRESHOLD=2.2389912605285645
ENV CM_SCORE_SCALE=1.0
ENV CONFIDENCE_THRESHOLD=0.60
ENV MEDIUM_CONFIDENCE_THRESHOLD=0.75
ENV FLAT_WINDOW_SPREAD_THRESHOLD=0.02

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libsndfile1 \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.3.1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD ["uvicorn", "verivox_api:app", "--host", "0.0.0.0", "--port", "7860"]
