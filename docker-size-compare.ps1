# ═══════════════════════════════════════════════════════════════════════════
# Docker Image Size Comparison Script (PowerShell)
# ═══════════════════════════════════════════════════════════════════════════
# 
# Usage:
#   .\docker-size-compare.ps1
#
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Docker Image Size Comparison" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Function to build and measure
function Build-AndMeasure {
    param(
        [string]$Name,
        [string]$Dockerfile
    )
    
    $tag = "icd-predictor:$Name"
    
    Write-Host ""
    Write-Host "━━━ Building: $Name ━━━" -ForegroundColor Blue
    Write-Host "Dockerfile: $Dockerfile"
    Write-Host ""
    
    # Build with timing
    $startTime = Get-Date
    
    try {
        docker build -t $tag -f $Dockerfile .
        
        $endTime = Get-Date
        $buildTime = ($endTime - $startTime).TotalSeconds
        
        # Get size
        $size = docker images $tag --format "{{.Size}}"
        
        Write-Host ""
        Write-Host "✓ Build successful" -ForegroundColor Green
        Write-Host "  Size: $size"
        Write-Host "  Build time: $([math]::Round($buildTime, 2))s"
        
        # Check if under 4GB
        if ($size -match "(\d+\.?\d*)GB") {
            $sizeNum = [double]$matches[1]
            if ($sizeNum -lt 4.0) {
                Write-Host "  ✓ Under 4GB limit" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Exceeds 4GB limit" -ForegroundColor Red
            }
        } else {
            Write-Host "  ✓ Under 4GB limit" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Host ""
        Write-Host "✗ Build failed: $_" -ForegroundColor Red
        return $false
    }
}

# Function to show layer breakdown
function Show-Layers {
    param([string]$Tag)
    
    Write-Host ""
    Write-Host "━━━ Layer Breakdown: $Tag ━━━" -ForegroundColor Blue
    docker history $Tag --human --format "table {{.Size}}`t{{.CreatedBy}}" | Select-Object -First 20
}

# Main comparison
Write-Host "Starting builds..."
Write-Host ""

# Build 1: Current Dockerfile (Alpine optimized)
if (Build-AndMeasure -Name "alpine" -Dockerfile "Dockerfile") {
    Show-Layers -Tag "icd-predictor:alpine"
}

# Build 2: Ultra-optimized Alpine
if (Build-AndMeasure -Name "ultra" -Dockerfile "Dockerfile.alpine-ultra") {
    Show-Layers -Tag "icd-predictor:ultra"
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

docker images icd-predictor --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}`t{{.CreatedAt}}"

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the images:"
Write-Host "     docker run -p 5000:5000 --env-file .env icd-predictor:alpine"
Write-Host "     docker run -p 5000:5000 --env-file .env icd-predictor:ultra"
Write-Host ""
Write-Host "  2. Verify functionality:"
Write-Host "     curl http://localhost:5000/api/health"
Write-Host "     curl http://localhost:5000/api/demo"
Write-Host ""
Write-Host "  3. Choose the best option and deploy"
Write-Host ""
