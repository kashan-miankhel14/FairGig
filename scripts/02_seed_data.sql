-- Seed realistic test data for FairGig Platform

-- Insert test users
INSERT INTO users (id, email, password_hash, full_name, role, city, state, country, status) VALUES
-- Workers
('550e8400-e29b-41d4-a716-446655440001', 'alex.thompson@example.com', 'hashed_pwd_1', 'Alex Thompson', 'worker', 'San Francisco', 'CA', 'USA', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'jordan.smith@example.com', 'hashed_pwd_2', 'Jordan Smith', 'worker', 'San Francisco', 'CA', 'USA', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'maria.garcia@example.com', 'hashed_pwd_3', 'Maria Garcia', 'worker', 'Chicago', 'IL', 'USA', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'james.wilson@example.com', 'hashed_pwd_4', 'James Wilson', 'worker', 'New York', 'NY', 'USA', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'sarah.johnson@example.com', 'hashed_pwd_5', 'Sarah Johnson', 'worker', 'Los Angeles', 'CA', 'USA', 'active'),
-- Verifiers
('550e8400-e29b-41d4-a716-446655440010', 'verifier.one@fairgig.com', 'hashed_pwd_10', 'Elena Rodriguez', 'verifier', 'San Francisco', 'CA', 'USA', 'active'),
('550e8400-e29b-41d4-a716-446655440011', 'verifier.two@fairgig.com', 'hashed_pwd_11', 'Michael Chen', 'verifier', 'Chicago', 'IL', 'USA', 'active'),
-- Advocates
('550e8400-e29b-41d4-a716-446655440020', 'advocate.lead@fairgig.com', 'hashed_pwd_20', 'Patricia Brown', 'advocate', 'National', 'HQ', 'USA', 'active');

-- Insert shifts for Alex Thompson (worker 1)
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Uber Eats', '2024-01-20', '09:00:00', '13:15:00', 4.25, 124.50, 12.45, 112.05, 'verified', 'San Francisco'),
('550e8400-e29b-41d4-a716-446655440001', 'Uber Eats', '2024-01-21', '18:00:00', '22:30:00', 4.50, 156.00, 15.60, 140.40, 'verified', 'San Francisco'),
('550e8400-e29b-41d4-a716-446655440001', 'DoorDash', '2024-01-22', '10:00:00', '14:45:00', 4.75, 88.20, 8.82, 79.38, 'verified', 'San Francisco'),
('550e8400-e29b-41d4-a716-446655440001', 'Instacart', '2024-01-23', '08:30:00', '13:15:00', 4.75, 210.15, 21.01, 189.14, 'verified', 'San Francisco'),
('550e8400-e29b-41d4-a716-446655440001', 'Uber Eats', '2024-01-24', '19:00:00', '23:45:00', 4.75, 178.50, 17.85, 160.65, 'logged', 'San Francisco');

-- Insert shifts for Jordan Smith (worker 2) - in Chicago
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'DoorDash', '2024-01-20', '11:00:00', '15:45:00', 4.75, 85.50, 8.55, 76.95, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440002', 'Uber Eats', '2024-01-21', '09:30:00', '14:00:00', 4.50, 108.00, 10.80, 97.20, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440002', 'Last-Mile Logistics', '2024-01-22', '08:00:00', '16:30:00', 8.50, 289.00, 28.90, 260.10, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440002', 'Instacart', '2024-01-23', '14:00:00', '18:30:00', 4.50, 198.75, 19.87, 178.88, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440002', 'DoorDash', '2024-01-24', '20:00:00', '23:45:00', 3.75, 67.50, 6.75, 60.75, 'logged', 'Chicago');

-- Insert shifts for Maria Garcia (worker 3) - Chicago
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Uber Eats', '2024-01-20', '10:00:00', '14:30:00', 4.50, 103.50, 10.35, 93.15, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440003', 'DoorDash', '2024-01-21', '15:00:00', '19:45:00', 4.75, 80.75, 8.07, 72.68, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440003', 'Instacart', '2024-01-22', '09:00:00', '13:15:00', 4.25, 191.25, 19.12, 172.13, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440003', 'Home Care Support', '2024-01-23', '08:00:00', '16:00:00', 8.00, 280.00, 28.00, 252.00, 'verified', 'Chicago'),
('550e8400-e29b-41d4-a716-446655440003', 'Uber Eats', '2024-01-24', '17:00:00', '21:30:00', 4.50, 117.00, 11.70, 105.30, 'verified', 'Chicago');

