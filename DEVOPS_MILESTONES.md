# FairGig DevOps Milestones
> Full DevOps pipeline: Docker → CI/CD → AWS → Kubernetes → Ansible → Monitoring

## Tools Already Installed
| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 29.4.0 | Containerization |
| kubectl | v1.35.4 | Kubernetes CLI |
| Terraform | v1.14.8 | Infrastructure as Code |
| Ansible | 2.20.4 | Server configuration automation |
| Helm | v3.20.1 | Kubernetes package manager |
| Minikube | v1.38.1 | Local Kubernetes cluster |
| AWS CLI | ❌ NOT INSTALLED | Need to install |

## Architecture Overview
```
Internet
    │
    ▼
[AWS ALB Load Balancer]
    │
    ▼
[AWS EKS Kubernetes Cluster]
    ├── [Next.js Frontend]        port 3000
    ├── [Auth Service]            port 8001  (Python/FastAPI)
    ├── [Earnings Service]        port 8002  (Python/FastAPI)
    ├── [Anomaly Service]         port 8003  (Python/FastAPI)
    ├── [Grievance Service]       port 8004  (Node.js/Express)
    ├── [Analytics Service]       port 8005  (Python/FastAPI)
    └── [Certificate Renderer]    port 8006  (Node.js/Express)
    │
    ▼
[Supabase PostgreSQL] (external managed DB)
```

---

# MILESTONE 1 — Docker Containerization
**Goal**: Every service runs in its own Docker container. All containers talk to each other via docker-compose locally.

## 1.1 — Dockerfiles

### Files to create:
```
docker/
├── frontend/Dockerfile
├── auth_service/Dockerfile
├── earnings_service/Dockerfile
├── anomaly_service/Dockerfile
├── analytics_service/Dockerfile
├── grievance_service/Dockerfile
└── certificate_renderer/Dockerfile
docker-compose.yml
.dockerignore
```

### What each Dockerfile does:
- **Python services** (auth, earnings, anomaly, analytics): Use `python:3.11-slim`, install from `requirements.txt`, run with `uvicorn`
- **Node.js services** (grievance, certificate): Use `node:18-alpine`, install npm deps, run with `node`
- **Frontend** (Next.js): Multi-stage build — build stage + production stage using `node:18-alpine`

### How to build and test:
```bash
# Build all images
docker-compose build

# Start all services
docker-compose up

# Check all containers are running
docker ps

# Test a service
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
curl http://localhost:8006/health
curl http://localhost:3000
```

## 1.2 — docker-compose.yml
Single file that:
- Starts all 7 services (6 backend + 1 frontend)
- Passes environment variables from `.env` files
- Sets up a shared Docker network so services can talk to each other
- Maps ports so you can access from browser

## 1.3 — .dockerignore
Prevents `node_modules`, `.env`, `__pycache__`, `.next` from being copied into images (keeps images small and secure)

## Milestone 1 Checklist
- [ ] Dockerfile for auth_service
- [ ] Dockerfile for earnings_service
- [ ] Dockerfile for anomaly_service
- [ ] Dockerfile for analytics_service
- [ ] Dockerfile for grievance_service
- [ ] Dockerfile for certificate_renderer
- [ ] Dockerfile for frontend (Next.js)
- [ ] docker-compose.yml
- [ ] .dockerignore
- [ ] All health checks pass: `curl http://localhost:800X/health`
- [ ] Frontend loads at `http://localhost:3000`

---

# MILESTONE 2 — GitHub Actions CI/CD Pipeline
**Goal**: Every `git push` to `main` automatically builds Docker images, runs tests, and pushes to AWS ECR.

## 2.1 — AWS ECR Setup (Container Registry)
ECR = Elastic Container Registry. It's like Docker Hub but on AWS. You push your images here, and EKS pulls from here.

### Files to create:
```
.github/
└── workflows/
    ├── ci.yml          # Runs on every PR - build + test
    └── deploy.yml      # Runs on push to main - build + push to ECR + deploy to EKS
```

