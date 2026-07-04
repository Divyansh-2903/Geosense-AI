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
