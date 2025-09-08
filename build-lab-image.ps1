# Build the CEH Virtual Lab Environment
# This script creates the Docker image for the virtual lab

Write-Host "Building CEH Virtual Lab Docker Image..." -ForegroundColor Cyan

# Change to docker directory
Set-Location "c:\Users\THINKPAD -T15\Documents\ceh-time-table\docker\virtual-lab"

# Build the Docker image
docker build -t ceh-virtual-lab:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
    Write-Host "Image: ceh-virtual-lab:latest" -ForegroundColor Yellow
    
    # Create Docker network if it doesn't exist
    $networkExists = docker network ls --filter name=lab-network --format "{{.Name}}"
    if (-not $networkExists) {
        Write-Host "Creating lab-network..." -ForegroundColor Cyan
        docker network create lab-network
    }
    
    Write-Host "🎯 Virtual lab environment is ready!" -ForegroundColor Green
    Write-Host "You can now launch labs from the web interface." -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to build Docker image" -ForegroundColor Red
    exit 1
}