### What the pipeline does:
```
git push to main
    │
    ▼
GitHub Actions triggers
    │
    ├── 1. Checkout code
    ├── 2. Set up Docker Buildx
    ├── 3. Login to AWS ECR
    ├── 4. Build Docker images for all services
    ├── 5. Push images to ECR with tags (latest + commit SHA)
    ├── 6. Update Kubernetes manifests with new image tags
    └── 7. Apply manifests to EKS cluster (kubectl apply)
```

## 2.2 — GitHub Secrets to configure
In your GitHub repo → Settings → Secrets → Actions, add:
```
AWS_ACCESS_KEY_ID        → from AWS IAM user
AWS_SECRET_ACCESS_KEY    → from AWS IAM user
AWS_REGION               → ap-south-1 (or your region)
ECR_REGISTRY             → your-account-id.dkr.ecr.region.amazonaws.com
SUPABASE_URL             → already have this
SUPABASE_ANON_KEY        → already have this
SUPABASE_SERVICE_KEY     → already have this
POSTGRES_URL             → already have this
```

## Milestone 2 Checklist
- [ ] AWS account created and IAM user with ECR + EKS permissions
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] ECR repositories created for each service (7 total)
- [ ] `.github/workflows/ci.yml` created
- [ ] `.github/workflows/deploy.yml` created
- [ ] Push to main triggers pipeline
- [ ] Images appear in ECR after push

---

# MILESTONE 3 — AWS Infrastructure with Terraform
**Goal**: All AWS resources (VPC, EKS, ECR, IAM, Load Balancer) are defined as code. One command creates everything.

## 3.1 — Install AWS CLI
```bash
# Download and install
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure with your AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-south-1), Output format (json)
```

## 3.2 — Terraform File Structure
```
terraform/
├── main.tf           # Root module - calls all other modules
├── variables.tf      # Input variables (region, cluster name, etc.)
├── outputs.tf        # Output values (cluster endpoint, ECR URLs, etc.)
├── versions.tf       # Terraform and provider version constraints
└── modules/
    ├── vpc/          # VPC, subnets, internet gateway, NAT gateway
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── eks/          # EKS cluster, node groups, IAM roles
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecr/          # ECR repositories for all 7 services
    │   ├── main.tf
    │   └── outputs.tf
    └── iam/          # IAM roles and policies
        ├── main.tf
        └── outputs.tf
```

## 3.3 — What Terraform provisions:
- **VPC**: Virtual Private Cloud with public + private subnets across 2 availability zones
- **EKS Cluster**: Managed Kubernetes cluster (t3.medium nodes, 2-4 nodes auto-scaling)
- **ECR**: 7 container registries (one per service)
- **IAM Roles**: EKS cluster role, node group role, GitHub Actions deployment role
- **Security Groups**: Allow traffic between services, restrict external access

## 3.4 — How to use:
```bash
cd terraform

# Initialize (download providers)
terraform init

# Preview what will be created
terraform plan

# Create everything (takes ~15 minutes)
terraform apply

# When done, destroy everything (saves AWS costs)
terraform destroy
```

## Milestone 3 Checklist
- [ ] AWS CLI installed and configured
- [ ] AWS account has sufficient permissions
- [ ] `terraform/` directory structure created
- [ ] VPC module written and tested
- [ ] EKS module written and tested
- [ ] ECR module written and tested
- [ ] `terraform plan` shows expected resources
- [ ] `terraform apply` succeeds
- [ ] EKS cluster visible in AWS Console
- [ ] `aws eks update-kubeconfig --name fairgig-cluster` works
- [ ] `kubectl get nodes` shows running nodes

---

# MILESTONE 4 — Kubernetes Manifests + Helm Charts
**Goal**: All services deployed to EKS with proper health checks, resource limits, auto-scaling, and secrets management.

