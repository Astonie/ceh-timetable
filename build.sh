
#!/bin/bash
# build.sh - Custom build script replacing S2I's assemble for OpenShift
set -e

# Print build info
echo "[build.sh] Starting build for Next.js app on OpenShift UBI..."

# Install dependencies
echo "[build.sh] Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci --legacy-peer-deps
else
  npm install --legacy-peer-deps
fi

# Build the Next.js app
echo "[build.sh] Building Next.js app..."
npm run build

# Clean up unnecessary files (optional, for smaller image)
echo "[build.sh] Cleaning up..."
rm -rf /app/.cache || true
rm -rf /app/tmp || true

echo "[build.sh] Build complete."
