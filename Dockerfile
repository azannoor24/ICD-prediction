# ═══════════════════════════════════════════════════════════════════════════
# OPTIMIZED DOCKERFILE (Debian Slim) - Target: <2GB
# ═══════════════════════════════════════════════════════════════════════════
# 
# NOTE: Alpine Linux doesn't support PyTorch (no musllinux wheels)
# Using Debian Slim with aggressive optimizations instead
#
# ═══════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Frontend Build (Alpine - minimal) ───────────────────────────
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build && \
    rm -rf node_modules src

# ─── Stage 2: Python Runtime (Debian Slim - PyTorch compatible) ────────────
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies with minimal footprint
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy and install Python dependencies
COPY requirements.txt .

# Install Python packages with AGGRESSIVE optimization
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    # AGGRESSIVE CLEANUP (saves ~1.5GB)
    rm -rf /root/.cache/pip && \
    # Remove test files from all packages
    find /usr/local/lib/python3.11 -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11 -type d -name "test" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.11 -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    # Remove .pyc and .pyo files
    find /usr/local/lib/python3.11 -type f -name "*.pyc" -delete && \
    find /usr/local/lib/python3.11 -type f -name "*.pyo" -delete && \
    # Remove source files from compiled packages (keeps only .so files)
    find /usr/local/lib/python3.11 -type f -name "*.c" -delete && \
    find /usr/local/lib/python3.11 -type f -name "*.h" -delete && \
    find /usr/local/lib/python3.11 -type f -name "*.cpp" -delete && \
    # Strip debug symbols from binaries
    find /usr/local -name "*.so" -exec strip --strip-unneeded {} + 2>/dev/null || true && \
    # Remove PyTorch test data and examples (saves ~300MB)
    rm -rf /usr/local/lib/python3.11/site-packages/torch/test 2>/dev/null || true && \
    rm -rf /usr/local/lib/python3.11/site-packages/torch/include 2>/dev/null || true && \
    # Remove unnecessary locale data
    rm -rf /usr/share/locale/* && \
    rm -rf /usr/share/man/* && \
    rm -rf /usr/share/doc/* && \
    # Final cleanup
    rm -rf /tmp/* /var/tmp/*

# Copy application files
COPY app.py icd.py ./
COPY utils/ utils/

# Copy ONLY CSV data (FAISS indices built at runtime - saves 500MB-1GB)
COPY data/*.csv data/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist frontend/dist

# Create runtime directories
RUN mkdir -p uploads results logs data && \
    chmod 755 uploads results logs data

# Environment variables for optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TRANSFORMERS_CACHE=/tmp/transformers \
    SENTENCE_TRANSFORMERS_HOME=/tmp/sentence-transformers

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health', timeout=5)" || exit 1

# Run with gunicorn (fallback to Flask dev server if needed)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:5000 --timeout 300 --workers 1 --threads 2 app:app || python app.py"]
