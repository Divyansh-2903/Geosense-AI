const ee = require('@google/earthengine');
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const config = require('../config/env');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const EE_SCOPE = [
  'https://www.googleapis.com/auth/earthengine',
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/devstorage.read_write'
].join(' ');

let cachedInitPromise = null;
let cachedToken = null;
let cachedTokenExpiresAt = 0;

function loadServiceAccountKey() {
  if (config.googleServiceAccountJson) {
    return JSON.parse(config.googleServiceAccountJson);
  }

  if (config.googleApplicationCredentials) {
    const raw = fs.readFileSync(config.googleApplicationCredentials, 'utf8');
    return JSON.parse(raw);
  }

  throw new Error(
    'Earth Engine credentials are not configured. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON.'
  );
}

function b64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function makeJWT(key) {
  const now = Math.floor(Date.now() / 1000);

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: key.client_email,
    scope: EE_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  }));

  const signingInput = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const sig = signer.sign(key.private_key, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${signingInput}.${sig}`;
}

function fetchToken(jwt) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        Accept: 'application/json',
        'Accept-Encoding': 'identity'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`OAuth error: ${parsed.error} - ${parsed.error_description}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Failed to parse token response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('Token request timed out after 15 s'));
    });

    req.write(body);
    req.end();
  });
}

async function initializeEarthEngine() {
  if (cachedInitPromise) {
    return cachedInitPromise;
  }

  cachedInitPromise = (async () => {
    const key = loadServiceAccountKey();
    const now = Date.now();

    if (!cachedToken || now >= cachedTokenExpiresAt - 60000) {
      const jwt = makeJWT(key);
      const tokenResponse = await fetchToken(jwt);
      cachedToken = tokenResponse.access_token;
      cachedTokenExpiresAt = now + ((tokenResponse.expires_in || 3600) * 1000);
    }

    const expiresIn = Math.max(1, Math.floor((cachedTokenExpiresAt - now) / 1000));

    return new Promise((resolve, reject) => {
      ee.data.setAuthToken(
        '',
        'Bearer',
        cachedToken,
        expiresIn,
        [],
        () => {
          ee.initialize(
            null,
            null,
            () => {
              console.log('Earth Engine initialized');
              resolve(ee);
            },
            (err) => reject(new Error(`EE initialize failed: ${err}`))
          );
        },
        false
      );
    });
  })().catch((err) => {
    cachedInitPromise = null;
    throw err;
  });

  return cachedInitPromise;
}

module.exports = initializeEarthEngine;