-- Insert shifts for James Wilson (worker 4) - New York
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'Uber Eats', '2024-01-20', '12:00:00', '16:30:00', 4.50, 135.00, 13.50, 121.50, 'verified', 'New York'),
('550e8400-e29b-41d4-a716-446655440004', 'DoorDash', '2024-01-21', '10:00:00', '15:15:00', 5.25, 94.50, 9.45, 85.05, 'verified', 'New York'),
('550e8400-e29b-41d4-a716-446655440004', 'Instacart', '2024-01-22', '08:30:00', '13:00:00', 4.50, 216.00, 21.60, 194.40, 'verified', 'New York'),
('550e8400-e29b-41d4-a716-446655440004', 'Amazon Flex', '2024-01-23', '11:00:00', '19:00:00', 8.00, 304.00, 30.40, 273.60, 'verified', 'New York'),
('550e8400-e29b-41d4-a716-446655440004', 'Uber Eats', '2024-01-24', '18:00:00', '22:45:00', 4.75, 142.50, 14.25, 128.25, 'logged', 'New York');

-- Insert shifts for Sarah Johnson (worker 5) - Los Angeles
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'DoorDash', '2024-01-20', '09:00:00', '13:45:00', 4.75, 95.00, 9.50, 85.50, 'verified', 'Los Angeles'),
('550e8400-e29b-41d4-a716-446655440005', 'Uber Eats', '2024-01-21', '14:00:00', '18:30:00', 4.50, 112.50, 11.25, 101.25, 'verified', 'Los Angeles'),
('550e8400-e29b-41d4-a716-446655440005', 'Instacart', '2024-01-22', '10:00:00', '14:45:00', 4.75, 237.50, 23.75, 213.75, 'verified', 'Los Angeles'),
('550e8400-e29b-41d4-a716-446655440005', 'Uber Eats', '2024-01-23', '19:00:00', '23:30:00', 4.50, 126.00, 12.60, 113.40, 'verified', 'Los Angeles'),
('550e8400-e29b-41d4-a716-446655440005', 'DoorDash', '2024-01-24', '15:00:00', '19:45:00', 4.75, 85.50, 8.55, 76.95, 'logged', 'Los Angeles');

-- Insert earnings aggregation data (city-wide statistics)
INSERT INTO earnings_aggregation (city, state, platform, date_range_start, date_range_end, median_hourly_rate, average_hourly_rate, min_hourly_rate, max_hourly_rate, sample_size) VALUES
('San Francisco', 'CA', 'Uber Eats', '2024-01-15', '2024-01-25', 29.25, 30.50, 25.00, 38.00, 145),
('San Francisco', 'CA', 'DoorDash', '2024-01-15', '2024-01-25', 18.50, 19.25, 15.00, 24.00, 132),
('San Francisco', 'CA', 'Instacart', '2024-01-15', '2024-01-25', 44.25, 46.75, 35.00, 58.00, 98),
('Chicago', 'IL', 'Uber Eats', '2024-01-15', '2024-01-25', 24.00, 25.15, 18.00, 32.00, 167),
('Chicago', 'IL', 'DoorDash', '2024-01-15', '2024-01-25', 16.75, 17.50, 12.00, 22.00, 156),
('Chicago', 'IL', 'Last-Mile Logistics', '2024-01-15', '2024-01-25', 34.00, 35.20, 28.00, 42.00, 89),
('New York', 'NY', 'Uber Eats', '2024-01-15', '2024-01-25', 30.00, 31.25, 25.00, 40.00, 189),
('New York', 'NY', 'DoorDash', '2024-01-15', '2024-01-25', 18.00, 18.75, 14.00, 25.00, 176),
('Los Angeles', 'CA', 'Uber Eats', '2024-01-15', '2024-01-25', 25.00, 26.50, 20.00, 34.00, 154),
('Los Angeles', 'CA', 'DoorDash', '2024-01-15', '2024-01-25', 17.00, 18.00, 13.00, 23.00, 142);

