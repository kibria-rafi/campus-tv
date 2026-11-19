'use strict';

const mongoose = require('mongoose');

const adminCredentialsSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

const AdminCredentials =
  mongoose.models.AdminCredentials ||
  mongoose.model('AdminCredentials', adminCredentialsSchema);

module.exports = AdminCredentials;
