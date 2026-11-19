'use strict';

const mongoose = require('mongoose');

const ALLOWED_CATEGORIES = [
  'Features',
  'Culture',
  'Education',
  'Amar Campus',
  'Opinion',
  'Campus',
  'Admission',
  'Career',
  'Event',
];

const CATEGORY_MAP = {
  Features: { bn: 'ফিচার', en: 'Features' },
  Culture: { bn: 'সংস্কৃতি', en: 'Culture' },
  Education: { bn: 'শিক্ষা', en: 'Education' },
  'Amar Campus': { bn: 'আমার ক্যাম্পাস', en: 'Amar Campus' },
  Opinion: { bn: 'অপিনিয়ন', en: 'Opinion' },
  Campus: { bn: 'ক্যাম্পাস', en: 'Campus' },
  Admission: { bn: 'ভর্তি', en: 'Admission' },
  Career: { bn: 'ক্যারিয়ার', en: 'Career' },
  Event: { bn: 'ইভেন্ট', en: 'Event' },
};

const newsSchema = new mongoose.Schema({
  title: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  subtitle: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  description: {
    bn: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  image: String,
  secondaryImage: { type: String, default: '' },
  imageCaption: { type: String, default: '' },
  reporterName: { type: String, default: '' },
  category: {
    bn: { type: String, default: 'সাধারণ' },
    en: { type: String, default: 'General' },
  },
  videoUrl: { type: String, default: '' },
  isLive: { type: Boolean, default: false },
  categories: {
    type: [String],
    default: [],
    validate: {
      validator: (arr) =>
        Array.isArray(arr) && arr.every((v) => ALLOWED_CATEGORIES.includes(v)),
      message: 'Invalid category value',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

newsSchema.index({ createdAt: -1 });
newsSchema.index({ categories: 1, createdAt: -1 });
newsSchema.index({ isLive: 1, createdAt: -1 });

const News = mongoose.models.News || mongoose.model('News', newsSchema);

module.exports = {
  News,
  ALLOWED_CATEGORIES,
  CATEGORY_MAP,
};
