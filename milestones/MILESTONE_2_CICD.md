# Milestone 2 — GitHub Actions CI/CD Pipeline ✅ COMPLETED

## What Was Done
Every `git push` to `main` now automatically:
1. Builds all 7 Docker images
2. Pushes them to AWS ECR (container registry)
3. Deploys updated images to EKS (Kubernetes on AWS)

Every Pull Request automatically:
1. Builds all images to verify nothing is broken
2. Runs ESLint on the frontend
3. Runs TypeScript type checking

---

## Files Created

```
.github/
└── workflows/
    ├── ci.yml        # Runs on every PR / push to develop
    └── deploy.yml    # Runs on push to main → builds + pushes to ECR + deploys to EKS
```

---

## ci.yml Explained

Triggers on: Pull Requests to `main` or `develop`, and pushes to `develop`

### Jobs:

**build** — Builds all 7 Docker images without pushing
- Uses `docker/build-push-action` with `push: false`
- Uses GitHub Actions cache (`type=gha`) so repeated builds are fast
- If any image fails to build, the PR is blocked

**lint** — Runs `npm run lint` on the frontend
- Catches code style issues before they reach main

**typecheck** — Runs `tsc --noEmit`
- Catches TypeScript type errors before they reach main

### Why cache?
```yaml
cache-from: type=gha    # Pull cached layers from GitHub Actions cache
cache-to: type=gha,mode=max   # Save all layers to cache after build
```
Without cache: every build downloads and compiles everything (~5-10 min)
With cache: only changed layers rebuild (~1-2 min)

---

## deploy.yml Explained

Triggers on: push to `main` only

### Steps in order:

**1. Checkout** — Gets your code onto the GitHub Actions runner (Ubuntu VM)

**2. Configure AWS credentials**
```yaml
uses: aws-actions/configure-aws-credentials@v4
with:
  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
```
Uses GitHub Secrets (not hardcoded) to authenticate with AWS.
The runner gets temporary AWS credentials to push to ECR and talk to EKS.

**3. Login to ECR**
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
```
This is what the action does under the hood. After this, `docker push` works to ECR.

**4. Set image tag**
```bash
IMAGE_TAG=${GITHUB_SHA::8}   # First 8 chars of commit hash e.g. "a1b2c3d4"
```
Every deployment gets a unique tag tied to the exact commit.
This means you can always roll back to any previous version.

**5. Build & Push all images**
Each image gets two tags:
- `fairgig-auth:a1b2c3d4` — specific to this commit (for rollbacks)
- `fairgig-auth:latest` — always points to newest version

**6. Update kubeconfig**
```bash
aws eks update-kubeconfig --name fairgig-cluster
```
Configures `kubectl` on the runner to talk to your EKS cluster.

**7. Deploy to EKS**
```bash
kubectl set image deployment/auth-service auth-service=<ecr>/fairgig-auth:a1b2c3d4
```
Tells Kubernetes to update the running containers with the new image.
Kubernetes does a rolling update — new pods start before old ones stop (zero downtime).

**8. Wait for rollout**
```bash
kubectl rollout status deployment/auth-service --timeout=120s
```
Pipeline waits until all pods are running the new version.
If pods crash, this step fails and you get notified.

**9. Verify**
```bash
kubectl get pods -n fairgig
```
Shows final state of all pods in the pipeline logs.

---

## GitHub Secrets to Configure

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Where to Get It | Example |
|-------------|----------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Console → IAM → Users → Security credentials | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Same place, shown once when created | `wJalrXUtnFEMI/K7MDENG/...` |
| `ECR_REGISTRY` | AWS Console → ECR → your registry URL | `123456789.dkr.ecr.ap-south-1.amazonaws.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGci...` |

---

## How the Full Flow Works

```
Developer pushes to main
         │
         ▼
GitHub Actions runner starts (Ubuntu VM on GitHub's servers)
         │
         ▼
Checks out your code
         │
         ▼
Logs into AWS ECR using your secrets
         │
         ▼
Builds 7 Docker images (uses cache for speed)
         │
         ▼
Pushes images to ECR with commit SHA tag
         │
         ▼
Connects to your EKS cluster
         │
         ▼
Updates each Kubernetes deployment with new image
         │
         ▼
Kubernetes does rolling update (zero downtime)
         │
         ▼
Pipeline waits for all pods to be healthy
         │
         ▼
✅ Deployment complete — new version is live
```

---

## Branch Strategy

| Branch | What happens |
|--------|-------------|
| `develop` | CI runs (build + lint + typecheck) |
| PR to `main` | CI runs (build + lint + typecheck) — must pass before merge |
| `main` | Full deploy to AWS EKS |

---

## What You Learned
- GitHub Actions workflow syntax (on, jobs, steps, uses, with)
- How to use GitHub Secrets to store AWS credentials safely
- Docker layer caching in CI for fast builds
- How to authenticate GitHub Actions with AWS
- Rolling deployments with `kubectl set image`
- Image tagging strategy (commit SHA + latest)
- Zero-downtime deployments via Kubernetes rolling updates

---

## Status
- [x] `.github/workflows/ci.yml` — PR checks (build + lint + typecheck)
- [x] `.github/workflows/deploy.yml` — Push to main → ECR + EKS deploy
- [ ] GitHub Secrets configured (needs AWS account setup in Milestone 3)
- [ ] First successful pipeline run (needs ECR + EKS from Milestone 3)
