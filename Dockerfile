# Build stage for frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build && rm -rf node_modules

# Python runtime - use slim Debian
FROM python:3.11-slim
WORKDIR /app

# Install minimal system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python requirements
COPY requirements.txt .

# Install Python packages and clean up in one layer
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip && \
    find /usr/local/lib/python3.11 -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# Copy only necessary backend files
COPY app.py icd.py ./

# Copy only CSV data (not FAISS indices)
COPY data/*.csv data/

# Copy utils
COPY utils/ utils/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist frontend/dist

# Create directories
RUN mkdir -p uploads results logs

# Expose port
EXPOSE 5000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "--workers", "1", "app:app"]
