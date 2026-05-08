# FairGig — Gig Worker Advocacy Platform

> A full-stack microservices platform for gig worker rights in Pakistan, with a complete production-grade DevOps pipeline deployed on AWS.

[![CI](https://github.com/kashan-miankhel14/fairgig-devops/actions/workflows/ci.yml/badge.svg)](https://github.com/kashan-miankhel14/fairgig-devops/actions/workflows/ci.yml)
[![Deploy](https://github.com/kashan-miankhel14/fairgig-devops/actions/workflows/deploy.yml/badge.svg)](https://github.com/kashan-miankhel14/fairgig-devops/actions/workflows/deploy.yml)

---

## What Is FairGig?

FairGig helps gig workers (Foodpanda, Careem, Daraz riders) in Pakistan track their earnings, file grievances, detect wage anomalies, and generate verified income certificates for banks and landlords.

---

## Tech Stack

### Application
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Shadcn/UI |
| Auth Service | Python, FastAPI, JWT, bcrypt |
| Earnings Service | Python, FastAPI, PostgreSQL |
| Anomaly Detection | Python, FastAPI, Statistical Analysis (Z-score) |
| Analytics Service | Python, FastAPI, Aggregate KPIs |
| Grievance Service | Node.js, Express.js |
| Certificate Renderer | Node.js, Express.js, HTML/PDF generation |
| Database | Supabase (PostgreSQL) |

### DevOps Pipeline
| Tool | Purpose |
|------|---------|
| Docker | Containerization of all 7 services |
| Docker Compose | Local development orchestration |
| GitHub Actions | CI/CD — build, test, deploy on every push |
| Terraform | Infrastructure as Code — AWS provisioning |
| AWS EKS | Managed Kubernetes cluster |
| AWS ECR | Container registry |
| AWS VPC | Networking — subnets, security groups |
| Kubernetes | Container orchestration, auto-scaling |
| Helm | Kubernetes package management |
| Ansible | Server configuration automation |
| Prometheus | Metrics collection |
| Grafana | Monitoring dashboards and alerts |

---

## Architecture

```
Internet
    │
    ▼
[AWS ALB — Application Load Balancer]
    │
    ▼
[AWS EKS — Kubernetes Cluster]
    ├── frontend          (Next.js)          :3000
    ├── auth-service      (FastAPI)          :8001
    ├── earnings-service  (FastAPI)          :8002
    ├── anomaly-service   (FastAPI)          :8003
    ├── grievance-service (Express.js)       :8004
    ├── analytics-service (FastAPI)          :8005
    └── certificate-svc   (Express.js)       :8006
    │
    ▼
[Supabase PostgreSQL — Managed Database]
```

---

## DevOps Pipeline

```
git push to main
      │
      ▼
GitHub Actions CI
      ├── Build all 7 Docker images
      ├── TypeScript type check
      └── Push images to AWS ECR
      │
      ▼
Deploy to AWS EKS
      ├── kubectl rolling update (zero downtime)
      ├── Health check all pods
      └── Verify deployment
      │
      ▼
Monitoring (Prometheus + Grafana)
      ├── Service health dashboards
      ├── Resource usage per pod
      └── Alerts on failures
```

---

## Project Structure

```
fairgig-devops/
├── app/                          # Next.js pages
│   ├── dashboard/
│   ├── shift-logs/
│   ├── grievance/
│   ├── verifications/
│   ├── advocate/
│   └── profile/
├── backend/
│   └── services/
│       ├── auth_service/         # FastAPI — JWT auth
│       ├── earnings_service/     # FastAPI — shift logging
│       ├── anomaly_service/      # FastAPI — anomaly detection
│       ├── analytics_service/    # FastAPI — KPI analytics
│       ├── grievance_service/    # Express.js — grievances
│       └── certificate_renderer/ # Express.js — income certs
├── docker/                       # Dockerfiles for all services
├── .github/workflows/            # GitHub Actions CI/CD
├── terraform/                    # AWS infrastructure as code
├── k8s/                          # Kubernetes manifests
├── helm/                         # Helm charts
├── ansible/                      # Ansible playbooks
├── monitoring/                   # Prometheus + Grafana config
├── milestones/                   # DevOps milestone documentation
└── docker-compose.yml            # Local development
```

---

## Running Locally

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### Quick Start

```bash
# Clone the repo
git clone https://github.com/kashan-miankhel14/fairgig-devops.git
cd fairgig-devops

# Copy env file and fill in your Supabase credentials
cp .env.example .env

# Start all services with Docker Compose
docker-compose up

# Or run without Docker
npm install --legacy-peer-deps
npm run dev:all
```

Services will be available at:
- Frontend: http://localhost:3000
- Auth: http://localhost:8001/health
- Earnings: http://localhost:8002/health
- Anomaly: http://localhost:8003/health
- Grievance: http://localhost:8004/health
- Analytics: http://localhost:8005/health
- Certificate: http://localhost:8006/health

---

## DevOps Milestones

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Docker containerization of all 7 services | ✅ Complete |
| 2 | GitHub Actions CI/CD pipeline | ✅ Complete |
| 3 | Terraform — AWS VPC, EKS, ECR provisioning | 🔄 In Progress |
| 4 | Kubernetes manifests + Helm charts | 🔄 In Progress |
| 5 | Ansible server configuration playbooks | 🔄 In Progress |
| 6 | Prometheus + Grafana monitoring stack | 🔄 In Progress |

---

## CI/CD Pipeline Details

### On every Pull Request / push to develop:
- Builds Docker images for all 6 backend services
- Runs TypeScript type checking

### On push to main:
- Builds and pushes all 7 images to AWS ECR
- Tags images with commit SHA for traceability
- Deploys to AWS EKS via `kubectl set image`
- Waits for rolling update to complete
- Verifies all pods are healthy

---

## Infrastructure (Terraform)

Provisions on AWS:
- **VPC** with public/private subnets across 2 availability zones
- **EKS Cluster** — managed Kubernetes (t3.medium nodes, auto-scaling 2-4)
- **ECR** — 7 container registries (one per service)
- **IAM Roles** — EKS cluster role, node group role, CI/CD deployment role
- **Security Groups** — least-privilege network access

```bash
cd terraform
terraform init
terraform plan
terraform apply   # Provisions entire AWS infrastructure
```

---

## Kubernetes Deployment

```bash
# Deploy to EKS
helm install fairgig ./helm/fairgig -f helm/fairgig/values-prod.yaml

# Check pods
kubectl get pods -n fairgig

# View logs
kubectl logs -f deployment/auth-service -n fairgig
```

---

## Monitoring

Prometheus scrapes metrics from all services every 15 seconds.
Grafana dashboards show:
- Service uptime and response times
- Pod CPU and memory usage
- Error rates per service
- Business metrics (grievances filed, shifts logged, anomalies detected)

```bash
# Access Grafana
kubectl port-forward svc/grafana 3001:80 -n monitoring
# Open http://localhost:3001
```

---

## Environment Variables

Copy `.env.example` and fill in your values:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
POSTGRES_URL=postgresql://postgres:password@host:5432/postgres
SUPABASE_JWT_SECRET=your-jwt-secret

# Frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Author

**Kashan Saeed**
- GitHub: [@kashan-miankhel14](https://github.com/kashan-miankhel14)
- LinkedIn: [kashan-saeed-942548375](https://linkedin.com/in/kashan-saeed-942548375)
- Email: kashanmiankhel922@gmail.com
