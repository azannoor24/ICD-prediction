#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Docker Image Size Comparison Script
# ═══════════════════════════════════════════════════════════════════════════
# 
# Usage:
#   chmod +x docker-size-compare.sh
#   ./docker-size-compare.sh
#
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  Docker Image Size Comparison"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to build and measure
build_and_measure() {
    local name=$1
    local dockerfile=$2
    local tag="icd-predictor:${name}"
    
    echo ""
    echo "${BLUE}━━━ Building: ${name} ━━━${NC}"
    echo "Dockerfile: ${dockerfile}"
    echo ""
    
    # Build with timing
    start_time=$(date +%s)
    
    if docker build -t "${tag}" -f "${dockerfile}" . ; then
        end_time=$(date +%s)
        build_time=$((end_time - start_time))
        
        # Get size
        size=$(docker images "${tag}" --format "{{.Size}}")
        size_bytes=$(docker images "${tag}" --format "{{.Size}}" | numfmt --from=iec 2>/dev/null || echo "N/A")
        
        echo ""
        echo "${GREEN}✓ Build successful${NC}"
        echo "  Size: ${size}"
        echo "  Build time: ${build_time}s"
        
        # Check if under 4GB
        if [[ "${size}" == *"GB"* ]]; then
            size_num=$(echo "${size}" | grep -oP '[\d.]+')
            if (( $(echo "${size_num} < 4.0" | bc -l) )); then
                echo "  ${GREEN}✓ Under 4GB limit${NC}"
            else
                echo "  ${RED}✗ Exceeds 4GB limit${NC}"
            fi
        else
            echo "  ${GREEN}✓ Under 4GB limit${NC}"
        fi
        
        return 0
    else
        echo ""
        echo "${RED}✗ Build failed${NC}"
        return 1
    fi
}

# Function to show layer breakdown
show_layers() {
    local tag=$1
    echo ""
    echo "${BLUE}━━━ Layer Breakdown: ${tag} ━━━${NC}"
    docker history "${tag}" --human --format "table {{.Size}}\t{{.CreatedBy}}" | head -20
}

# Main comparison
echo "Starting builds..."
echo ""

# Build 1: Current Dockerfile (Alpine optimized)
if build_and_measure "alpine" "Dockerfile"; then
    show_layers "icd-predictor:alpine"
fi

# Build 2: Ultra-optimized Alpine
if build_and_measure "ultra" "Dockerfile.alpine-ultra"; then
    show_layers "icd-predictor:ultra"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  Summary"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

docker images icd-predictor --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo ""
echo "${YELLOW}Next steps:${NC}"
echo "  1. Test the images:"
echo "     docker run -p 5000:5000 --env-file .env icd-predictor:alpine"
echo "     docker run -p 5000:5000 --env-file .env icd-predictor:ultra"
echo ""
echo "  2. Verify functionality:"
echo "     curl http://localhost:5000/api/health"
echo "     curl http://localhost:5000/api/demo"
echo ""
echo "  3. Choose the best option and deploy"
echo ""