-- Insert income certificates
INSERT INTO income_certificates (worker_id, certificate_number, period_start, period_end, total_gross_earnings, total_platform_fees, total_net_earnings, verified_by, verification_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'FG-2023-8842-X', '2023-10-01', '2023-12-31', 16200.00, 1620.00, 14580.00, '550e8400-e29b-41d4-a716-446655440010', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440002', 'FG-2023-9156-Y', '2023-10-01', '2023-12-31', 14850.00, 1485.00, 13365.00, '550e8400-e29b-41d4-a716-446655440010', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440003', 'FG-2023-7823-Z', '2023-10-01', '2023-12-31', 18540.00, 1854.00, 16686.00, '550e8400-e29b-41d4-a716-446655440011', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440004', 'FG-2024-0001-A', '2024-01-01', '2024-01-31', 8620.00, 862.00, 7758.00, NULL, NULL, 'pending'),
('550e8400-e29b-41d4-a716-446655440005', 'FG-2024-0002-B', '2024-01-01', '2024-01-31', 7880.00, 788.00, 7092.00, NULL, NULL, 'pending');

-- Insert grievances
INSERT INTO grievances (worker_id, platform, title, description, category, severity, status, tags, assigned_advocate_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Uber', 'Unjust account deactivation without clear explanation in Seattle region', 'I woke up this morning to find my Pro-Gold account deactivated. The reason cited was "Safety Concern" but I have a 4.98 rating and perfect delivery record. No specific incident was mentioned. This is a critical livelihoods issue.', 'deactivation', 'high', 'in_review', ARRAY['account_access', 'deactivation', 'safety_concern'], '550e8400-e29b-41d4-a716-446655440020'),
('550e8400-e29b-41d4-a716-446655440002', 'DoorDash', 'Missing payment for multi-drop delivery batch #88291', 'Completed a heavy 5-stop batch during rain peak hours. App crashed upon final delivery and the $42 earnings are nowhere in my account. Support says it''s under review but no timeline given.', 'payment', 'high', 'open', ARRAY['payment_issue', 'batch_delivery'], NULL),
('550e8400-e29b-41d4-a716-446655440003', 'Instacart', 'Tip baiting and metric suppression after refusal', 'Customer added $25 tip, then removed it after I delivered. My metrics dropped by 0.15 points which affected my batch eligibility. No recourse offered.', 'tip_baiting', 'medium', 'resolved', ARRAY['tip_theft', 'metrics'], '550e8400-e29b-41d4-a716-446655440020'),
('550e8400-e29b-41d4-a716-446655440004', 'Amazon Flex', 'Non-existent address block and wage theft', 'Assigned to deliver to a rural address that doesn''t exist. Spent 2.5 hours investigating and drove $12 in gas for no payment. Amazon support refused the wage claim.', 'navigation', 'high', 'escalated', ARRAY['wage_theft', 'invalid_assignment'], NULL),
('550e8400-e29b-41d4-a716-446655440005', 'Last-Mile Logistics', 'Unsafe working conditions and vehicle violations', 'Required to use personal vehicle for heavy industrial deliveries. No insurance offered. Driver physically threatened by a customer and company blamed me for "provocation".', 'safety', 'critical', 'open', ARRAY['safety', 'harassment', 'vehicle_violations'], '550e8400-e29b-41d4-a716-446655440020');

-- Insert grievance comments
INSERT INTO grievance_comments (grievance_id, user_id, content, likes_count) VALUES
(
  (SELECT id FROM grievances WHERE title LIKE '%Unjust%' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440002',
  'I had the exact same issue! Deactivated with no explanation after a false safety report. The appeals process is completely opaque.',
  45
),
(
  (SELECT id FROM grievances WHERE title LIKE '%Missing payment%' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440001',
  'DoorDash has a known issue with their batch payment system during peak hours. Document everything with screenshots.',
  38
),
(
  (SELECT id FROM grievances WHERE title LIKE '%Non-existent%' LIMIT 1),
  '550e8400-e29b-41d4-a716-446655440003',
  'Amazon Flex doesn''t validate addresses. I''ve had this happen twice. Their response is always "that''s the customer''s address". Demand mileage compensation.',
  52
);

-- Insert anomaly flags
INSERT INTO anomaly_flags (worker_id, shift_id, flag_type, severity, description, detection_method, statistical_value, threshold_value) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM shifts WHERE worker_id = '550e8400-e29b-41d4-a716-446655440001' AND platform = 'Instacart' LIMIT 1),
  'unusually_high_earnings',
  'low',
  'Single shift earnings 2.1x above city median for platform',
  'z_score_analysis',
  210.15,
  100.00
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  NULL,
  'consistent_violation_pattern',
  'medium',
  'Worker consistently logs shifts outside typical gig worker hours (8am-9pm) - 6 shifts at 3am-4am',
  'temporal_analysis',
  3,
  1
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  (SELECT id FROM shifts WHERE worker_id = '550e8400-e29b-41d4-a716-446655440004' AND platform = 'Amazon Flex' LIMIT 1),
  'platform_inconsistency',
  'high',
  'Reported earnings 1.8x lower than similar workers same platform/city/time',
  'comparative_analysis',
  38.00,
  50.00
);

-- Insert CSV import records
INSERT INTO csv_imports (worker_id, filename, file_url, status, total_rows, successfully_imported, failed_rows) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'jan_2024_earnings.csv', '/uploads/csv/550e8400-e29b-41d4-a716-446655440001/jan_2024.csv', 'completed', 15, 15, 0),
('550e8400-e29b-41d4-a716-446655440002', 'uber_doordash_jan.csv', '/uploads/csv/550e8400-e29b-41d4-a716-446655440002/uber_doordash.csv', 'completed', 12, 12, 0),
('550e8400-e29b-41d4-a716-446655440003', 'all_platforms_q1.csv', '/uploads/csv/550e8400-e29b-41d4-a716-446655440003/q1_2024.csv', 'failed', 28, 0, 28);
