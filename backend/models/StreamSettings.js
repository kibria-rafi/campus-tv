'use strict';

const mongoose = require('mongoose');

const streamSettingsSchema = new mongoose.Schema({
  primaryM3u8: { type: String, required: true },
  backupM3u8: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: '' },
});

const StreamSettings =
  mongoose.models.StreamSettings ||
  mongoose.model('StreamSettings', streamSettingsSchema);

module.exports = StreamSettings;
