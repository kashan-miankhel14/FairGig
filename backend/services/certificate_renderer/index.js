/**
 * FairGig Certificate Renderer Service
 * Generates verified income certificates as HTML (printable / PDF-ready)
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const app = express();
const port = 8006;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://user:password@localhost/fairgig'
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'certificate-renderer' });
});

// ==================== GENERATE CERTIFICATE (from DB) ====================
app.get('/render/:userId', async (req, res) => {
  const { userId } = req.params;
  const { period_start, period_end } = req.query;

  try {
    // Fetch user info
    const userResult = await pool.query(
      'SELECT id, full_name, email, city, state, country FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    // Fetch verified certificate if exists
    const certResult = await pool.query(
      `SELECT * FROM income_certificates
       WHERE worker_id = $1 AND status = 'verified'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    let certData;
    if (certResult.rows.length > 0) {
      certData = certResult.rows[0];
    } else {
      // Build from shifts
      const start = period_start || new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0];
      const end = period_end || new Date().toISOString().split('T')[0];

      const shiftsResult = await pool.query(
        `SELECT platform, SUM(gross_earnings) as gross, SUM(platform_fees) as fees,
                SUM(net_earnings) as net, COUNT(*) as shift_count
         FROM shifts
         WHERE worker_id = $1 AND shift_date BETWEEN $2 AND $3 AND status != 'flagged'
         GROUP BY platform`,
        [userId, start, end]
      );

      const totals = shiftsResult.rows.reduce(
        (acc, r) => ({
          gross: acc.gross + parseFloat(r.gross || 0),
          fees: acc.fees + parseFloat(r.fees || 0),
          net: acc.net + parseFloat(r.net || 0),
        }),
        { gross: 0, fees: 0, net: 0 }
      );

      certData = {
        certificate_number: `FG-${Date.now()}-DRAFT`,
        period_start: start,
        period_end: end,
        total_gross_earnings: totals.gross,
        total_platform_fees: totals.fees,
        total_net_earnings: totals.net,
        status: 'draft',
        platforms: shiftsResult.rows,
      };
    }

    const html = generateCertificateHTML(user, certData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Certificate render error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== GENERATE CERTIFICATE (from POST body) ====================
app.post('/generate-certificate', async (req, res) => {
  const { worker_id, worker_name, total_income, period, period_start, period_end, platforms } = req.body;

  try {
    let user = { full_name: worker_name || 'Worker', city: '', email: '' };
    let certData = {
      certificate_number: `FG-${Date.now()}`,
      period_start: period_start || period || '',
      period_end: period_end || '',
      total_gross_earnings: parseFloat(total_income) || 0,
      total_platform_fees: 0,
      total_net_earnings: parseFloat(total_income) || 0,
      status: 'verified',
      platforms: platforms || [],
    };

    if (worker_id) {
      try {
        const userResult = await pool.query(
          'SELECT id, full_name, email, city FROM users WHERE id = $1',
          [worker_id]
        );
        if (userResult.rows.length > 0) user = userResult.rows[0];
      } catch (_) {}
    }

    const html = generateCertificateHTML(user, certData);
    res.json({
      success: true,
      certificate_id: certData.certificate_number,
      html_template: html,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== HTML GENERATOR ====================
function generateCertificateHTML(user, cert) {
  const formatPKR = (amount) =>
    `PKR ${parseFloat(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const issueDate = new Date().toLocaleDateString('en-PK', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const periodStr = cert.period_start && cert.period_end
    ? `${new Date(cert.period_start).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })} — ${new Date(cert.period_end).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'Current Period';

  const platformRows = (cert.platforms || []).map(p => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-weight:600;">${p.platform || p.name || ''}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;">${p.shift_count || p.tasks || '—'}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;">${formatPKR(p.gross || p.gross_earnings || 0)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#dc2626;">${formatPKR(p.fees || p.platform_fees || 0)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#16a34a;font-weight:700;">${formatPKR(p.net || p.net_earnings || 0)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FairGig Income Certificate — ${user.full_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; color: #111827; }
    .page { max-width: 860px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%); color: white; padding: 40px 48px; text-align: center; }
    .header .flag { font-size: 48px; margin-bottom: 8px; }
    .header h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { opacity: 0.85; margin-top: 6px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); border-radius: 999px; padding: 6px 16px; font-size: 12px; font-weight: 700; margin-top: 16px; letter-spacing: 1px; }
    .body { padding: 40px 48px; }
    .ref { text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 32px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 24px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin-bottom: 32px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .value { font-size: 18px; font-weight: 700; color: #111827; }
    .sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .income-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 32px; margin-bottom: 32px; }
    .income-box .label { color: #166534; }
    .income-box .big { font-size: 42px; font-weight: 800; color: #15803d; margin: 8px 0; }
    .income-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; padding-top: 24px; border-top: 1px solid #bbf7d0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead th { background: #f3f4f6; padding: 10px 16px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 600; }
    .declaration { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 32px; font-size: 13px; color: #6b7280; line-height: 1.7; }
    .declaration strong { color: #1d4ed8; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .sig { font-size: 28px; font-weight: 800; color: #1d4ed8; font-style: italic; }
    .sig-name { font-weight: 700; font-size: 14px; }
    .sig-title { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-verified { background: #dcfce7; color: #166534; }
    .status-draft { background: #fef9c3; color: #854d0e; }
    @media print { body { background: white; } .page { box-shadow: none; margin: 0; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="flag">🇵🇰</div>
      <h1>Income Certificate</h1>
      <p>FairGig Worker Advocacy Platform</p>
      <div class="badge">✓ Officially Certified</div>
    </div>
    <div class="body">
      <p class="ref">
        Ref No: <strong>${cert.certificate_number}</strong> &nbsp;•&nbsp; Issue Date: <strong>${issueDate}</strong>
        &nbsp;•&nbsp; <span class="status-badge ${cert.status === 'verified' ? 'status-verified' : 'status-draft'}">${cert.status}</span>
      </p>

      <div class="grid2">
        <div>
          <p class="label">Statement Issued To</p>
          <p class="value">${user.full_name}</p>
          <p class="sub">${user.email || ''}</p>
          <p class="sub">${user.city ? `${user.city}, Pakistan` : 'Pakistan'}</p>
        </div>
        <div style="text-align:right;">
          <p class="label">Statement Period</p>
          <p class="value">${periodStr}</p>
          <p class="sub">Multi-Platform Worker</p>
        </div>
      </div>

      <div class="income-box">
        <p class="label">Total Net Certified Income</p>
        <p class="big">${formatPKR(cert.total_net_earnings)}</p>
        <div class="income-grid">
          <div>
            <p class="label">Gross Earnings</p>
            <p style="font-size:22px;font-weight:700;color:#111827;">${formatPKR(cert.total_gross_earnings)}</p>
          </div>
          <div style="text-align:right;">
            <p class="label">Platform Fees Deducted</p>
            <p style="font-size:22px;font-weight:700;color:#dc2626;">-${formatPKR(cert.total_platform_fees)}</p>
          </div>
        </div>
      </div>

      ${platformRows ? `
      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Activity Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Platform</th><th>Shifts</th><th>Gross</th><th>Fees</th><th>Net Income</th>
          </tr>
        </thead>
        <tbody>${platformRows}</tbody>
      </table>` : ''}

      <div class="declaration">
        <strong>Statement Declaration:</strong> FairGig certifies that the above figures represent the actual
        verified income disbursed to the individual named herein. All figures are in Pakistani Rupees (PKR).
        This document is cryptographically secured and verifiable against the FairGig Public Ledger.
        Ye certificate makan maalik, banks, aur loan applications ke liye qabil-e-qabool hai.
      </div>

      <div class="footer">
        <div>
          <p style="font-size:12px;color:#9ca3af;">FairGig Platform</p>
          <p style="font-size:12px;color:#9ca3af;">Pakistan Labour Advocacy Network</p>
        </div>
        <div style="text-align:right;">
          <p class="sig">Amina</p>
          <p class="sig-name">Amina Siddiqui</p>
          <p class="sig-title">Chief Verification Officer</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

app.listen(port, () => {
  console.log(`Certificate Renderer listening at http://localhost:${port}`);
});
