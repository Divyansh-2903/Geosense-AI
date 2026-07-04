const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // ── Core Auth ──────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['farmer', 'manager', 'admin'],
      default: 'farmer'
    },

    // ── Profile ────────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: ''   // URL to profile photo (stored as base64 data URL or external URL)
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot be more than 200 characters'],
      default: ''
    },
    location: {
      district: { type: String, default: '' },
      state:    { type: String, default: '' },
      country:  { type: String, default: 'India' },
      pincode:  { type: String, default: '' }
    },

    // ── Farm Profile ───────────────────────────────────────────────────────
    farmProfile: {
      totalLandHectares: { type: Number, default: 0 },
      primaryCrops:      { type: [String], default: [] },  // e.g. ['Rice', 'Wheat']
      farmingExperience: { type: Number, default: 0 },     // years
      irrigationType:    {
        type: String,
        enum: ['drip', 'sprinkler', 'flood', 'rainfed', 'mixed', ''],
        default: ''
      },
      soilType: {
        type: String,
        enum: ['clay', 'loamy', 'sandy', 'silty', 'black', 'red', ''],
        default: ''
      },
      governmentId: { type: String, default: '' }   // Kisan ID / Aadhaar (optional)
    },

    // ── Preferences ────────────────────────────────────────────────────────
    preferences: {
      language:            { type: String, default: 'en' },
      notificationsEmail:  { type: Boolean, default: true },
      notificationsSMS:    { type: Boolean, default: false },
      units:               { type: String, enum: ['metric', 'imperial'], default: 'metric' }
    },

    // ── Dashboard Stats (auto-updated by activity) ─────────────────────────
    stats: {
      totalAnalysesRun: { type: Number, default: 0 },
      lastLoginAt:      { type: Date,   default: null },
      accountCreatedAt: { type: Date,   default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

// ── Pre-save: hash password only when modified ─────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare password ─────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
