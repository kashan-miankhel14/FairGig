# FairGig 🇵🇰 — Gig Worker Income & Rights Platform

> A production-grade microservices platform with a full DevOps pipeline — containerized with Docker, orchestrated on AWS EKS with Kubernetes, automated CI/CD via GitHub Actions, infrastructure provisioned with Terraform, server configuration managed by Ansible, and full observability with Prometheus & Grafana.

---

## 🏗️ Architecture Overview

```
Internet
    │
    ▼
[AWS ALB Load Balancer]
    │
    ▼
[AWS EKS — Kubernetes Cluster]
    ├── Next.js Frontend          :3000
    ├── Auth Service              :8001  (Python/FastAPI)
    ├── Earnings Service          :8002  (Python/FastAPI)
    ├── Anomaly Service           :8003  (Python/FastAPI)
    ├── Grievance Service         :8004  (Node.js/Express)
    ├── Analytics Service         :8005  (Python/FastAPI)
    └── Certificate Renderer      :8006  (Node.js/Express)
    │
    ▼
[Supabase PostgreSQL — Managed Database]
    │
    ▼
[Prometheus + Grafana — Monitoring & Alerting]
```

---

## 🚀 DevOps Pipeline

### ✅ Milestone 1 — Docker Containerization
- Dockerfiles for all 7 services (Python/FastAPI + Node.js/Express + Next.js multi-stage)
- `docker-compose.yml` for full local development stack
- Shared Docker network for inter-service communication
- Health checks on all containers
- `.dockerignore` to keep images lean and secrets out

```bash
# Run entire stack locally
docker-compose up
```

### ✅ Milestone 2 — GitHub Actions CI/CD
- **CI pipeline** (`ci.yml`): Triggers on every push and PR — builds all Docker images, runs TypeScript checks
- **Deploy pipeline** (`deploy.yml`): Triggers on push to `main` — builds images, pushes to AWS ECR, deploys to EKS with zero-downtime rolling updates
- Docker layer caching for fast builds
- Image tagging with commit SHA for full traceability and rollback capability

```
git push to main
    → Build 7 Docker images
    → Push to AWS ECR
    → kubectl rolling update on EKS
    → Wait for all pods healthy
    → ✅ Live
```

### 🔄 Milestone 3 — Terraform (AWS Infrastructure as Code)
- VPC with public/private subnets across 2 availability zones
- EKS cluster with auto-scaling node groups (t3.medium)
- ECR repositories for all 7 services
- IAM roles and security groups
- One command to provision entire AWS infrastructure

```bash
terraform init
terraform plan
terraform apply   # Provisions full AWS stack
```

### 🔄 Milestone 4 — Kubernetes Manifests + Helm Charts
- K8s Deployments, Services, Ingress for all 7 services
- Secrets management for DB credentials and API keys
- Horizontal Pod Autoscaler (HPA) — scales pods based on CPU/memory
- Helm charts for environment-specific deployments (dev/prod)

```bash
helm install fairgig ./helm/fairgig -f values-prod.yaml
kubectl get pods -n fairgig
```

### 🔄 Milestone 5 — Ansible Automation
- Playbooks for EC2 bastion host configuration
- Automated tool installation (kubectl, helm, aws-cli)
- Deployment automation playbooks
- Secret rotation playbooks

```bash
ansible-playbook -i inventory/hosts.ini playbooks/setup-bastion.yml
ansible-playbook -i inventory/hosts.ini playbooks/deploy-app.yml
```

### 🔄 Milestone 6 — Prometheus + Grafana Monitoring
- Prometheus scraping metrics from all 7 services
- Grafana dashboards: service health, K8s cluster, business metrics
- Alerting rules: pod down, high CPU, high error rate
- Installed via Helm on the EKS cluster

```bash
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring
```

---

## 🌟 Application Features

FairGig empowers millions of Pakistani gig workers (Foodpanda riders, Careem drivers, Daraz delivery agents) with:

- **Kamaai Logger** — Log shifts across multiple platforms, bulk CSV import
- **Certified Income Statements** — Verifiable PKR income certificates for banks and landlords
- **Shikayat Board** — Community grievance board for reporting deactivations and commission hikes
- **Advocate Analytics** — Dashboard for labour advocates to spot city-wide income patterns
- **Anomaly Detection** — Statistical Z-score analysis to flag suspicious platform deductions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, TypeScript |
| Backend | Python FastAPI, Node.js Express |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Containerization | Docker, docker-compose |
| Orchestration | Kubernetes (AWS EKS), Helm |
| CI/CD | GitHub Actions |
| Infrastructure | Terraform, AWS (EKS, ECR, VPC, ALB, IAM) |
| Configuration | Ansible |
| Monitoring | Prometheus, Grafana, Alertmanager |

---

## 🗂️ Project Structure

```
FairGig/
├── app/                          # Next.js pages
├── components/                   # React components
├── backend/
│   └── services/
│       ├── auth_service/         # FastAPI — JWT auth (port 8001)
│       ├── earnings_service/     # FastAPI — shift logging (port 8002)
│       ├── anomaly_service/      # FastAPI — anomaly detection (port 8003)
│       ├── grievance_service/    # Express — grievance board (port 8004)
│       ├── analytics_service/    # FastAPI — KPI analytics (port 8005)
│       └── certificate_renderer/ # Express — income certs (port 8006)
├── docker/                       # Dockerfiles for all services
├── .github/workflows/            # CI/CD pipelines
├── terraform/                    # AWS infrastructure as code
├── k8s/                          # Kubernetes manifests
├── helm/                         # Helm charts
├── ansible/                      # Ansible playbooks
├── monitoring/                   # Prometheus & Grafana config
└── milestones/                   # DevOps milestone documentation
```

---

## 🚦 Running Locally

### Option A — Docker (Recommended)
```bash
# Clone repo
git clone https://github.com/kashan-miankhel14/fairgig-devops.git
cd fairgig-devops

# Copy env file
cp .env.example .env
# Fill in your Supabase credentials in .env

# Start everything
docker-compose up
```

### Option B — Manual
```bash
# Frontend
npm install --legacy-peer-deps
npm run dev

# Backend (activate venv first)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Each service in separate terminal
uvicorn services.auth_service.main:app --port 8001
uvicorn services.earnings_service.main:app --port 8002
uvicorn services.anomaly_service.main:app --port 8003
uvicorn services.analytics_service.main:app --port 8005
node backend/services/grievance_service/server.js
node backend/services/certificate_renderer/index.js
```

### Demo Accounts (password: `password123`)
| Role | Email |
|------|-------|
| Worker | worker@fairgig.com |
| Verifier | verifier@fairgig.com |
| Advocate | advocate@fairgig.com |

---

## 🇵🇰 Pakistani Localization
- All currency in **PKR**
- Platforms: **Foodpanda, Careem, Daraz, Bykea**
- Cities: **Karachi, Lahore, Islamabad, Rawalpindi, Peshawar**
- UI in English + Roman Urdu for accessibility

---

## 📄 License
MIT
