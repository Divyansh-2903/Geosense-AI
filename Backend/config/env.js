const path = require('path');

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function readOptionalEnv(name, fallback = '') {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function parseAllowedOrigins() {
  const configured = readOptionalEnv('CORS_ORIGINS');
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function resolveCredentialPath(rawPath) {
  if (!rawPath) return '';
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(__dirname, '..', rawPath);
}

const config = {
  port: Number(readOptionalEnv('PORT', '5001')),
  mongoUri: readOptionalEnv('MONGO_URI', 'mongodb://127.0.0.1:27017/agrisense'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: readOptionalEnv('JWT_EXPIRES_IN', '30d'),
  corsOrigins: parseAllowedOrigins(),
  googleApplicationCredentials: resolveCredentialPath(
    readOptionalEnv('GOOGLE_APPLICATION_CREDENTIALS')
  ),
  googleServiceAccountJson: readOptionalEnv('GOOGLE_SERVICE_ACCOUNT_JSON'),
  geminiApiKey: readOptionalEnv('GEMINI_API_KEY'),
  geminiModel: readOptionalEnv('GEMINI_MODEL', 'gemini-2.5-pro'),
  useVertexAI: readOptionalEnv('USE_VERTEX_AI') === 'true',
  gcpProject: readOptionalEnv('GCP_PROJECT'),
  gcpLocation: readOptionalEnv('GCP_LOCATION', 'us-central1')
};

module.exports = config;
