# Milestone 1 — Docker Containerization ✅ COMPLETED

## What Was Done
Every service in FairGig now runs in its own isolated Docker container.
All containers are connected via a shared Docker network and managed with docker-compose.

---

## Files Created

```
docker/
├── auth_service/Dockerfile
├── earnings_service/Dockerfile
├── anomaly_service/Dockerfile
├── analytics_service/Dockerfile
├── grievance_service/Dockerfile
├── certificate_renderer/Dockerfile
└── frontend/Dockerfile
docker-compose.yml
.dockerignore
.env                  (docker-compose env vars)
next.config.mjs       (added output: standalone)
```

---

## Dockerfile Explanations

### Python Services (auth, earnings, anomaly, analytics)
All 4 Python services follow the same pattern:

```dockerfile
FROM python:3.11-slim          # Lightweight Python base image (~50MB vs ~900MB full)

WORKDIR /app                   # All commands run from /app inside container

RUN apt-get install libpq-dev gcc   # libpq-dev = PostgreSQL client headers
                                     # gcc = C compiler needed by psycopg2

COPY backend/requirements.txt .
RUN pip install -r requirements.txt  # Install FastAPI, uvicorn, psycopg2, etc.

COPY backend/services/<name>/main.py .   # Copy only the service file needed

EXPOSE 800X                    # Tell Docker which port this service listens on

HEALTHCHECK ...                # Docker checks this URL every 30s to know if container is alive

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "800X"]
# uvicorn = ASGI server that runs FastAPI
# 0.0.0.0 = listen on all interfaces (required inside Docker)
```

Why `python:3.11-slim` and not `3.14`?
- psycopg2-binary has pre-built wheels for 3.11 — no compilation needed
- Python 3.14 is too new, many packages don't have wheels yet → causes build failures

---

### Node.js Services (grievance, certificate_renderer)

```dockerfile
FROM node:18-alpine            # Alpine = tiny Linux (~5MB), node:18 = stable LTS

WORKDIR /app

COPY package.json .
RUN npm install --production   # --production skips devDependencies (nodemon etc.)
                               # Keeps image smaller and more secure

COPY server.js .               # Copy only the single service file

EXPOSE 8004 / 8006

HEALTHCHECK CMD wget -qO- http://localhost:800X/health || exit 1
# wget is available in alpine, curl is not by default

CMD ["node", "server.js"]      # Run directly with node, no dev tools
```

---

### Frontend (Next.js) — Multi-Stage Build

This is the most complex Dockerfile. It uses 3 stages:

```dockerfile
# STAGE 1: deps
FROM node:18-alpine AS deps
# Only installs node_modules
# Cached separately so rebuilds are fast if code changes but deps don't

# STAGE 2: builder  
FROM node:18-alpine AS builder
# Copies node_modules from stage 1
# Runs `npm run build` → produces optimized .next/standalone output
# This stage is heavy (includes all build tools) but gets thrown away

# STAGE 3: runner (final image)
FROM node:18-alpine AS runner
# Only copies the built output from stage 2
# Final image is tiny — no source code, no node_modules, no build tools
# Runs as non-root user (nextjs) for security

CMD ["node", "server.js"]      # Next.js standalone mode produces its own server.js
```

Why multi-stage?
- Without it: image would be ~1.5GB (includes all build tools + source)
- With it: final image is ~200MB (only the compiled output)

Why `output: 'standalone'` in next.config.mjs?
- Next.js standalone mode bundles everything needed to run into `.next/standalone/`
- Without it, you'd need to copy the entire `node_modules` into the container

---

## docker-compose.yml Explained

```yaml
networks:
  fairgig-network:              # All containers join this network
    driver: bridge              # Standard Docker bridge network

services:
  auth-service:
    build:
      context: .                # Build context = project root
      dockerfile: docker/auth_service/Dockerfile
    ports:
      - "8001:8001"             # host:container port mapping
    environment:
      - POSTGRES_URL=${POSTGRES_URL}   # Injected from .env file
    networks:
      - fairgig-network         # Joins shared network
    restart: unless-stopped     # Auto-restart if container crashes
```

The `context: .` is important — it means Docker can see the entire project
when building, so Dockerfiles can copy files from anywhere in the project.

---

## .dockerignore Explained
Prevents these from being sent to Docker during build:
- `node_modules/` — huge, gets reinstalled inside container anyway
- `.env.local` — secrets should not be baked into images
- `__pycache__/` — Python bytecode, not needed
- `.next/` — gets rebuilt inside container
- `.git/` — version history not needed in production image

---

## How to Use

```bash
# Build all 7 images (first time takes ~5-10 minutes)
docker-compose build

# Start all services
docker-compose up

# Start in background (detached)
docker-compose up -d

# Check all containers are running and healthy
docker ps

# View logs for a specific service
docker logs fairgig-auth
docker logs fairgig-frontend

# Stop everything
docker-compose down

# Rebuild a single service after code change
docker-compose build auth-service
docker-compose up -d auth-service

# Test health endpoints
curl http://localhost:8001/health   # Auth
curl http://localhost:8002/health   # Earnings
curl http://localhost:8003/health   # Anomaly
curl http://localhost:8004/health   # Grievance
curl http://localhost:8005/health   # Analytics
curl http://localhost:8006/health   # Certificate
```

---

## What You Learned
- How to write Dockerfiles for Python (FastAPI) and Node.js (Express) services
- Multi-stage Docker builds for Next.js frontend
- docker-compose for orchestrating multiple containers locally
- Docker networking — containers talk to each other by service name
- Health checks — Docker monitors if your service is actually alive
- `.dockerignore` — keeping images small and secrets out

---

## Status
- [x] Dockerfile — auth_service (Python/FastAPI, port 8001)
- [x] Dockerfile — earnings_service (Python/FastAPI, port 8002)
- [x] Dockerfile — anomaly_service (Python/FastAPI, port 8003)
- [x] Dockerfile — analytics_service (Python/FastAPI, port 8005)
- [x] Dockerfile — grievance_service (Node.js/Express, port 8004)
- [x] Dockerfile — certificate_renderer (Node.js/Express, port 8006)
- [x] Dockerfile — frontend (Next.js multi-stage, port 3000)
- [x] docker-compose.yml
- [x] .dockerignore
- [x] .env for docker-compose
- [x] next.config.mjs updated with output: standalone
