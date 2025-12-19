const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const trainRoutes = require('./routes/trainRoutes');
const stationRoutes = require('./routes/stationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- ENDPOINTS ---
app.use('/api', authRoutes);
app.use('/api', trainRoutes);
app.use('/api', stationRoutes);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});