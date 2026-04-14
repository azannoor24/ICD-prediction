# Build stage for frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Python runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app.py .
COPY icd.py .
COPY .env .

# Copy data and utils
COPY data/ data/
COPY utils/ utils/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist frontend/dist

# Create necessary directories
RUN mkdir -p uploads results logs

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
