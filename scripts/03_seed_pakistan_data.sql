-- FairGig Pakistan Seed Data
-- Pakistani names, cities, and currency in PKR (Pakistan Rupees)
-- Demo accounts use bcrypt hash of "password123"
-- Hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe

-- ============================================================
-- DEMO ACCOUNTS (login with password: password123)
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, role, city, state, country, status) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'worker@fairgig.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Ahmed Hassan',   'worker',    'Karachi',   'Sindh',   'Pakistan', 'active'),
('aaaaaaaa-0000-0000-0000-000000000002', 'verifier@fairgig.com',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Hina Ramzan',    'verifier',  'Lahore',    'Punjab',  'Pakistan', 'active'),
('aaaaaaaa-0000-0000-0000-000000000003', 'advocate@fairgig.com',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Iqbal Masood',   'advocate',  'Lahore',    'Punjab',  'Pakistan', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- ADDITIONAL WORKERS
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, role, city, state, country, status) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'ahmed.hassan@example.pk',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Ahmed Hassan',   'worker', 'Lahore',      'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440102', 'fatima.khan@example.pk',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Fatima Khan',    'worker', 'Lahore',      'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440103', 'ali.raza@example.pk',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Ali Raza',       'worker', 'Karachi',     'Sindh',   'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440104', 'hassan.malik@example.pk',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Hassan Malik',   'worker', 'Islamabad',   'Federal', 'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440105', 'amina.shah@example.pk',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Amina Shah',     'worker', 'Rawalpindi',  'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440106', 'zainab.hussain@example.pk', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Zainab Hussain', 'worker', 'Lahore',      'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440107', 'bilal.ahmad@example.pk',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Bilal Ahmad',    'worker', 'Karachi',     'Sindh',   'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440108', 'nadia.malik@example.pk',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Nadia Malik',    'worker', 'Lahore',      'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440110', 'verifier.samir@fairgig.pk', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Samir Aslam',    'verifier', 'Lahore',    'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440120', 'advocate.iqbal@fairgig.pk', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Iqbal Masood',   'advocate', 'Lahore',    'Punjab',  'Pakistan', 'active'),
('550e8400-e29b-41d4-a716-446655440121', 'advocate.sarah@fairgig.pk', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uoHe', 'Sarah Khan',     'advocate', 'Karachi',   'Sindh',   'Pakistan', 'active')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SHIFTS — Ahmed Hassan (Lahore, Foodpanda/Daraz/Careem)
-- ============================================================
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'Foodpanda', '2024-10-15', '10:00:00', '14:30:00', 4.5,  3645.00, 364.50, 3280.50, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Daraz',     '2024-10-16', '14:00:00', '18:45:00', 4.75, 2812.50, 281.25, 2531.25, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Foodpanda', '2024-10-17', '11:00:00', '15:30:00', 4.5,  3375.00, 337.50, 3037.50, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Careem',    '2024-10-18', '08:30:00', '13:15:00', 4.75, 2937.50, 293.75, 2643.75, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Foodpanda', '2024-10-19', '18:00:00', '22:45:00', 4.75, 4125.00, 412.50, 3712.50, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Foodpanda', '2024-10-22', '09:00:00', '13:45:00', 4.75, 3712.50, 371.25, 3341.25, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Daraz',     '2024-10-23', '15:00:00', '19:30:00', 4.5,  2700.00, 270.00, 2430.00, 'verified', 'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Careem',    '2024-10-24', '10:00:00', '14:45:00', 4.75, 2625.00, 262.50, 2362.50, 'logged',   'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Foodpanda', '2024-10-25', '09:00:00', '13:30:00', 4.5,  3500.00, 350.00, 3150.00, 'logged',   'Karachi'),
('aaaaaaaa-0000-0000-0000-000000000001', 'Bykea',     '2024-10-26', '14:00:00', '18:30:00', 4.5,  2200.00, 220.00, 1980.00, 'logged',   'Karachi')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SHIFTS — Fatima Khan (Lahore)
-- ============================================================
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440102', 'Foodpanda', '2024-10-15', '12:00:00', '16:30:00', 4.5,  3375.00, 337.50, 3037.50, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440102', 'Daraz',     '2024-10-16', '10:00:00', '14:45:00', 4.75, 2906.25, 290.63, 2615.62, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440102', 'Careem',    '2024-10-17', '14:00:00', '18:30:00', 4.5,  2700.00, 270.00, 2430.00, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440102', 'Foodpanda', '2024-10-18', '09:00:00', '13:45:00', 4.75, 3618.75, 361.87, 3256.88, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440102', 'Daraz',     '2024-10-19', '16:00:00', '20:45:00', 4.75, 3118.75, 311.88, 2806.87, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440102', 'Foodpanda', '2024-10-22', '11:00:00', '15:30:00', 4.5,  3375.00, 337.50, 3037.50, 'verified', 'Lahore')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SHIFTS — Ali Raza (Karachi)
-- ============================================================
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440103', 'Foodpanda', '2024-10-15', '08:00:00', '12:30:00', 4.5,  3150.00, 315.00, 2835.00, 'verified', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440103', 'Careem',    '2024-10-16', '13:00:00', '17:45:00', 4.75, 2850.00, 285.00, 2565.00, 'verified', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440103', 'Daraz',     '2024-10-17', '10:00:00', '14:30:00', 4.5,  2700.00, 270.00, 2430.00, 'verified', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440103', 'Foodpanda', '2024-10-18', '15:00:00', '19:45:00', 4.75, 3618.75, 361.88, 3256.87, 'verified', 'Karachi'),
('550e8400-e29b-41d4-a716-446655440103', 'Careem',    '2024-10-19', '09:00:00', '13:45:00', 4.75, 2756.25, 275.63, 2480.62, 'logged',   'Karachi')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SHIFTS — Hassan Malik (Islamabad, Uber/JazzCash)
-- ============================================================
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440104', 'Careem',        '2024-10-15', '07:00:00', '11:45:00', 4.75, 4756.25, 475.63, 4280.62, 'verified', 'Islamabad'),
('550e8400-e29b-41d4-a716-446655440104', 'Careem',        '2024-10-16', '14:00:00', '18:30:00', 4.5,  4275.00, 427.50, 3847.50, 'verified', 'Islamabad'),
('550e8400-e29b-41d4-a716-446655440104', 'JazzCash Rides','2024-10-17', '11:00:00', '15:45:00', 4.75, 2850.00, 285.00, 2565.00, 'verified', 'Islamabad'),
('550e8400-e29b-41d4-a716-446655440104', 'Careem',        '2024-10-18', '18:00:00', '22:45:00', 4.75, 5062.50, 506.25, 4556.25, 'verified', 'Islamabad')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SHIFTS — Zainab Hussain (Lahore, Freelance)
-- ============================================================
INSERT INTO shifts (worker_id, platform, shift_date, start_time, end_time, duration_hours, gross_earnings, platform_fees, net_earnings, status, city) VALUES
('550e8400-e29b-41d4-a716-446655440106', 'Upwork', '2024-10-10', '09:00:00', '17:00:00', 8.0, 4400.00, 220.00, 4180.00, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440106', 'Fiverr', '2024-10-15', '10:00:00', '14:00:00', 4.0, 2200.00, 110.00, 2090.00, 'verified', 'Lahore'),
('550e8400-e29b-41d4-a716-446655440106', 'Upwork', '2024-10-18', '08:30:00', '16:30:00', 8.0, 4400.00, 220.00, 4180.00, 'verified', 'Lahore')
ON CONFLICT DO NOTHING;

-- ============================================================
-- CITY-WIDE EARNINGS AGGREGATION
-- ============================================================
INSERT INTO earnings_aggregation (city, state, platform, date_range_start, date_range_end, median_hourly_rate, average_hourly_rate, min_hourly_rate, max_hourly_rate, sample_size) VALUES
('Lahore',     'Punjab',  'Foodpanda',    '2024-10-01', '2024-10-31', 650,  687.50, 500,  900,  145),
('Lahore',     'Punjab',  'Daraz',        '2024-10-01', '2024-10-31', 575,  610.00, 400,  850,  132),
('Lahore',     'Punjab',  'Careem',       '2024-10-01', '2024-10-31', 575,  595.00, 450,  800,  98),
('Lahore',     'Punjab',  'Upwork',       '2024-10-01', '2024-10-31', 500,  550.00, 300,  1000, 65),
('Lahore',     'Punjab',  'Fiverr',       '2024-10-01', '2024-10-31', 400,  450.00, 200,  800,  48),
('Karachi',    'Sindh',   'Foodpanda',    '2024-10-01', '2024-10-31', 600,  650.00, 450,  900,  167),
('Karachi',    'Sindh',   'Careem',       '2024-10-01', '2024-10-31', 550,  580.00, 400,  750,  89),
('Karachi',    'Sindh',   'Daraz',        '2024-10-01', '2024-10-31', 525,  560.00, 350,  800,  76),
('Karachi',    'Sindh',   'Bykea',        '2024-10-01', '2024-10-31', 480,  510.00, 300,  700,  54),
('Islamabad',  'Federal', 'Careem',       '2024-10-01', '2024-10-31', 875,  920.00, 700,  1200, 156),
('Islamabad',  'Federal', 'JazzCash Rides','2024-10-01','2024-10-31', 500,  530.00, 350,  750,  67),
('Rawalpindi', 'Punjab',  'Careem',       '2024-10-01', '2024-10-31', 800,  850.00, 650,  1100, 89),
('Faisalabad', 'Punjab',  'Foodpanda',    '2024-10-01', '2024-10-31', 520,  550.00, 380,  750,  72),
('Peshawar',   'KPK',     'Foodpanda',    '2024-10-01', '2024-10-31', 480,  510.00, 350,  700,  58)
ON CONFLICT DO NOTHING;

-- ============================================================
-- INCOME CERTIFICATES
-- ============================================================
INSERT INTO income_certificates (worker_id, certificate_number, period_start, period_end, total_gross_earnings, total_platform_fees, total_net_earnings, verified_by, verification_date, status) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'FG-PK-2024-KHI-001', '2024-07-01', '2024-09-30', 414500.00, 44500.00, 370000.00, 'aaaaaaaa-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440101', 'FG-PK-2024-LHR-001', '2024-10-01', '2024-10-31', 26212.50,  2621.25,  23591.25,  '550e8400-e29b-41d4-a716-446655440110', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440102', 'FG-PK-2024-LHR-002', '2024-10-01', '2024-10-31', 22694.25,  2269.42,  20424.83,  '550e8400-e29b-41d4-a716-446655440110', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440103', 'FG-PK-2024-KHI-002', '2024-10-01', '2024-10-31', 16425.00,  1642.50,  14782.50,  'aaaaaaaa-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, 'verified'),
('550e8400-e29b-41d4-a716-446655440104', 'FG-PK-2024-ISB-001', '2024-10-01', '2024-10-31', 18400.00,  1840.00,  16560.00,  NULL, NULL, 'pending')
ON CONFLICT DO NOTHING;

-- ============================================================
-- GRIEVANCES
-- ============================================================
INSERT INTO grievances (worker_id, platform, title, description, category, severity, status, tags, assigned_advocate_id) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'Foodpanda', 'Account deactivated without explanation for 2 weeks', 'My account was deactivated on October 22 without any warning or explanation. Customer support says I violated community guidelines but no specific incident was mentioned. I had a 4.8 rating and have been delivering for 8 months without issues.', 'deactivation', 'critical', 'open', ARRAY['account_access', 'deactivation', 'no_explanation'], NULL),
('550e8400-e29b-41d4-a716-446655440102', 'Daraz', 'Commission rate increased from 15% to 25% overnight without notice', 'Daraz increased platform commission from 15% to 25% effective immediately. No prior notification was sent. This reduced my daily earnings by 1200-1500 PKR. Other riders are experiencing the same issue.', 'commission', 'high', 'in_review', ARRAY['commission_increase', 'unfair_practice', 'no_notification'], '550e8400-e29b-41d4-a716-446655440120'),
('550e8400-e29b-41d4-a716-446655440103', 'Careem', 'Unpaid earnings from 5 cancelled orders (3200 PKR missing)', 'On October 18, 5 orders were cancelled by customers after I had already traveled to pickup locations. The platform cancelled the orders but did not credit me for travel time or cancellation fees promised in their policy.', 'payment', 'high', 'resolved', ARRAY['payment_issue', 'cancelled_orders', 'travel_compensation'], '550e8400-e29b-41d4-a716-446655440121'),
('550e8400-e29b-41d4-a716-446655440104', 'Careem', 'Safety concern: Aggressive customer incident not addressed', 'A customer verbally abused me and threatened violence. I reported it through the app but Careem support response was automated and dismissive. They suggested I cancel future rides with this customer but offered no other support.', 'safety', 'high', 'open', ARRAY['safety', 'harassment', 'customer_aggression', 'support_failure'], '550e8400-e29b-41d4-a716-446655440120'),
('550e8400-e29b-41d4-a716-446655440105', 'JazzCash Rides', 'Forced to use older vehicle due to rejection of newer car documentation', 'My newer vehicle was rejected during documentation verification. Support gave no reason and no appeal process. I am forced to use my older, less fuel-efficient vehicle which costs me 200-300 PKR more per day.', 'vehicle', 'medium', 'escalated', ARRAY['vehicle_requirements', 'documentation', 'arbitrary_rejection'], NULL),
('550e8400-e29b-41d4-a716-446655440106', 'Upwork', 'Client refused to pay 4400 PKR for completed transcription work', 'Completed a 8-hour transcription project as per specifications. Client claimed "poor quality" without specific feedback and dispute remains unresolved for 3 weeks. Upwork support is slow.', 'payment', 'medium', 'open', ARRAY['non_payment', 'dispute', 'quality_claim'], NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- GRIEVANCE COMMENTS
-- ============================================================
INSERT INTO grievance_comments (grievance_id, user_id, content, likes_count)
SELECT g.id, '550e8400-e29b-41d4-a716-446655440102',
       'Same thing happened to me last month. They never gave a reason. It took a week of messages to get my account back. Foodpanda needs transparency.',
       28
FROM grievances g WHERE g.title LIKE '%Account deactivated%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO grievance_comments (grievance_id, user_id, content, likes_count)
SELECT g.id, '550e8400-e29b-41d4-a716-446655440103',
       'They did this to all of us in Lahore. My earnings went from 15,000 to 12,000 per day overnight. This is wage theft.',
       64
FROM grievances g WHERE g.title LIKE '%Commission rate increased%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO grievance_comments (grievance_id, user_id, content, likes_count)
SELECT g.id, 'aaaaaaaa-0000-0000-0000-000000000001',
       'Document everything with screenshots. Careem admits the policy but claims "technical issues" prevent payment. Keep the messages for legal action.',
       45
FROM grievances g WHERE g.title LIKE '%Unpaid earnings%' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- ANOMALY FLAGS
-- ============================================================
INSERT INTO anomaly_flags (worker_id, flag_type, severity, description, detection_method, statistical_value, threshold_value, status)
VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'platform_inconsistency', 'high',    'Bykea rate 1980 PKR is 22% below city median for Karachi (2530 PKR)', 'comparative_analysis', 1980.0, 2530.0, 'open'),
('550e8400-e29b-41d4-a716-446655440102', 'platform_inconsistency', 'high',    'Daraz commission rate increase detected: 15% to 25% between Oct 19-22', 'temporal_analysis',    20.0,   15.0,   'open'),
('550e8400-e29b-41d4-a716-446655440104', 'unusually_high_earnings', 'low',    'Careem Islamabad earnings 15% above city median during peak hours — expected', 'z_score_analysis', 920.0, 800.0, 'open'),
('550e8400-e29b-41d4-a716-446655440105', 'inactivity_period',       'medium', 'No shifts logged in last 14 days after consistent activity', 'temporal_analysis', 0.0, 0.0, 'open')
ON CONFLICT DO NOTHING;
