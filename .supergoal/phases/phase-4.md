# Phase 4: Docker Configuration

## Objective
Containerize CaliGuide for consistent deployment.

## Tasks

### 4.1 Create Dockerfile
**File**: `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

### 4.2 Create docker-compose.yml
**File**: `docker-compose.yml`

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./data:/app/data
```

### 4.3 Create .dockerignore
**File**: `.dockerignore`

```
node_modules
dist
.git
.env
*.db
```

## Verification
- [ ] Docker image builds
- [ ] Container runs
- [ ] App accessible at localhost:3000
