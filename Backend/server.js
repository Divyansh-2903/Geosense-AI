const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/env');

const app = express();
const allowedOrigins = new Set(config.corsOrigins);

