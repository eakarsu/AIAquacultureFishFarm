const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');
const { fireWebhook } = require('./services/webhooks');

const app = express();
const PORT = process.env.BACKEND_PORT || 3095;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3094,http://localhost:3095,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below this line requires a Bearer token.
app.use('/api', authenticateToken);

// 18 CRUD routes (all use _crudFactory: RBAC + bulk-import + attachments)
app.use('/api/farms',                  require('./routes/farms'));
app.use('/api/net-pens',               require('./routes/netPens'));
app.use('/api/fish-groups',            require('./routes/fishGroups'));
app.use('/api/feed-inventory',         require('./routes/feedInventory'));
app.use('/api/treatments',             require('./routes/treatments'));
app.use('/api/mortality-logs',         require('./routes/mortalityLogs'));
// Mount the batch sensor ingest BEFORE the CRUD router so /ingest doesn't
// get caught by the CRUD's GET /:id route.
app.use('/api/water-quality/ingest',    require('./routes/waterQualityIngest'));
app.use('/api/water-quality',          require('./routes/waterQuality'));
app.use('/api/feeding-schedules',      require('./routes/feedingSchedules'));
app.use('/api/regulatory-reports',     require('./routes/regulatoryReports'));
app.use('/api/biomass-estimates',      require('./routes/biomassEstimates'));
app.use('/api/sea-lice-counts',        require('./routes/seaLiceCounts'));
app.use('/api/vessels',                require('./routes/vessels'));
app.use('/api/divers',                 require('./routes/divers'));
app.use('/api/harvests',               require('./routes/harvests'));
app.use('/api/customers',              require('./routes/customers'));
app.use('/api/certifications',         require('./routes/certifications'));
app.use('/api/predator-incidents',     require('./routes/predatorIncidents'));
app.use('/api/environmental-impacts',  require('./routes/environmentalImpacts'));
app.use('/api/vendors',                require('./routes/vendors'));
app.use('/api/audit-log',              require('./routes/auditLog'));

// AI routes (16 sub-endpoints + history under /api/ai)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Custom Farm Analytics views (read-only aggregated time-series)
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`\nAI Aquaculture Fish Farm API running on http://localhost:${PORT}\n`);
});
