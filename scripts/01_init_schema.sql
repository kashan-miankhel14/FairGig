-- FairGig Platform Database Schema
-- This schema supports multi-service architecture for earnings tracking, verification, and grievance management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (for all roles: worker, verifier, advocate)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('worker', 'verifier', 'advocate')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Shifts/Earnings table - raw earnings data per worker
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(5,2) NOT NULL,
  gross_earnings DECIMAL(10,2) NOT NULL,
  platform_fees DECIMAL(10,2) DEFAULT 0,
  net_earnings DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'logged' CHECK (status IN ('logged', 'verified', 'flagged', 'disputed')),
  screenshot_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  city VARCHAR(100)
);

-- Screenshot verification queue - for verifier review
CREATE TABLE screenshot_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'rejected')),
  verifier_id UUID REFERENCES users(id),
  verification_notes TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly detection flags - statistical outliers and suspicious patterns
CREATE TABLE anomaly_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  flag_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  detection_method VARCHAR(100),
  statistical_value DECIMAL(10,4),
  threshold_value DECIMAL(10,4),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  resolution_notes TEXT
);

-- Income aggregation cache - city-wide statistics
CREATE TABLE earnings_aggregation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  median_hourly_rate DECIMAL(10,2) NOT NULL,
  average_hourly_rate DECIMAL(10,2) NOT NULL,
  min_hourly_rate DECIMAL(10,2),
  max_hourly_rate DECIMAL(10,2),
  sample_size INTEGER,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city, state, platform, date_range_start, date_range_end)
);

-- Income certificates - official verified income statements
CREATE TABLE income_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_gross_earnings DECIMAL(12,2) NOT NULL,
  total_platform_fees DECIMAL(12,2),
  total_net_earnings DECIMAL(12,2) NOT NULL,
  verified_by UUID REFERENCES users(id),
  verification_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  print_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Grievances - worker complaints and issues
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'escalated', 'closed')),
  tags TEXT[],
  assigned_advocate_id UUID REFERENCES users(id),
  resolution_notes TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grievance comments - community discussion on grievances
CREATE TABLE grievance_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grievance_id UUID NOT NULL REFERENCES grievances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CSV imports - track bulk upload history
CREATE TABLE csv_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_rows INTEGER,
  successfully_imported INTEGER,
  failed_rows INTEGER,
  error_details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_shifts_worker_id ON shifts(worker_id);
CREATE INDEX idx_shifts_platform ON shifts(platform);
CREATE INDEX idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX idx_shifts_city ON shifts(city);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_screenshot_verifications_status ON screenshot_verifications(status);
CREATE INDEX idx_screenshot_verifications_shift_id ON screenshot_verifications(shift_id);
CREATE INDEX idx_anomaly_flags_worker_id ON anomaly_flags(worker_id);
CREATE INDEX idx_anomaly_flags_status ON anomaly_flags(status);
CREATE INDEX idx_grievances_worker_id ON grievances(worker_id);
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_assigned_advocate ON grievances(assigned_advocate_id);
CREATE INDEX idx_earnings_aggregation_city_platform ON earnings_aggregation(city, platform);
CREATE INDEX idx_income_certificates_worker_id ON income_certificates(worker_id);
CREATE INDEX idx_income_certificates_status ON income_certificates(status);
CREATE INDEX idx_csv_imports_worker_id ON csv_imports(worker_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for updated_at columns
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_screenshot_verifications_updated_at BEFORE UPDATE ON screenshot_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_grievances_updated_at BEFORE UPDATE ON grievances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_grievance_comments_updated_at BEFORE UPDATE ON grievance_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
