# Production-ready Dockerfile for the Node.js backend

FROM node:18-alpine AS base

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install production dependencies only, using npm ci for reproducible builds
COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy source code
COPY . .

# The app listens on port 3000 by default
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]