## 4.1 — Kubernetes File Structure
```
k8s/
├── namespace.yaml              # fairgig namespace
├── secrets/
│   └── app-secrets.yaml        # DB URL, Supabase keys (base64 encoded)
├── configmaps/
│   └── app-config.yaml         # Non-sensitive config
├── deployments/
│   ├── frontend.yaml
│   ├── auth-service.yaml
│   ├── earnings-service.yaml
│   ├── anomaly-service.yaml
│   ├── analytics-service.yaml
│   ├── grievance-service.yaml
│   └── certificate-renderer.yaml
├── services/
│   ├── frontend-svc.yaml
│   ├── auth-svc.yaml
│   ├── earnings-svc.yaml
│   ├── anomaly-svc.yaml
│   ├── analytics-svc.yaml
│   ├── grievance-svc.yaml
│   └── certificate-svc.yaml
├── ingress/
│   └── ingress.yaml            # AWS ALB Ingress Controller routes
└── hpa/
    └── hpa.yaml                # Horizontal Pod Autoscaler
```

## 4.2 — What each manifest does:
- **Deployment**: Defines how many replicas, which Docker image, resource limits (CPU/memory), health checks (liveness + readiness probes), environment variables from secrets
- **Service**: Exposes the deployment internally (ClusterIP) or externally (LoadBalancer)
- **Ingress**: Routes external traffic — `/api/auth/*` → auth-service, `/api/earnings/*` → earnings-service, etc.
- **HPA**: Auto-scales pods based on CPU usage (e.g., scale from 2 to 10 pods when CPU > 70%)
- **Secrets**: Stores sensitive data (DB passwords, API keys) encrypted in K8s

## 4.3 — Helm Chart Structure
```
helm/
└── fairgig/
    ├── Chart.yaml
    ├── values.yaml             # Default values (image tags, replicas, etc.)
    ├── values-prod.yaml        # Production overrides
    └── templates/
        ├── deployment.yaml
        ├── service.yaml
        ├── ingress.yaml
        └── hpa.yaml
```

## 4.4 — How to deploy:
```bash
# Test locally with minikube first
minikube start
kubectl apply -f k8s/

# Check everything is running
kubectl get pods -n fairgig
kubectl get services -n fairgig

# Deploy to EKS with Helm
helm install fairgig ./helm/fairgig -f helm/fairgig/values-prod.yaml

# Check deployment
kubectl get pods -n fairgig
kubectl logs -f deployment/auth-service -n fairgig
```

## Milestone 4 Checklist
- [ ] All K8s manifests created
- [ ] Secrets properly base64 encoded and applied
- [ ] All pods running on minikube: `kubectl get pods`
- [ ] All health checks passing: `kubectl describe pod <name>`
- [ ] Ingress routing working
- [ ] HPA configured
- [ ] Helm chart created
- [ ] Deployed to EKS with Helm
- [ ] All pods running on EKS: `kubectl get pods -n fairgig`
- [ ] App accessible via Load Balancer URL

---

# MILESTONE 5 — Ansible Automation
**Goal**: Automate server setup, configuration, and deployment tasks with Ansible playbooks.

## 5.1 — What Ansible does in this project:
- Configure EC2 bastion host (jump server for accessing EKS)
- Install and configure monitoring agents
- Automate environment setup on new machines
- Manage application secrets rotation

## 5.2 — Ansible File Structure
```
ansible/
├── inventory/
│   ├── hosts.ini           # List of servers to manage
│   └── group_vars/
│       ├── all.yml         # Variables for all hosts
│       └── ec2.yml         # EC2-specific variables
├── playbooks/
│   ├── setup-bastion.yml   # Configure EC2 bastion host
│   ├── install-tools.yml   # Install kubectl, helm, aws-cli on bastion
│   ├── deploy-app.yml      # Deploy latest version to EKS
│   └── rotate-secrets.yml  # Rotate application secrets
└── roles/
    ├── common/             # Base server setup (updates, security)
    ├── docker/             # Install and configure Docker
    └── monitoring/         # Install Prometheus node exporter
```

