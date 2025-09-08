# GitHub Integration Setup for Vercel
# Your project: ceh-time-table (Project ID: prj_QDjOO6Hv3oY7NsLc1A1dzKS62Q71)

Write-Host "🔄 Optimizing GitHub Integration with Vercel..." -ForegroundColor Cyan

# Check git status
Write-Host "📊 Checking Git Status..." -ForegroundColor Yellow
git status

# Add all changes
Write-Host "📦 Adding changes..." -ForegroundColor Yellow
git add .

# Commit with deployment message
$commitMessage = "feat: Enhanced CEH platform with virtual labs and quizzes ready for production"
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push to trigger Vercel deployment
Write-Host "🚀 Pushing to GitHub (triggers Vercel deployment)..." -ForegroundColor Cyan
git push origin main

Write-Host "✅ Deployment triggered!" -ForegroundColor Green
Write-Host "🌐 Check your Vercel dashboard for deployment status" -ForegroundColor Yellow
Write-Host "📊 Live URL will be available shortly at your Vercel domain" -ForegroundColor Yellow
