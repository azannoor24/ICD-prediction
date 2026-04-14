# Build stage for frontend
FROM node:18-slim AS frontend-builder
WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies with verbose logging
RUN npm install --legacy-peer-deps --loglevel verbose || \
    (echo "npm install failed, trying without package-lock" && \
     rm -f package-lock.json && \
     npm install --legacy-peer-deps)

# Copy source files
COPY frontend/ ./

# Build
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

# Copy data folder (required)
COPY data/ data/

# Copy utils folder (for demo report)
COPY utils/ utils/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist frontend/dist

# Create necessary directories
RUN mkdir -p uploads results logs

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]