## 5.3 — How to use:
```bash
# Test connection to servers
ansible all -i ansible/inventory/hosts.ini -m ping

# Run setup playbook on bastion
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/setup-bastion.yml

# Deploy latest version
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy-app.yml
```

## Milestone 5 Checklist
- [ ] Ansible inventory configured with EC2 IPs
- [ ] SSH key configured for EC2 access
- [ ] `ansible all -m ping` succeeds
- [ ] Bastion host setup playbook works
- [ ] Tools installation playbook works
- [ ] Deploy playbook triggers Helm upgrade on EKS

---

# MILESTONE 6 — Monitoring with Prometheus + Grafana
**Goal**: Full observability — metrics, logs, dashboards, and alerts for all services.

## 6.1 — What to monitor:
- **Service health**: Is each service up? Response times?
- **Resource usage**: CPU, memory per pod
- **Business metrics**: Number of grievances filed, shifts logged, anomalies detected
- **Error rates**: 4xx/5xx responses per service
- **Database**: Query times, connection pool usage

## 6.2 — File Structure
```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Scrape configs for all services
│   └── alert-rules.yml         # Alert conditions
├── grafana/
│   ├── dashboards/
│   │   ├── fairgig-overview.json    # Main dashboard
│   │   ├── services-health.json     # Per-service health
│   │   └── kubernetes-cluster.json  # K8s cluster metrics
│   └── datasources/
│       └── prometheus.yml
└── k8s/
    ├── prometheus-deployment.yaml
    ├── grafana-deployment.yaml
    └── alertmanager-deployment.yaml
```

## 6.3 — Install with Helm (easiest way):
```bash
# Add Prometheus community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack (includes Prometheus + Grafana + Alertmanager)
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f monitoring/values.yml

# Access Grafana dashboard
kubectl port-forward svc/monitoring-grafana 3001:80 -n monitoring
# Open http://localhost:3001 (admin/prom-operator)
```

## 6.4 — Alerts to configure:
- Service down for > 1 minute → send alert
- Pod CPU > 80% for > 5 minutes → send alert
- Pod memory > 90% → send alert
- Error rate > 5% → send alert

## Milestone 6 Checklist
- [ ] Prometheus scraping all services
- [ ] Grafana accessible
- [ ] FairGig overview dashboard created
- [ ] Kubernetes cluster dashboard working
- [ ] Alert rules configured
- [ ] Test alert fires correctly

---

# Full Timeline

| Milestone | What | Estimated Time |
|-----------|------|----------------|
| M1 | Docker + docker-compose | 1-2 hours |
| M2 | GitHub Actions CI/CD | 1-2 hours |
| M3 | Terraform + AWS setup | 2-3 hours |
| M4 | Kubernetes + Helm | 2-3 hours |
| M5 | Ansible | 1-2 hours |
| M6 | Prometheus + Grafana | 1-2 hours |

**Total: ~2 days of focused work**

---

# Resume Bullet Points (after completion)

```
FairGig — Gig Worker Advocacy Platform | DevOps Engineer
• Containerized 6-service microservices architecture using Docker with multi-stage builds
• Built CI/CD pipeline with GitHub Actions — auto-builds, tests, and deploys on every push
• Provisioned AWS infrastructure (VPC, EKS, ECR, IAM) using Terraform IaC
• Deployed and orchestrated all services on AWS EKS using Kubernetes and Helm charts
• Automated server configuration and deployments using Ansible playbooks
• Implemented full observability stack with Prometheus metrics and Grafana dashboards
• Configured HPA for auto-scaling pods based on CPU/memory thresholds
```

---

# Start Now — Milestone 1

Run this to begin:
```bash
# We will create Dockerfiles for all 7 services
# Tell Kiro: "start milestone 1"
```
