# Multi-stage Dockerfile for Next.js app on Red Hat UBI (OpenShift-ready)
# --- Build Stage ---


FROM registry.access.redhat.com/ubi8/nodejs-20 AS builder
WORKDIR /app
USER 0
RUN chown -R 1001:0 /app


# Copy only necessary files for install
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# Ensure correct permissions for user 1001
RUN chown -R 1001:0 /app
USER 1001
# Use npm ci for clean, reproducible builds
RUN npm ci --legacy-peer-deps
# Copy only necessary files for build
COPY public ./public
COPY src ./src
COPY next.config.ts ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY jest.config.js ./
COPY jest.setup.js ./
COPY babel.config.json ./
COPY custom-buildconfig.yaml ./
COPY README.md ./


# Build Next.js app
RUN npm run build

# --- Production Stage ---

FROM registry.access.redhat.com/ubi8/nodejs-20-minimal
WORKDIR /app
LABEL io.openshift.expose-services="3000:http" \
      io.openshift.tags="nextjs,nodejs,ubi8" \
      maintainer="Lameckwh"
USER 0
RUN chown -R 1001:0 /app \
    && chgrp -R 0 /app \
    && chmod -R g=u /app
USER 1001


# Copy only necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma


# Declare volume for persistent or shared data (adjust path as needed)
VOLUME ["/app/data"]

# Expose port (default for Next.js)
EXPOSE 3000


# Set environment variable for production
ENV NODE_ENV=production

# Run Prisma migrations before starting app (if using Prisma)
RUN npx prisma generate --no-engine
CMD npx prisma migrate deploy && npx next start -p 3000

# Add healthcheck for container
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1
