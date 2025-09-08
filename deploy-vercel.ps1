# Vercel Deployment Script for CEH Platform
# Run this script to deploy to Vercel

Write-Host "🚀 Deploying CEH Platform to Vercel..." -ForegroundColor Cyan

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Build and test locally first
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run vercel-build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Cyan
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Deployment successful!" -ForegroundColor Green
        Write-Host "Your CEH platform is now live on Vercel!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Add environment variables in Vercel dashboard" -ForegroundColor White
        Write-Host "2. Set DATABASE_URL in Vercel environment variables" -ForegroundColor White
        Write-Host "3. Test all functionality on the live site" -ForegroundColor White
    } else {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
}
