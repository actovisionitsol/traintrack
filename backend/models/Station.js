const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true }
});

// Compound index for text search if needed later, but simple index on both is enough for regex
stationSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('Station', stationSchema);
