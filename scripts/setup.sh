#!/bin/bash
# FairGig — Full Setup Script
# Run once after cloning: bash scripts/setup.sh

set -e
echo "🚀 FairGig Setup Starting..."

# ── 1. Frontend dependencies ──────────────────────────────────────────────
echo ""
echo "📦 Installing frontend dependencies (pnpm)..."
pnpm install

# ── 2. Python dependencies ────────────────────────────────────────────────
echo ""
echo "🐍 Installing Python dependencies..."
pip install -r backend/requirements.txt

# ── 3. Node.js service dependencies ──────────────────────────────────────
echo ""
echo "📦 Installing Grievance Service dependencies..."
cd backend/services/grievance_service && npm install && cd ../../..

echo ""
echo "📦 Installing Certificate Renderer dependencies..."
cd backend/services/certificate_renderer && npm install && cd ../../..

# ── 4. Check .env.local ───────────────────────────────────────────────────
echo ""
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found — creating from example..."
  cp .env.local.example .env.local
  echo "   ➡  Edit .env.local and add your NEXT_PUBLIC_SUPABASE_ANON_KEY"
else
  echo "✅ .env.local exists"
fi

# ── 5. Check backend .env ─────────────────────────────────────────────────
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env not found — please create it with POSTGRES_URL and SUPABASE_JWT_SECRET"
else
  echo "✅ backend/.env exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fill in .env.local with your Supabase ANON KEY"
echo "  2. Run the DB schema: psql \$POSTGRES_URL -f scripts/01_init_schema.sql"
echo "  3. Seed the DB: psql \$POSTGRES_URL -f scripts/03_seed_pakistan_data.sql"
echo "  4. Start everything: node scripts/run_all.js"
echo "     OR start individually:"
echo "     - Frontend:    pnpm dev"
echo "     - Auth:        cd backend/services/auth_service && python main.py"
echo "     - Earnings:    cd backend/services/earnings_service && python main.py"
echo "     - Anomaly:     cd backend/services/anomaly_service && python main.py"
echo "     - Grievance:   cd backend/services/grievance_service && node server.js"
echo "     - Analytics:   cd backend/services/analytics_service && python main.py"
echo "     - Certificate: cd backend/services/certificate_renderer && node index.js"
